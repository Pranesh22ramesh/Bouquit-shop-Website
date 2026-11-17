const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/apiError');
const {
  serializeActivity,
  serializeCartItem,
  serializeProduct,
  serializeUser,
} = require('../utils/serializers');
const userRepository = require('../repositories/userRepository');
const { logActivity } = require('./activityService');
const { pushEventToUser } = require('./realtimeRelayService');
const { env } = require('../config/env');
const updateSensitiveUser = async (userId, data) => {
  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({ where: { id: userId }, data: { ...data, authVersion: { increment: 1 } } });
    await tx.refreshToken.deleteMany({ where: { userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });
    return updated;
  });
  require('./realtimeRelayService').disconnectUser(userId);
  return user;
};

const getAllUsers = async (filters = {}) => {
  const users = await userRepository.listUsers(filters);
  return users.map(serializeUser);
};

const getUserById = async (userId) => {
  const user = await userRepository.findWithRelationsById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  return {
    ...serializeUser(user),
    cartItems: await getCart(userId),
    orders: user.orders.map((order) => ({
      id: order.id,
      _id: order.id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalPrice: Number(order.totalPrice),
      orderItems: order.orderItems,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })),
    reviews: user.reviews.map((review) => ({
      id: review.id,
      _id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      image: review.image,
      isHidden: review.isHidden,
      isPinned: review.isPinned,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    })),
  };
};

const updateProfile = async (userId, { fullName, email, phoneNumber, address, password, currentPassword }) => {
  const payload = {};
  const current = await userRepository.findById(userId);
  if (!current) throw new ApiError(404, 'User not found');
  const sensitive = Boolean(password) || (email !== undefined && email.trim().toLowerCase() !== current.email);
  if (sensitive && (!currentPassword || !await bcrypt.compare(currentPassword, current.passwordHash))) {
    throw new ApiError(403, 'Enter your current password to change your email or password');
  }

  if (fullName !== undefined) payload.fullName = fullName;
  if (email !== undefined) {
    const normalizedEmail = String(email).trim().toLowerCase();
    if (normalizedEmail === env.adminEmail && current.email !== env.adminEmail) throw new ApiError(403, 'That email address is unavailable');
    const existing = await userRepository.findByEmail(normalizedEmail);

    if (existing && existing.id !== userId) {
      throw new ApiError(409, 'Email address is already registered');
    }

    payload.email = normalizedEmail;
  }
  if (phoneNumber !== undefined) payload.phoneNumber = phoneNumber || null;
  if (address !== undefined) payload.address = address || null;

  if (password) payload.passwordHash = await bcrypt.hash(password, 12);

  const user = sensitive ? await updateSensitiveUser(userId, payload) : await userRepository.updateUser(userId, payload);
  await logActivity({
    userId,
    action: 'profile_updated',
    resourceType: 'user',
    resourceId: userId,
    details: { email: user.email },
  });

  pushEventToUser(userId, 'profile.changed', { user: serializeUser(user) });
  pushEventToUser(userId, 'activities.changed', {});
  return serializeUser(user);
};

const deleteUser = async (userId) => {
  pushEventToUser(userId, 'account.deleted', {});
  require('./realtimeRelayService').disconnectUser(userId);
  await prisma.user.delete({ where: { id: userId } });
};

const updateUserPassword = async (userId, password) => {
  await updateSensitiveUser(userId, { passwordHash: await bcrypt.hash(password, 12) });

  pushEventToUser(userId, 'profile.changed', {});
  pushEventToUser(userId, 'activities.changed', {});
};

const setUserStatus = async (userId, isActive) => {
  const user = await updateSensitiveUser(userId, { isActive });

  if (!isActive) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  await logActivity({
    userId,
    action: Boolean(isActive) ? 'account_enabled' : 'account_disabled',
    resourceType: 'user',
    resourceId: userId,
    details: { isActive: Boolean(isActive) },
  });

  if (user.isActive) {
    pushEventToUser(userId, 'profile.changed', { user: serializeUser({ ...user, likes: [], wishlistItems: [] }) });
  } else {
    pushEventToUser(userId, 'account.disabled', {});
  }
  pushEventToUser(userId, 'activities.changed', {});

  return user;
};

const getActivities = async (userId) => {
  const activities = await prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return activities.map(serializeActivity);
};

const getActivitiesByUserId = async (userId) => getActivities(userId);

const getCart = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((product) => [product.id, serializeProduct(product)]));

  return items.map((item) =>
    serializeCartItem({
      ...item,
      product: productMap.get(item.productId) || item.productSnapshot || item.productId,
    })
  );
};

const addCartItem = async (userId, { productId, quantity, customization }) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new ApiError(404, 'Product not found');

  const item = await prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity,
      customization: customization || {},
      productSnapshot: serializeProduct(product),
    },
  });

  await logActivity({
    userId,
    action: 'cart_item_added',
    resourceType: 'cart',
    resourceId: item.id,
    details: { productId, quantity },
  });

  pushEventToUser(userId, 'cart.changed', {});
  pushEventToUser(userId, 'activities.changed', {});

  return getCart(userId);
};

const updateCartItem = async (userId, { itemId, quantity }) => {
  const existing = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
  if (!existing) throw new ApiError(404, 'Cart item not found');

  await prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity: Math.min(99, Math.max(1, Number(quantity) || 1)) },
  });

  await logActivity({
    userId,
    action: 'cart_item_updated',
    resourceType: 'cart',
    resourceId: itemId,
    details: { quantity: Math.min(99, Math.max(1, Number(quantity) || 1)) },
  });

  pushEventToUser(userId, 'cart.changed', {});
  pushEventToUser(userId, 'activities.changed', {});

  return getCart(userId);
};

const removeCartItem = async (userId, itemId) => {
  const existing = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
  if (!existing) throw new ApiError(404, 'Cart item not found');
  await prisma.cartItem.delete({ where: { id: existing.id } });

  await logActivity({
    userId,
    action: 'cart_item_removed',
    resourceType: 'cart',
    resourceId: itemId,
    details: { productId: existing.productId },
  });

  pushEventToUser(userId, 'cart.changed', {});
  pushEventToUser(userId, 'activities.changed', {});

  return getCart(userId);
};

const toggleLike = async (userId, productId) => {
  if (!await prisma.product.findUnique({ where: { id: productId } })) throw new ApiError(404, 'Product not found');
  const existing = await prisma.like.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId, productId } });
  }

  await logActivity({
    userId,
    action: existing ? 'product_unliked' : 'product_liked',
    resourceType: 'like',
    resourceId: productId,
    details: { productId },
  });

  const user = await userRepository.findById(userId);
  pushEventToUser(userId, 'profile.changed', { user: serializeUser(user) });
  pushEventToUser(userId, 'activities.changed', {});
  return user.likes.map((entry) => entry.productId);
};

const getWishlist = async (userId) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((product) => [product.id, serializeProduct(product)]));

  return items.map((item) => productMap.get(item.productId) || item.productSnapshot).filter(Boolean);
};

const toggleWishlist = async (userId, productId) => {
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new ApiError(404, 'Product not found');
    await prisma.wishlistItem.create({
      data: {
        userId,
        productId,
        productSnapshot: product ? serializeProduct(product) : null,
      },
    });
  }

  await logActivity({
    userId,
    action: existing ? 'wishlist_removed' : 'wishlist_added',
    resourceType: 'wishlist',
    resourceId: productId,
    details: { productId },
  });

  const user = await userRepository.findById(userId);
  pushEventToUser(userId, 'profile.changed', { user: serializeUser(user) });
  pushEventToUser(userId, 'activities.changed', {});
  return user.wishlistItems.map((entry) => entry.productId);
};

const adminUpdateUserDetails = async (adminUserId, targetUserId, { fullName, email, phoneNumber, password, role }) => {
  const payload = {};
  
  if (fullName) payload.fullName = fullName;
  if (phoneNumber !== undefined) payload.phoneNumber = phoneNumber || null;
  if (role) payload.role = role.toUpperCase();
  
  if (email) {
    const normalizedEmail = String(email).toLowerCase();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing && existing.id !== targetUserId) {
      throw new ApiError(409, 'Email address is already registered to another user');
    }
    payload.email = normalizedEmail;
  }
  
  if (password) {
    payload.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await updateSensitiveUser(targetUserId, payload);

  await logActivity({
    userId: adminUserId,
    action: 'admin_updated_user',
    resourceType: 'user',
    resourceId: targetUserId,
    details: { updatedFields: Object.keys(payload) },
  });

  pushEventToUser(targetUserId, 'profile.changed', { user: serializeUser(user) });
  return serializeUser(user);
};

module.exports = {
  addCartItem,
  adminUpdateUserDetails,
  deleteUser,
  getActivities,
  getActivitiesByUserId,
  getAllUsers,
  getCart,
  getUserById,
  getWishlist,
  removeCartItem,
  setUserStatus,
  toggleLike,
  toggleWishlist,
  updateCartItem,
  updateProfile,
  updateUserPassword,
};

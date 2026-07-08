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

const updateProfile = async (userId, { fullName, email, phoneNumber, address, password }) => {
  const normalizedEmail = String(email).toLowerCase();
  const existing = await userRepository.findByEmail(normalizedEmail);

  if (existing && existing.id !== userId) {
    throw new ApiError(409, 'Email address is already registered');
  }

  const payload = {
    fullName,
    email: normalizedEmail,
    phoneNumber: phoneNumber || null,
    address: address || null,
  };

  if (password) payload.passwordHash = await bcrypt.hash(password, 12);

  const user = await userRepository.updateUser(userId, payload);
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
  await prisma.user.delete({ where: { id: userId } });
};

const updateUserPassword = async (userId, password) => {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  pushEventToUser(userId, 'profile.changed', {});
  pushEventToUser(userId, 'activities.changed', {});
};

const setUserStatus = async (userId, isActive) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: Boolean(isActive) },
  });

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
    data: { quantity: Math.max(1, Number(quantity) || 1) },
  });

  await logActivity({
    userId,
    action: 'cart_item_updated',
    resourceType: 'cart',
    resourceId: itemId,
    details: { quantity: Math.max(1, Number(quantity) || 1) },
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

module.exports = {
  addCartItem,
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

const { ProductBadge, Availability, OrderStatus } = require('@prisma/client');

const badgeLabels = {
  [ProductBadge.NORMAL]: 'Normal',
  [ProductBadge.NEW_ARRIVAL]: 'New Arrival',
  [ProductBadge.OFFER]: 'Offer',
};

const availabilityLabels = {
  [Availability.AVAILABLE]: 'Available',
  [Availability.UNAVAILABLE]: 'Unavailable',
};

const orderStatusLabels = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
};

const toNumber = (value) => (value == null ? null : Number(value));

const serializeProduct = (product) => ({
  id: product.id,
  _id: product.id,
  name: product.name,
  category: product.category,
  price: toNumber(product.price),
  offerPrice: toNumber(product.offerPrice),
  description: product.description || '',
  image: product.image || null,
  badge: badgeLabels[product.badge] || 'Normal',
  productStatus: badgeLabels[product.badge] || 'Normal',
  availability: availabilityLabels[product.availability] || 'Available',
  status: availabilityLabels[product.availability] || 'Available',
  featured: Boolean(product.featured),
  customizedAvailable: product.customizedAvailable !== false,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const serializeUser = (user) => ({
  id: user.id,
  _id: user.id,
  name: user.fullName,
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber || '',
  mobile: user.phoneNumber || '',
  address: user.address || '',
  role: user.role === 'ADMIN' ? 'admin' : 'user',
  isAdmin: user.role === 'ADMIN',
  isActive: user.isActive !== false,
  likes: user.likes?.map((entry) => entry.productId) || [],
  wishlist: user.wishlistItems?.map((entry) => entry.productId) || [],
  cartCount: user.cartItems?.length ?? user._count?.cartItems ?? 0,
  orderCount: user.orders?.length ?? user._count?.orders ?? 0,
  reviewCount: user.reviews?.length ?? user._count?.reviews ?? 0,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const serializeCartItem = (item) => ({
  id: item.id,
  _id: item.id,
  cartId: item.id,
  productId: item.product || item.productSnapshot || item.productId,
  quantity: item.quantity,
  customization: item.customization || {},
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const serializeOrder = (order) => ({
  id: order.id,
  _id: order.id,
  status: orderStatusLabels[order.status] || 'Pending',
  paymentMethod: order.paymentMethod,
  itemsPrice: toNumber(order.itemsPrice),
  taxPrice: toNumber(order.taxPrice),
  shippingPrice: toNumber(order.shippingPrice),
  totalPrice: toNumber(order.totalPrice),
  shippingAddress: order.shippingAddress,
  deliveryDate: order.deliveryDate,
  orderItems: order.orderItems,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const serializeReview = (review) => ({
  id: review.id,
  _id: review.id,
  userId: review.userId,
  userName: review.userName,
  rating: review.rating,
  comment: review.comment,
  image: review.image || null,
  productId: review.productId,
  isHidden: Boolean(review.isHidden),
  isPinned: Boolean(review.isPinned),
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
});

const serializeActivity = (activity) => ({
  id: activity.id,
  _id: activity.id,
  action: activity.action,
  resourceType: activity.resourceType,
  resourceId: activity.resourceId,
  details: activity.details,
  createdAt: activity.createdAt,
});

module.exports = {
  serializeActivity,
  serializeCartItem,
  serializeOrder,
  serializeProduct,
  serializeReview,
  serializeUser,
};

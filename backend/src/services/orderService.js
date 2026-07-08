const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/apiError');
const { serializeOrder } = require('../utils/serializers');
const { logActivity } = require('./activityService');
const { pushEventToUser } = require('./realtimeRelayService');

const createOrder = async (userId, payload) => {
  const order = await prisma.order.create({
    data: {
      userId,
      paymentMethod: payload.paymentMethod,
      itemsPrice: payload.itemsPrice,
      taxPrice: payload.taxPrice,
      shippingPrice: payload.shippingPrice,
      totalPrice: payload.totalPrice,
      shippingAddress: payload.shippingAddress,
      deliveryDate: payload.deliveryDate || null,
      orderItems: payload.orderItems,
    },
  });

  await prisma.cartItem.deleteMany({ where: { userId } });
  await logActivity({
    userId,
    action: 'order_created',
    resourceType: 'order',
    resourceId: order.id,
    details: { totalPrice: payload.totalPrice },
  });

  pushEventToUser(userId, 'orders.changed', {});
  pushEventToUser(userId, 'cart.changed', {});
  pushEventToUser(userId, 'activities.changed', {});

  return serializeOrder(order);
};

const getMyOrders = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map(serializeOrder);
};

const getOrderById = async (userId, role, orderId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, 'Order not found');
  if (role !== 'ADMIN' && order.userId !== userId) throw new ApiError(403, 'Not authorized to view this order');
  return serializeOrder(order);
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};

const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/apiError');
const { serializeOrder } = require('../utils/serializers');
const { pushEventToUser } = require('./realtimeRelayService');

const stonePrices = { Crystals: 250, 'Pearl Beads': 200, 'Kundan Highlights': 300 };
const flowerPrices = { Orchid: 300, Lotus: 400 };
const validColor = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

const priceAddons = (customization = {}) => {
  const chosenStones = Array.isArray(customization.stones)
    ? [...new Set(customization.stones)].filter((name) => Object.hasOwn(stonePrices, name))
    : [];
  const chosenFlowers = Array.isArray(customization.selectedFlowers)
    ? [...new Set(customization.selectedFlowers)].filter((name) => Object.hasOwn(flowerPrices, name))
    : [];
  const colors = Array.isArray(customization.secondaryColors) ? customization.secondaryColors : [];

  return {
    stones: chosenStones.reduce((sum, name) => sum + stonePrices[name], 0),
    genericStones: customization.stones === true ? 200 : 0,
    flowers: chosenFlowers.reduce((sum, name) => sum + flowerPrices[name], 0),
    beads: customization.beads ? 120 : 0,
    multicolor: customization.primaryColor === 'Multicolor' || new Set(colors).size >= 2 ? 200 : 0,
    chosenStones,
    chosenFlowers,
  };
};

const createOrder = async (userId, payload) => {
  if (payload.paymentMethod !== 'Cash on Delivery') {
    throw new ApiError(400, 'Cash on Delivery is the only available payment method');
  }

  const address = payload.shippingAddress || {};
  const shippingAddress = {
    address: String(address.address || '').trim(),
    city: String(address.city || '').trim(),
    postalCode: String(address.postalCode || '').trim(),
    country: String(address.country || '').trim(),
  };
  if (Object.values(shippingAddress).some((value) => !value || value.length > 180)) {
    throw new ApiError(400, 'Complete each shipping address field before placing your order');
  }

  const deliveryDate = payload.deliveryDate ? new Date(payload.deliveryDate) : null;
  if (deliveryDate && Number.isNaN(deliveryDate.getTime())) throw new ApiError(400, 'Delivery date is invalid');

  const order = await prisma.$transaction(async (transaction) => {
    // Read and claim the cart in one transaction so simultaneous submissions cannot place it twice.
    const cart = await transaction.cartItem.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
    if (!cart.length) throw new ApiError(400, 'Your cart is empty');
    if (cart.some((item) => item.quantity < 1 || item.quantity > 99)) {
      throw new ApiError(400, 'Each item quantity must be between 1 and 99');
    }

    const products = await transaction.product.findMany({ where: { id: { in: [...new Set(cart.map((item) => item.productId))] } } });
    const productMap = new Map(products.map((product) => [product.id, product]));
    let itemsPrice = 0;

    const orderItems = cart.map((cartItem) => {
      const product = productMap.get(cartItem.productId);
      if (!product || product.availability !== 'AVAILABLE') {
        throw new ApiError(409, 'A product in your cart is no longer available. Please review your cart.');
      }

      const customization = cartItem.customization && typeof cartItem.customization === 'object' ? cartItem.customization : {};
      const addons = priceAddons(customization);
      const basePrice = Number(product.badge === 'OFFER' && product.offerPrice != null ? product.offerPrice : product.price);
      const unitPrice = basePrice + addons.stones + addons.genericStones + addons.flowers + addons.beads + addons.multicolor;
      itemsPrice += unitPrice * cartItem.quantity;

      const safeCustomization = {};
      if (typeof customization.variant === 'string') safeCustomization.variant = customization.variant.slice(0, 40);
      if (validColor(customization.mainColor)) safeCustomization.mainColor = customization.mainColor;
      if (validColor(customization.secondaryColor)) safeCustomization.secondaryColor = customization.secondaryColor;
      if (typeof customization.primaryColor === 'string') safeCustomization.primaryColor = customization.primaryColor.slice(0, 40);
      if (Array.isArray(customization.secondaryColors)) safeCustomization.secondaryColors = customization.secondaryColors.filter((color) => typeof color === 'string').slice(0, 6);
      if (addons.chosenStones.length) safeCustomization.stones = addons.chosenStones;
      else if (customization.stones === true) safeCustomization.stones = true;
      if (addons.chosenFlowers.length) safeCustomization.selectedFlowers = addons.chosenFlowers;
      if (customization.beads) safeCustomization.beads = true;
      if (typeof customization.notes === 'string') safeCustomization.notes = customization.notes.trim().slice(0, 500);
      if (typeof customization.referenceImageName === 'string') safeCustomization.referenceImageName = customization.referenceImageName.slice(0, 120);
      if (customization.hasReferencePhoto || customization.referenceImageName) safeCustomization.hasReferencePhoto = true;

      return {
        product: product.id,
        name: product.name,
        qty: cartItem.quantity,
        image: product.image || '',
        price: unitPrice,
        customization: safeCustomization,
      };
    });

    // Tax and delivery are currently free in the storefront. All product prices come from the catalog.
    const taxPrice = 0;
    const shippingPrice = 0;
    const totalPrice = itemsPrice;
    const removedItems = await transaction.cartItem.deleteMany({ where: { userId } });
    if (removedItems.count !== cart.length) {
      throw new ApiError(409, 'Your cart changed during checkout. Please review it and try again.');
    }

    const createdOrder = await transaction.order.create({
      data: {
        userId,
        paymentMethod: payload.paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        shippingAddress,
        deliveryDate,
        orderItems,
      },
    });

    await transaction.activityLog.create({
      data: {
        userId,
        action: 'order_created',
        resourceType: 'order',
        resourceId: createdOrder.id,
        details: { totalPrice },
      },
    });
    return createdOrder;
  });

  pushEventToUser(userId, 'orders.changed', {});
  pushEventToUser(userId, 'cart.changed', {});
  pushEventToUser(userId, 'activities.changed', {});
  return serializeOrder(order);
};

const getMyOrders = async (userId) => {
  const orders = await prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  return orders.map(serializeOrder);
};

const getOrderById = async (userId, role, orderId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new ApiError(404, 'Order not found');
  if (role !== 'ADMIN' && order.userId !== userId) throw new ApiError(403, 'Not authorized to view this order');
  return serializeOrder(order);
};

module.exports = { createOrder, getMyOrders, getOrderById };

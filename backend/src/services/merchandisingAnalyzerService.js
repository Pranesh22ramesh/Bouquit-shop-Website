const { OrderStatus, ProductBadge } = require('@prisma/client');
const { prisma } = require('../config/prisma');

const LATEST_WINDOW_DAYS = 30;

const getOrderProductId = (item) => {
  const candidate = item?.product || item?.productId || item?.id;
  if (candidate && typeof candidate === 'object') return candidate.id || candidate._id || null;
  return candidate ? String(candidate) : null;
};

const buildMerchandisingAnalysis = (products, orders, reviews, now = new Date()) => {
  const salesByProduct = new Map();
  const reviewsByProduct = new Map();

  orders.forEach((order) => {
    const seenInOrder = new Set();
    const items = Array.isArray(order.orderItems) ? order.orderItems : [];
    items.forEach((item) => {
      const productId = getOrderProductId(item);
      if (!productId) return;
      const quantity = Math.max(1, Number(item.qty || item.quantity || 1));
      const price = Math.max(0, Number(item.price || 0));
      const current = salesByProduct.get(productId) || { unitsSold: 0, orderCount: 0, revenue: 0 };
      current.unitsSold += quantity;
      current.revenue += price * quantity;
      if (!seenInOrder.has(productId)) {
        current.orderCount += 1;
        seenInOrder.add(productId);
      }
      salesByProduct.set(productId, current);
    });
  });

  reviews.forEach((review) => {
    if (!review.productId) return;
    const current = reviewsByProduct.get(review.productId) || { total: 0, reviewCount: 0 };
    current.total += Number(review.rating || 0);
    current.reviewCount += 1;
    reviewsByProduct.set(review.productId, current);
  });

  const rankedSales = products
    .map((product) => ({ id: product.id, unitsSold: salesByProduct.get(product.id)?.unitsSold || 0 }))
    .filter((entry) => entry.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold);
  const highSellerCount = Math.max(1, Math.ceil(products.length * 0.2));
  const highSellerIds = new Set(rankedSales.slice(0, highSellerCount).map((entry) => entry.id));

  return new Map(products.map((product) => {
    const sales = salesByProduct.get(product.id) || { unitsSold: 0, orderCount: 0, revenue: 0 };
    const reviewData = reviewsByProduct.get(product.id) || { total: 0, reviewCount: 0 };
    const averageRating = reviewData.reviewCount
      ? Number((reviewData.total / reviewData.reviewCount).toFixed(1))
      : 0;
    const ageInDays = Math.max(0, (now.getTime() - new Date(product.createdAt).getTime()) / 86_400_000);
    const tags = [];

    if (product.badge === ProductBadge.OFFER && product.offerPrice != null) tags.push('Offered');
    if (highSellerIds.has(product.id)) tags.push('High Selling');
    if (ageInDays <= LATEST_WINDOW_DAYS) tags.push('Latest');
    if (reviewData.reviewCount >= 2 && averageRating >= 4.5) tags.push('Top Rated');

    const primaryTag = ['Offered', 'High Selling', 'Top Rated', 'Latest'].find((tag) => tags.includes(tag)) || null;
    const score = Number((sales.unitsSold * 5 + sales.orderCount * 2 + averageRating * reviewData.reviewCount).toFixed(1));

    return [product.id, {
      unitsSold: sales.unitsSold,
      orderCount: sales.orderCount,
      revenue: Number(sales.revenue.toFixed(2)),
      averageRating,
      reviewCount: reviewData.reviewCount,
      tags,
      primaryTag,
      score,
    }];
  }));
};

const analyzeProducts = async (products) => {
  if (!products.length) return new Map();
  const productIds = products.map((product) => product.id);
  const [orders, reviews] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: OrderStatus.CANCELLED } },
      select: { orderItems: true },
    }),
    prisma.review.findMany({
      where: { productId: { in: productIds }, isHidden: false },
      select: { productId: true, rating: true },
    }),
  ]);

  return buildMerchandisingAnalysis(products, orders, reviews);
};

module.exports = { LATEST_WINDOW_DAYS, analyzeProducts, buildMerchandisingAnalysis };

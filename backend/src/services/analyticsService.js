const { prisma } = require('../config/prisma');
const productService = require('./productService');

const getDashboardAnalytics = async () => {
  const [userCount, productCount, orderCount, reviewCount, featuredProductCount, activities] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.review.count({ where: { isHidden: false } }),
    prisma.product.count({ where: { featured: true } }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  const categories = await prisma.product.findMany({
    distinct: ['category'],
    select: { category: true },
  });

  const revenueResult = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });
  const merchandisingProducts = await productService.listProducts({ limit: 5, sort: 'high-selling' });

  return {
    totalUsers: userCount,
    totalProducts: productCount,
    totalOrders: orderCount,
    totalRevenue: Number(revenueResult._sum.totalPrice || 0),
    totalReviews: reviewCount,
    totalCategories: categories.length,
    featuredProducts: featuredProductCount,
    recentActivities: activities.map((entry) => ({
      id: entry.id,
      action: entry.action,
      resourceType: entry.resourceType,
      details: entry.details,
      createdAt: entry.createdAt,
    })),
    merchandisingInsights: merchandisingProducts.map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      ...product.analytics,
    })),
  };
};

module.exports = { getDashboardAnalytics };

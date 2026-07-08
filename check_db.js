const { PrismaClient } = require("./backend/node_modules/@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();

    const [userCount, productCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);

    console.log("Database connection successful");
    console.log("Users:", userCount);
    console.log("Products:", productCount);
    console.log("Orders:", orderCount);
  } catch (error) {
    console.error("Database check failed:", error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

const { PrismaClient } = require("./backend/node_modules/@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to Prisma database successfully.");

    const key = "home-highlight";
    const existing = await prisma.contentSection.findUnique({ where: { key } });

    if (existing) {
      console.log("Found existing home-highlight content. Updating...");
      const updatedData = {
        ...existing.data,
        heroText: "Crafting Your Eternal Memories",
        heroDescription: "Handcrafted bouquets, elegant garlands, and floral experiences tailored to your celebration. and We can deliver allover Tamilnadu"
      };

      await prisma.contentSection.update({
        where: { key },
        data: { data: updatedData }
      });
      console.log("Successfully updated home-highlight content in the database!");
    } else {
      console.log("No home-highlight content found in the database.");
    }
  } catch (error) {
    console.error("Failed to update database content:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

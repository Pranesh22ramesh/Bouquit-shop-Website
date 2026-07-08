const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Floral Hair Piece 1",
      category: "Hair Style",
      price: 2500,
      description: "Beautiful floral hair piece for elegant styling.",
      image: "/gallery/hairstyle/hairstyle_1.jpg",
    },
    {
      name: "Floral Hair Piece 2",
      category: "Hair Style",
      price: 3000,
      description: "Elegant floral hair bun accessory.",
      image: "/gallery/hairstyle/hairstyle_2.jpg",
    },
    {
      name: "Floral Hair Piece 3",
      category: "Hair Style",
      price: 3500,
      description: "Stunning floral hair braid extension.",
      image: "/gallery/hairstyle/hairstyle_3.jpg",
    },
    {
      name: "Floral Hair Piece 4",
      category: "Hair Style",
      price: 4000,
      description: "Premium floral styling for traditional wear.",
      image: "/gallery/hairstyle/hairstyle_4.jpg",
    }
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: prod
    });
  }

  console.log("Hair style products added successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

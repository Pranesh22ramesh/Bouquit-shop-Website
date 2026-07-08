const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Custom Bouquet 1",
      category: "bouquet",
      price: 1500,
      description: "A beautiful custom bouquet tailored for special occasions.",
      image: "/gallery/bouquet/custom_bouquet_1.jpg",
    },
    {
      name: "Custom Bouquet 2",
      category: "bouquet",
      price: 1800,
      description: "An elegant custom bouquet with a stunning arrangement.",
      image: "/gallery/bouquet/custom_bouquet_2.jpg",
    },
    {
      name: "Custom Bouquet 3",
      category: "bouquet",
      price: 2000,
      description: "A gorgeous mix of fresh blooms for your loved ones.",
      image: "/gallery/bouquet/custom_bouquet_3.jpg",
    },
    {
      name: "Custom Bouquet 4",
      category: "bouquet",
      price: 2200,
      description: "Vibrant and lively bouquet arrangement.",
      image: "/gallery/bouquet/custom_bouquet_4.jpg",
    },
    {
      name: "Custom Bouquet 5",
      category: "bouquet",
      price: 2500,
      description: "Classic romantic bouquet with premium wrapping.",
      image: "/gallery/bouquet/custom_bouquet_5.jpg",
    }
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: prod
    });
  }

  console.log("Custom bouquets added successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

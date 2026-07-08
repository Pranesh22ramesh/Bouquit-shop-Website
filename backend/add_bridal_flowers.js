const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Bridal Flower Jadai 1",
      category: "Bridal Flowers",
      price: 2800,
      description: "Premium bridal flower jadai with red roses and golden accents.",
      image: "/gallery/bridal-flowers/bridal_new_1.jpg",
    },
    {
      name: "Bridal Flower Jadai 2",
      category: "Bridal Flowers",
      price: 3200,
      description: "Beautiful braided jadai with pink and green floral decorations.",
      image: "/gallery/bridal-flowers/bridal_new_2.jpg",
    },
    {
      name: "Bridal Flower Jadai 3",
      category: "Bridal Flowers",
      price: 2500,
      description: "Classic red and yellow rose bud jadai for weddings.",
      image: "/gallery/bridal-flowers/bridal_new_3.jpg",
    },
    {
      name: "Bridal Flower Jadai 4",
      category: "Bridal Flowers",
      price: 2900,
      description: "Elegant purple orchid jadai piece with decorative elements.",
      image: "/gallery/bridal-flowers/bridal_new_4.jpg",
    }
  ];

  for (const prod of products) {
    await prisma.product.create({
      data: prod
    });
  }

  console.log("Bridal flowers products added successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

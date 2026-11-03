const { PrismaClient, ProductBadge, Availability, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: 'Classic Red Bridal Jadai',
    category: 'bridal-flowers',
    price: 2500,
    offerPrice: 2200,
    description: 'Traditional South Indian bridal jadai with layered jasmine and red roses.',
    image: 'https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: ProductBadge.OFFER,
    availability: Availability.AVAILABLE,
    featured: true,
  },
  {
    name: 'Pastel Bridal Hair Floral Set',
    category: 'bridal-flowers',
    price: 3200,
    description: 'Soft pastel mix of baby pink roses, carnations and gypsos for reception look.',
    image: 'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: ProductBadge.NEW_ARRIVAL,
    availability: Availability.AVAILABLE,
    featured: true,
  },
  {
    name: 'Floral Ring Stage Backdrop',
    category: 'stage-decoration',
    price: 15000,
    description: 'Round floral ring with mix of roses, chrysanthemums and fillers.',
    image: 'https://images.pexels.com/photos/1966889/pexels-photo-1966889.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: ProductBadge.NORMAL,
    availability: Availability.AVAILABLE,
    featured: true,
  },
  {
    name: 'Mandap Entrance Arch',
    category: 'stage-decoration',
    price: 18000,
    offerPrice: 16500,
    description: 'Grand entrance arch with marigold, jasmine and green foliage.',
    image: 'https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: ProductBadge.OFFER,
    availability: Availability.AVAILABLE,
    featured: false,
  },
  {
    name: 'Lotus Flower Dollar',
    category: 'flower-dollars',
    price: 3500,
    description: 'Pink lotus based dollar with golden ribbon highlights.',
    image: 'https://images.pexels.com/photos/258539/pexels-photo-258539.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: ProductBadge.NEW_ARRIVAL,
    availability: Availability.AVAILABLE,
    featured: true,
  },
  {
    name: 'Rose Petal Dollar',
    category: 'flower-dollars',
    price: 2800,
    description: 'Layered rose petal dollar in red & white tones with bead work.',
    image: 'https://images.pexels.com/photos/3738374/pexels-photo-3738374.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: ProductBadge.NORMAL,
    availability: Availability.AVAILABLE,
    featured: false,
  },
  {
    name: 'Bridal Hand Bouquet - Red Roses',
    category: 'bouquets',
    price: 1800,
    offerPrice: 1500,
    description: 'Compact hand bouquet with 25 red roses and baby’s breath fillers.',
    image: 'https://images.pexels.com/photos/931167/pexels-photo-931167.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: ProductBadge.OFFER,
    availability: Availability.AVAILABLE,
    featured: true,
  },
  {
    name: 'Pastel Peach Bridal Bouquet',
    category: 'bouquets',
    price: 2200,
    description: 'Peach roses, white carnations and eucalyptus for dreamy photographs.',
    image: 'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: ProductBadge.NEW_ARRIVAL,
    availability: Availability.AVAILABLE,
    featured: true,
  },
  {
    name: 'Custom Elegant Rose Bouquet',
    category: 'bouquets',
    price: 1500,
    description: 'A beautiful custom bouquet tailored for special celebrations.',
    image: '/gallery/bouquet/custom_bouquet_1.jpg',
    badge: ProductBadge.NORMAL,
    availability: Availability.AVAILABLE,
    featured: false,
  },
  {
    name: 'Vibrant Floral Bouquet',
    category: 'bouquets',
    price: 2500,
    description: 'Vibrant and lively bouquet arrangement featuring premium red roses.',
    image: '/gallery/bouquet/custom_bouquet_5.jpg',
    badge: ProductBadge.NEW_ARRIVAL,
    availability: Availability.AVAILABLE,
    featured: true,
  },
];

async function main() {
  console.log('Seeding database...');
  
  // Seed admin user
  const adminEmail = (process.env.ADMIN_EMAIL || 'miudhunyas2012@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword && process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: ADMIN_PASSWORD environment variable must be set to run seed in production!');
  }

  const finalPassword = adminPassword || 'DevAdminPass123!';
  const passwordHash = await bcrypt.hash(finalPassword, 12);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, passwordHash },
    create: {
      email: adminEmail,
      fullName: 'MIDHUNYAS Admin',
      passwordHash,
      role: Role.ADMIN,
      phoneNumber: '+91 9942071721',
    },
  });
  console.log(`Admin user seeded: ${adminEmail}`);

  // Seed sample products if database has no products
  const count = await prisma.product.count();
  if (count === 0) {
    for (const p of sampleProducts) {
      await prisma.product.create({ data: p });
    }
    console.log(`Seeded ${sampleProducts.length} initial products.`);
  } else {
    console.log(`Database already has ${count} products.`);
  }

  // Seed default home-highlight content section
  await prisma.contentSection.upsert({
    where: { key: 'home-highlight' },
    update: {
      data: {
        heroText: 'Crafting Your Eternal Memories',
        heroDescription: 'Handcrafted bouquets, elegant garlands, and floral experiences tailored to your celebration. and We can deliver allover Tamilnadu',
      },
    },
    create: {
      key: 'home-highlight',
      data: {
        heroText: 'Crafting Your Eternal Memories',
        heroDescription: 'Handcrafted bouquets, elegant garlands, and floral experiences tailored to your celebration. and We can deliver allover Tamilnadu',
      },
    },
  });
  console.log('Home highlight content seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

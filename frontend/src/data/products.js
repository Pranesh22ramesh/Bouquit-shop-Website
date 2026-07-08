// src/data/products.js

export const CATEGORIES = [
  {
    id: "bridal-flowers",
    slug: "bridal-flowers",
    name: "Bridal Flowers",
    description: "Elegant hairdo and bridal flower sets curated for your big day.",
    imageUrl:
      "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },

  {
    id: "stage-decoration",
    slug: "stage-decoration",
    name: "Stage Decoration",
    description: "Stage backdrops, floral arches and mandap decor.",
    imageUrl:
      "https://images.pexels.com/photos/1966889/pexels-photo-1966889.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "flower-dollars",
    slug: "flower-dollars",
    name: "Flower Dollars",
    description: "Stylish flower dollars and malas for special entries.",
    imageUrl:
      "https://images.pexels.com/photos/3738374/pexels-photo-3738374.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "bouquets",
    slug: "bouquets",
    name: "Bouquets",
    description: "Hand bouquets, basket arrangements and gift florals.",
    imageUrl:
      "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    id: "hair-style",
    slug: "hair-style",
    name: "Hair Style",
    description: "Beautiful hair styling floral arrangements and pieces.",
    imageUrl: "/gallery/hairstyle/hairstyle_1.jpg",
  },
];

export const PRODUCTS = [
  {
    id: "BF001",
    title: "Classic Red Bridal Jadai",
    description:
      "Traditional South Indian bridal jadai with layered jasmine and red roses.",
    category: "bridal-flowers",
    basePrice: 2500,
    size: "Full length (back waist)",
    isPremium: false,
    flowersUsed: ["Jasmine", "Red Rose"],
    images: [
      "https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=1200",
      "https://images.pexels.com/photos/931167/pexels-photo-931167.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    tags: ["jadai", "bridal", "traditional"],
  },
  {
    id: "BF002",
    title: "Pastel Bridal Hair Floral Set",
    description:
      "Soft pastel mix of baby pink roses, carnations and gypsos for reception look.",
    category: "bridal-flowers",
    basePrice: 3200,
    size: "Medium length",
    isPremium: true,
    flowersUsed: ["Rose", "Carnation", "Gypsophila"],
    images: [
      "https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    tags: ["pastel", "reception", "modern"],
  },

  {
    id: "SD001",
    title: "Floral Ring Stage Backdrop",
    description:
      "Round floral ring with mix of roses, chrysanthemums and fillers.",
    category: "stage-decoration",
    basePrice: 15000,
    size: "12 ft diameter",
    isPremium: true,
    flowersUsed: ["Rose", "Chrysanthemum"],
    images: [
      "https://images.pexels.com/photos/1966889/pexels-photo-1966889.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    tags: ["stage", "backdrop", "ring"],
  },
  {
    id: "SD002",
    title: "Mandap Entrance Arch",
    description:
      "Grand entrance arch with marigold, jasmine and green foliage.",
    category: "stage-decoration",
    basePrice: 18000,
    size: "18 ft width",
    isPremium: false,
    flowersUsed: ["Marigold", "Jasmine"],
    images: [
      "https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    tags: ["arch", "entrance"],
  },
  {
    id: "FD001",
    title: "Lotus Flower Dollar",
    description: "Pink lotus based dollar with golden ribbon highlights.",
    category: "flower-dollars",
    basePrice: 3500,
    size: "Chest length",
    isPremium: true,
    flowersUsed: ["Lotus"],
    images: [
      "https://images.pexels.com/photos/258539/pexels-photo-258539.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    tags: ["lotus", "premium"],
  },
  {
    id: "FD002",
    title: "Rose Petal Dollar",
    description:
      "Layered rose petal dollar in red & white tones with bead work.",
    category: "flower-dollars",
    basePrice: 2800,
    size: "Medium length",
    isPremium: false,
    flowersUsed: ["Rose"],
    images: [
      "https://images.pexels.com/photos/3738374/pexels-photo-3738374.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    tags: ["rose", "classic"],
  },
  {
    id: "BQ001",
    title: "Bridal Hand Bouquet - Red Roses",
    description:
      "Compact hand bouquet with 25 red roses and baby’s breath fillers.",
    category: "bouquets",
    basePrice: 1800,
    size: "Standard",
    isPremium: false,
    flowersUsed: ["Red Rose"],
    images: [
      "https://images.pexels.com/photos/931167/pexels-photo-931167.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    tags: ["hand bouquet", "red"],
  },
  {
    id: "BQ002",
    title: "Pastel Peach Bridal Bouquet",
    description:
      "Peach roses, white carnations and eucalyptus for dreamy photographs.",
    category: "bouquets",
    basePrice: 2200,
    size: "Standard",
    isPremium: true,
    flowersUsed: ["Rose", "Carnation"],
    images: [
      "https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=1200",
    ],
    tags: ["pastel", "bridal"],
  },
  {
    id: "CBQ001",
    title: "Custom Bouquet 1",
    description: "A beautiful custom bouquet tailored for special occasions.",
    category: "bouquets",
    basePrice: 1500,
    size: "Standard",
    isPremium: false,
    flowersUsed: ["Rose"],
    images: ["/gallery/bouquet/custom_bouquet_1.jpg"],
    tags: ["custom", "bouquet"],
  },
  {
    id: "CBQ002",
    title: "Custom Bouquet 2",
    description: "An elegant custom bouquet with a stunning arrangement.",
    category: "bouquets",
    basePrice: 1800,
    size: "Standard",
    isPremium: false,
    flowersUsed: ["Rose", "Fillers"],
    images: ["/gallery/bouquet/custom_bouquet_2.jpg"],
    tags: ["custom", "bouquet"],
  },
  {
    id: "CBQ003",
    title: "Custom Bouquet 3",
    description: "A gorgeous mix of fresh blooms for your loved ones.",
    category: "bouquets",
    basePrice: 2000,
    size: "Standard",
    isPremium: true,
    flowersUsed: ["Mixed Flowers"],
    images: ["/gallery/bouquet/custom_bouquet_3.jpg"],
    tags: ["custom", "premium"],
  },
  {
    id: "CBQ004",
    title: "Custom Bouquet 4",
    description: "Vibrant and lively bouquet arrangement.",
    category: "bouquets",
    basePrice: 2200,
    size: "Large",
    isPremium: true,
    flowersUsed: ["Rose", "Orchid"],
    images: ["/gallery/bouquet/custom_bouquet_4.jpg"],
    tags: ["custom", "vibrant"],
  },
  {
    id: "CBQ005",
    title: "Custom Bouquet 5",
    description: "Classic romantic bouquet with premium wrapping.",
    category: "bouquets",
    basePrice: 2500,
    size: "Large",
    isPremium: true,
    flowersUsed: ["Red Rose"],
    images: ["/gallery/bouquet/custom_bouquet_5.jpg"],
    tags: ["custom", "romantic"],
  },
];

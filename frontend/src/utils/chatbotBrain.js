// Intelligent Client-Side Floral Assistant & Recommendation Engine

export const SHOP_CATALOG = [
  {
    id: 'prod-1',
    name: 'Classic Red Bridal Jadai',
    category: 'bridal-flowers',
    categoryName: 'Bridal Flowers',
    price: 2500,
    offerPrice: 2200,
    description: 'Traditional South Indian bridal jadai with layered jasmine and fresh red roses.',
    occasions: ['wedding', 'muhurtham', 'marriage', 'bride', 'traditional', 'jadai'],
    flowers: ['jasmine', 'malli', 'rose', 'red rose'],
    budget: 'mid',
    image: 'https://images.pexels.com/photos/931162/pexels-photo-931162.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: 'prod-2',
    name: 'Pastel Bridal Hair Floral Set',
    category: 'bridal-flowers',
    categoryName: 'Bridal Flowers',
    price: 3200,
    description: 'Soft pastel mix of baby pink roses, carnations, and gypsos for modern reception look.',
    occasions: ['reception', 'engagement', 'modern wedding', 'bride', 'party'],
    flowers: ['pink rose', 'carnation', 'gypsophila', 'baby breath'],
    budget: 'premium',
    image: 'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: 'prod-3',
    name: 'Floral Ring Stage Backdrop',
    category: 'stage-decoration',
    categoryName: 'Stage Decoration',
    price: 15000,
    description: 'Grand round floral ring backdrop with fresh roses, chrysanthemums, and green foliage.',
    occasions: ['stage', 'wedding', 'reception', 'engagement', 'mandap'],
    flowers: ['roses', 'chrysanthemums', 'orchids', 'fillers'],
    budget: 'luxury',
    image: 'https://images.pexels.com/photos/1966889/pexels-photo-1966889.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: 'prod-4',
    name: 'Mandap Entrance Arch',
    category: 'stage-decoration',
    categoryName: 'Stage Decoration',
    price: 18000,
    offerPrice: 16500,
    description: 'Grand entrance floral arch with marigold, jasmine, and exotic hanging flower garlands.',
    occasions: ['entrance', 'arch', 'mandap', 'temple', 'house warming', 'wedding'],
    flowers: ['marigold', 'jasmine', 'rose'],
    budget: 'luxury',
    image: 'https://images.pexels.com/photos/169211/pexels-photo-169211.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: 'prod-5',
    name: 'Lotus Flower Dollar',
    category: 'flower-dollars',
    categoryName: 'Flower Dollars',
    price: 3500,
    description: 'Handcrafted pink lotus-based dollar garland with golden ribbon highlights.',
    occasions: ['engagement', 'reception', 'muhurtham', 'garland', 'dollar'],
    flowers: ['lotus', 'jasmine', 'gold ribbon'],
    budget: 'premium',
    image: 'https://images.pexels.com/photos/258539/pexels-photo-258539.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: 'prod-6',
    name: 'Rose Petal Dollar',
    category: 'flower-dollars',
    categoryName: 'Flower Dollars',
    price: 2800,
    description: 'Layered red & white rose petal dollar with delicate pearl and bead work.',
    occasions: ['wedding', 'anniversary', 'garland', 'vip', 'felicitation'],
    flowers: ['rose petals', 'white rose', 'red rose'],
    budget: 'mid',
    image: 'https://images.pexels.com/photos/3738374/pexels-photo-3738374.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: 'prod-7',
    name: 'Bridal Hand Bouquet - Red Roses',
    category: 'bouquets',
    categoryName: 'Hand Bouquets',
    price: 1800,
    offerPrice: 1500,
    description: 'Romantic hand bouquet with 25 fresh red Dutch roses wrapped in elegant craft paper.',
    occasions: ['birthday', 'anniversary', 'valentine', 'proposal', 'reception', 'romantic'],
    flowers: ['red rose', 'baby breath'],
    budget: 'budget',
    image: 'https://images.pexels.com/photos/931167/pexels-photo-931167.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: 'prod-8',
    name: 'Pastel Peach Bridal Bouquet',
    category: 'bouquets',
    categoryName: 'Hand Bouquets',
    price: 2200,
    description: 'Dreamy peach roses, white carnations, and silver dollar eucalyptus greens.',
    occasions: ['bridal', 'reception', 'gift', 'anniversary', 'photoshoot'],
    flowers: ['peach rose', 'carnation', 'eucalyptus'],
    budget: 'mid',
    image: 'https://images.pexels.com/photos/931158/pexels-photo-931158.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    id: 'prod-9',
    name: 'Custom Elegant Rose Bouquet',
    category: 'bouquets',
    categoryName: 'Hand Bouquets',
    price: 1500,
    description: 'Custom personalized bouquet tailored with your choice of floral colors and ribbon styling.',
    occasions: ['birthday', 'congratulations', 'friendship', 'get well soon', 'custom'],
    flowers: ['mixed roses', 'fillers'],
    budget: 'budget',
    image: '/gallery/bouquet/custom_bouquet_1.jpg'
  }
];

export const SHOP_INFO = {
  name: 'MIDHUNYAS Petals & Bridal Flowers',
  city: 'Karur, Tamil Nadu',
  delivery: 'Same-day express delivery across Karur district & express floral courier all over Tamil Nadu!',
  hours: 'Open 7 days a week: 7:00 AM – 10:00 PM',
  phone: '+91 9942071721',
  whatsapp: '9942071721',
  customOrders: 'Yes! We customize bridal jadai, garland weights, flower colors, stage backdrops, and theme bouquets.'
};

/**
 * Intelligent customer intent analyzer and recommendation engine.
 * Understands taste, occasion, flowers, budget, custom requests, and delivery.
 */
export function getBotResponse(userPrompt, history = []) {
  const query = userPrompt.toLowerCase().trim();

  // 1. GREETINGS
  if (/^(hi|hello|hey|vanakkam|namaste|good\s?(morning|evening|afternoon)|start)/i.test(query)) {
    return {
      text: `Hello and Vanakkam! 🌸 I am your **MIDHUNYAS Floral Stylist Assistant**.\n\nI can help you find the perfect flowers matching your **taste, occasion, and budget**.\n\nWhat are you looking for today?`,
      suggestions: [
        '🌸 South Indian Bridal Jadai',
        '💐 Hand Bouquets & Gifts',
        '🏛️ Stage & Mandap Decoration',
        '✨ Flower Dollar Garlands',
        '🎁 Suggest by Budget'
      ]
    };
  }

  // 2. TASTE & OCCASION RECOMMENDATIONS
  // A. Bridal / Marriage / Jadai / Reception
  if (/bridal|jadai|wedding|marriage|muhurtham|bride|hair flower|reception/i.test(query)) {
    const bridalItems = SHOP_CATALOG.filter(p => p.category === 'bridal-flowers' || p.occasions.includes('wedding'));
    return {
      text: `For weddings and bridal occasions, we specialize in **authentic South Indian traditional designs** and **modern pastel themes**! 👰✨\n\nHere are our top handcrafted recommendations:`,
      products: bridalItems.slice(0, 3),
      suggestions: [
        'Classic Red Jasmine Jadai',
        'Pastel Baby Pink Hair Set',
        'Custom Wedding Garland',
        'Book via WhatsApp'
      ]
    };
  }

  // B. Bouquets / Birthday / Anniversary / Romantic / Valentine
  if (/bouquet|birthday|anniversary|romantic|love|valentine|girlfriend|boyfriend|wife|husband|proposal|rose/i.test(query)) {
    const bouquetItems = SHOP_CATALOG.filter(p => p.category === 'bouquets');
    return {
      text: `Looking for something romantic and memorable? 🌹💖\n\nOur fresh flower bouquets are handcrafted using premium Dutch roses, baby's breath, and imported foliage:`,
      products: bouquetItems,
      suggestions: [
        'Red Rose Bouquet (₹1500)',
        'Peach Pastel Bouquet',
        'Custom Message Card',
        'Same-Day Delivery'
      ]
    };
  }

  // C. Stage / Backdrop / Hall / Mandap Decoration
  if (/stage|backdrop|decoration|mandap|hall|entrance|event|arch/i.test(query)) {
    const stageItems = SHOP_CATALOG.filter(p => p.category === 'stage-decoration');
    return {
      text: `Transform your event with our **luxurious floral backdrops & arches**! 🏛️💐\n\nWe provide complete venue styling for weddings, receptions, engagements, and temple events in Karur & surrounding areas:`,
      products: stageItems,
      suggestions: [
        'Floral Ring Stage (₹15,000)',
        'Mandap Entrance Arch',
        'Request Custom Stage Quote'
      ]
    };
  }

  // D. Flower Dollars / Malai / Garlands
  if (/dollar|garland|malai|maalai|lotus|bead/i.test(query)) {
    const dollarItems = SHOP_CATALOG.filter(p => p.category === 'flower-dollars');
    return {
      text: `Our **Flower Dollars and Garlands** are masterfully stitched with fresh lotus, velvety rose petals, and golden accents: 🌺📿`,
      products: dollarItems,
      suggestions: [
        'Lotus Flower Dollar',
        'Rose Petal Dollar',
        'Order Matching Pair'
      ]
    };
  }

  // 3. BUDGET / TASTE FILTERING
  if (/budget|cheap|low price|under 1500|under 2000|affordable|cost|price|rate/i.test(query)) {
    const budgetItems = SHOP_CATALOG.filter(p => p.price <= 2500);
    return {
      text: `Here are our best floral arrangements categorized by price: 🏷️\n\n• **Budget-Friendly (₹1,500 - ₹2,000):** Hand Bouquets & Rose arrangements\n• **Mid-Tier (₹2,200 - ₹3,500):** Bridal Jadai & Lotus Flower Dollars\n• **Premium / Grand (₹15,000+):** Full Stage & Mandap Floral Setups\n\nHere are some popular options under ₹2,500:`,
      products: budgetItems.slice(0, 3),
      suggestions: ['Show Bouquets under ₹2000', 'Bridal Options', 'Talk to Florist']
    };
  }

  // 4. CUSTOM ORDERS & PERSONALIZATION TASTE
  if (/custom|customize|own design|personal|photo|different flower|special request/i.test(query)) {
    return {
      text: `🎨 **Yes, 100% Customization is our specialty!**\n\nTell us your taste:\n1. Choose your preferred flowers (Roses, Jasmine, Lotus, Carnations, Orchids)\n2. Share your outfit/saree color code for perfect matching\n3. Select garland length or bouquet wrapping style\n\nYou can also send a photo reference directly to our master florist on WhatsApp!`,
      action: {
        type: 'whatsapp',
        label: '💬 Chat with Master Florist on WhatsApp',
        url: `https://wa.me/91${SHOP_INFO.whatsapp}?text=Hi%20MIDHUNYAS,%20I%20have%20a%20custom%20flower%20design%20request.`
      },
      suggestions: [
        'Match with My Wedding Saree',
        'Custom Bouquet Wrapping',
        'View Photo Gallery'
      ]
    };
  }

  // 5. DELIVERY & LOCATION
  if (/deliver|delivery|karur|tamil nadu|reach|ship|time|timing|where|location|address/i.test(query)) {
    return {
      text: `🚚 **Delivery & Coverage Information:**\n\n• **Karur District:** Same-day instant delivery within 2–4 hours!\n• **All Over Tamil Nadu:** Express safe-pack delivery for bridal flowers, jadai, and garland sets (Coimbatore, Trichy, Madurai, Salem, Chennai, etc.)\n• **Shop Timing:** 7:00 AM to 10:00 PM (Monday to Sunday)\n• **Address:** Karur, Tamil Nadu, India.`,
      suggestions: [
        'How to Place Order?',
        'Can I order for tomorrow morning?',
        'WhatsApp Us'
      ]
    };
  }

  // 6. HOW TO ORDER / PAYMENT
  if (/order|buy|book|payment|pay|how to order/i.test(query)) {
    return {
      text: `🛒 **How to Order:**\n\n1. **Browse Gallery / Shop:** Add your favorite bouquets or bridal sets to your Cart.\n2. **Checkout:** Fill your delivery details and choose your event date.\n3. **Direct Express Order:** You can also click below to order immediately on WhatsApp with personalized assistance!`,
      action: {
        type: 'whatsapp',
        label: '📲 Order Directly on WhatsApp',
        url: `https://wa.me/91${SHOP_INFO.whatsapp}?text=Hi%20MIDHUNYAS,%20I%20would%20like%20to%20place%20an%20order.`
      },
      suggestions: [
        'Browse All Products',
        'Check Bridal Collections',
        'Ask about Delivery Time'
      ]
    };
  }

  // 7. GENERIC / SMART FALLBACK (Understands taste queries)
  // Search products matching any words in user prompt
  const matched = SHOP_CATALOG.filter(p => {
    const text = `${p.name} ${p.category} ${p.description} ${p.occasions.join(' ')} ${p.flowers.join(' ')}`.toLowerCase();
    const words = query.split(/\s+/).filter(w => w.length > 2);
    return words.some(w => text.includes(w));
  });

  if (matched.length > 0) {
    return {
      text: `Based on your request, here are flowers and designs tailored to your taste: 🌸`,
      products: matched.slice(0, 3),
      suggestions: [
        'Tell me more details',
        'Can you customize this?',
        'Order via WhatsApp'
      ]
    };
  }

  // Fallback helpful guide
  return {
    text: `I'd love to help you choose the ideal floral arrangement! 🌸\n\nCould you share a bit more about:\n• **The Occasion** (Wedding, Birthday, Anniversary, Stage Deco?)\n• **Your Preferred Flowers or Color Theme**?\n• **Your Budget Range**?\n\nOr click any of the quick options below:`,
    suggestions: [
      '👰 Bridal Jadai & Flowers',
      '🌹 Birthday / Anniversary Bouquets',
      '🏛️ Stage & Venue Decoration',
      '🚚 Delivery & Timings',
      '💬 Talk to Human Florist'
    ]
  };
}


import { Category, MenuItem, Table, Coupon, StockItem } from '../types';

export const seedCategories: Category[] = [
  {
    id: 'smorrebrod',
    name: { en: 'Smørrebrød', da: 'Smørrebrød' },
    icon: 'Utensils',
    sortOrder: 1,
    active: true,
  },
  {
    id: 'salads',
    name: { en: 'Salads & Bowls', da: 'Salater & Bowls' },
    icon: 'Salad',
    sortOrder: 2,
    active: true,
  },
  {
    id: 'coffee',
    name: { en: 'Specialty Coffee', da: 'Specialkaffe' },
    icon: 'Coffee',
    sortOrder: 3,
    active: true,
  },
  {
    id: 'drinks',
    name: { en: 'Cold Drinks & Spritz', da: 'Kolde Drikke & Spritz' },
    icon: 'Wine',
    sortOrder: 4,
    active: true,
  },
  {
    id: 'desserts',
    name: { en: 'Desserts & Ice Cream', da: 'Desserter & Is' },
    icon: 'IceCream',
    sortOrder: 5,
    active: true,
  },
  {
    id: 'breakfast',
    name: { en: 'Breakfast & Bakery', da: 'Morgenmad & Bagværk' },
    icon: 'Croissant',
    sortOrder: 6,
    active: true,
  },
];

export const seedMenuItems: MenuItem[] = [
  {
    id: 'sm-laks',
    categoryId: 'smorrebrod',
    name: {
      en: 'Smoked Salmon Smørrebrød',
      da: 'Røget Laks Smørrebrød',
    },
    description: {
      en: 'Cold smoked Atlantic salmon on artisan dark rye bread, pickled cucumber, dill crème, lemon and fresh harbor herbs.',
      da: 'Koldrøget atlantisk laks på friskbagt rugbrød, syltet agurk, dildcreme, citron og friske urter fra havnen.',
    },
    price: 125,
    image: '/images/smorrebrod-laks.jpg',
    tags: ['chef-pick'],
    available: true,
    customizations: [
      {
        id: 'bread-type',
        name: { en: 'Bread Selection', da: 'Brødvalg' },
        type: 'single',
        required: true,
        options: [
          { id: 'rye', name: { en: 'Dark Rye Bread (Rugbrød)', da: 'Mørkt Rugbrød' }, price: 0 },
          { id: 'sourdough', name: { en: 'Sourdough Bread', da: 'Surdejsbrød' }, price: 5 },
          { id: 'gluten-free', name: { en: 'Gluten-Free Bread', da: 'Glutenfrit Brød' }, price: 10 },
        ],
      },
      {
        id: 'extras',
        name: { en: 'Extras', da: 'Ekstra Tilvalg' },
        type: 'multiple',
        required: false,
        options: [
          { id: 'extra-salmon', name: { en: 'Extra Salmon (+50g)', da: 'Ekstra Laks (+50g)' }, price: 35 },
          { id: 'avocado', name: { en: 'Sliced Avocado', da: 'Frisk Avokado' }, price: 20 },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sm-fisk',
    categoryId: 'smorrebrod',
    name: {
      en: 'Crispy Fish Fillet with Greenland Shrimp',
      da: 'Stjerneskud med Paneret Rødspætte & Rejer',
    },
    description: {
      en: 'Golden panko-crusted plaice fillet, hand-peeled Greenland prawns, green asparagus, lumpfish caviar and Thousand Island dressing.',
      da: 'Gyldenstegt panko-paneret rødspættefilet, håndpillede grønlandske rejer, grønne asparges, stenbiderrogn og hjemmelavet dressing.',
    },
    price: 145,
    image: '/images/stegt-fisk.jpg',
    tags: ['chef-pick'],
    available: true,
    customizations: [
      {
        id: 'portion-size',
        name: { en: 'Portion Size', da: 'Portionsstørrelse' },
        type: 'single',
        required: true,
        options: [
          { id: 'standard', name: { en: 'Standard (1 Fillet)', da: 'Standard (1 Filet)' }, price: 0 },
          { id: 'large', name: { en: 'Large Stjerneskud (2 Fillets)', da: 'Luksus Stjerneskud (2 Fileter)' }, price: 45 },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sm-rejer',
    categoryId: 'smorrebrod',
    name: {
      en: 'Shrimp Tartare Royale',
      da: 'Rejetatar Royale med Ørredrogn',
    },
    description: {
      en: 'Fresh Atlantic shrimp tartare on toasted brioche with citrus herb dressing and orange trout roe.',
      da: 'Frisk rejefars på smørristet brioche med citrus-urtemayonnaise og orange ørredrogn.',
    },
    price: 135,
    image: '/images/rejesalat.png',
    tags: ['chef-pick', 'gluten-free'],
    available: true,
    customizations: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'sal-ged',
    categoryId: 'salads',
    name: {
      en: 'Warm Goat Cheese & Candied Walnut Salad',
      da: 'Varm Gedeost & Valnøddesalat',
    },
    description: {
      en: 'Caramelized French goat cheese on crouton, mixed garden greens, balsamic glaze, candied walnuts and pickled red onion.',
      da: 'Gratineret fransk gedeost på sprød crouton, blandede salater, balsamico-glace, ristede valnødder og syltede rødløg.',
    },
    price: 115,
    image: '/images/salat.png',
    tags: ['vegetarian'],
    available: true,
    customizations: [
      {
        id: 'protein',
        name: { en: 'Add Protein', da: 'Tilføj Protein' },
        type: 'single',
        required: false,
        options: [
          { id: 'chicken', name: { en: 'Grilled Free-Range Chicken', da: 'Grillet Kyllingebryst' }, price: 30 },
          { id: 'smoked-salmon', name: { en: 'Smoked Salmon', da: 'Røget Laks' }, price: 35 },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'dr-aperol',
    categoryId: 'drinks',
    name: {
      en: 'Vitus Harbor Aperol Spritz',
      da: 'Vitus Havne-Aperol Spritz',
    },
    description: {
      en: 'Italian Prosecco, Aperol liqueur, sparkling soda water and fresh orange slice over ice. Best enjoyed by the sea.',
      da: 'Italiensk Prosecco, Aperol, dansk vand og frisk appelsinskive over is. Nydes bedst med udsigt over Øresund.',
    },
    price: 85,
    image: '/images/aperol-spritz.png',
    tags: ['chef-pick', 'vegan'],
    available: true,
    customizations: [
      {
        id: 'alcohol',
        name: { en: 'Type', da: 'Variant' },
        type: 'single',
        required: true,
        options: [
          { id: 'classic', name: { en: 'Classic Alcoholic (11% ABV)', da: 'Klassisk Alkoholisk' }, price: 0 },
          { id: 'virgin', name: { en: 'Virgin Spritz (Non-Alcoholic 0.0%)', da: 'Alkoholfri Virgin Spritz' }, price: -10 },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'cof-cappuccino',
    categoryId: 'coffee',
    name: {
      en: 'Artisan Barista Cappuccino',
      da: 'Barista Cappuccino',
    },
    description: {
      en: 'Double shot of organic espresso with velvety steamed milk microfoam and cocoa dusting.',
      da: 'Dobbelt shot økologisk espresso med fløjlsblød mikroskum og et strejf af kakao.',
    },
    price: 45,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian'],
    available: true,
    customizations: [
      {
        id: 'size',
        name: { en: 'Size', da: 'Størrelse' },
        type: 'single',
        required: true,
        options: [
          { id: 'reg', name: { en: 'Regular (240ml)', da: 'Almindelig (240ml)' }, price: 0 },
          { id: 'large', name: { en: 'Large (360ml)', da: 'Stor (360ml)' }, price: 10 },
        ],
      },
      {
        id: 'milk',
        name: { en: 'Milk Type', da: 'Mælketype' },
        type: 'single',
        required: true,
        options: [
          { id: 'whole', name: { en: 'Organic Whole Milk', da: 'Økologisk Sødmælk' }, price: 0 },
          { id: 'oat', name: { en: 'Oatly Barista Oat Milk', da: 'Oatly Havremælk' }, price: 6 },
          { id: 'almond', name: { en: 'Almond Milk', da: 'Mandelmælk' }, price: 6 },
        ],
      },
      {
        id: 'syrup',
        name: { en: 'Organic Syrups', da: 'Økologisk Sirup' },
        type: 'single',
        required: false,
        options: [
          { id: 'vanilla', name: { en: 'Madagascar Vanilla', da: 'Vanilje' }, price: 6 },
          { id: 'caramel', name: { en: 'Salted Caramel', da: 'Saltkaramel' }, price: 6 },
          { id: 'hazelnut', name: { en: 'Hazelnut', da: 'Hasselnød' }, price: 6 },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'cof-latte',
    categoryId: 'coffee',
    name: {
      en: 'Caffè Latte with Latte Art',
      da: 'Caffè Latte',
    },
    description: {
      en: 'Smooth espresso with generous steamed milk and beautiful barista latte art.',
      da: 'Mild espresso med rigelig cremet mælk og smuk latte art.',
    },
    price: 48,
    image: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian'],
    available: true,
    customizations: [
      {
        id: 'milk',
        name: { en: 'Milk Choice', da: 'Mælkevalg' },
        type: 'single',
        required: true,
        options: [
          { id: 'whole', name: { en: 'Whole Milk', da: 'Sødmælk' }, price: 0 },
          { id: 'oat', name: { en: 'Oat Milk', da: 'Havremælk' }, price: 6 },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'des-waffle',
    categoryId: 'desserts',
    name: {
      en: 'Belgian Waffle with Bornholm Ice Cream',
      da: 'Belgisk Vaffel med Bornholmsk Is',
    },
    description: {
      en: 'Warm crisp waffle served with vanilla bean ice cream, chocolate sauce, strawberries and dusted sugar.',
      da: 'Varm sprød vaffel med ægte vaniljeis, mørk chokoladesauce, friske jordbær og flormelis.',
    },
    price: 68,
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian'],
    available: true,
    customizations: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'brk-morgen',
    categoryId: 'breakfast',
    name: {
      en: 'Vitus Harbor Morning Plate',
      da: 'Vitus Havne Morgentallerken',
    },
    description: {
      en: 'Artisan sourdough and rye bread, Vesterhavsost aged cheese, soft boiled farm egg, butter, jam and fruit.',
      da: 'Surdejsbrød og rugbrød, Vesterhavsost, økologisk blødkogt æg, pisket smør, marmelade og frisk frugt.',
    },
    price: 110,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    tags: ['chef-pick', 'vegetarian'],
    available: true,
    customizations: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const seedTables: Table[] = Array.from({ length: 15 }, (_, i) => {
  const num = (i + 1).toString();
  return {
    id: `table-${num}`,
    number: num,
    status: 'empty',
    currentOrderIds: [],
    capacity: i < 4 ? 2 : i < 10 ? 4 : 6,
  };
});

export const seedCoupons: Coupon[] = [
  {
    id: 'c-welcome10',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    usageLimit: 100,
    usedCount: 12,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    active: true,
    createdAt: Date.now(),
  },
  {
    id: 'c-havn20',
    code: 'HAVN20',
    type: 'percentage',
    value: 20,
    usageLimit: 50,
    usedCount: 8,
    expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000,
    active: true,
    createdAt: Date.now(),
  },
  {
    id: 'c-vitus50',
    code: 'VITUS50',
    type: 'fixed',
    value: 50,
    usageLimit: 20,
    usedCount: 5,
    expiresAt: Date.now() + 60 * 24 * 60 * 60 * 1000,
    active: true,
    createdAt: Date.now(),
  },
];

export const seedStock: StockItem[] = [
  {
    id: 'st-coffee-beans',
    name: { en: 'Organic Coffee Beans', da: 'Økologiske Kaffebønner' },
    quantity: 18.5,
    unit: 'kg',
    criticalLevel: 5.0,
    costPerUnit: 145,
    category: 'Coffee',
    updatedAt: Date.now(),
  },
  {
    id: 'st-oat-milk',
    name: { en: 'Oatly Barista Milk', da: 'Oatly Barista Havremælk' },
    quantity: 42,
    unit: 'liters',
    criticalLevel: 12,
    costPerUnit: 16.5,
    category: 'Dairy',
    updatedAt: Date.now(),
  },
  {
    id: 'st-salmon',
    name: { en: 'Cold Smoked Salmon', da: 'Koldrøget Laks' },
    quantity: 6.2,
    unit: 'kg',
    criticalLevel: 2.0,
    costPerUnit: 210,
    category: 'Fish',
    updatedAt: Date.now(),
  },
  {
    id: 'st-rye-bread',
    name: { en: 'Fresh Rye Bread Loaves', da: 'Friske Rugbrød' },
    quantity: 14,
    unit: 'pcs',
    criticalLevel: 4,
    costPerUnit: 28,
    category: 'Bakery',
    updatedAt: Date.now(),
  },
  {
    id: 'st-prosecco',
    name: { en: 'Italian Prosecco DOC', da: 'Prosecco DOC' },
    quantity: 24,
    unit: 'bottles',
    criticalLevel: 6,
    costPerUnit: 65,
    category: 'Bar',
    updatedAt: Date.now(),
  },
];

export async function seedDatabase(storageApi: any, force = false): Promise<void> {
  try {
    const isAlreadySeeded = await storageApi.isSeeded();
    if (isAlreadySeeded && !force) return;

    for (const cat of seedCategories) {
      await storageApi.set('categories', cat.id, cat);
    }
    for (const item of seedMenuItems) {
      await storageApi.set('menu', item.id, item);
    }
    for (const table of seedTables) {
      await storageApi.set('tables', table.id, table);
    }
    for (const coupon of seedCoupons) {
      await storageApi.set('coupons', coupon.id, coupon);
    }
    for (const stock of seedStock) {
      await storageApi.set('stock', stock.id, stock);
    }
    console.log('Cafe Vitus database initialized with rich Danish demo dataset.');
  } catch (err) {
    console.warn('Seeding failed:', err);
  }
}

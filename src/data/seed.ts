import {
  Category,
  MenuItem,
  Table,
  Coupon,
  StockItem,
  TableReservation,
  StaffMember,
  Shift,
  AttendanceLog,
  TemperatureLog,
  HygieneChecklist,
} from '../types';

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
    mealPeriods: ['lunch', 'dinner'],
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
    mealPeriods: ['lunch', 'dinner'],
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
    mealPeriods: ['lunch', 'dinner'],
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
    mealPeriods: ['lunch', 'dinner'],
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
    mealPeriods: ['lunch', 'dinner', 'all-day'],
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
    mealPeriods: ['breakfast', 'lunch', 'dinner', 'all-day'],
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
    mealPeriods: ['breakfast', 'lunch', 'dinner', 'all-day'],
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
    mealPeriods: ['lunch', 'dinner', 'all-day'],
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
    mealPeriods: ['breakfast'],
    available: true,
    customizations: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'brk-croissant',
    categoryId: 'breakfast',
    name: {
      en: 'Freshly Baked Butter Croissant',
      da: 'Smørbagt Fransk Croissant',
    },
    description: {
      en: 'Flaky warm all-butter croissant served with organic strawberry marmalade and whipped salted butter.',
      da: 'Sprød, smørmættet fransk croissant serveret med økologisk jordbærmarmelade og pisket saltet smør.',
    },
    price: 36,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian'],
    mealPeriods: ['breakfast'],
    available: true,
    customizations: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'brk-avocado',
    categoryId: 'breakfast',
    name: {
      en: 'Smashed Avocado Surdejsmad',
      da: 'Knust Avokado på Surdejsbrød',
    },
    description: {
      en: 'Toasted artisan sourdough bread, crushed avocado, poached organic egg, chili flakes, microgreens and cold-pressed olive oil.',
      da: 'Ristet surdejsbrød med knust avokado, økologisk pocheret æg, chiliflager, ærteskud og koldpresset jomfruolivenolie.',
    },
    price: 95,
    image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian', 'chef-pick'],
    mealPeriods: ['breakfast'],
    available: true,
    customizations: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'brk-skyr',
    categoryId: 'breakfast',
    name: {
      en: 'Organic Skyr Bowl with Granola & Berries',
      da: 'Økologisk Skyr Bowl med Granola & Bær',
    },
    description: {
      en: 'Creamy Nordic vanilla skyr topped with house-toasted maple granola, fresh blueberries, chia seeds and Snekkersten blossom honey.',
      da: 'Cremet økologisk vaniljeskyr toppet med ristet ahorngranola, friske blåbær, chiafrø og lokal blomsterhonning.',
    },
    price: 78,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=80',
    tags: ['vegetarian', 'gluten-free'],
    mealPeriods: ['breakfast'],
    available: true,
    customizations: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'din-steak',
    categoryId: 'smorrebrod',
    name: {
      en: 'Danish Grass-Fed Ribeye Steak (250g)',
      da: 'Dansk Krogmodnet Ribeye Steak (250g)',
    },
    description: {
      en: 'Tender grilled Danish ribeye with house-whipped Bearnaise sauce, harbor sea salt fries and charred harbor broccolini.',
      da: 'Mør grillet krogmodnet dansk ribeye serveret med håndpisket bearnaisesauce, havsaltede fritter og grillet asparges-broccoli.',
    },
    price: 245,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    tags: ['chef-pick', 'gluten-free'],
    mealPeriods: ['dinner'],
    available: true,
    customizations: [
      {
        id: 'doneness',
        name: { en: 'Steak Doneness', da: 'Stegegrad' },
        type: 'single',
        required: true,
        options: [
          { id: 'medium-rare', name: { en: 'Medium Rare (Pink & Juicy)', da: 'Medium Rare (Rosa)' }, price: 0 },
          { id: 'medium', name: { en: 'Medium', da: 'Medium' }, price: 0 },
          { id: 'well-done', name: { en: 'Well Done', da: 'Gennemstegt' }, price: 0 },
        ],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'din-bouillabaisse',
    categoryId: 'smorrebrod',
    name: {
      en: 'Snekkersten Harbor Seafood Bouillabaisse',
      da: 'Snekkersten Havn Bouillabaisse',
    },
    description: {
      en: 'Rich seafood soup with saffron, local cod, Greenland prawns, blue mussels, fennel and toasted sourdough with garlic rouille.',
      da: 'Rig fiskesuppe med safran, lokal torsk, grønlandske rejer, blåmuslinger, fennikel og ristet surdejsbrød med hvidløgsrouille.',
    },
    price: 185,
    image: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=800&q=80',
    tags: ['chef-pick'],
    mealPeriods: ['lunch', 'dinner'],
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

export const seedReservations: TableReservation[] = [
  {
    id: 'res-1',
    reservationCode: 'CV-8491',
    guestName: 'Anders Møller',
    guestPhone: '+45 28 44 19 82',
    guestEmail: 'anders.moller@gmail.com',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    guestsCount: 4,
    tablePreference: 'outdoor-harbor',
    assignedTableNumber: '5',
    specialRequests: 'Fødselsdagsmiddag, gerne tæt på kajen.',
    depositPerPerson: 50,
    totalDeposit: 200,
    depositPaid: true,
    status: 'confirmed',
    createdAt: Date.now() - 2 * 3600 * 1000,
    updatedAt: Date.now() - 2 * 3600 * 1000,
  },
  {
    id: 'res-2',
    reservationCode: 'CV-7320',
    guestName: 'Sofie & Morten Nielsen',
    guestPhone: '+45 40 19 22 71',
    guestEmail: 'sofie.n@hotmail.com',
    date: new Date().toISOString().split('T')[0],
    time: '12:30',
    guestsCount: 2,
    tablePreference: 'indoor',
    assignedTableNumber: '3',
    specialRequests: 'Barnestol ønskes.',
    depositPerPerson: 50,
    totalDeposit: 100,
    depositPaid: true,
    status: 'seated',
    createdAt: Date.now() - 4 * 3600 * 1000,
    updatedAt: Date.now() - 1 * 3600 * 1000,
  },
  {
    id: 'res-3',
    reservationCode: 'CV-9012',
    guestName: 'Christian Lind',
    guestPhone: '+45 31 88 45 10',
    guestEmail: 'clind@erhverv.dk',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    time: '19:00',
    guestsCount: 6,
    tablePreference: 'outdoor-harbor',
    specialRequests: 'Forretningsmiddag.',
    depositPerPerson: 50,
    totalDeposit: 300,
    depositPaid: true,
    status: 'no-show',
    createdAt: Date.now() - 30 * 3600 * 1000,
    updatedAt: Date.now() - 24 * 3600 * 1000,
  },
  {
    id: 'res-4',
    reservationCode: 'CV-3184',
    guestName: 'Maria Højberg',
    guestPhone: '+45 52 70 88 12',
    guestEmail: 'maria.hojberg@outlook.dk',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '19:30',
    guestsCount: 3,
    tablePreference: 'any',
    specialRequests: '1 person er glutenintolerant.',
    depositPerPerson: 50,
    totalDeposit: 150,
    depositPaid: true,
    status: 'confirmed',
    createdAt: Date.now() - 10 * 3600 * 1000,
    updatedAt: Date.now() - 10 * 3600 * 1000,
  },
];

export const seedStaff: StaffMember[] = [
  {
    id: 'stf-lukas',
    name: 'Lukas Berg',
    role: 'manager',
    pin: '1111',
    phone: '+45 20 12 34 56',
    email: 'lukas@cafevitus.dk',
    hourlyWage: 215,
    active: true,
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    color: '#3B82F6',
    createdAt: Date.now() - 90 * 86400000,
  },
  {
    id: 'stf-freja',
    name: 'Freja Jensen',
    role: 'chef',
    pin: '2222',
    phone: '+45 21 34 56 78',
    email: 'freja@cafevitus.dk',
    hourlyWage: 190,
    active: true,
    workingDays: ['tue', 'wed', 'thu', 'fri', 'sat'],
    color: '#10B981',
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'stf-emil',
    name: 'Emil Thomsen',
    role: 'waiter',
    pin: '3333',
    phone: '+45 22 45 67 89',
    email: 'emil@cafevitus.dk',
    hourlyWage: 165,
    active: true,
    workingDays: ['thu', 'fri', 'sat', 'sun'],
    color: '#F59E0B',
    createdAt: Date.now() - 45 * 86400000,
  },
  {
    id: 'stf-astrid',
    name: 'Astrid Lind',
    role: 'bartender',
    pin: '4444',
    phone: '+45 23 56 78 90',
    email: 'astrid@cafevitus.dk',
    hourlyWage: 170,
    active: true,
    workingDays: ['wed', 'thu', 'fri', 'sat'],
    color: '#8B5CF6',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'stf-magnus',
    name: 'Magnus Holm',
    role: 'dishwasher',
    pin: '5555',
    phone: '+45 24 67 89 01',
    email: 'magnus@cafevitus.dk',
    hourlyWage: 145,
    active: true,
    workingDays: ['fri', 'sat', 'sun'],
    color: '#EC4899',
    createdAt: Date.now() - 20 * 86400000,
  },
];

export const seedShifts: Shift[] = [
  {
    id: 'sh-1',
    staffId: 'stf-lukas',
    staffName: 'Lukas Berg',
    role: 'manager',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    breakMinutes: 30,
    plannedHours: 7.5,
    estimatedWage: 7.5 * 215,
    status: 'scheduled',
  },
  {
    id: 'sh-2',
    staffId: 'stf-freja',
    staffName: 'Freja Jensen',
    role: 'chef',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '18:00',
    breakMinutes: 30,
    plannedHours: 7.5,
    estimatedWage: 7.5 * 190,
    status: 'scheduled',
  },
  {
    id: 'sh-3',
    staffId: 'stf-emil',
    staffName: 'Emil Thomsen',
    role: 'waiter',
    date: new Date().toISOString().split('T')[0],
    startTime: '12:00',
    endTime: '21:00',
    breakMinutes: 45,
    plannedHours: 8.25,
    estimatedWage: 8.25 * 165,
    status: 'scheduled',
  },
  {
    id: 'sh-4',
    staffId: 'stf-astrid',
    staffName: 'Astrid Lind',
    role: 'bartender',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '23:30',
    breakMinutes: 30,
    plannedHours: 7.0,
    estimatedWage: 7.0 * 170,
    status: 'scheduled',
  },
];

export const seedAttendanceLogs: AttendanceLog[] = [
  {
    id: 'att-1',
    staffId: 'stf-lukas',
    staffName: 'Lukas Berg',
    role: 'manager',
    checkInTime: Date.now() - 5.5 * 3600 * 1000,
    breakMinutes: 30,
    status: 'active',
  },
  {
    id: 'att-2',
    staffId: 'stf-freja',
    staffName: 'Freja Jensen',
    role: 'chef',
    checkInTime: Date.now() - 3.5 * 3600 * 1000,
    breakMinutes: 15,
    status: 'active',
  },
  {
    id: 'att-3',
    staffId: 'stf-emil',
    staffName: 'Emil Thomsen',
    role: 'waiter',
    checkInTime: Date.now() - 28 * 3600 * 1000,
    checkOutTime: Date.now() - 20 * 3600 * 1000,
    breakMinutes: 30,
    totalHours: 7.5,
    earnedWage: 7.5 * 165,
    status: 'completed',
    notes: 'Travl lørdag aften.',
  },
];

export const seedTemperatures: TemperatureLog[] = [
  {
    id: 'temp-1',
    unitName: 'Køleskab 1 (Fisk & Skaldyr)',
    unitType: 'fridge',
    temperature: 2.8,
    maxAllowed: 4.0,
    isCompliant: true,
    checkedBy: 'Freja Jensen (Kok)',
    timestamp: Date.now() - 2 * 3600 * 1000,
  },
  {
    id: 'temp-2',
    unitName: 'Køleskab 2 (Mejeri & Dressinger)',
    unitType: 'fridge',
    temperature: 3.6,
    maxAllowed: 5.0,
    isCompliant: true,
    checkedBy: 'Freja Jensen (Kok)',
    timestamp: Date.now() - 2 * 3600 * 1000,
  },
  {
    id: 'temp-3',
    unitName: 'Hovedfryser (Kød & Brød)',
    unitType: 'freezer',
    temperature: -21.2,
    maxAllowed: -18.0,
    isCompliant: true,
    checkedBy: 'Freja Jensen (Kok)',
    timestamp: Date.now() - 2 * 3600 * 1000,
  },
  {
    id: 'temp-4',
    unitName: 'Varmholdelse (Supper & Sovs)',
    unitType: 'hot-holding',
    temperature: 74.0,
    maxAllowed: 65.0,
    isCompliant: true,
    checkedBy: 'Freja Jensen (Kok)',
    timestamp: Date.now() - 1 * 3600 * 1000,
  },
];

export const seedHygieneChecklists: HygieneChecklist[] = [
  {
    id: 'chk-opening',
    type: 'opening',
    title: { da: 'Daglig Åbningstjekliste (Enos Egenkontrol)', en: 'Daily Opening Checklist (Enos Hygiene)' },
    date: new Date().toISOString().split('T')[0],
    completed: true,
    completedBy: 'Lukas Berg',
    completedAt: Date.now() - 5 * 3600 * 1000,
    items: [
      { id: 'op-1', label: { da: 'Håndvaskestationer opfyldt med sæbe og engangspapir', en: 'Handwashing stations stocked with soap and paper towels' }, checked: true },
      { id: 'op-2', label: { da: 'Arbejdsborde og skærebrætter desinficeret', en: 'Worktops and cutting boards sanitized' }, checked: true },
      { id: 'op-3', label: { da: 'Køleskabe og frysere kontrolleret for temperatur', en: 'Refrigerators and freezers temperatures verified' }, checked: true },
      { id: 'op-4', label: { da: 'Ingen spor af skadedyr eller urenheder', en: 'No signs of pests or contamination' }, checked: true },
      { id: 'op-5', label: { da: 'Fødevarestyrelsens Smiley kontrolrapport ophængt synligt', en: 'Danish Food Inspection Smiley visibly displayed' }, checked: true },
    ],
  },
  {
    id: 'chk-closing',
    type: 'closing',
    title: { da: 'Daglig Lukketjekliste (Køkken & Bar)', en: 'Daily Closing Checklist (Kitchen & Bar)' },
    date: new Date().toISOString().split('T')[0],
    completed: false,
    items: [
      { id: 'cl-1', label: { da: 'Alt fersk kød og fisk dækket til, datomærket og sat på køl', en: 'All meat and fish covered, dated and chilled' }, checked: false },
      { id: 'cl-2', label: { da: 'Opvaskemaskine tømt, renset og filter rengjort', en: 'Dishwasher drained, cleaned and filter washed' }, checked: false },
      { id: 'cl-3', label: { da: 'Gulve fejet og vasket med godkendt desinfektionsmiddel', en: 'Floors swept and mopped with approved disinfectant' }, checked: false },
      { id: 'cl-4', label: { da: 'Affaldsspande tømt og udendørs containere låst', en: 'Bins emptied and outdoor bins locked' }, checked: false },
    ],
  },
  {
    id: 'chk-delivery',
    type: 'delivery',
    title: { da: 'Varemodtagelse & Leverandørkontrol', en: 'Goods Receipt & Supplier Quality Control' },
    date: new Date().toISOString().split('T')[0],
    completed: true,
    completedBy: 'Freja Jensen',
    completedAt: Date.now() - 4 * 3600 * 1000,
    items: [
      { id: 'dl-1', label: { da: 'Kølevognens temperatur kontrolleret (≤ 4°C)', en: 'Delivery truck refrigerated temperature verified (≤ 4°C)' }, checked: true },
      { id: 'dl-2', label: { da: 'Emballage ren, intakt og fri for fugt/brud', en: 'Packaging clean, intact and sealed' }, checked: true },
      { id: 'dl-3', label: { da: 'Holdbarhedsdatoer tjekket og godkendt', en: 'Expiration dates inspected and approved' }, checked: true },
    ],
  },
];

export async function seedDatabase(storageApi: any, force = false): Promise<void> {
  try {
    const isAlreadySeeded = await storageApi.isSeeded();
    if (!isAlreadySeeded || force) {
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
    }

    // Always ensure new modules are seeded if empty
    const existingReservations = await storageApi.getAll('reservations');
    if (existingReservations.length === 0 || force) {
      for (const res of seedReservations) {
        await storageApi.set('reservations', res.id, res);
      }
    }

    const existingStaff = await storageApi.getAll('staff');
    if (existingStaff.length === 0 || force) {
      for (const member of seedStaff) {
        await storageApi.set('staff', member.id, member);
      }
    }

    const existingShifts = await storageApi.getAll('shifts');
    if (existingShifts.length === 0 || force) {
      for (const shift of seedShifts) {
        await storageApi.set('shifts', shift.id, shift);
      }
    }

    const existingAttendance = await storageApi.getAll('attendance');
    if (existingAttendance.length === 0 || force) {
      for (const att of seedAttendanceLogs) {
        await storageApi.set('attendance', att.id, att);
      }
    }

    const existingTemperatures = await storageApi.getAll('temperatures');
    if (existingTemperatures.length === 0 || force) {
      for (const temp of seedTemperatures) {
        await storageApi.set('temperatures', temp.id, temp);
      }
    }

    const existingHygiene = await storageApi.getAll('hygiene_checklists');
    if (existingHygiene.length === 0 || force) {
      for (const chk of seedHygieneChecklists) {
        await storageApi.set('hygiene_checklists', chk.id, chk);
      }
    }

    console.log('Cafe Vitus database initialized with complete restaurant, staff, and food safety datasets.');
  } catch (err) {
    console.warn('Seeding failed:', err);
  }
}


// ─── Infinity Castle Dining · Menu Mock Data ───

export interface MenuItem {
  id: string;
  name: string;
  category: string; // matches Category.id
  price: number;
  isSignature: boolean;
  characterId: string | null; // links to characters.ts
  description?: string;
}

export interface Category {
  id: string;
  label: string;
  labelJp: string;
  order: number;
}

export const categories: Category[] = [
  { id: "starters",   label: "Starters",               labelJp: "前菜",   order: 1 },
  { id: "soups",      label: "Soups",                  labelJp: "スープ", order: 2 },
  { id: "wings-pasta",label: "Wings & Pasta",          labelJp: "手羽",   order: 3 },
  { id: "sandwiches", label: "Sandwich & Burgers",     labelJp: "挟む",   order: 4 },
  { id: "continental",label: "Continental & Chinese",  labelJp: "洋食",   order: 5 },
  { id: "pizza",      label: "Pizza",                  labelJp: "焼",     order: 6 },
  { id: "coffee",     label: "Coffee",                 labelJp: "珈琲",   order: 7 },
  { id: "cold-drinks",label: "Cold Drinks",            labelJp: "冷飲",   order: 8 },
  { id: "shakes",     label: "Shakes",                 labelJp: "揺",     order: 9 },
];

export const menuItems: MenuItem[] = [
  // ─── Starters ───
  { id: "dsc-01",  name: "Demon Slayer Chunks",     category: "starters",    price: 849,  isSignature: true,  characterId: null },
  { id: "dsc-02",  name: "Hashira Behari Rolls",    category: "starters",    price: 599,  isSignature: false, characterId: null },
  { id: "dsc-03",  name: "Wisteria Arabic Rolls",   category: "starters",    price: 649,  isSignature: false, characterId: null },
  { id: "dsc-04",  name: "Thunder Chicken Pasta",   category: "starters",    price: 699,  isSignature: false, characterId: null },
  { id: "dsc-05",  name: "Infinity Loaded Fries",   category: "starters",    price: 799,  isSignature: true,  characterId: null },
  { id: "dsc-06",  name: "Slayers Nuggets",         category: "starters",    price: 649,  isSignature: false, characterId: null },
  { id: "dsc-07",  name: "Tanjiro Nachos",          category: "starters",    price: 799,  isSignature: false, characterId: null },
  { id: "dsc-08",  name: "Shinobu Special Strips",  category: "starters",    price: 999,  isSignature: false, characterId: "shinobu-kocho" },
  { id: "dsc-09",  name: "Flame Spicy Strips",      category: "starters",    price: 899,  isSignature: false, characterId: "kyojuro-rengoku" },
  { id: "dsc-10",  name: "Uzui Mini Burger",        category: "starters",    price: 349,  isSignature: false, characterId: "tengen-uzui" },
  { id: "dsc-11",  name: "Inosuke Drum Sticks",     category: "starters",    price: 849,  isSignature: false, characterId: null },
  { id: "dsc-12",  name: "Thunder Finger Chicken",  category: "starters",    price: 749,  isSignature: false, characterId: null },
  { id: "dsc-13",  name: "Akaza Dhaka Chicken",     category: "starters",    price: 799,  isSignature: false, characterId: "akaza" },

  // ─── Soups ───
  { id: "sop-01",  name: "Muzan Special Soup",            category: "soups", price: 949, isSignature: false, characterId: "muzan-kibutsuji" },
  { id: "sop-02",  name: "Rengoku Hot n Sour Soup",       category: "soups", price: 899, isSignature: false, characterId: "kyojuro-rengoku" },
  { id: "sop-03",  name: "Zenitsu Corn Soup",             category: "soups", price: 899, isSignature: false, characterId: null },
  { id: "sop-04",  name: "Slayers Vegetable Soup",        category: "soups", price: 749, isSignature: false, characterId: null },
  { id: "sop-05",  name: "Kanao Chicken Vegetable Soup",  category: "soups", price: 899, isSignature: false, characterId: null },
  { id: "sop-06",  name: "Demons Red Schezwan Soup",      category: "soups", price: 899, isSignature: false, characterId: null },

  // ─── Wings & Pasta ───
  { id: "wng-01",  name: "Mitsuri Love Wings",      category: "wings-pasta", price: 899,  isSignature: false, characterId: "mitsuri-kanroji" },
  { id: "wng-02",  name: "Akaza Crispy",            category: "wings-pasta", price: 849,  isSignature: false, characterId: "akaza" },
  { id: "wng-03",  name: "Douma Peri Peri",         category: "wings-pasta", price: 849,  isSignature: false, characterId: "douma" },

  // ─── Sandwiches & Burgers ───
  { id: "burg-01", name: "Tanjiro Grill Burger",    category: "sandwiches",  price: 749,  isSignature: true,  characterId: null },
  { id: "burg-02", name: "Tengen Turkish Wrap",     category: "sandwiches",  price: 799,  isSignature: false, characterId: "tengen-uzui" },
  { id: "burg-03", name: "Obanai Chicken Wrap",     category: "sandwiches",  price: 799,  isSignature: false, characterId: "obanai-iguro" },

  // ─── Continental & Chinese ───
  { id: "con-01",  name: "Water Breathing Almond Gravy", category: "continental", price: 999, isSignature: false, characterId: "giyu-tomioka" },

  // ─── Pizza ───
  { id: "piz-01",  name: "Rengoku Bornfire Pizza",    category: "pizza",  price: 1199, isSignature: true,  characterId: "kyojuro-rengoku" },
  { id: "piz-02",  name: "Kokushibo Bornfire",        category: "pizza",  price: 1199, isSignature: false, characterId: "kokushibo" },
  { id: "piz-03",  name: "Shinobu Peri Peri Pizza",   category: "pizza",  price: 1099, isSignature: false, characterId: "shinobu-kocho" },
  { id: "piz-04",  name: "Sanemi Kabab Crust Pizza",  category: "pizza",  price: 1099, isSignature: false, characterId: "sanemi-shinazugawa" },
  { id: "piz-05",  name: "Gyomei Crown Crust Pizza",  category: "pizza",  price: 1099, isSignature: false, characterId: "gyomei-himejima" },

  // ─── Coffee ───
  { id: "cof-01",  name: "Tokito Cold Coffee",      category: "coffee",    price: 650, isSignature: true,  characterId: "muichiro-tokito" },

  // ─── Cold Drinks ───
  { id: "cld-01",  name: "Slayers Mojito",          category: "cold-drinks", price: 399, isSignature: false, characterId: null },
  { id: "cld-02",  name: "Wisteria Cooler",         category: "cold-drinks", price: 349, isSignature: false, characterId: null },

  // ─── Shakes ───
  { id: "shk-01",  name: "Infinity Shake",          category: "shakes",    price: 499, isSignature: false, characterId: null },
  { id: "shk-02",  name: "Demon King Shake",        category: "shakes",    price: 549, isSignature: false, characterId: "muzan-kibutsuji" },
];

// ─── Signatures (curated cross-category) ───
export const signatures = menuItems.filter((item) => item.isSignature);

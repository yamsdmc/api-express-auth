export const ProductCategory = {
  ELECTRONICS: "electronics",
  FURNITURE_HOME: "furniture_home", 
  FASHION_BEAUTY: "fashion_beauty",
  HOBBIES_LEISURE: "hobbies_leisure",
  FAMILY_KIDS: "family_kids",
  HOME_GARDEN: "home_garden",
  OTHER: "other",
} as const;

export type ProductCategoryType =
  (typeof ProductCategory)[keyof typeof ProductCategory];

export const ProductSubcategory = {
  // Electronics
  SMARTPHONES_TABLETS: "smartphones_tablets",
  COMPUTERS_LAPTOPS: "computers_laptops", 
  AUDIO_VIDEO: "audio_video",
  GAMING: "gaming",
  ELECTRONICS_ACCESSORIES: "electronics_accessories",
  
  // Furniture & Home
  LIVING_ROOM: "living_room",
  BEDROOM: "bedroom",
  KITCHEN_DINING: "kitchen_dining",
  OFFICE: "office",
  STORAGE: "storage",
  
  // Fashion & Beauty
  MENS_CLOTHING: "mens_clothing",
  WOMENS_CLOTHING: "womens_clothing",
  SHOES: "shoes",
  BAGS_ACCESSORIES: "bags_accessories",
  BEAUTY_COSMETICS: "beauty_cosmetics",
  
  // Hobbies & Leisure
  SPORTS_EQUIPMENT: "sports_equipment",
  BOOKS_COMICS: "books_comics",
  MUSIC_INSTRUMENTS: "music_instruments",
  ARTS_CRAFTS: "arts_crafts",
  BOARD_GAMES: "board_games",
  
  // Family & Kids
  BABY_ITEMS: "baby_items",
  TOYS: "toys",
  KIDS_CLOTHING: "kids_clothing",
  SCHOOL_SUPPLIES: "school_supplies",
  
  // Home & Garden
  APPLIANCES: "appliances",
  TOOLS_DIY: "tools_diy",
  GARDEN_PLANTS: "garden_plants",
  DECORATION: "decoration",
} as const;

export type ProductSubcategoryType = 
  (typeof ProductSubcategory)[keyof typeof ProductSubcategory];

export const ProductGender = {
  UNISEX: "unisex",
  MEN: "men", 
  WOMEN: "women",
  BOYS: "boys",
  GIRLS: "girls",
} as const;

export type ProductGenderType = 
  (typeof ProductGender)[keyof typeof ProductGender];

// Mapping catégories -> sous-catégories
export const categorySubcategoryMap: Record<ProductCategoryType, ProductSubcategoryType[]> = {
  [ProductCategory.ELECTRONICS]: [
    ProductSubcategory.SMARTPHONES_TABLETS,
    ProductSubcategory.COMPUTERS_LAPTOPS,
    ProductSubcategory.AUDIO_VIDEO,
    ProductSubcategory.GAMING,
    ProductSubcategory.ELECTRONICS_ACCESSORIES,
  ],
  [ProductCategory.FURNITURE_HOME]: [
    ProductSubcategory.LIVING_ROOM,
    ProductSubcategory.BEDROOM,
    ProductSubcategory.KITCHEN_DINING,
    ProductSubcategory.OFFICE,
    ProductSubcategory.STORAGE,
  ],
  [ProductCategory.FASHION_BEAUTY]: [
    ProductSubcategory.MENS_CLOTHING,
    ProductSubcategory.WOMENS_CLOTHING,
    ProductSubcategory.SHOES,
    ProductSubcategory.BAGS_ACCESSORIES,
    ProductSubcategory.BEAUTY_COSMETICS,
  ],
  [ProductCategory.HOBBIES_LEISURE]: [
    ProductSubcategory.SPORTS_EQUIPMENT,
    ProductSubcategory.BOOKS_COMICS,
    ProductSubcategory.MUSIC_INSTRUMENTS,
    ProductSubcategory.ARTS_CRAFTS,
    ProductSubcategory.BOARD_GAMES,
  ],
  [ProductCategory.FAMILY_KIDS]: [
    ProductSubcategory.BABY_ITEMS,
    ProductSubcategory.TOYS,
    ProductSubcategory.KIDS_CLOTHING,
    ProductSubcategory.SCHOOL_SUPPLIES,
  ],
  [ProductCategory.HOME_GARDEN]: [
    ProductSubcategory.APPLIANCES,
    ProductSubcategory.TOOLS_DIY,
    ProductSubcategory.GARDEN_PLANTS,
    ProductSubcategory.DECORATION,
  ],
  [ProductCategory.OTHER]: [],
};

// Sous-catégories qui nécessitent un filtre genre
export const genderRequiredSubcategories: ProductSubcategoryType[] = [
  ProductSubcategory.SHOES,
  ProductSubcategory.MENS_CLOTHING,
  ProductSubcategory.WOMENS_CLOTHING,
  ProductSubcategory.KIDS_CLOTHING,
];

export const productCategoryUtils = {
  getDisplayName(category: ProductCategoryType): string {
    const displayNames = {
      [ProductCategory.ELECTRONICS]: "Electronics",
      [ProductCategory.FURNITURE_HOME]: "Furniture & Home",
      [ProductCategory.FASHION_BEAUTY]: "Fashion & Beauty", 
      [ProductCategory.HOBBIES_LEISURE]: "Hobbies & Leisure",
      [ProductCategory.FAMILY_KIDS]: "Family & Kids",
      [ProductCategory.HOME_GARDEN]: "Home & Garden",
      [ProductCategory.OTHER]: "Other",
    };
    return displayNames[category];
  },

  getSubcategoryDisplayName(subcategory: ProductSubcategoryType): string {
    const displayNames = {
      // Electronics
      [ProductSubcategory.SMARTPHONES_TABLETS]: "Smartphones & Tablets",
      [ProductSubcategory.COMPUTERS_LAPTOPS]: "Computers & Laptops",
      [ProductSubcategory.AUDIO_VIDEO]: "Audio & Video",
      [ProductSubcategory.GAMING]: "Gaming",
      [ProductSubcategory.ELECTRONICS_ACCESSORIES]: "Accessories",
      
      // Furniture & Home
      [ProductSubcategory.LIVING_ROOM]: "Living Room",
      [ProductSubcategory.BEDROOM]: "Bedroom", 
      [ProductSubcategory.KITCHEN_DINING]: "Kitchen & Dining",
      [ProductSubcategory.OFFICE]: "Office",
      [ProductSubcategory.STORAGE]: "Storage",
      
      // Fashion & Beauty
      [ProductSubcategory.MENS_CLOTHING]: "Men's Clothing",
      [ProductSubcategory.WOMENS_CLOTHING]: "Women's Clothing",
      [ProductSubcategory.SHOES]: "Shoes",
      [ProductSubcategory.BAGS_ACCESSORIES]: "Bags & Accessories",
      [ProductSubcategory.BEAUTY_COSMETICS]: "Beauty & Cosmetics",
      
      // Hobbies & Leisure
      [ProductSubcategory.SPORTS_EQUIPMENT]: "Sports Equipment",
      [ProductSubcategory.BOOKS_COMICS]: "Books & Comics",
      [ProductSubcategory.MUSIC_INSTRUMENTS]: "Music Instruments",
      [ProductSubcategory.ARTS_CRAFTS]: "Arts & Crafts",
      [ProductSubcategory.BOARD_GAMES]: "Board Games",
      
      // Family & Kids
      [ProductSubcategory.BABY_ITEMS]: "Baby Items",
      [ProductSubcategory.TOYS]: "Toys",
      [ProductSubcategory.KIDS_CLOTHING]: "Kids Clothing",
      [ProductSubcategory.SCHOOL_SUPPLIES]: "School Supplies",
      
      // Home & Garden
      [ProductSubcategory.APPLIANCES]: "Appliances",
      [ProductSubcategory.TOOLS_DIY]: "Tools & DIY",
      [ProductSubcategory.GARDEN_PLANTS]: "Garden & Plants",
      [ProductSubcategory.DECORATION]: "Decoration",
    };
    return displayNames[subcategory];
  },

  getGenderDisplayName(gender: ProductGenderType): string {
    const displayNames = {
      [ProductGender.UNISEX]: "Unisex",
      [ProductGender.MEN]: "Men",
      [ProductGender.WOMEN]: "Women", 
      [ProductGender.BOYS]: "Boys",
      [ProductGender.GIRLS]: "Girls",
    };
    return displayNames[gender];
  },

  getSubcategoriesForCategory(category: ProductCategoryType): ProductSubcategoryType[] {
    return categorySubcategoryMap[category] || [];
  },

  requiresGender(subcategory: ProductSubcategoryType): boolean {
    return genderRequiredSubcategories.includes(subcategory);
  },

  isValid(category: string): category is ProductCategoryType {
    return Object.values(ProductCategory).includes(
      category as ProductCategoryType
    );
  },

  isValidSubcategory(subcategory: string): subcategory is ProductSubcategoryType {
    return Object.values(ProductSubcategory).includes(
      subcategory as ProductSubcategoryType
    );
  },

  isValidGender(gender: string): gender is ProductGenderType {
    return Object.values(ProductGender).includes(
      gender as ProductGenderType
    );
  },
};

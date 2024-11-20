export const ProductCategory = {
  ELECTRONICS: "electronics",
  VEHICLES: "vehicles",
  FURNITURE: "furniture",
  CLOTHING: "clothing",
  BOOKS: "books",
  SPORTS: "sports",
  OTHER: "other",
} as const;

export type ProductCategoryType =
  (typeof ProductCategory)[keyof typeof ProductCategory];

export const productCategoryUtils = {
  getDisplayName(category: ProductCategoryType): string {
    const displayNames = {
      [ProductCategory.ELECTRONICS]: "Electronics",
      [ProductCategory.VEHICLES]: "Vehicles",
      [ProductCategory.FURNITURE]: "Furniture",
      [ProductCategory.CLOTHING]: "Clothing",
      [ProductCategory.BOOKS]: "Books",
      [ProductCategory.SPORTS]: "Sports",
      [ProductCategory.OTHER]: "Other",
    };
    return displayNames[category];
  },

  isValid(category: string): category is ProductCategoryType {
    return Object.values(ProductCategory).includes(
      category as ProductCategoryType
    );
  },
};

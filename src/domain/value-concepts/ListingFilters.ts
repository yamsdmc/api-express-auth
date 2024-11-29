import { ProductCategory } from "@domain/value-concepts/ProductCategory";

export interface ListingFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export const listingFiltersUtils = {
  validate(filters: ListingFilters): void {
    if (
      filters.minPrice &&
      filters.maxPrice &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new Error("Min price cannot be greater than max price");
    }

    if (filters.minPrice && filters.minPrice < 0) {
      throw new Error("Min price cannot be negative");
    }

    if (filters.maxPrice && filters.maxPrice < 0) {
      throw new Error("Max price cannot be negative");
    }
  },

  isValidCategory(category: string): boolean {
    return Object.values(ProductCategory).includes(category as any);
  },
};

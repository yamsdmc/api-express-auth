import { ProductCategoryType } from "@domain/value-concepts/ProductCategory";

export interface ListingFilters {
  category?: ProductCategoryType;
  minPrice?: number;
  maxPrice?: number;
}

export const listingFiltersUtils = {
  validate(filters: ListingFilters): void {
    if (filters.minPrice && filters.minPrice < 0) {
      throw new Error("minPrice must be positive");
    }
    if (filters.maxPrice && filters.maxPrice < 0) {
      throw new Error("maxPrice must be positive");
    }
    if (
      filters.minPrice &&
      filters.maxPrice &&
      filters.minPrice > filters.maxPrice
    ) {
      throw new Error("minPrice must be less than maxPrice");
    }
  },
};

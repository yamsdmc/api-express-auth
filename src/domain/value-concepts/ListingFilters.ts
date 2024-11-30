import {
  ProductCategory,
  ProductCategoryType,
} from "@domain/value-concepts/ProductCategory";
import {
  ProductCondition,
  ProductConditionType,
} from "@domain/value-concepts/ProductCondition";

export interface ListingFilters {
  category?: ProductCategoryType;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductConditionType;
  query?: string;
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
    if (
      filters.category !== undefined &&
      !Object.values(ProductCategory).includes(filters.category)
    ) {
      throw new Error(`Invalid category: ${filters.category}`);
    }
    if (
      filters.condition !== undefined &&
      !Object.values(ProductCondition).includes(filters.condition)
    ) {
      throw new Error(`Invalid condition: ${filters.condition}`);
    }
  },
};

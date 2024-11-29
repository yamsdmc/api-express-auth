import { listingFiltersUtils } from "@domain/value-concepts/ListingFilters";
import { ProductCategory } from "@domain/value-concepts/ProductCategory";
import { describe, it, expect } from "vitest";

describe("ListingFiltersUtils", () => {
  it("should validate valid filters", () => {
    expect(() =>
      listingFiltersUtils.validate({
        minPrice: 10,
        maxPrice: 20,
        category: ProductCategory.ELECTRONICS,
      })
    ).not.toThrow();
  });

  it("should throw if prices are negative", () => {
    expect(() =>
      listingFiltersUtils.validate({
        minPrice: -10,
      })
    ).toThrow();
  });

  it("should throw if minPrice > maxPrice", () => {
    expect(() =>
      listingFiltersUtils.validate({
        minPrice: 20,
        maxPrice: 10,
      })
    ).toThrow();
  });
});

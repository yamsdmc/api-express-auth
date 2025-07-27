import { listingFiltersUtils } from "@domain/value-concepts/ListingFilters";
import { ProductCategory, ProductSubcategory, ProductGender } from "@domain/value-concepts/ProductCategory";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { describe, it, expect } from "vitest";

describe("ListingFiltersUtils", () => {
  describe("basic validation", () => {
    it("should validate valid filters", () => {
      expect(() =>
        listingFiltersUtils.validate({
          minPrice: 10,
          maxPrice: 20,
          category: ProductCategory.ELECTRONICS,
        })
      ).not.toThrow();
    });

    it("should validate empty filters", () => {
      expect(() =>
        listingFiltersUtils.validate({})
      ).not.toThrow();
    });
  });

  describe("price validation", () => {
    it("should throw if minPrice is negative", () => {
      expect(() =>
        listingFiltersUtils.validate({
          minPrice: -10,
        })
      ).toThrow("minPrice must be positive");
    });

    it("should throw if maxPrice is negative", () => {
      expect(() =>
        listingFiltersUtils.validate({
          maxPrice: -10,
        })
      ).toThrow("maxPrice must be positive");
    });

    it("should throw if minPrice > maxPrice", () => {
      expect(() =>
        listingFiltersUtils.validate({
          minPrice: 20,
          maxPrice: 10,
        })
      ).toThrow("minPrice must be less than maxPrice");
    });

    it("should accept equal min and max price", () => {
      expect(() =>
        listingFiltersUtils.validate({
          minPrice: 20,
          maxPrice: 20,
        })
      ).not.toThrow();
    });
  });

  describe("category validation", () => {
    it("should validate valid category", () => {
      expect(() =>
        listingFiltersUtils.validate({
          category: ProductCategory.ELECTRONICS,
        })
      ).not.toThrow();
    });

    it("should throw for invalid category", () => {
      expect(() =>
        listingFiltersUtils.validate({
          category: "invalid-category" as any,
        })
      ).toThrow("Invalid category: invalid-category");
    });

    it("should validate all available categories", () => {
      Object.values(ProductCategory).forEach(category => {
        expect(() =>
          listingFiltersUtils.validate({
            category,
          })
        ).not.toThrow();
      });
    });
  });

  describe("condition validation", () => {
    it("should validate valid condition", () => {
      expect(() =>
        listingFiltersUtils.validate({
          condition: ProductCondition.GOOD,
        })
      ).not.toThrow();
    });

    it("should throw for invalid condition", () => {
      expect(() =>
        listingFiltersUtils.validate({
          condition: "invalid-condition" as any,
        })
      ).toThrow("Invalid condition: invalid-condition");
    });

    it("should validate all available conditions", () => {
      Object.values(ProductCondition).forEach(condition => {
        expect(() =>
          listingFiltersUtils.validate({
            condition,
          })
        ).not.toThrow();
      });
    });
  });

  describe("complex filter combinations", () => {
    it("should validate complex filter with all fields", () => {
      expect(() =>
        listingFiltersUtils.validate({
          category: ProductCategory.FASHION_BEAUTY,
          subcategory: ProductSubcategory.MENS_CLOTHING,
          gender: ProductGender.MEN,
          minPrice: 10,
          maxPrice: 100,
          condition: ProductCondition.GOOD,
          query: "nike shirt",
        })
      ).not.toThrow();
    });

    it("should validate filter with subcategory only", () => {
      expect(() =>
        listingFiltersUtils.validate({
          subcategory: ProductSubcategory.SMARTPHONES_TABLETS,
        })
      ).not.toThrow();
    });

    it("should validate filter with gender only", () => {
      expect(() =>
        listingFiltersUtils.validate({
          gender: ProductGender.WOMEN,
        })
      ).not.toThrow();
    });

    it("should validate filter with query only", () => {
      expect(() =>
        listingFiltersUtils.validate({
          query: "search term",
        })
      ).not.toThrow();
    });
  });
});

import { describe, it, expect } from "vitest";
import { ProductEntity } from "@domain/entities/Product";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { ProductListingValidator } from "@domain/validators/product-listing-validator";
import {
  InvalidCategoryError,
  InvalidDescriptionError,
  InvalidImagesError,
  InvalidPriceError,
  InvalidTitleError,
} from "@domain/errors";
import { ProductCategory } from "@domain/value-concepts/ProductCategory";

describe("ProductListingValidator", () => {
  const validProduct: ProductEntity = {
    title: "Valid Product",
    description:
      "This is a valid description that meets the minimum length requirement", // Au moins 20 caractères
    price: 100,
    category: "electronics",
    condition: ProductCondition.NEW,
    images: ["image1.jpg"],
    location: "Paris",
  };

  describe("price validation", () => {
    it("should not throw error for valid price", () => {
      expect(() =>
        ProductListingValidator.validate(validProduct)
      ).not.toThrow();
    });

    it("should throw error for negative price", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          price: -1,
        })
      ).toThrow(InvalidPriceError);
    });

    it("should throw error for price exceeding maximum", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          price: 1000001,
        })
      ).toThrow(InvalidPriceError);
    });

    it("should throw error for non-numeric price", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          price: "invalid" as any,
        })
      ).toThrow(InvalidPriceError);
    });
  });

  describe("images validation", () => {
    it("should not throw error for valid images array", () => {
      expect(() =>
        ProductListingValidator.validate(validProduct)
      ).not.toThrow();
    });

    it("should throw error for empty images array", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          images: [],
        })
      ).toThrow(InvalidImagesError);
    });

    it("should throw error for too many images", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"],
        })
      ).toThrow(InvalidImagesError);
    });

    it("should throw error for non-string image URLs", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          images: [123 as any],
        })
      ).toThrow(InvalidImagesError);
    });

    it("should throw error for empty image URLs", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          images: [""],
        })
      ).toThrow(InvalidImagesError);
    });
  });

  describe("title validation", () => {
    it("should not throw error for valid title", () => {
      expect(() =>
        ProductListingValidator.validate(validProduct)
      ).not.toThrow();
    });

    it("should throw error for title too short", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          title: "ab",
        })
      ).toThrow(InvalidTitleError);
    });

    it("should throw error for title too long", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          title: "a".repeat(101),
        })
      ).toThrow(InvalidTitleError);
    });

    it("should throw error for non-string title", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          title: 123 as any,
        })
      ).toThrow(InvalidTitleError);
    });
  });

  describe("description validation", () => {
    it("should not throw error for valid description", () => {
      expect(() =>
        ProductListingValidator.validate(validProduct)
      ).not.toThrow();
    });

    it("should throw error for description too short", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          description: "Too short",
        })
      ).toThrow(InvalidDescriptionError);
    });

    it("should throw error for description too long", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          description: "a".repeat(1001),
        })
      ).toThrow(InvalidDescriptionError);
    });

    it("should throw error for non-string description", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          description: 123 as any,
        })
      ).toThrow(InvalidDescriptionError);
    });

    it("should accept description with exactly minimum length", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          description: "a".repeat(20),
        })
      ).not.toThrow();
    });

    it("should accept description with exactly maximum length", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          description: "a".repeat(1000),
        })
      ).not.toThrow();
    });

    it("should validate description with special characters", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          description:
            "This is a valid description with special chars: @#$%^&*()!",
        })
      ).not.toThrow();
    });
  });

  describe("category validation", () => {
    it("should not throw error for valid category", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          category: ProductCategory.ELECTRONICS,
        })
      ).not.toThrow();
    });

    it("should throw error for invalid category", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          category: "invalid-category" as any,
        })
      ).toThrow(InvalidCategoryError);
    });

    it("should throw error for empty category", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          category: "" as any,
        })
      ).toThrow(InvalidCategoryError);
    });

    it("should validate all available categories", () => {
      Object.values(ProductCategory).forEach((category) => {
        expect(() =>
          ProductListingValidator.validate({
            ...validProduct,
            category,
          })
        ).not.toThrow();
      });
    });
  });

  describe("multiple validations", () => {
    it("should validate all fields correctly", () => {
      expect(() =>
        ProductListingValidator.validate(validProduct)
      ).not.toThrow();
    });

    it("should throw first encountered error when multiple fields are invalid", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validProduct,
          price: -1,
          images: [],
          title: "",
        })
      ).toThrow();
    });
  });
});

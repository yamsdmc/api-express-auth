import { describe, it, expect } from "vitest";
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
import { ProductListingEntity } from "@domain/entities/ProductListing";
import {createValidProductListing} from "@application/use-cases/product-listing/factories/productListing.factory";

describe("ListingValidator", () => {
  const validListing: ProductListingEntity = createValidProductListing()

  describe("price validation", () => {
    it("should not throw error for valid price", () => {
      expect(() =>
        ProductListingValidator.validate(validListing)
      ).not.toThrow();
    });

    it("should throw error for negative price", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            price: -1,
          },
        })
      ).toThrow(InvalidPriceError);
    });

    it("should throw error for price exceeding maximum", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            price: 1000001,
          },
        })
      ).toThrow(InvalidPriceError);
    });

    it("should throw error for non-numeric price", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            price: "invalid" as any,
          },
        })
      ).toThrow(InvalidPriceError);
    });
  });

  describe("images validation", () => {
    it("should not throw error for valid images array", () => {
      expect(() =>
        ProductListingValidator.validate(validListing)
      ).not.toThrow();
    });

    it("should throw error for empty images array", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            images: [],
          },
        })
      ).toThrow(InvalidImagesError);
    });

    it("should throw error for too many images", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            images: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"],
          },
        })
      ).toThrow(InvalidImagesError);
    });

    it("should throw error for non-string image URLs", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            images: [123 as any],
          },
        })
      ).toThrow(InvalidImagesError);
    });

    it("should throw error for empty image URLs", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            images: [""],
          },
        })
      ).toThrow(InvalidImagesError);
    });

    it("should throw error for non-string base64 images", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            images: [123 as any],
          },
        })
      ).toThrow(InvalidImagesError);
    });

    it("should throw error for invalid base64 images", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            images: ["invalid-string"],
          },
        })
      ).toThrow(InvalidImagesError);
    });
  });

  describe("title validation", () => {
    it("should not throw error for valid title", () => {
      expect(() =>
        ProductListingValidator.validate(validListing)
      ).not.toThrow();
    });

    it("should throw error for title too short", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            title: "ab",
          },
        })
      ).toThrow(InvalidTitleError);
    });

    it("should throw error for title too long", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            title: "a".repeat(101),
          },
        })
      ).toThrow(InvalidTitleError);
    });

    it("should throw error for non-string title", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            title: 123 as any,
          },
        })
      ).toThrow(InvalidTitleError);
    });
  });

  describe("description validation", () => {
    it("should not throw error for valid description", () => {
      expect(() =>
        ProductListingValidator.validate(validListing)
      ).not.toThrow();
    });

    it("should throw error for description too short", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            description: "Too short",
          },
        })
      ).toThrow(InvalidDescriptionError);
    });

    it("should throw error for description too long", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            description: "a".repeat(1001),
          },
        })
      ).toThrow(InvalidDescriptionError);
    });

    it("should throw error for non-string description", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            description: 123 as any,
          },
        })
      ).toThrow(InvalidDescriptionError);
    });

    it("should accept description with exactly minimum length", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            description: "a".repeat(20),
          },
        })
      ).not.toThrow();
    });

    it("should accept description with exactly maximum length", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            description: "a".repeat(1000),
          },
        })
      ).not.toThrow();
    });

    it("should validate description with special characters", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            description:
              "This is a valid description with special chars: @#$%^&*()!",
          },
        })
      ).not.toThrow();
    });
  });

  describe("category validation", () => {
    it("should not throw error for valid category", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            category: ProductCategory.ELECTRONICS,
          },
        })
      ).not.toThrow();
    });

    it("should throw error for invalid category", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            category: "invalid-category" as any,
          },
        })
      ).toThrow(InvalidCategoryError);
    });

    it("should throw error for empty category", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            category: "" as any,
          },
        })
      ).toThrow(InvalidCategoryError);
    });

    it("should validate all available categories", () => {
      Object.values(ProductCategory).forEach((category) => {
        expect(() =>
          ProductListingValidator.validate({
            ...validListing,
            product: {
              ...validListing.product,
              category,
            },
          })
        ).not.toThrow();
      });
    });
  });

  describe("multiple validations", () => {
    it("should validate all fields correctly", () => {
      expect(() =>
        ProductListingValidator.validate(validListing)
      ).not.toThrow();
    });

    it("should throw first encountered error when multiple fields are invalid", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            price: -1,
            images: [],
            title: "",
          },
        })
      ).toThrow();
    });
  });
});

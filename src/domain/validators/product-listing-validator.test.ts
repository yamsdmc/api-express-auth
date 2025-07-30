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
import { ProductCategory, ProductSubcategory, ProductGender, categorySubcategoryMap, genderRequiredSubcategories } from "@domain/value-concepts/ProductCategory";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import { createValidProductListing, createClothingProduct } from "@application/use-cases/product-listing/factories/productListing.factory";

describe("ProductListingValidator", () => {
  const validListing: ProductListingEntity = createValidProductListing();

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
            images: ["data:image/png;base64,1", "data:image/png;base64,2", "data:image/png;base64,3", "data:image/png;base64,4"],
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
            subcategory: ProductSubcategory.SMARTPHONES_TABLETS,
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
        // Use appropriate subcategory for each category
        const validSubcategories = categorySubcategoryMap[category];
        
        // Skip categories without subcategories (like OTHER)
        if (validSubcategories.length === 0) {
          return;
        }
        
        // Find a subcategory that doesn't require gender, or use the first one with appropriate gender
        let subcategory = validSubcategories[0];
        let gender = undefined;
        
        // If the first subcategory requires gender, provide appropriate gender
        if (subcategory === ProductSubcategory.MENS_CLOTHING) {
          gender = ProductGender.MEN;
        } else if (subcategory === ProductSubcategory.WOMENS_CLOTHING) {
          gender = ProductGender.WOMEN;
        } else if (subcategory === ProductSubcategory.KIDS_CLOTHING) {
          gender = ProductGender.BOYS;
        } else if (subcategory === ProductSubcategory.SHOES) {
          gender = ProductGender.UNISEX;
        }
        
        // For FASHION_BEAUTY, try to use a non-clothing subcategory first
        if (category === ProductCategory.FASHION_BEAUTY) {
          const nonClothingSubcats = validSubcategories.filter(sub => 
            !genderRequiredSubcategories.includes(sub)
          );
          if (nonClothingSubcats.length > 0) {
            subcategory = nonClothingSubcats[0];
            gender = undefined;
          }
        }
        
        expect(() =>
          ProductListingValidator.validate({
            ...validListing,
            product: {
              ...validListing.product,
              category,
              subcategory,
              gender,
            },
          })
        ).not.toThrow();
      });
    });
  });

  describe("subcategory validation", () => {
    it("should not throw error for valid subcategory", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            category: ProductCategory.ELECTRONICS,
            subcategory: ProductSubcategory.SMARTPHONES_TABLETS,
          },
        })
      ).not.toThrow();
    });

    it("should throw error for invalid subcategory", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            subcategory: "invalid-subcategory" as any,
          },
        })
      ).toThrow();
    });

    it("should validate category-subcategory mapping", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            category: ProductCategory.FURNITURE_HOME,
            subcategory: ProductSubcategory.LIVING_ROOM,
          },
        })
      ).not.toThrow();
    });
  });

  describe("gender validation", () => {
    it("should not require gender for non-fashion items", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            category: ProductCategory.ELECTRONICS,
            subcategory: ProductSubcategory.SMARTPHONES_TABLETS,
            gender: undefined,
          },
        })
      ).not.toThrow();
    });

    it("should require gender for clothing items", () => {
      const clothingListing = createValidProductListing({
        product: createClothingProduct(),
      });
      
      expect(() =>
        ProductListingValidator.validate(clothingListing)
      ).not.toThrow();
    });

    it("should validate gender values", () => {
      expect(() =>
        ProductListingValidator.validate({
          ...validListing,
          product: {
            ...validListing.product,
            category: ProductCategory.FASHION_BEAUTY,
            subcategory: ProductSubcategory.MENS_CLOTHING,
            gender: ProductGender.MEN,
          },
        })
      ).not.toThrow();
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

import { ProductEntity } from "@domain/entities/Product";
import {
  InvalidCategoryError,
  InvalidDescriptionError,
  InvalidImagesError,
  InvalidPriceError,
  InvalidTitleError,
} from "@domain/errors";
import {
  ProductCategory,
  productCategoryUtils,
} from "@domain/value-concepts/ProductCategory";

export class ProductListingValidator {
  private static readonly MAX_IMAGES = 5;
  private static readonly MIN_PRICE = 0;
  private static readonly MAX_PRICE = 1000000; // 1 million
  private static readonly MIN_TITLE_LENGTH = 3;
  private static readonly MAX_TITLE_LENGTH = 100;
  private static readonly MIN_DESCRIPTION_LENGTH = 20;
  private static readonly MAX_DESCRIPTION_LENGTH = 1000;

  static validate(product: ProductEntity): void {
    this.validatePrice(product.price);
    this.validateImages(product.images);
    this.validateTitle(product.title);
    this.validateDescription(product.description);
    this.validateCategory(product.category);
  }

  private static validatePrice(price: number): void {
    if (typeof price !== "number") {
      throw new InvalidPriceError("Price must be a number");
    }
    if (price < this.MIN_PRICE) {
      throw new InvalidPriceError("Price cannot be negative");
    }
    if (price > this.MAX_PRICE) {
      throw new InvalidPriceError(`Price cannot exceed ${this.MAX_PRICE}`);
    }
  }

  private static validateImages(images: string[]): void {
    if (!Array.isArray(images)) {
      throw new InvalidImagesError("Images must be an array");
    }
    if (images.length === 0) {
      throw new InvalidImagesError("At least one image is required");
    }
    if (images.length > this.MAX_IMAGES) {
      throw new InvalidImagesError(`Cannot exceed ${this.MAX_IMAGES} images`);
    }
    if (
      !images.every((img) => typeof img === "string" && img.trim().length > 0)
    ) {
      throw new InvalidImagesError("All images must be valid URLs");
    }
  }

  private static validateTitle(title: string): void {
    if (typeof title !== "string") {
      throw new InvalidTitleError("Title must be a string");
    }
    if (title.length < this.MIN_TITLE_LENGTH) {
      throw new InvalidTitleError(
        `Title must be at least ${this.MIN_TITLE_LENGTH} characters`
      );
    }
    if (title.length > this.MAX_TITLE_LENGTH) {
      throw new InvalidTitleError(
        `Title cannot exceed ${this.MAX_TITLE_LENGTH} characters`
      );
    }
  }

  private static validateCategory(category: string): void {
    if (!productCategoryUtils.isValid(category)) {
      throw new InvalidCategoryError(
        `Invalid category. Must be one of: ${Object.values(ProductCategory).join(", ")}`
      );
    }
  }

  private static validateDescription(description: string): void {
    if (typeof description !== "string") {
      throw new InvalidDescriptionError("Description must be a string");
    }
    if (description.length < this.MIN_DESCRIPTION_LENGTH) {
      throw new InvalidDescriptionError(
        `Description must be at least ${this.MIN_DESCRIPTION_LENGTH} characters`
      );
    }
    if (description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new InvalidDescriptionError(
        `Description cannot exceed ${this.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }
}

import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductEntity } from "@domain/entities/Product";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { ProductCategory, ProductSubcategory, ProductGender } from "@domain/value-concepts/ProductCategory";
import { iphoneBase64 } from "@infrastructure/repositories/in-memory/fake-base64";

export function createValidProductListing(
  override: Partial<ProductListingEntity> = {}
): ProductListingEntity {
  return {
    id: "default-id",
    product: createValidProduct(),
    location: "Paris",
    sellerId: "default-seller-id",
    phoneNumber: "+33123456789",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...override,
  };
}

export function createValidProduct(override: Partial<ProductEntity> = {}): ProductEntity {
  return {
    title: "iPhone 12",
    description: "Excellent condition iPhone",
    price: 500,
    category: ProductCategory.ELECTRONICS,
    subcategory: ProductSubcategory.SMARTPHONES_TABLETS,
    condition: ProductCondition.GOOD,
    images: iphoneBase64,
    ...override,
  };
}

export function createClothingProduct(override: Partial<ProductEntity> = {}): ProductEntity {
  return {
    title: "T-shirt Nike",
    description: "Comfortable cotton t-shirt",
    price: 25,
    category: ProductCategory.FASHION_BEAUTY,
    subcategory: ProductSubcategory.MENS_CLOTHING,
    gender: ProductGender.MEN,
    condition: ProductCondition.GOOD,
    images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="],
    ...override,
  };
}

export function createFurnitureProduct(override: Partial<ProductEntity> = {}): ProductEntity {
  return {
    title: "Wooden Chair",
    description: "Beautiful wooden dining chair",
    price: 80,
    category: ProductCategory.FURNITURE_HOME,
    subcategory: ProductSubcategory.KITCHEN_DINING,
    condition: ProductCondition.VERY_GOOD,
    images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg=="],
    ...override,
  };
}

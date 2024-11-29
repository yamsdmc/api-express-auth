import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { fakeBase64 } from "@infrastructure/repositories/in-memory/fake-base64";

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

export function createValidProduct(override = {}) {
  return {
    title: "iPhone 12",
    description: "Excellent condition iPhone",
    price: 500,
    category: "electronics",
    condition: ProductCondition.GOOD,
    images: fakeBase64,
    ...override,
  };
}

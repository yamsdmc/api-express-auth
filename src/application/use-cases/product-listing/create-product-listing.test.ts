import { describe, it, expect, beforeEach } from "vitest";
import { CreateProductListingUseCase } from "@application/use-cases/product-listing/create-product-listing";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import { createValidProductListing } from "./factories/productListing.factory.js";

describe("CreateProductListingUseCase", () => {
  let useCase: CreateProductListingUseCase;
  let repository: InMemoryProductListingRepository;
  const sellerId = "seller-123";

  const mockListing: ProductListingEntity = createValidProductListing();

  beforeEach(() => {
    repository = new InMemoryProductListingRepository();
    useCase = new CreateProductListingUseCase(repository);
  });

  it("should create a new product listing", async () => {
    const result = await useCase.execute(sellerId, mockListing);

    expect(result).toMatchObject({
      sellerId,
      product: expect.objectContaining({
        title: mockListing.product.title,
        price: mockListing.product.price,
      }),
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should store the listing in repository", async () => {
    const created = await useCase.execute(sellerId, mockListing);
    const found = await repository.findById(created.id!);

    expect(found).toBeDefined();
    expect(found?.product.title).toBe(mockListing.product.title);
  });
});

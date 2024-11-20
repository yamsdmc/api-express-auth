import { describe, it, expect, beforeEach } from "vitest";
import { CreateProductListingUseCase } from "@application/use-cases/product-listing/create-product-listing";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { ProductEntity } from "@domain/entities/Product";

describe("CreateProductListingUseCase", () => {
  let useCase: CreateProductListingUseCase;
  let repository: InMemoryProductListingRepository;
  const sellerId = "seller-123";

  const mockProduct: ProductEntity = {
    title: "iPhone 12",
    description: "Excellent condition iPhone",
    price: 500,
    category: "electronics",
    condition: ProductCondition.GOOD,
    images: ["image1.jpg"],
    location: "Paris",
  };

  beforeEach(() => {
    repository = new InMemoryProductListingRepository();
    useCase = new CreateProductListingUseCase(repository);
  });

  it("should create a new product listing", async () => {
    const result = await useCase.execute(sellerId, mockProduct);

    expect(result).toMatchObject({
      sellerId,
      product: expect.objectContaining({
        title: mockProduct.title,
        price: mockProduct.price,
      }),
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("should store the listing in repository", async () => {
    const created = await useCase.execute(sellerId, mockProduct);
    const found = await repository.findById(created.id!);

    expect(found).toBeDefined();
    expect(found?.product.title).toBe(mockProduct.title);
  });
});

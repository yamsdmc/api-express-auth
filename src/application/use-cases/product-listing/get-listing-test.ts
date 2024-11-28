import {describe, it, expect, beforeEach} from "vitest";
import {GetListingsUseCase} from "@application/use-cases/product-listing/get-listings";
import {
    InMemoryProductListingRepository
} from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import {ProductCategory} from "@domain/value-concepts/ProductCategory";

describe('GetListingsUseCase', () => {
    let useCase: GetListingsUseCase;
    let repository: InMemoryProductListingRepository;

    beforeEach(() => {
        repository = new InMemoryProductListingRepository();
        useCase = new GetListingsUseCase(repository);
    });

    it('should filter by category', async () => {
        const listings = await useCase.execute({category: ProductCategory.ELECTRONICS});
        expect(listings.every(l => l.product.category === ProductCategory.ELECTRONICS)).toBe(true);
    });

    it('should filter by price range', async () => {
        const listings = await useCase.execute({minPrice: 10, maxPrice: 20});
        expect(listings.every(l => l.product.price >= 10 && l.product.price <= 20)).toBe(true);
    });
});

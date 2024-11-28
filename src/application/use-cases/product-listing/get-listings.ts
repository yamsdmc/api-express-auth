import {ProductListingRepository} from "@domain/repositories/product-listing-repository";
import {ProductListingEntity} from "@domain/entities/ProductListing";
import {listingFiltersUtils} from "@domain/value-concepts/ListingFilters";

export interface ListingFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}

export class GetListingsUseCase {
    constructor(private readonly productListingRepository: ProductListingRepository) {}

    async execute(filters?: ListingFilters): Promise<ProductListingEntity[]> {
        if (filters) {
            listingFiltersUtils.validate(filters);
        }
        return this.productListingRepository.findAll(filters);
    }
}
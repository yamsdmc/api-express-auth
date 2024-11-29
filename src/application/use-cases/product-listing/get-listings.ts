import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import {
  ListingFilters,
  listingFiltersUtils,
} from "@domain/value-concepts/ListingFilters";
import {
  PaginatedResult,
  PaginationParams,
} from "@domain/value-concepts/Pagination";

export interface GetListingsParams {
  pagination: PaginationParams;
  filters?: ListingFilters | undefined;
}

export class GetListingsUseCase {
  constructor(
    private readonly productListingRepository: ProductListingRepository
  ) {}

  async execute({
    pagination,
    filters,
  }: GetListingsParams): Promise<PaginatedResult<ProductListingEntity>> {
    if (filters) {
      listingFiltersUtils.validate(filters);
    }
    return this.productListingRepository.findAll(pagination, filters);
  }
}

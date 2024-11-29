import { ProductEntity } from "@domain/entities/Product";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import {
  PaginatedResult,
  PaginationParams,
} from "@domain/value-concepts/Pagination";
import { ListingFilters } from "@domain/value-concepts/ListingFilters";

export interface ProductListingRepository {
  create(listing: ProductListingEntity): Promise<ProductListingEntity>;
  findById(id: string): Promise<ProductListingEntity | null>;
  findBySellerId(sellerId: string): Promise<ProductListingEntity[]>;
  update(
    id: string,
    product: Partial<ProductEntity>
  ): Promise<ProductListingEntity>;
  delete(id: string): Promise<void>;
  findAll(
    pagination: PaginationParams,
    filters?: ListingFilters
  ): Promise<PaginatedResult<ProductListingEntity>>;
  countListingsForUser(userId: string): Promise<number>;
}

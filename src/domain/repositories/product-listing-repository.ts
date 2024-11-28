import { ProductEntity } from "@domain/entities/Product";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import {ListingFilters} from "@application/use-cases/product-listing/get-listings";

export interface ProductListingRepository {
  create(listing: ProductListingEntity): Promise<ProductListingEntity>;
  findById(id: string): Promise<ProductListingEntity | null>;
  findBySellerId(sellerId: string): Promise<ProductListingEntity[]>;
  update(
    id: string,
    product: Partial<ProductEntity>
  ): Promise<ProductListingEntity>;
  delete(id: string): Promise<void>;
  findAll(filters?: ListingFilters): Promise<ProductListingEntity[]>;
  countListingsForUser(userId: string): Promise<number>;
}

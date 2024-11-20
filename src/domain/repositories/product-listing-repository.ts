import { ProductEntity } from "@domain/entities/Product";
import { ProductListingEntity } from "@domain/entities/ProductListing";

export interface ProductListingRepository {
  create(
    sellerId: string,
    product: ProductEntity
  ): Promise<ProductListingEntity>;
  findById(id: string): Promise<ProductListingEntity | null>;
  findBySellerId(sellerId: string): Promise<ProductListingEntity[]>;
  update(
    id: string,
    product: Partial<ProductEntity>
  ): Promise<ProductListingEntity>;
  delete(id: string): Promise<void>;
}

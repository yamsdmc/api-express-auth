import { ProductEntity } from "@domain/entities/Product";

export interface ProductListingEntity {
  id?: string;
  product: ProductEntity;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
}

import { ProductEntity } from "@domain/entities/Product";

export interface ProductListingDTO {
  id: string;
  product: ProductEntity;
  sellerId: string;
  phoneNumber: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

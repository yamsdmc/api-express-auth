import { ProductEntity } from "@domain/entities/Product";

export interface UserProduct {
  id?: string;
  userId: string;
  product: ProductEntity;
  createdAt: Date;
}

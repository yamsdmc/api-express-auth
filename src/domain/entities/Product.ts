import { ProductConditionType } from "@domain/value-concepts/ProductCondition";

export interface ProductEntity {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: ProductConditionType;
  images: string[];
}

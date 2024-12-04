import { ProductConditionType } from "@domain/value-concepts/ProductCondition";

export interface ProductEntity {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: ProductConditionType;
  images: string[];
}

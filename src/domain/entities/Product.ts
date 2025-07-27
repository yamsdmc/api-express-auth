import { ProductConditionType } from "@domain/value-concepts/ProductCondition";
import { ProductCategoryType, ProductSubcategoryType, ProductGenderType } from "@domain/value-concepts/ProductCategory";

export interface ProductEntity {
  title: string;
  description: string;
  price: number;
  category: ProductCategoryType;
  subcategory: ProductSubcategoryType;
  gender?: ProductGenderType; // Optionnel, requis seulement pour certaines sous-catégories
  condition: ProductConditionType;
  images: string[];
}

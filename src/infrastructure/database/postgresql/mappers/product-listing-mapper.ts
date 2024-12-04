import { ProductListingEntity } from "@domain/entities/ProductListing";

export class ProductListingMapper {
  static toEntity(row: any): ProductListingEntity {
    return {
      id: row.id,
      product: {
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        category: row.category,
        condition: row.condition,
        images: row.images,
      },
      sellerId: row.seller_id,
      location: row.location,
      phoneNumber: row.phone_number,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  static toDB(entity: ProductListingEntity): any {
    return {
      id: entity.id,
      title: entity.product.title,
      description: entity.product.description,
      price: entity.product.price,
      category: entity.product.category,
      condition: entity.product.condition,
      images: entity.product.images,
      seller_id: entity.sellerId,
      location: entity.location,
      phone_number: entity.phoneNumber,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}

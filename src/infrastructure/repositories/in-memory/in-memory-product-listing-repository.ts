import { ProductEntity } from "@domain/entities/Product";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductListingRepository } from "@domain/repositories/product-listing-repository";

export class InMemoryProductListingRepository
  implements ProductListingRepository
{
  private listings: ProductListingEntity[] = [];

  async create(
    sellerId: string,
    product: ProductEntity
  ): Promise<ProductListingEntity> {
    const newListing: ProductListingEntity = {
      id: crypto.randomUUID(),
      product: { ...product, id: crypto.randomUUID() },
      sellerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.listings.push(newListing);
    return newListing;
  }

  async findById(id: string): Promise<ProductListingEntity | null> {
    return this.listings.find((listing) => listing.id === id) || null;
  }

  async findBySellerId(sellerId: string): Promise<ProductListingEntity[]> {
    return this.listings.filter((listing) => listing.sellerId === sellerId);
  }

  async update(
    id: string,
    productData: Partial<ProductEntity>
  ): Promise<ProductListingEntity> {
    const index = this.listings.findIndex((listing) => listing.id === id);
    if (index === -1) {
      throw new Error("Listing not found");
    }

    const updatedListing = {
      ...this.listings[index],
      product: {
        ...this.listings[index].product,
        ...productData,
      },
      updatedAt: new Date(),
    };

    this.listings[index] = updatedListing;
    return updatedListing;
  }

  async delete(id: string): Promise<void> {
    const index = this.listings.findIndex((listing) => listing.id === id);
    if (index === -1) {
      throw new Error("Listing not found");
    }
    this.listings.splice(index, 1);
  }

  async reset(): Promise<void> {
    this.listings = [];
  }
}

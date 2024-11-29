import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ListingFilters } from "@domain/value-concepts/ListingFilters";
import { fakeBase64 } from "./fake-base64";
import {
  PaginatedResult,
  PaginationParams,
} from "@domain/value-concepts/Pagination";
import { ProductCategory } from "@domain/value-concepts/ProductCategory";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { fakeUserId } from "@infrastructure/repositories/in-memory/in-memory-user-repository";

export class InMemoryProductListingRepository
  implements ProductListingRepository
{
  private listings: ProductListingEntity[] = this.generateMockListings(80);

  async countListingsForUser(userId: string): Promise<number> {
    return this.listings.filter((listing) => listing.sellerId === userId)
      .length;
  }

  async create(listing: ProductListingEntity): Promise<ProductListingEntity> {
    const newListing: ProductListingEntity = {
      ...listing,
      id: crypto.randomUUID(),
      product: { ...listing.product, id: crypto.randomUUID() },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.listings.push(newListing);
    console.log(this.listings.map((listing) => listing.createdAt));
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
    productData: Partial<ProductListingEntity>
  ): Promise<ProductListingEntity> {
    const index = this.listings.findIndex((listing) => listing.id === id);
    if (index === -1) {
      throw new Error("Listing not found");
    }

    const updatedListing = {
      ...this.listings[index],
      ...productData,
      product: {
        ...this.listings[index].product,
        ...productData.product,
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

  async findAll(
    pagination: PaginationParams,
    filters?: ListingFilters
  ): Promise<PaginatedResult<ProductListingEntity>> {
    const listingsFiltered = this.listings.filter((listing) => {
      if (filters?.category && listing.product.category !== filters.category) {
        return false;
      }
      if (filters?.minPrice && listing.product.price < filters.minPrice) {
        return false;
      }
      if (filters?.maxPrice && listing.product.price > filters.maxPrice) {
        return false;
      }
      return true;
    });

    const sorted = listingsFiltered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const total = sorted.length;
    const data = sorted.slice(
      pagination.offset,
      pagination.offset + pagination.limit
    );
    const hasMore = total > pagination.offset + pagination.limit;

    return {
      data,
      total,
      hasMore,
    };
  }

  async reset(): Promise<void> {
    this.listings = [];
  }
  private generateMockListings(count: number): ProductListingEntity[] {
    const conditions = Object.values(ProductCondition);
    const categories = Object.values(ProductCategory);
    const cities = ["Paris", "Lyon", "Marseille", "Bordeaux"];

    return Array.from({ length: count }, (_, i) => ({
      id: crypto.randomUUID(),
      product: {
        id: crypto.randomUUID(),
        title: `Product ${i + 1}`,
        description: `Description for product ${i + 1}`,
        price: Math.floor(Math.random() * 1000) + 100,
        category: categories[Math.floor(Math.random() * categories.length)],
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        images: fakeBase64,
      },
      location: `${cities[Math.floor(Math.random() * cities.length)]}, France`,
      phoneNumber: "+33612345678",
      sellerId: fakeUserId,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)),
      updatedAt: new Date(),
    }));
  }
}

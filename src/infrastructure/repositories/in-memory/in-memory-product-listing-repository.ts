import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ListingFilters } from "@domain/value-concepts/ListingFilters";
import {
  giantCycleBase64,
  ikeaBillyBase64,
  iphoneBase64,
  ps5Base64,
  solidDiningBase64,
} from "./fake-base64";
import {
  PaginatedResult,
  PaginationParams,
} from "@domain/value-concepts/Pagination";
import { ProductCategory, ProductSubcategory } from "@domain/value-concepts/ProductCategory";
import { ProductCondition } from "@domain/value-concepts/ProductCondition";
import { fakeUserId } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import crypto from "crypto";

export class InMemoryProductListingRepository
  implements ProductListingRepository
{
  private listings: ProductListingEntity[] = this.generateRealisticListings();

  async countListingsForUser(userId: string): Promise<number> {
    return this.listings.filter((listing) => listing.sellerId === userId)
      .length;
  }

  async create(listing: ProductListingEntity): Promise<ProductListingEntity> {
    const newListing: ProductListingEntity = {
      ...listing,
      id: crypto.randomUUID(),
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
      if (filters?.subcategory && listing.product.subcategory !== filters.subcategory) {
        return false;
      }
      if (filters?.minPrice && listing.product.price < filters.minPrice) {
        return false;
      }
      if (filters?.maxPrice && listing.product.price > filters.maxPrice) {
        return false;
      }
      if (
        filters?.condition &&
        listing.product.condition !== filters.condition
      ) {
        return false;
      }
      if (filters?.query) {
        const searchQuery = filters.query.toLowerCase();
        const title = listing.product.title.toLowerCase();
        const description = listing.product.description?.toLowerCase() || "";

        if (
          !title.includes(searchQuery) &&
          !description.includes(searchQuery)
        ) {
          return false;
        }
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
        images: iphoneBase64,
      },
      location: `${cities[Math.floor(Math.random() * cities.length)]}, France`,
      phoneNumber: "+33612345678",
      sellerId: fakeUserId,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)),
      updatedAt: new Date(),
    }));
  }

  private generateRealisticListings(): ProductListingEntity[] {
    const realisticProducts = [
      {
        title: "iPhone 13 Pro 256GB",
        description:
          "iPhone 13 Pro in excellent condition, graphite color. Sold with original charger and protective case. Battery health at 89%. Unlocked for all carriers.",
        price: 699,
        category: ProductCategory.ELECTRONICS,
        subcategory: "smartphones_tablets" as any,
        condition: ProductCondition.GOOD,
        images: iphoneBase64,
      },
      {
        title: "Giant Trance X 29 Mountain Bike",
        description:
          "Giant Trance X 29 2022 full suspension mountain bike, size L. Shimano XT drivetrain, hydraulic disc brakes. Perfect condition, recently serviced.",
        price: 2200,
        category: ProductCategory.SPORTS,
        subcategory: "sports_equipment" as any,
        condition: ProductCondition.FAIR,
        images: [giantCycleBase64],
      },
      {
        title: "PS5 Standard Edition Console",
        description:
          "PS5 Standard Edition with Blu-ray drive. Comes with 2 DualSense controllers and 3 games (Spider-Man, God of War, Horizon). Under warranty until 2025.",
        price: 450,
        category: ProductCategory.ELECTRONICS,
        subcategory: "gaming" as any,
        condition: ProductCondition.GOOD,
        images: [ps5Base64],
      },
      {
        title: "Solid Oak Dining Table",
        description:
          "Handcrafted solid oak dining table. Dimensions: 200x90cm. Seats 8 people. Some signs of use but in very good overall condition.",
        price: 580,
        category: ProductCategory.FURNITURE,
        subcategory: "kitchen_dining" as any,
        condition: ProductCondition.GOOD,
        images: [solidDiningBase64],
      },
      {
        title: "IKEA Billy Bookcase",
        description:
          "White IKEA Billy bookcase, 80x28x202cm. Assembled once then disassembled, stored in original box. Like new condition, all mounting hardware included.",
        price: 45,
        category: ProductCategory.FURNITURE,
        subcategory: "living_room" as any,
        condition: ProductCondition.LIKE_NEW,
        images: [ikeaBillyBase64],
      },
    ];
    const UAE_CITIES = [
      "Sharjah",
      "Dubai",
      "Abu Dhabi",
      "Ajman",
      "Fujairah",
      "Ras Al Khaimah",
      "Umm Al Quwain",
    ];

    const getRandomLocation = () => {
      return UAE_CITIES[Math.floor(Math.random() * UAE_CITIES.length)];
    };
    return realisticProducts.map((product) => ({
      id: crypto.randomUUID(),
      product: {
        ...product,
      },
      phoneNumber: "+33612345678",
      sellerId: fakeUserId,
      location: getRandomLocation(),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000)),
      updatedAt: new Date(),
    }));
  }
}

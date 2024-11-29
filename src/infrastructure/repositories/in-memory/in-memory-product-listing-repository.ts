import { ProductEntity } from "@domain/entities/Product";
import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { ListingFilters } from "@domain/value-concepts/ListingFilters";
import { fakeBase64 } from "./fake-base64";

export class InMemoryProductListingRepository
  implements ProductListingRepository
{
  private listings: ProductListingEntity[] = [
    {
      id: "e2d4f3a5-2a17-4d60-bd26-bc7c6e6b1f94",
      product: {
        id: "12345",
        title: "Smartphone Samsung Galaxy S21",
        description:
          "Un smartphone haut de gamme en excellent état, vendu avec tous les accessoires d'origine.",
        price: 799.99,
        category: "Electronics",
        condition: "good",
        images: fakeBase64,
      },
      location: "Paris, France",
      phoneNumber: "+33612345678",
      sellerId: "e2d4f3a5-2a17-4d60-bd26-bc7c6e6b1f94",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "e2d4f3a5-2a17-4d60-bd26-bc7c6e6b1f95",
      product: {
        id: "12345",
        title: "Smartphone Samsung Galaxy S21",
        description:
          "Un smartphone haut de gamme en excellent état, vendu avec tous les accessoires d'origine.",
        price: 799.99,
        category: "Electronics",
        condition: "good",
        images: fakeBase64,
      },
      location: "Paris, France",
      phoneNumber: "+33612345678",
      sellerId: "e2d4f3a5-2a17-4d60-bd26-bc7c6e6b1f94",
      createdAt: new Date("2024-10-27T09:34:46.147Z"),
      updatedAt: new Date(),
    },
  ];

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

  async findAll(filters?: ListingFilters): Promise<ProductListingEntity[]> {
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

    return listingsFiltered.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async reset(): Promise<void> {
    this.listings = [];
  }
}

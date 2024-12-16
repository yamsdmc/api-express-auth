import { ProductListingEntity } from "@domain/entities/ProductListing";
import { ProductListingRepository } from "@domain/repositories/product-listing-repository";
import { pool } from "../client";
import { ProductListingMapper } from "@infrastructure/database/postgresql/mappers/product-listing-mapper";
import { ListingFilters } from "@domain/value-concepts/ListingFilters";
import {
  PaginatedResult,
  PaginationParams,
} from "@domain/value-concepts/Pagination";
import crypto from 'crypto';

export class PostgresqlProductListingRepository
  implements ProductListingRepository
{
  async countListingsForUser(userId: string): Promise<number> {
    const query = `
           SELECT COUNT(*) 
           FROM product_listings
           WHERE seller_id = $1
       `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  async create(listing: ProductListingEntity): Promise<ProductListingEntity> {
    const query = `
           INSERT INTO product_listings (
               id,
               seller_id,
               title,
               description,
               price,
               category,
               condition,
               location,
               phone_number,
               images,
               created_at,
               updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *
       `;

    const values = [
      crypto.randomUUID(),
      listing.sellerId,
      listing.product.title,
      listing.product.description,
      listing.product.price,
      listing.product.category,
      listing.product.condition,
      listing.location,
      listing.phoneNumber,
      listing.product.images,
      new Date(),
      new Date(),
    ];

    const result = await pool.query(query, values);
    return ProductListingMapper.toEntity(result.rows[0]);
  }

  async findById(id: string): Promise<ProductListingEntity | null> {
    const query = `
           SELECT * FROM product_listings 
           WHERE id = $1
       `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;

    return ProductListingMapper.toEntity(result.rows[0]);
  }

  async findBySellerId(sellerId: string): Promise<ProductListingEntity[]> {
    const query = `
           SELECT * FROM product_listings 
           WHERE seller_id = $1
           ORDER BY created_at DESC
       `;

    const result = await pool.query(query, [sellerId]);

    return result.rows.map((row) => ProductListingMapper.toEntity(row));
  }

  async update(
    id: string,
    productData: Partial<ProductListingEntity>
  ): Promise<ProductListingEntity> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (productData.product) {
      if (productData.product.title) {
        updates.push(`title = $${paramCount}`);
        values.push(productData.product.title);
        paramCount++;
      }
      if (productData.product.description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(productData.product.description);
        paramCount++;
      }
      if (productData.product.price !== undefined) {
        updates.push(`price = $${paramCount}`);
        values.push(productData.product.price);
        paramCount++;
      }
      if (productData.product.category) {
        updates.push(`category = $${paramCount}`);
        values.push(productData.product.category);
        paramCount++;
      }
      if (productData.product.condition) {
        updates.push(`condition = $${paramCount}`);
        values.push(productData.product.condition);
        paramCount++;
      }
      if (productData.product.images) {
        updates.push(`images = $${paramCount}`);
        values.push(productData.product.images);
        paramCount++;
      }
    }

    if (productData.location) {
      updates.push(`location = $${paramCount}`);
      values.push(productData.location);
      paramCount++;
    }

    if (productData.phoneNumber) {
      updates.push(`phone_number = $${paramCount}`);
      values.push(productData.phoneNumber);
      paramCount++;
    }

    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(id);

    const query = `
            UPDATE product_listings 
            SET ${updates.join(", ")}
            WHERE id = $${paramCount}
            RETURNING *
        `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error("Listing not found");
    }

    return ProductListingMapper.toEntity(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = `
            DELETE FROM product_listings 
            WHERE id = $1
            RETURNING id
        `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new Error("Listing not found");
    }
  }

  async findAll(
    pagination: PaginationParams,
    filters?: ListingFilters
  ): Promise<PaginatedResult<ProductListingEntity>> {
    let query = `SELECT * FROM product_listings WHERE 1=1`;
    const values: any[] = [];
    let paramCount = 1;

    if (filters) {
      if (filters.category) {
        query += ` AND category = $${paramCount}`;
        values.push(filters.category);
        paramCount++;
      }
      if (filters.minPrice !== undefined) {
        query += ` AND price >= $${paramCount}`;
        values.push(filters.minPrice);
        paramCount++;
      }
      if (filters.maxPrice !== undefined) {
        query += ` AND price <= $${paramCount}`;
        values.push(filters.maxPrice);
        paramCount++;
      }
      if (filters.condition) {
        query += ` AND condition = $${paramCount}`;
        values.push(filters.condition);
        paramCount++;
      }
      if (filters.query) {
        query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        values.push(`%${filters.query}%`);
        paramCount++;
      }
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM (${query}) AS filtered`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(pagination.limit, pagination.offset);

    const result = await pool.query(query, values);

    return {
      data: result.rows.map((row) => ProductListingMapper.toEntity(row)),
      total,
      hasMore: total > pagination.offset + pagination.limit,
    };
  }
}

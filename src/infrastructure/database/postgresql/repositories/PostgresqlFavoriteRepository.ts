import { Pool } from 'pg';
import { FavoriteRepository } from '../../../../domain/repositories/favorite-repository';
import { Favorite, CreateFavoriteData, FavoritesFilter, FavoriteFactory } from '../../../../domain/entities/Favorite';
import { ProductListingEntity } from '../../../../domain/entities/ProductListing';
import { ProductListingMapper } from '../mappers/product-listing-mapper';
import { pool } from '../client';

/**
 * PostgreSQL implementation of the Favorite Repository
 * 
 * Handles database operations for favorites using PostgreSQL.
 * Follows the Repository pattern for infrastructure details abstraction.
 */
export class PostgresqlFavoriteRepository implements FavoriteRepository {
  private pool: Pool;

  constructor(poolInstance?: Pool) {
    this.pool = poolInstance || pool;
  }

  async addToFavorites(data: CreateFavoriteData): Promise<Favorite> {
    const favorite = FavoriteFactory.create(data);
    
    const query = `
      INSERT INTO favorites (id, user_id, listing_id, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [favorite.id, favorite.userId, favorite.listingId, favorite.createdAt];

    try {
      const result = await this.pool.query(query, values);
      return this.mapToFavorite(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('This listing is already in your favorites');
      }
      throw new Error(`Failed to add to favorites: ${error.message}`);
    }
  }

  async removeFromFavorites(userId: string, listingId: string): Promise<void> {
    const query = `
      DELETE FROM favorites 
      WHERE user_id = $1 AND listing_id = $2
    `;

    const result = await this.pool.query(query, [userId, listingId]);

    if (result.rowCount === 0) {
      throw new Error('This listing is not in your favorites');
    }
  }

  async getUserFavorites(userId: string): Promise<ProductListingEntity[]> {
    const query = `
      SELECT 
        pl.*,
        u.firstname as user_firstname,
        u.lastname as user_lastname,
        u.created_at as user_created_at,
        (SELECT COUNT(*) FROM product_listings WHERE seller_id = u.id) as user_active_listings_count
      FROM favorites f
      INNER JOIN product_listings pl ON f.listing_id = pl.id
      INNER JOIN users u ON pl.seller_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;

    const result = await this.pool.query(query, [userId]);
    return result.rows.map(row => ProductListingMapper.toEntity(row));
  }

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const query = `
      SELECT 1 FROM favorites 
      WHERE user_id = $1 AND listing_id = $2
      LIMIT 1
    `;

    const result = await this.pool.query(query, [userId, listingId]);
    return result.rows.length > 0;
  }

  async getFavorites(filter: FavoritesFilter): Promise<Favorite[]> {
    let query = `
      SELECT * FROM favorites 
      WHERE user_id = $1
    `;
    const values: any[] = [filter.userId];

    if (filter.listingId) {
      query += ` AND listing_id = $${values.length + 1}`;
      values.push(filter.listingId);
    }

    query += ` ORDER BY created_at DESC`;

    if (filter.limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(filter.limit);
    }

    if (filter.offset) {
      query += ` OFFSET $${values.length + 1}`;
      values.push(filter.offset);
    }

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapToFavorite(row));
  }

  async removeAllFavoritesForListing(listingId: string): Promise<void> {
    const query = `DELETE FROM favorites WHERE listing_id = $1`;
    await this.pool.query(query, [listingId]);
  }

  async getFavoritesCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM favorites f
      INNER JOIN product_listings pl ON f.listing_id = pl.id
      WHERE f.user_id = $1
    `;

    const result = await this.pool.query(query, [userId]);
    return parseInt(result.rows[0].count, 10);
  }

  private mapToFavorite(row: any): Favorite {
    return FavoriteFactory.fromDatabase({
      id: row.id,
      userId: row.user_id,
      listingId: row.listing_id,
      createdAt: row.created_at,
    });
  }
}
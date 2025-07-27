import { Router } from 'express';
import { FavoriteController } from '../controllers/favorite-controller';
import { authMiddleware } from '../middleware/auth-middleware';
import { TokenService } from '../../../application/services/token-service';
import { TokenBlacklistService } from '../../../domain/services/token-blacklist';

/**
 * Favorite Routes
 * 
 * Defines REST API endpoints for favorite operations.
 * All routes require authentication.
 */
export const createFavoriteRoutes = (
  tokenService: TokenService,
  blacklistService: TokenBlacklistService
): Router => {
  const router = Router();
  const favoriteController = new FavoriteController();

  // All favorite routes require authentication
  router.use(authMiddleware(tokenService, blacklistService));

  /**
   * @swagger
   * /api/favorites:
   *   post:
   *     summary: Add a listing to favorites
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - listingId
   *             properties:
   *               listingId:
   *                 type: string
   *                 description: ID of the listing to add to favorites
   *     responses:
   *       201:
   *         description: Added to favorites successfully
   *       400:
   *         description: Bad request - missing listingId
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Cannot favorite own listing
   *       404:
   *         description: Listing not found
   *       409:
   *         description: Already in favorites
   */
  router.post('/', favoriteController.addToFavorites);

  /**
   * @swagger
   * /api/favorites/{listingId}:
   *   delete:
   *     summary: Remove a listing from favorites
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: listingId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the listing to remove from favorites
   *     responses:
   *       200:
   *         description: Removed from favorites successfully
   *       401:
   *         description: Authentication required
   *       404:
   *         description: Not in favorites or listing not found
   */
  router.delete('/:listingId', favoriteController.removeFromFavorites);

  /**
   * @swagger
   * /api/favorites:
   *   get:
   *     summary: Get user's favorite listings
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Favorites retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ProductListing'
   *                 count:
   *                   type: number
   *       401:
   *         description: Authentication required
   */
  router.get('/', favoriteController.getUserFavorites);

  /**
   * @swagger
   * /api/favorites/check/{listingId}:
   *   get:
   *     summary: Check if a listing is in user's favorites
   *     tags: [Favorites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: listingId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the listing to check
   *     responses:
   *       200:
   *         description: Favorite status retrieved
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 data:
   *                   type: object
   *                   properties:
   *                     isFavorite:
   *                       type: boolean
   *       401:
   *         description: Authentication required
   */
  router.get('/check/:listingId', favoriteController.checkFavoriteStatus);

  return router;
};
import { Router } from "express";
import { ProductListingController } from "../controllers/product-listing-controller";
import { authMiddleware } from "../middleware/auth-middleware";
import { TokenService } from "@application/services/token-service";
import { TokenBlacklistService } from "@domain/services/token-blacklist";

export const productListingRouter = (
  controller: ProductListingController,
  tokenService: TokenService,
  blacklistService: TokenBlacklistService
): Router => {
  const router = Router();
  const auth = authMiddleware(tokenService, blacklistService);

  router.get('/', async (req, res, next) => {
    console.log('Hello World -----');
    await controller.getListings(req, res, next);
  });

  /**
   * @openapi
   * /api/listings:
   *   post:
   *     tags:
   *       - Listings
   *     summary: Create a new listing
   *     description: Create a new product listing. Must be authenticated.
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - description
   *               - price
   *               - category
   *               - condition
   *               - images
   *             properties:
   *               title:
   *                 type: string
   *                 description: Title of the product
   *                 minLength: 3
   *                 maxLength: 100
   *                 example: "iPhone 12 Pro Max"
   *               description:
   *                 type: string
   *                 description: Detailed description of the product
   *                 minLength: 20
   *                 maxLength: 1000
   *                 example: "Perfect condition iPhone 12 Pro Max, 256GB, Pacific Blue, with original box and accessories"
   *               price:
   *                 type: number
   *                 description: Price in the default currency
   *                 minimum: 0
   *                 maximum: 1000000
   *                 example: 899.99
   *               category:
   *                 type: string
   *                 description: Product category
   *                 enum: [electronics, vehicles, furniture, clothing, books, sports, other]
   *                 example: "electronics"
   *               condition:
   *                 type: string
   *                 description: Product condition
   *                 enum: [new, likeNew, good, fair, poor]
   *                 example: "likeNew"
   *               images:
   *                 type: array
   *                 description: Array of image URLs
   *                 minItems: 1
   *                 maxItems: 5
   *                 items:
   *                   type: string
   *                 example: ["image1.jpg", "image2.jpg"]
   *               location:
   *                 type: string
   *                 description: Optional location of the product
   *                 example: "Paris, France"
   *     responses:
   *       201:
   *         description: Product listing created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: "123e4567-e89b-12d3-a456-426614174000"
   *                 product:
   *                   $ref: '#/components/schemas/Product'
   *                 sellerId:
   *                   type: string
   *                   example: "user123"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Invalid input data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "VALIDATION_ERROR"
   *                 message:
   *                   type: string
   *                   example: "Invalid input data"
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "UNAUTHORIZED"
   *                 message:
   *                   type: string
   *                   example: "Authentication required"
   */
  router.post("/", auth, (req, res, next) =>
    controller.createListing(req, res, next)
  );

  /**
   * @openapi
   * /api/listings/me:
   *   get:
   *     tags:
   *       - Listings
   *     summary: Get current user's listings
   *     description: Retrieve all listings created by the authenticated user
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of user's listings
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     example: "123e4567-e89b-12d3-a456-426614174000"
   *                   product:
   *                     type: object
   *                     properties:
   *                       title:
   *                         type: string
   *                         example: "iPhone 12 Pro Max"
   *                       description:
   *                         type: string
   *                         example: "Perfect condition iPhone"
   *                       price:
   *                         type: number
   *                         example: 899.99
   *                       category:
   *                         type: string
   *                         example: "electronics"
   *                       condition:
   *                         type: string
   *                         example: "likeNew"
   *                       images:
   *                         type: array
   *                         items:
   *                           type: string
   *                         example: ["image1.jpg", "image2.jpg"]
   *                       location:
   *                         type: string
   *                         example: "Paris, France"
   *                   sellerId:
   *                     type: string
   *                     example: "user123"
   *                   createdAt:
   *                     type: string
   *                     format: date-time
   *                   updatedAt:
   *                     type: string
   *                     format: date-time
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "UNAUTHORIZED"
   *                 message:
   *                   type: string
   *                   example: "Authentication required"
   */
  router.get("/me", auth, (req, res, next) =>
    controller.getSellerListings(req, res, next)
  );

  /**
   * @openapi
   * /api/listings/{id}:
   *   get:
   *     tags:
   *       - Listings
   *     summary: Get listing by ID
   *     description: Retrieve detailed information about a specific listing
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Listing ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Detailed listing information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: "123e4567-e89b-12d3-a456-426614174000"
   *                 product:
   *                   type: object
   *                   properties:
   *                     title:
   *                       type: string
   *                       example: "iPhone 12 Pro Max"
   *                     description:
   *                       type: string
   *                       example: "Perfect condition iPhone"
   *                     price:
   *                       type: number
   *                       example: 899.99
   *                     category:
   *                       type: string
   *                       example: "electronics"
   *                     condition:
   *                       type: string
   *                       example: "likeNew"
   *                     images:
   *                       type: array
   *                       items:
   *                         type: string
   *                       example: ["image1.jpg", "image2.jpg"]
   *                     location:
   *                       type: string
   *                       example: "Paris, France"
   *                 sellerId:
   *                   type: string
   *                   example: "user123"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *       404:
   *         description: Listing not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "LISTING_001"
   *                 message:
   *                   type: string
   *                   example: "Listing not found"
   */
  router.get("/:id", (req, res, next) =>
    controller.getListingById(req, res, next)
  );

  /**
   * @openapi
   * /api/listings/{id}:
   *   put:
   *     tags:
   *       - Listings
   *     summary: Update a listing
   *     description: Update an existing listing. Only the owner can update their listing.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Listing ID
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: Title of the product
   *                 minLength: 3
   *                 maxLength: 100
   *                 example: "Updated iPhone 12 Pro Max"
   *               description:
   *                 type: string
   *                 description: Detailed description of the product
   *                 minLength: 20
   *                 maxLength: 1000
   *                 example: "Updated description with new details"
   *               price:
   *                 type: number
   *                 description: Price in the default currency
   *                 minimum: 0
   *                 maximum: 1000000
   *                 example: 799.99
   *               category:
   *                 type: string
   *                 description: Product category
   *                 enum: [electronics, vehicles, furniture, clothing, books, sports, other]
   *                 example: "electronics"
   *               condition:
   *                 type: string
   *                 description: Product condition
   *                 enum: [new, likeNew, good, fair, poor]
   *                 example: "good"
   *               images:
   *                 type: array
   *                 description: Array of image URLs
   *                 minItems: 1
   *                 maxItems: 5
   *                 items:
   *                   type: string
   *                 example: ["newimage1.jpg", "newimage2.jpg"]
   *               location:
   *                 type: string
   *                 description: Optional location of the product
   *                 example: "Lyon, France"
   *     responses:
   *       200:
   *         description: Listing updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   example: "123e4567-e89b-12d3-a456-426614174000"
   *                 product:
   *                   $ref: '#/components/schemas/Product'
   *                 sellerId:
   *                   type: string
   *                   example: "user123"
   *                 createdAt:
   *                   type: string
   *                   format: date-time
   *                 updatedAt:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Invalid input data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "VALIDATION_ERROR"
   *                 message:
   *                   type: string
   *                   example: "Invalid input data"
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "UNAUTHORIZED"
   *                 message:
   *                   type: string
   *                   example: "Authentication required"
   *       403:
   *         description: Forbidden - User is not the owner of the listing
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "FORBIDDEN"
   *                 message:
   *                   type: string
   *                   example: "You are not authorized to update this listing"
   *       404:
   *         description: Listing not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "LISTING_001"
   *                 message:
   *                   type: string
   *                   example: "Listing not found"
   */
  router.put("/:id", auth, (req, res, next) =>
    controller.updateListing(req, res, next)
  );

  /**
   * @openapi
   * /api/listings/{id}:
   *   delete:
   *     tags:
   *       - Listings
   *     summary: Delete a listing
   *     description: Delete an existing listing. Only the owner can delete their listing.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Listing ID to delete
   *         example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       204:
   *         description: Listing successfully deleted
   *       401:
   *         description: Unauthorized - User not authenticated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "UNAUTHORIZED"
   *                 message:
   *                   type: string
   *                   example: "Authentication required"
   *       403:
   *         description: Forbidden - User is not the owner of the listing
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "FORBIDDEN"
   *                 message:
   *                   type: string
   *                   example: "You are not authorized to delete this listing"
   *       404:
   *         description: Listing not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: string
   *                   example: "LISTING_001"
   *                 message:
   *                   type: string
   *                   example: "Listing not found"
   */
  router.delete("/:id", auth, (req, res, next) =>
    controller.deleteListing(req, res, next)
  );

  return router;
};

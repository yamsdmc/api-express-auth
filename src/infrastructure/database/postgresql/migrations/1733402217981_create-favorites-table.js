/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Create favorites table
  pgm.createTable("favorites", {
    id: { type: "varchar(255)", primaryKey: true },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    listing_id: {
      type: "uuid",
      notNull: true,
      references: "product_listings",
      onDelete: "CASCADE",
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Add unique constraint: a user can only favorite a listing once
  pgm.addConstraint("favorites", "unique_user_listing", {
    unique: ["user_id", "listing_id"],
  });

  // Create indexes for performance
  pgm.createIndex("favorites", "user_id");
  pgm.createIndex("favorites", "listing_id");
  pgm.createIndex("favorites", "created_at");

  console.log('✅ Created favorites table');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("favorites", "created_at");
  pgm.dropIndex("favorites", "listing_id");
  pgm.dropIndex("favorites", "user_id");
  pgm.dropConstraint("favorites", "unique_user_listing");
  pgm.dropTable("favorites");
  
  console.log('✅ Dropped favorites table');
};
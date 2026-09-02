-- H2Os Ultra H₂ — MySQL 8.0+ Schema
-- Run: mysql -u user -p hydrogen_store < schema.sql
-- Engine: InnoDB • Charset: utf8mb4_unicode_ci
-- Catalog-ready: add future H2Os bottles as new rows in products/product_variants

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- --------------------------------------------------
-- products
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sku` VARCHAR(64) NOT NULL COMMENT 'H2OS-ULTRA-H2',
  `name` VARCHAR(128) NOT NULL DEFAULT 'Ultra H₂',
  `brand` VARCHAR(64) NOT NULL DEFAULT 'H2Os',
  `category` VARCHAR(64) NOT NULL DEFAULT 'Hydrogen Bottle',
  `badge` VARCHAR(32) NULL,
  `tagline` VARCHAR(255) NOT NULL DEFAULT 'Hydration, upgraded.',
  `description` TEXT NOT NULL,
  `image` VARCHAR(255) NOT NULL DEFAULT '/images/ultraH2.jpeg',
  `images_json` JSON NULL COMMENT 'gallery',
  `videos_json` JSON NULL,
  `specs_json` JSON NULL,
  `features_json` JSON NULL,
  `rating` DECIMAL(2,1) NULL DEFAULT 4.9,
  `reviews_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- product_variants
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `variant_key` VARCHAR(32) NOT NULL COMMENT 'ultra-h2|future variants',
  `name` VARCHAR(64) NOT NULL,
  `finish` VARCHAR(128) NOT NULL,
  `hex` VARCHAR(16) NOT NULL,
  `sku` VARCHAR(64) NOT NULL,
  `price` INT UNSIGNED NOT NULL COMMENT 'NGN (not kobo)',
  `compare_at` INT UNSIGNED NULL,
  `stock` INT UNSIGNED NOT NULL DEFAULT 0,
  `image` VARCHAR(255) NOT NULL DEFAULT '/images/ultraH2.jpeg',
  `gradient` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_variant_sku` (`sku`),
  UNIQUE KEY `uq_product_variant` (`product_id`,`variant_key`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- orders
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference` VARCHAR(64) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `total` INT UNSIGNED NOT NULL COMMENT 'NGN total (incl shipping)',
  `currency` VARCHAR(8) NOT NULL DEFAULT 'NGN',
  `status` ENUM('pending','paid','failed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `shipping_json` JSON NOT NULL,
  `tracking_number` VARCHAR(32) NULL,
  `paystack_ref` VARCHAR(64) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_reference` (`reference`),
  KEY `idx_orders_email` (`email`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_paystack_ref` (`paystack_ref`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- order_items
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `variant_id` VARCHAR(32) NOT NULL,
  `qty` INT UNSIGNED NOT NULL,
  `price` INT UNSIGNED NOT NULL COMMENT 'NGN per unit at purchase time',
  `sku` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_items_order` (`order_id`),
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- paystack_transactions (webhook audit)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS `paystack_transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reference` VARCHAR(64) NOT NULL,
  `event` VARCHAR(64) NOT NULL,
  `amount` INT UNSIGNED NOT NULL COMMENT 'kobo',
  `raw_json` JSON NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_paystack_ref` (`reference`),
  KEY `idx_paystack_event` (`event`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- reviews (H2Os community)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(64) NOT NULL,
  `phone` VARCHAR(32) NULL COMMENT 'optional, never shown publicly',
  `rating` TINYINT UNSIGNED NOT NULL,
  `text` TEXT NOT NULL,
  `verified` TINYINT(1) NOT NULL DEFAULT 0,
  `anonymous` TINYINT(1) NOT NULL DEFAULT 0,
  `is_approved` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_rating` (`rating`),
  KEY `idx_reviews_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------
-- admins — H2Os MGT secure login (DB-managed)
-- --------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL COMMENT 'bcrypt',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=1;

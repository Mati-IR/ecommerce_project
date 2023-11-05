-- init.sql

-- Listings Table
CREATE TABLE IF NOT EXISTS `listings` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `creator_id` INT NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `location` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Listing Photos Table
CREATE TABLE IF NOT EXISTS `listing_photos` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT NOT NULL,
  `photo_url` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

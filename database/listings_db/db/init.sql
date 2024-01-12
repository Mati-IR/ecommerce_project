-- init.sql

-- Listings Table
CREATE TABLE IF NOT EXISTS `listings` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `creator_id` INT NOT NULL,
  `creation_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `category_id` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Listing Photos Table
CREATE TABLE IF NOT EXISTS `listing_photos` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `listing_id` INT NOT NULL,
  `photo_name` VARCHAR(50) NOT NULL,
  `storage` VARCHAR(20) NOT NULL,
  FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  'ordinal' INT NOT NULL DEFAULT '0
  `description` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert extended categories
INSERT INTO `categories` (`name`, `description`) VALUES
('Jobs', 'Job listings and employment opportunities', 0),
('Housing', 'Real estate, rentals, and shared accommodations', 1),
('Services', 'Local services offered by professionals and businesses', 2),
('Vehicles', 'Cars, trucks, motorcycles, and other vehicles', 3),
('Electronics', 'Computers, mobile phones, gadgets, and other electronics', 4),
('Furniture', 'Home and office furniture', 5),
('Clothing & Accessories', 'Apparel, shoes, and fashion accessories', 6),
('Free Stuff', 'Items being given away for free', 7),
('Pets', 'Pets for sale, adoption, and pet services', 8),
('Gigs', 'Short-term jobs and freelance opportunities', 9),
('Other', 'Everything else', 10);

CREATE TABLE IF NOT EXISTS `basket` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `listing_id` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




ALTER TABLE `listings` ADD CONSTRAINT `listings_category_fk0` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
ALTER TABLE `basket` ADD CONSTRAINT `basket_listing_fk0` FOREIGN KEY (`listing_id`) REFERENCES `listings` (`id`);
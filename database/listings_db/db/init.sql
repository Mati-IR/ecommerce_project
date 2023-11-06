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
  `photo_url` VARCHAR(255) NOT NULL,
  FOREIGN KEY (`listing_id`) REFERENCES `listings`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert extended categories
INSERT INTO `categories` (`name`, `description`) VALUES
('For Sale', 'Items for sale by owner'),
('Jobs', 'Job listings and employment opportunities'),
('Housing', 'Real estate, rentals, and shared accommodations'),
('Services', 'Local services offered by professionals and businesses'),
('Vehicles', 'Cars, trucks, motorcycles, and other vehicles'),
('Electronics', 'Computers, mobile phones, gadgets, and other electronics'),
('Furniture', 'Home and office furniture'),
('Clothing & Accessories', 'Apparel, shoes, and fashion accessories'),
('Free Stuff', 'Items being given away for free'),
('Pets', 'Pets for sale, adoption, and pet services'),
('Gigs', 'Short-term jobs and freelance opportunities');

ALTER TABLE `listings` ADD CONSTRAINT `listings_category_fk0` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
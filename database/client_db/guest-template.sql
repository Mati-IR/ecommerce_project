CREATE TABLE `users` (
	`id` int NOT NULL AUTO_INCREMENT,
	`name` varchar NOT NULL,
	`email` varchar NOT NULL,
	`phone` int NOT NULL,
	`city` varchar NOT NULL,
	`postal_code` varchar NOT NULL,
	`street` varchar NOT NULL,
	`street_number` varchar NOT NULL,
	`website` INT,
	PRIMARY KEY (`id`)
);

CREATE TABLE `users_password` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`user_id` INT NOT NULL,
	`password` varchar NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `users_password` ADD CONSTRAINT `users_password_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);




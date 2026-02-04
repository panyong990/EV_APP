-- Create user_feedbacks table
CREATE TABLE IF NOT EXISTS `user_feedbacks` (
  `feedback_id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `text` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `reviewed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  INDEX `idx_rating` (`rating`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_reviewed` (`reviewed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE DATABASE IF NOT EXISTS wishlist_db;
USE wishlist_db;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  priority ENUM('Penting', 'Biasa', 'Opsional') NOT NULL DEFAULT 'Biasa',
  status ENUM('Belum Dibeli', 'Sudah Dibeli') NOT NULL DEFAULT 'Belum Dibeli',
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

INSERT IGNORE INTO categories (name) VALUES
  ('Elektronik'),
  ('Fashion'),
  ('Buku'),
  ('Kebutuhan'),
  ('Lainnya');

INSERT INTO wishlist (name, price, priority, status, category_id)
SELECT 'Headphone impian', 350000, 'Penting', 'Belum Dibeli', id
FROM categories WHERE name = 'Elektronik'
AND NOT EXISTS (SELECT 1 FROM wishlist WHERE name = 'Headphone impian');

INSERT INTO wishlist (name, price, priority, status, category_id)
SELECT 'Jurnal lucu', 45000, 'Opsional', 'Sudah Dibeli', id
FROM categories WHERE name = 'Buku'
AND NOT EXISTS (SELECT 1 FROM wishlist WHERE name = 'Jurnal lucu');

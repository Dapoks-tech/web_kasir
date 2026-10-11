CREATE DATABASE IF NOT EXISTS coffeeshop;
USE coffeeshop;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('barista', 'manager') NOT NULL DEFAULT 'barista',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category_id INT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(255) DEFAULT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  barista_id INT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash', 'qris', 'debit') NOT NULL DEFAULT 'cash',
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  change_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barista_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  qty INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  notes VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Seed default manager account (password: admin123)
INSERT IGNORE INTO users (name, username, password, role) VALUES
('Manager', 'manager', '$2a$10$8K1p/a0dR1xqM8hJzQdGOeYEGo3WKEH5L2.VZqXBqZmGq3FJm3OyC', 'manager');

-- Seed categories
INSERT IGNORE INTO categories (id, name) VALUES
(1, 'Coffee'),
(2, 'Non-Coffee'),
(3, 'Snack'),
(4, 'Pastry');

-- Seed products
INSERT IGNORE INTO products (name, category_id, price) VALUES
('Espresso', 1, 18000),
('Americano', 1, 22000),
('Cappuccino', 1, 28000),
('Cafe Latte', 1, 28000),
('Mocha', 1, 32000),
('Matcha Latte', 2, 30000),
('Chocolate', 2, 25000),
('Thai Tea', 2, 22000),
('Lemon Tea', 2, 18000),
('French Fries', 3, 20000),
('Croissant', 4, 25000),
('Roti Bakar', 3, 18000);

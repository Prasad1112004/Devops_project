-- ============================================================
-- Smart Logistics & Delivery Management System
-- Database Schema (MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_logistics;
USE smart_logistics;

-- ── Roles ────────────────────────────────────────────────────
CREATE TABLE roles (
  id   TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  email        VARCHAR(180) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role_id      TINYINT UNSIGNED NOT NULL DEFAULT 3,
  phone        VARCHAR(20),
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_email (email),
  INDEX idx_users_role  (role_id)
);

-- ── Customers ────────────────────────────────────────────────
CREATE TABLE customers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL UNIQUE,
  company    VARCHAR(150),
  address    VARCHAR(400),
  city       VARCHAR(80),
  country    VARCHAR(80) DEFAULT 'India',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Vehicles ─────────────────────────────────────────────────
CREATE TABLE vehicles (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plate_number    VARCHAR(20) NOT NULL UNIQUE,
  type            ENUM('Bike','Van','Truck','Mini-Truck') NOT NULL,
  capacity_kg     DECIMAL(8,2),
  status          ENUM('Available','In Use','Maintenance') DEFAULT 'Available',
  last_lat        DECIMAL(10,7),
  last_lng        DECIMAL(10,7),
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vehicles_status (status)
);

-- ── Drivers ──────────────────────────────────────────────────
CREATE TABLE drivers (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL UNIQUE,
  vehicle_id   INT UNSIGNED,
  license_no   VARCHAR(30) NOT NULL UNIQUE,
  status       ENUM('Available','On Delivery','Off Duty') DEFAULT 'Available',
  rating       DECIMAL(3,2) DEFAULT 5.00,
  total_deliveries INT UNSIGNED DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  INDEX idx_drivers_status (status)
);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE orders (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tracking_id      VARCHAR(16) NOT NULL UNIQUE,
  customer_id      INT UNSIGNED NOT NULL,
  driver_id        INT UNSIGNED,
  vehicle_id       INT UNSIGNED,
  status           ENUM('Pending','Assigned','Picked Up','In Transit',
                        'Out for Delivery','Delivered','Cancelled','Delayed')
                   NOT NULL DEFAULT 'Pending',
  priority         ENUM('Standard','Express','Overnight') DEFAULT 'Standard',
  pickup_address   VARCHAR(400) NOT NULL,
  pickup_city      VARCHAR(80),
  pickup_lat       DECIMAL(10,7),
  pickup_lng       DECIMAL(10,7),
  delivery_address VARCHAR(400) NOT NULL,
  delivery_city    VARCHAR(80),
  delivery_lat     DECIMAL(10,7),
  delivery_lng     DECIMAL(10,7),
  weight_kg        DECIMAL(8,2),
  distance_km      DECIMAL(8,2),
  estimated_eta    DATETIME,
  actual_delivery  DATETIME,
  notes            TEXT,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (driver_id)   REFERENCES drivers(id)  ON DELETE SET NULL,
  FOREIGN KEY (vehicle_id)  REFERENCES vehicles(id) ON DELETE SET NULL,
  INDEX idx_orders_tracking   (tracking_id),
  INDEX idx_orders_status     (status),
  INDEX idx_orders_customer   (customer_id),
  INDEX idx_orders_driver     (driver_id),
  INDEX idx_orders_created_at (created_at)
);

-- ── Order Items ──────────────────────────────────────────────
CREATE TABLE order_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED NOT NULL,
  description VARCHAR(200) NOT NULL,
  quantity    SMALLINT UNSIGNED DEFAULT 1,
  weight_kg   DECIMAL(6,2),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_items_order (order_id)
);

-- ── Routes ───────────────────────────────────────────────────
CREATE TABLE routes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  driver_id    INT UNSIGNED NOT NULL,
  vehicle_id   INT UNSIGNED,
  status       ENUM('Planned','Active','Completed') DEFAULT 'Planned',
  total_km     DECIMAL(8,2),
  started_at   DATETIME,
  completed_at DATETIME,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (driver_id)  REFERENCES drivers(id)  ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

-- ── Route Stops ──────────────────────────────────────────────
CREATE TABLE route_stops (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  route_id    INT UNSIGNED NOT NULL,
  order_id    INT UNSIGNED NOT NULL,
  stop_order  TINYINT UNSIGNED NOT NULL,
  lat         DECIMAL(10,7),
  lng         DECIMAL(10,7),
  address     VARCHAR(400),
  arrived_at  DATETIME,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_stops_route (route_id)
);

-- ── Tracking Events ──────────────────────────────────────────
CREATE TABLE tracking_events (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED NOT NULL,
  status      VARCHAR(60) NOT NULL,
  note        VARCHAR(300),
  lat         DECIMAL(10,7),
  lng         DECIMAL(10,7),
  location    VARCHAR(200),
  created_by  INT UNSIGNED,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)  ON DELETE SET NULL,
  INDEX idx_events_order (order_id),
  INDEX idx_events_created (created_at)
);

-- ── Notifications ────────────────────────────────────────────
CREATE TABLE notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  order_id   INT UNSIGNED,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  type       ENUM('info','success','warning','error') DEFAULT 'info',
  is_read    BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  INDEX idx_notif_user    (user_id),
  INDEX idx_notif_is_read (is_read)
);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW v_delayed_orders AS
SELECT o.id, o.tracking_id, o.status, o.estimated_eta,
       o.pickup_city, o.delivery_city,
       u.name AS customer_name, u.email AS customer_email,
       dv.id AS driver_id, ud.name AS driver_name
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN users u     ON u.id = c.user_id
LEFT JOIN drivers dv ON dv.id = o.driver_id
LEFT JOIN users ud   ON ud.id = dv.user_id
WHERE o.status NOT IN ('Delivered','Cancelled')
  AND o.estimated_eta < NOW();

CREATE OR REPLACE VIEW v_driver_workload AS
SELECT d.id, u.name, d.status, d.rating, d.total_deliveries,
       COUNT(o.id) AS active_orders
FROM drivers d
JOIN users u ON u.id = d.user_id
LEFT JOIN orders o ON o.driver_id = d.id
  AND o.status NOT IN ('Delivered','Cancelled')
GROUP BY d.id, u.name, d.status, d.rating, d.total_deliveries;

CREATE OR REPLACE VIEW v_deliveries_per_day AS
SELECT DATE(actual_delivery) AS day,
       COUNT(*) AS total_delivered
FROM orders
WHERE status = 'Delivered'
  AND actual_delivery IS NOT NULL
GROUP BY DATE(actual_delivery)
ORDER BY day DESC;

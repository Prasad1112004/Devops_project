-- ============================================================
-- Seed Data
-- ============================================================
USE smart_logistics;

-- Roles
INSERT INTO roles (name) VALUES ('Admin'), ('Driver'), ('Customer');

-- Users (passwords are bcrypt of "Password123!")
INSERT INTO users (name, email, password, role_id, phone) VALUES
('Admin User',   'admin@logitrack.com',
 '$2b$10$YourHashedPasswordHere1111111111111111111111111',  1, '9000000001'),
('Ravi Kumar',   'ravi@logitrack.com',
 '$2b$10$YourHashedPasswordHere1111111111111111111111112',  2, '9000000002'),
('Priya Sharma', 'priya@logitrack.com',
 '$2b$10$YourHashedPasswordHere1111111111111111111111113',  2, '9000000003'),
('John Doe',     'john@customer.com',
 '$2b$10$YourHashedPasswordHere1111111111111111111111114',  3, '9000000004'),
('Ananya Singh', 'ananya@customer.com',
 '$2b$10$YourHashedPasswordHere1111111111111111111111115',  3, '9000000005');

-- NOTE: Run the backend seed script instead (npm run seed) which
-- generates real bcrypt hashes. The above are placeholders.

-- Vehicles
INSERT INTO vehicles (plate_number, type, capacity_kg, status) VALUES
('MH12AB1234', 'Van',   800, 'Available'),
('MH12CD5678', 'Bike',   30, 'Available'),
('MH12EF9012', 'Truck', 5000,'Available');

-- Customers
INSERT INTO customers (user_id, company, address, city) VALUES
(4, 'Doe Enterprises', '12 MG Road', 'Mumbai'),
(5, 'Singh & Co',      '45 Park St',  'Pune');

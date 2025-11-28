-- ============================================
-- HAVENLY DATABASE SCHEMA
-- Digital Rental and Tenant Management System
-- Created: November 2025
-- Group 10: Barral, Espinosa, Gulay, Ybañez
-- ============================================

-- Drop existing tables (for fresh install)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS leases;
DROP TABLE IF EXISTS tenants;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- USERS TABLE
-- Stores admin, landlord, and tenant accounts
-- ============================================
CREATE TABLE users (
    user_id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Landlord', 'Tenant') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (user_id),
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROPERTIES TABLE
-- Stores rental properties owned by landlords
-- ============================================
CREATE TABLE properties (
    property_id INT(11) NOT NULL AUTO_INCREMENT,
    owner_id INT(11) NOT NULL,
    property_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    total_rooms INT(11) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (property_id),
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_property_name (property_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROOMS TABLE
-- Stores individual rooms within properties
-- ============================================
CREATE TABLE rooms (
    room_id INT(11) NOT NULL AUTO_INCREMENT,
    property_id INT(11) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    room_status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (room_id),
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    INDEX idx_property (property_id),
    INDEX idx_status (room_status),
    INDEX idx_room_number (room_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TENANTS TABLE
-- Stores tenant personal information
-- ============================================
CREATE TABLE tenants (
    tenant_id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    middle_name VARCHAR(150) NULL,
    contact_num VARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (tenant_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_name (last_name, first_name),
    INDEX idx_contact (contact_num)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- LEASES TABLE
-- Stores rental agreements between tenants and rooms
-- ============================================
CREATE TABLE leases (
    lease_id INT(11) NOT NULL AUTO_INCREMENT,
    room_id INT(11) NOT NULL,
    tenant_id INT(11) NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    lease_status ENUM('Active', 'Expired', 'Terminated') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (lease_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    INDEX idx_room (room_id),
    INDEX idx_tenant (tenant_id),
    INDEX idx_status (lease_status),
    INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRANSACTIONS TABLE
-- Stores rent payment records
-- ============================================
CREATE TABLE transactions (
    transaction_id INT(11) NOT NULL AUTO_INCREMENT,
    lease_id INT(11) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    transaction_status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (lease_id) REFERENCES leases(lease_id) ON DELETE CASCADE,
    INDEX idx_lease (lease_id),
    INDEX idx_status (transaction_status),
    INDEX idx_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DEFAULT ADMIN USER
-- ============================================
-- Username: admin
-- Password: admin123
-- IMPORTANT: Change this password after first login!

INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@havenly.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin');

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================

-- Sample Landlord Account
-- Username: landlord1, Password: admin123
INSERT INTO users (username, email, password_hash, role) VALUES
('landlord1', 'landlord@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Landlord');

-- Sample Tenant Account
-- Username: tenant1, Password: admin123
INSERT INTO users (username, email, password_hash, role) VALUES
('tenant1', 'tenant@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tenant');

-- Sample Property
INSERT INTO properties (owner_id, property_name, address, total_rooms) VALUES
(2, 'Sunset Apartments', '123 Main Street, Cebu City, Philippines', 5);

-- Sample Rooms
INSERT INTO rooms (property_id, room_number, monthly_rent, room_status) VALUES
(1, '101', 5000.00, 'Available'),
(1, '102', 5500.00, 'Available'),
(1, '103', 6000.00, 'Occupied'),
(1, '201', 5000.00, 'Available'),
(1, '202', 5500.00, 'Maintenance');

-- Sample Tenant Profile
INSERT INTO tenants (user_id, first_name, last_name, middle_name, contact_num) VALUES
(3, 'Juan', 'Dela Cruz', 'Santos', '09171234567');

-- Sample Active Lease
INSERT INTO leases (room_id, tenant_id, start_date, end_date, monthly_rent, lease_status) VALUES
(3, 1, '2024-11-01 00:00:00', '2025-10-31 23:59:59', 6000.00, 'Active');

-- Sample Payment Transactions
INSERT INTO transactions (lease_id, amount, transaction_date, transaction_status) VALUES
(1, 6000.00, '2024-11-01 10:00:00', 'Completed'),
(1, 6000.00, '2024-11-15 10:00:00', 'Completed'),
(1, 6000.00, '2024-11-28 10:00:00', 'Completed');

-- ============================================
-- VERIFICATION
-- ============================================

-- Display created tables
SELECT 'Database setup complete!' as Status;

SELECT '========================' as '';
SELECT 'TABLES CREATED:' as '';
SELECT '========================' as '';
SELECT TABLE_NAME as 'Table', TABLE_ROWS as 'Rows'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'havenly_db'
ORDER BY TABLE_NAME;

SELECT '========================' as '';
SELECT 'SAMPLE ACCOUNTS:' as '';
SELECT '========================' as '';
SELECT 
    username as 'Username',
    email as 'Email',
    role as 'Role',
    'admin123' as 'Password'
FROM users
ORDER BY role;

SELECT '========================' as '';
SELECT 'SAMPLE DATA SUMMARY:' as '';
SELECT '========================' as '';
SELECT 
    (SELECT COUNT(*) FROM users) as 'Users',
    (SELECT COUNT(*) FROM properties) as 'Properties',
    (SELECT COUNT(*) FROM rooms) as 'Rooms',
    (SELECT COUNT(*) FROM tenants) as 'Tenants',
    (SELECT COUNT(*) FROM leases) as 'Leases',
    (SELECT COUNT(*) FROM transactions) as 'Transactions';

-- ============================================
-- NOTES FOR TEAM
-- ============================================
-- 1. All sample accounts use password: admin123
-- 2. Change admin password after first login
-- 3. Sample data can be deleted after testing
-- 4. All tables use UTF-8 encoding
-- 5. Foreign keys enforce referential integrity
-- 6. Soft deletes via is_active flag
-- ============================================
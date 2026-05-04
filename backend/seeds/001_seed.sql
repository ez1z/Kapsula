-- Kapsula Seed Data
-- Timezone: Asia/Ashgabat (UTC+5)
-- Note: Password hash for "password123" - regenerate for production

-- Admin user (password: admin123)
INSERT INTO users (phone, password_hash, name, role) VALUES
('+99365123456', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin');

-- Business user for Berkarar Barbershop (password: password123)
INSERT INTO users (phone, password_hash, name, role) VALUES
('+99365123457', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aman Hojammedov', 'business');

-- Business user for Gözel Café (password: password123)
INSERT INTO users (phone, password_hash, name, role) VALUES
('+99365123458', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Gulshat Annaniazova', 'business');

-- Customer user (password: password123)
INSERT INTO users (phone, password_hash, name, role) VALUES
('+99365123459', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test Customer', 'customer');

-- Berkarar Barbershop
INSERT INTO businesses (id, name, type, phone, address, timezone, owner_id, is_active) VALUES
(1, 'Berkarar Barbershop', 'barber', '+99365123401', 'Magtymguly şaýoly 45, Turkmenabat', 'Asia/Ashgabat', 2, true);

-- Gözel Café
INSERT INTO businesses (id, name, type, phone, address, timezone, owner_id, is_active) VALUES
(2, 'Gözel Café', 'cafe', '+99365123402', 'Garryylyk köçesi 12, Turkmenabat', 'Asia/Ashgabat', 3, true);

-- Business hours for Berkarar Barbershop (Mon-Sat, closed Sun)
INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_day_off) VALUES
(1, 0, '09:00:00', '20:00:00', true),
(1, 1, '09:00:00', '20:00:00', false),
(1, 2, '09:00:00', '20:00:00', false),
(1, 3, '09:00:00', '20:00:00', false),
(1, 4, '09:00:00', '20:00:00', false),
(1, 5, '09:00:00', '20:00:00', false),
(1, 6, '09:00:00', '20:00:00', false);

-- Business hours for Gözel Café (daily 08:00-22:00)
INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_day_off) VALUES
(2, 0, '08:00:00', '22:00:00', false),
(2, 1, '08:00:00', '22:00:00', false),
(2, 2, '08:00:00', '22:00:00', false),
(2, 3, '08:00:00', '22:00:00', false),
(2, 4, '08:00:00', '22:00:00', false),
(2, 5, '08:00:00', '22:00:00', false),
(2, 6, '08:00:00', '22:00:00', false);

-- Services for Berkarar Barbershop
INSERT INTO services (business_id, name, duration_minutes, price, service_type, max_capacity) VALUES
(1, 'Classic Haircut', 30, 50.00, 'haircut', 1),
(1, 'Beard Trim', 20, 30.00, 'beard', 1),
(1, 'Full Service (Haircut + Beard)', 50, 80.00, 'full', 1),
(1, 'Kids Haircut', 25, 40.00, 'kids', 1);

-- Services for Gözel Café
INSERT INTO services (business_id, name, duration_minutes, price, service_type, max_capacity) VALUES
(2, 'Table for 2', 60, 20.00, 'table_2', 2),
(2, 'Table for 4', 90, 40.00, 'table_4', 4),
(2, 'Table for 6', 120, 60.00, 'table_6', 6),
(2, 'VIP Room (10 guests)', 180, 150.00, 'vip', 10);

-- Staff for Berkarar Barbershop
INSERT INTO staff (business_id, name, phone, color) VALUES
(1, 'Aman Hojammedov', '+99365123410', '#3B82F6'),
(1, 'Serdar Berdiyev', '+99365123411', '#10B981');

-- Staff for Gözel Café
INSERT INTO staff (business_id, name, phone, color) VALUES
(2, 'Gulshat Annaniazova', '+99365123412', '#8B5CF6');

-- Reset sequences
SELECT setval('businesses_id_seq', (SELECT MAX(id) FROM businesses));
SELECT setval('services_id_seq', (SELECT MAX(id) FROM services));
SELECT setval('staff_id_seq', (SELECT MAX(id) FROM staff));
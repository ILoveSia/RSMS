-- testpass123에 대한 올바른 BCrypt 해시로 업데이트 (strength=10)
UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE username = 'testuser'; 
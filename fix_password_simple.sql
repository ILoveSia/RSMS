-- password에 대한 검증된 BCrypt 해시로 업데이트
UPDATE users SET password = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG' WHERE username = 'testuser'; 
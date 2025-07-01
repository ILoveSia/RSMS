-- password123에 대한 올바른 BCrypt 해시로 업데이트
UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMye.w2gj9JgHLF4KkTgKPFiuCUwJJz8FLm' WHERE username = 'testuser'; 
-- 사용자 제공 BCrypt 해시로 비밀번호 업데이트
UPDATE users SET password = '$2a$12$FTLj/abyDrZoOpC1XLzSae6pIFoDwf3qkbsJgfMnLJU4Zr1TlxygO' WHERE username = 'testuser'; 
-- testpass123에 대한 올바른 BCrypt 해시로 업데이트
UPDATE users SET password = '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.' WHERE username = 'testuser'; 
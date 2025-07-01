-- testuser 계정의 비밀번호 업데이트 스크립트
-- 'testpass123'을 BCrypt(strength=12)로 암호화한 값으로 업데이트

-- 1. 현재 사용자 정보 확인
SELECT id, username, email, password, created_at 
FROM users 
WHERE username = 'testuser' OR id = 'testuser';

-- 2. 비밀번호 업데이트 
-- BCrypt로 'testpass123'을 암호화한 값 (테스트 결과): $2a$12$FTLj/abyDrZoOpC1XLzSae6pIFoDwf3qkbsJgfMnLJU4Zr1TlxygO
UPDATE users 
SET password = '$2a$12$FTLj/abyDrZoOpC1XLzSae6pIFoDwf3qkbsJgfMnLJU4Zr1TlxygO',
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'testuser' OR id = 'testuser';

-- 3. 업데이트 결과 확인
SELECT id, username, email, password, updated_at 
FROM users 
WHERE username = 'testuser' OR id = 'testuser';

-- 참고: 위 암호화된 값은 예시입니다. 
-- 실제로는 Java BCryptPasswordEncoder를 사용해 새로운 값을 생성해야 합니다. 
-- 테스트 데이터 삽입 스크립트
-- ITCEN Solution 테스트 사용자 및 역할 데이터

-- 1. 기본 역할 데이터 삽입 (기존 구조에 맞춤)
INSERT INTO roles (name, description, enabled, created_at, updated_at, created_id, updated_id) 
VALUES ('ADMIN', '시스템 관리자', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description, enabled, created_at, updated_at, created_id, updated_id) 
VALUES ('MANAGER', '부서 관리자', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description, enabled, created_at, updated_at, created_id, updated_id) 
VALUES ('USER', '일반 사용자', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system')
ON CONFLICT (name) DO NOTHING;

-- 2. 테스트 사용자 데이터 삽입
-- 비밀번호: testpass123 (BCrypt 해시: $2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7zqIg1v2)
INSERT INTO users (
    id, username, email, address, mobile, password, 
    dept_cd, num, job_rank_cd, job_title_cd,
    created_at, updated_at, created_id, updated_id
) VALUES 
(
    'user001', 
    'testuser', 
    'testuser@itcen.com', 
    '서울시 강남구 테헤란로 123', 
    '010-1234-5678', 
    '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7zqIg1v2',
    'IT001', 
    'E001', 
    'RANK001', 
    'TITLE001',
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP,
    'system',
    'system'
)
ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    mobile = EXCLUDED.mobile,
    password = EXCLUDED.password,
    updated_at = CURRENT_TIMESTAMP,
    updated_id = 'system';

INSERT INTO users (
    id, username, email, address, mobile, password, 
    dept_cd, num, job_rank_cd, job_title_cd,
    created_at, updated_at, created_id, updated_id
) VALUES 
(
    'admin001', 
    'admin', 
    'admin@itcen.com', 
    '서울시 강남구 테헤란로 456', 
    '010-9876-5432', 
    '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7zqIg1v2',
    'ADMIN001', 
    'A001', 
    'RANK999', 
    'TITLE999',
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP,
    'system',
    'system'
)
ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    mobile = EXCLUDED.mobile,
    password = EXCLUDED.password,
    updated_at = CURRENT_TIMESTAMP,
    updated_id = 'system';

-- 추가 테스트 사용자 (매니저 역할)
INSERT INTO users (
    id, username, email, address, mobile, password, 
    dept_cd, num, job_rank_cd, job_title_cd,
    created_at, updated_at, created_id, updated_id
) VALUES 
(
    'manager001', 
    'manager', 
    'manager@itcen.com', 
    '서울시 강남구 테헤란로 789', 
    '010-5555-1234', 
    '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7zqIg1v2',
    'SALES001', 
    'M001', 
    'RANK777', 
    'TITLE777',
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP,
    'system',
    'system'
)
ON CONFLICT (id) DO UPDATE SET
    address = EXCLUDED.address,
    mobile = EXCLUDED.mobile,
    password = EXCLUDED.password,
    updated_at = CURRENT_TIMESTAMP,
    updated_id = 'system';

-- 완료 메시지 출력
SELECT 'Test data inserted successfully!' as result;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as role_count FROM roles; 
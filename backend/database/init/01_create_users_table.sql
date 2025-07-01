-- 사용자 테이블 생성 스크립트
-- ITCEN Solution 사용자 관리

-- 1. users 테이블 생성 (이미 존재하는 경우 무시)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    dept_cd VARCHAR(100),
    num VARCHAR(100),
    job_rank_cd VARCHAR(100),
    job_title_cd VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_id VARCHAR(100) DEFAULT 'system',
    updated_id VARCHAR(100) DEFAULT 'system'
);

-- 2. roles 테이블 생성 (이미 존재하는 경우 무시)
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_id VARCHAR(100) DEFAULT 'system',
    updated_id VARCHAR(100) DEFAULT 'system'
);

-- 3. user_roles 테이블 생성 (사용자-역할 매핑)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(100) NOT NULL,
    role_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_id VARCHAR(100) DEFAULT 'system',
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 4. 기본 역할 데이터 삽입
INSERT INTO roles (id, name, description) VALUES 
('ROLE_ADMIN', 'ADMIN', '시스템 관리자')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, name, description) VALUES 
('ROLE_MANAGER', 'MANAGER', '부서 관리자')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, name, description) VALUES 
('ROLE_USER', 'USER', '일반 사용자')
ON CONFLICT (id) DO NOTHING;

-- 5. 테스트 사용자 데이터 삽입
-- 비밀번호: testpass123 (BCrypt 해시)
INSERT INTO users (
    id, username, email, address, mobile, password, 
    dept_cd, num, job_rank_cd, job_title_cd
) VALUES 
(
    'user001', 
    'testuser', 
    'testuser@itcen.com', 
    '서울시 강남구 테헤란로 123', 
    '010-1234-5678', 
    '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7zqIg1v2',  -- testpass123
    'IT001', 
    'E001', 
    'RANK001', 
    'TITLE001'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
    id, username, email, address, mobile, password, 
    dept_cd, num, job_rank_cd, job_title_cd
) VALUES 
(
    'admin001', 
    'admin', 
    'admin@itcen.com', 
    '서울시 강남구 테헤란로 456', 
    '010-9876-5432', 
    '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7zqIg1v2',  -- testpass123
    'ADMIN001', 
    'A001', 
    'RANK999', 
    'TITLE999'
)
ON CONFLICT (id) DO NOTHING;

-- 6. 사용자-역할 매핑
INSERT INTO user_roles (user_id, role_id) VALUES 
('user001', 'ROLE_USER')
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES 
('admin001', 'ROLE_ADMIN')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 7. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- 8. 트리거 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
SELECT 'Users table and test data created successfully!' as result; 
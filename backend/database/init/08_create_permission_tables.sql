-- 권한 관리 테이블들 생성
-- 8. 권한 관리 시스템

-- 8.1 역할(Role) 테이블
CREATE TABLE IF NOT EXISTS roles (
    role_id VARCHAR(20) PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
    created_id VARCHAR(50) DEFAULT 'system',
    updated_id VARCHAR(50) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8.2 API 권한(Permission) 테이블
CREATE TABLE IF NOT EXISTS api_permissions (
    permission_id VARCHAR(20) PRIMARY KEY,
    api_pattern VARCHAR(200) NOT NULL, -- URL 패턴 (ex: /api/departments/**, /api/positions/**)
    http_method VARCHAR(10), -- GET, POST, PUT, DELETE, null은 모든 메서드
    permission_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    is_public CHAR(1) DEFAULT 'N' CHECK (is_public IN ('Y', 'N')), -- 공개 API 여부
    use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
    created_id VARCHAR(50) DEFAULT 'system',
    updated_id VARCHAR(50) DEFAULT 'system',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8.3 역할-권한 매핑 테이블
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(20),
    permission_id VARCHAR(20),
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by VARCHAR(50) DEFAULT 'system',
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES api_permissions(permission_id) ON DELETE CASCADE
);

-- 8.4 사용자-역할 매핑 테이블 (기존 users 테이블과 연결)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(50),
    role_id VARCHAR(20),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(50) DEFAULT 'system',
    use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

-- 기본 역할 데이터 입력
INSERT INTO roles (role_id, role_name, description) VALUES
('ADMIN', '관리자', '시스템 전체 관리 권한'),
('USER', '일반사용자', '기본 사용자 권한'),
('MANAGER', '매니저', '부서 관리 권한'),
('READONLY', '읽기전용', '조회만 가능한 권한');

-- 기본 API 권한 데이터 입력
INSERT INTO api_permissions (permission_id, api_pattern, http_method, permission_name, description, is_public) VALUES
-- 부서 관리
('DEPT_READ', '/api/departments/**', 'GET', '부서조회', '부서 정보 조회 권한', 'N'),
('DEPT_WRITE', '/api/departments/**', 'POST', '부서생성', '부서 생성 권한', 'N'),
('DEPT_UPDATE', '/api/departments/**', 'PUT', '부서수정', '부서 수정 권한', 'N'),
('DEPT_DELETE', '/api/departments/**', 'DELETE', '부서삭제', '부서 삭제 권한', 'N'),

-- 직책 관리
('POS_READ', '/api/positions/**', 'GET', '직책조회', '직책 정보 조회 권한', 'N'),
('POS_WRITE', '/api/positions/**', 'POST', '직책생성', '직책 생성 권한', 'N'),
('POS_UPDATE', '/api/positions/**', 'PUT', '직책수정', '직책 수정 권한', 'N'),
('POS_DELETE', '/api/positions/**', 'DELETE', '직책삭제', '직책 삭제 권한', 'N'),

-- 사용자 관리
('USER_READ', '/api/users/**', 'GET', '사용자조회', '사용자 정보 조회 권한', 'N'),
('USER_WRITE', '/api/users/**', 'POST', '사용자생성', '사용자 생성 권한', 'N'),
('USER_UPDATE', '/api/users/**', 'PUT', '사용자수정', '사용자 수정 권한', 'N'),
('USER_DELETE', '/api/users/**', 'DELETE', '사용자삭제', '사용자 삭제 권한', 'N'),

-- 공개 API
('PUBLIC_READ', '/api/public/**', null, '공개조회', '공개 API 조회 권한', 'Y');

-- 역할별 권한 할당
-- 관리자: 모든 권한
INSERT INTO role_permissions (role_id, permission_id) VALUES
('ADMIN', 'DEPT_READ'), ('ADMIN', 'DEPT_WRITE'), ('ADMIN', 'DEPT_UPDATE'), ('ADMIN', 'DEPT_DELETE'),
('ADMIN', 'POS_READ'), ('ADMIN', 'POS_WRITE'), ('ADMIN', 'POS_UPDATE'), ('ADMIN', 'POS_DELETE'),
('ADMIN', 'USER_READ'), ('ADMIN', 'USER_WRITE'), ('ADMIN', 'USER_UPDATE'), ('ADMIN', 'USER_DELETE'),
('ADMIN', 'PUBLIC_READ');

-- 매니저: 부서, 직책 관리 권한
INSERT INTO role_permissions (role_id, permission_id) VALUES
('MANAGER', 'DEPT_READ'), ('MANAGER', 'DEPT_WRITE'), ('MANAGER', 'DEPT_UPDATE'),
('MANAGER', 'POS_READ'), ('MANAGER', 'POS_WRITE'), ('MANAGER', 'POS_UPDATE'),
('MANAGER', 'USER_READ'), ('MANAGER', 'PUBLIC_READ');

-- 일반사용자: 기본 조회 권한
INSERT INTO role_permissions (role_id, permission_id) VALUES
('USER', 'DEPT_READ'), ('USER', 'POS_READ'), ('USER', 'USER_READ'), ('USER', 'PUBLIC_READ');

-- 읽기전용: 조회만 가능
INSERT INTO role_permissions (role_id, permission_id) VALUES
('READONLY', 'DEPT_READ'), ('READONLY', 'POS_READ'), ('READONLY', 'PUBLIC_READ');

-- 기본 사용자에게 역할 할당 (예시)
-- INSERT INTO user_roles (user_id, role_id) VALUES ('testuser', 'USER');

-- 인덱스 생성
CREATE INDEX idx_api_permissions_pattern ON api_permissions(api_pattern);
CREATE INDEX idx_api_permissions_public ON api_permissions(is_public);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

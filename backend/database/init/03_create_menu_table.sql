-- 메뉴 테이블 생성
CREATE TABLE IF NOT EXISTS menus (
    id BIGSERIAL PRIMARY KEY,
    menu_code VARCHAR(50) UNIQUE NOT NULL,
    menu_name VARCHAR(100) NOT NULL,
    menu_name_en VARCHAR(100),
    parent_id BIGINT,
    menu_level INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    menu_url VARCHAR(200),
    icon_class VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_menu_parent FOREIGN KEY (parent_id) REFERENCES menus(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_menu_code ON menus(menu_code);
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order);

-- 메뉴 데이터 삽입
INSERT INTO menus (menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order, menu_url, icon_class, description) VALUES
-- 1차 메뉴 (최상위)
('LEDGER_MGMT', '적부구조 원장 관리', 'Ledger Management', NULL, 1, 1, NULL, 'fas fa-book', '적부구조 원장 관리 메뉴'),
('LEDGER_INQUIRY', '적부구조도 이력 점검', 'Ledger History Inquiry', NULL, 1, 2, NULL, 'fas fa-search', '적부구조도 이력 점검 메뉴'),
('COMPLIANCE_CHECK', '컴플라이언스 관리', 'Compliance Management', NULL, 1, 3, NULL, 'fas fa-shield-alt', '컴플라이언스 관리 메뉴'),
('APPROVAL_WORKFLOW', '승인처리현황 모니터링', 'Approval Workflow Monitoring', NULL, 1, 4, NULL, 'fas fa-tasks', '승인처리현황 모니터링 메뉴'),
('RESULT_MGMT', '결재 관리', 'Result Management', NULL, 1, 5, NULL, 'fas fa-clipboard-check', '결재 관리 메뉴'),
('USER_MGMT', '인재인수 관리', 'User Management', NULL, 1, 6, NULL, 'fas fa-users', '인재인수 관리 메뉴'),
('SYSTEM_MGMT', '시스템 관리', 'System Management', NULL, 1, 7, NULL, 'fas fa-cogs', '시스템 관리 메뉴');

-- 적부구조 원장 관리 하위 메뉴
INSERT INTO menus (menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order, menu_url, icon_class, description) VALUES
('LEDGER_MGMT_MEMBER', '회사별 현황', 'Company Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_MGMT'), 2, 1, '/ledger/company-status', 'fas fa-building', '회사별 현황 관리'),
('LEDGER_MGMT_DIRECT', '직계 현황', 'Direct Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_MGMT'), 2, 2, '/ledger/direct-status', 'fas fa-sitemap', '직계 현황 관리'),
('LEDGER_MGMT_DB', '적부 DB현황', 'DB Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_MGMT'), 2, 3, '/ledger/db-status', 'fas fa-database', '적부 DB현황 관리'),
('LEDGER_MGMT_DETAIL', '적부별 적부 현황', 'Detail Status by Category', (SELECT id FROM menus WHERE menu_code = 'LEDGER_MGMT'), 2, 4, '/ledger/detail-status', 'fas fa-list-alt', '적부별 적부 현황 관리'),
('LEDGER_MGMT_BUSINESS', '업무 현황', 'Business Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_MGMT'), 2, 5, '/ledger/business-status', 'fas fa-briefcase', '업무 현황 관리'),
('LEDGER_MGMT_BUSINESS_DETAIL', '업무별 적부 현황', 'Business Detail Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_MGMT'), 2, 6, '/ledger/business-detail-status', 'fas fa-chart-bar', '업무별 적부 현황 관리'),
('LEDGER_MGMT_SUBSIDIARY', '부서간 내부통제현황 현황', 'Internal Control Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_MGMT'), 2, 7, '/ledger/internal-control', 'fas fa-network-wired', '부서간 내부통제현황 관리'),
('LEDGER_MGMT_STRUCTURE', '적부구조도 제출 관리', 'Structure Submission Management', (SELECT id FROM menus WHERE menu_code = 'LEDGER_MGMT'), 2, 8, '/ledger/structure-submission', 'fas fa-upload', '적부구조도 제출 관리');

-- 적부구조도 이력 점검 하위 메뉴
INSERT INTO menus (menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order, menu_url, icon_class, description) VALUES
('LEDGER_INQUIRY_SCHEDULE', '점검 계획', 'Inspection Schedule', (SELECT id FROM menus WHERE menu_code = 'LEDGER_INQUIRY'), 2, 1, '/inquiry/schedule', 'fas fa-calendar-alt', '점검 계획 관리'),
('LEDGER_INQUIRY_HISTORY', '점검 현황(월별)', 'Monthly Inspection Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_INQUIRY'), 2, 2, '/inquiry/monthly-status', 'fas fa-calendar-check', '월별 점검 현황'),
('LEDGER_INQUIRY_DEPT', '점검 현황(부서별)', 'Department Inspection Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_INQUIRY'), 2, 3, '/inquiry/dept-status', 'fas fa-building', '부서별 점검 현황'),
('LEDGER_INQUIRY_OUTSIDER', '미종사자 현황', 'Non-employee Status', (SELECT id FROM menus WHERE menu_code = 'LEDGER_INQUIRY'), 2, 4, '/inquiry/non-employee', 'fas fa-user-times', '미종사자 현황 관리');

-- 메뉴 권한 테이블 생성
CREATE TABLE IF NOT EXISTS menu_permissions (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    can_read BOOLEAN NOT NULL DEFAULT false,
    can_write BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_menu_permission_menu FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    CONSTRAINT uk_menu_permission UNIQUE (menu_id, role_name)
);

-- 기본 권한 설정 (ADMIN 역할에 모든 메뉴 접근 권한 부여)
INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT id, 'ADMIN', true, true, true FROM menus;

-- USER 역할에 읽기 권한만 부여
INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT id, 'USER', true, false, false FROM menus;

-- 메뉴 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_menu_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_menu_updated_at ON menus;
CREATE TRIGGER trigger_update_menu_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_updated_at();

DROP TRIGGER IF EXISTS trigger_update_menu_permission_updated_at ON menu_permissions;
CREATE TRIGGER trigger_update_menu_permission_updated_at
    BEFORE UPDATE ON menu_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_updated_at();

-- 메뉴 조회용 뷰 생성 (계층형 구조)
CREATE OR REPLACE VIEW v_menu_hierarchy AS
WITH RECURSIVE menu_tree AS (
    -- 최상위 메뉴 (parent_id가 NULL인 메뉴)
    SELECT 
        id,
        menu_code,
        menu_name,
        menu_name_en,
        parent_id,
        menu_level,
        sort_order,
        menu_url,
        icon_class,
        is_active,
        is_visible,
        description,
        CAST(menu_name AS TEXT) as path,
        CAST(LPAD(sort_order::TEXT, 3, '0') AS TEXT) as sort_path
    FROM menus 
    WHERE parent_id IS NULL AND is_active = true
    
    UNION ALL
    
    -- 하위 메뉴들
    SELECT 
        m.id,
        m.menu_code,
        m.menu_name,
        m.menu_name_en,
        m.parent_id,
        m.menu_level,
        m.sort_order,
        m.menu_url,
        m.icon_class,
        m.is_active,
        m.is_visible,
        m.description,
        mt.path || ' > ' || m.menu_name,
        mt.sort_path || '-' || LPAD(m.sort_order::TEXT, 3, '0')
    FROM menus m
    INNER JOIN menu_tree mt ON m.parent_id = mt.id
    WHERE m.is_active = true
)
SELECT * FROM menu_tree
ORDER BY sort_path;

-- 사용자별 메뉴 권한 조회용 뷰
CREATE OR REPLACE VIEW v_user_menu_permissions AS
SELECT 
    m.id as menu_id,
    m.menu_code,
    m.menu_name,
    m.menu_name_en,
    m.parent_id,
    m.menu_level,
    m.sort_order,
    m.menu_url,
    m.icon_class,
    m.is_active,
    m.is_visible,
    mp.role_name,
    mp.can_read,
    mp.can_write,
    mp.can_delete
FROM menus m
LEFT JOIN menu_permissions mp ON m.id = mp.menu_id
WHERE m.is_active = true AND m.is_visible = true
ORDER BY m.menu_level, m.sort_order;

-- 메뉴 데이터 확인용 쿼리 (주석)
/*
-- 전체 메뉴 계층 구조 확인
SELECT 
    REPEAT('  ', menu_level - 1) || menu_name as menu_hierarchy,
    menu_code,
    menu_url,
    sort_order
FROM v_menu_hierarchy;

-- 특정 역할의 메뉴 권한 확인
SELECT 
    menu_name,
    role_name,
    can_read,
    can_write,
    can_delete
FROM v_user_menu_permissions 
WHERE role_name = 'ADMIN'
ORDER BY menu_level, sort_order;
*/ 
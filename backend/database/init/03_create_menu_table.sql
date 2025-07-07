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

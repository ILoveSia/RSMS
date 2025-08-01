-- JDBC 외래키 제약 조건 오류 해결
-- menu_permissions 테이블의 메뉴 참조 오류 수정

-- 1. 기존 데이터 정리 (외래키 제약 조건 일시 비활성화)
SET session_replication_role = replica;

-- 2. 외래키 제약 조건 위반 데이터 확인 및 삭제
-- 존재하지 않는 menu_id를 참조하는 menu_permissions 데이터 삭제
DELETE FROM menu_permissions 
WHERE menu_id NOT IN (SELECT id FROM menus WHERE id IS NOT NULL);

-- 3. 메뉴 권한 데이터 재생성
-- 기존 menu_permissions 데이터 모두 삭제
DELETE FROM menu_permissions;

-- 4. 메뉴 데이터가 있는 경우에만 권한 데이터 생성
INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT 
    m.id,
    'ADMIN',
    true,
    true,
    true
FROM menus m
WHERE m.id IS NOT NULL;

INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT 
    m.id,
    'USER',
    true,
    false,
    false
FROM menus m
WHERE m.id IS NOT NULL;

-- 5. 외래키 제약 조건 다시 활성화
SET session_replication_role = DEFAULT;

-- 6. 외래키 제약 조건 추가 (존재하지 않는 경우)
ALTER TABLE menu_permissions 
DROP CONSTRAINT IF EXISTS fk_menu_permissions_menu_id;

ALTER TABLE menu_permissions 
ADD CONSTRAINT fk_menu_permissions_menu_id 
FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE;

-- 7. 검증 쿼리
-- SELECT COUNT(*) as menu_count FROM menus;
-- SELECT COUNT(*) as permission_count FROM menu_permissions;
-- SELECT COUNT(*) as invalid_references FROM menu_permissions mp WHERE mp.menu_id NOT IN (SELECT id FROM menus);
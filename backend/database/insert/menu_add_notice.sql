-- 2) 하위 '공지사항' 메뉴 추가
INSERT INTO menus (menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order, menu_url, icon_class, is_active, is_visible, description)
SELECT 'COMMUNITY_NOTICE', '공지사항', 'Notice', m.id, 2, 1, '/community/notice', 'fas fa-bullhorn', true, true, '공지사항'
FROM menus m WHERE m.menu_code = 'COMMUNITY'
  AND NOT EXISTS (SELECT 1 FROM menus WHERE menu_code = 'COMMUNITY_NOTICE');

-- 4) 권한 부여 (ADMIN/USER)
INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT m.id, 'ADMIN', true, true, true
FROM menus m
WHERE m.menu_code IN ('COMMUNITY', 'COMMUNITY_NOTICE', 'COMMUNITY_QNA')
  AND NOT EXISTS (SELECT 1 FROM menu_permissions mp WHERE mp.menu_id = m.id AND mp.role_name = 'ADMIN');

INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT m.id, 'USER', true, false, false
FROM menus m
WHERE m.menu_code IN ('COMMUNITY', 'COMMUNITY_NOTICE', 'COMMUNITY_QNA')
  AND NOT EXISTS (SELECT 1 FROM menu_permissions mp WHERE mp.menu_id = m.id AND mp.role_name = 'USER');
-- 최상위 커뮤니티 메뉴 추가
INSERT INTO menus (
  menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order,
  menu_url, icon_class, is_active, is_visible, description
) VALUES (
  'COMMUNITY', '커뮤니티', 'Community', NULL, 1, 8,
  '/community', 'fas fa-users', true, true, '커뮤니티 최상위 메뉴'
);

-- 권한
INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT id, 'ADMIN', true, true, true FROM menus WHERE menu_code = 'COMMUNITY';

INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT id, 'USER', true, false, false FROM menus WHERE menu_code = 'COMMUNITY';

-- 1) 커뮤니티(COMMUNITY) id 참조하여 하위 Q&A 메뉴 추가
INSERT INTO menus (
  menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order,
  menu_url, icon_class, is_active, is_visible, description
)
SELECT
  'COMMUNITY_QNA', 'Q&A', 'QnA', m.id, 2, 1,
  '/community/qna', 'fas fa-list-alt', true, true, '커뮤니티 Q&A'
FROM menus m
WHERE m.menu_code = 'COMMUNITY';

-- 2) 권한 부여
INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT id, 'ADMIN', true, true, true FROM menus WHERE menu_code = 'COMMUNITY_QNA';

INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete)
SELECT id, 'USER', true, false, false FROM menus WHERE menu_code = 'COMMUNITY_QNA';
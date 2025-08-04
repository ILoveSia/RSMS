-- 인수인계 관리 하위 메뉴 추가
-- Phase 2 & 3 완료된 다이얼로그 통합 페이지들

-- USER_MGMT 메뉴의 ID를 찾기 위한 쿼리 (참고)
-- SELECT id FROM menus WHERE menu_code = 'USER_MGMT';

-- 인수인계 관리 하위 메뉴들 (menu_level = 2, parent_id = USER_MGMT의 id)
INSERT INTO public.menus (
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
    created_at, 
    updated_at, 
    created_id, 
    updated_id
) VALUES
-- 1. 인계자 및 인수자 지정 관리
(
    'HANDOVER_ASSIGNMENTS',
    '인계자 및 인수자 지정',
    'Handover Assignments',
    (SELECT id FROM menus WHERE menu_code = 'USER_MGMT'),
    2,
    1,
    '/handover/assignments',
    'fas fa-user-friends',
    true,
    true,
    '인수인계 지정 목록 관리 (다이얼로그 통합)',
    NOW(),
    NOW(),
    'system',
    'system'
),

-- 2. 책무기술서 관리
(
    'HANDOVER_DOCUMENTS',
    '책무기술서 관리',
    'Responsibility Documents',
    (SELECT id FROM menus WHERE menu_code = 'USER_MGMT'),
    2,
    2,
    '/handover/documents',
    'fas fa-file-alt',
    true,
    true,
    '직책별 책무기술서 관리 (다이얼로그 통합)',
    NOW(),
    NOW(),
    'system',
    'system'
),

-- 3. 내부통제 업무메뉴얼 관리
(
    'HANDOVER_MANUALS',
    '내부통제 업무메뉴얼 관리',
    'Internal Control Manuals',
    (SELECT id FROM menus WHERE menu_code = 'USER_MGMT'),
    2,
    3,
    '/handover/manuals',
    'fas fa-book-open',
    true,
    true,
    '내부통제 업무메뉴얼 관리 (다이얼로그 통합)',
    NOW(),
    NOW(),
    'system',
    'system'
),

-- 4. 사업계획 점검 관리
(
    'HANDOVER_INSPECTIONS',
    '사업계획 점검 관리',
    'Business Plan Inspections',
    (SELECT id FROM menus WHERE menu_code = 'USER_MGMT'),
    2,
    4,
    '/handover/inspections',
    'fas fa-clipboard-check',
    true,
    true,
    '부서별 사업계획 점검 관리 (다이얼로그 통합)',
    NOW(),
    NOW(),
    'system',
    'system'
);

-- 메뉴 권한 설정 (USER, ADMIN 역할에 대해 읽기/쓰기/삭제 권한 부여)
INSERT INTO public.menu_permissions (
    menu_id,
    role_name,
    can_read,
    can_write,
    can_delete,
    created_at,
    updated_at,
    created_id,
    updated_id
) VALUES
-- HANDOVER_ASSIGNMENTS 권한
((SELECT id FROM menus WHERE menu_code = 'HANDOVER_ASSIGNMENTS'), 'USER', true, true, true, NOW(), NOW(), 'system', 'system'),
((SELECT id FROM menus WHERE menu_code = 'HANDOVER_ASSIGNMENTS'), 'ADMIN', true, true, true, NOW(), NOW(), 'system', 'system'),

-- HANDOVER_DOCUMENTS 권한
((SELECT id FROM menus WHERE menu_code = 'HANDOVER_DOCUMENTS'), 'USER', true, true, true, NOW(), NOW(), 'system', 'system'),
((SELECT id FROM menus WHERE menu_code = 'HANDOVER_DOCUMENTS'), 'ADMIN', true, true, true, NOW(), NOW(), 'system', 'system'),

-- HANDOVER_MANUALS 권한
((SELECT id FROM menus WHERE menu_code = 'HANDOVER_MANUALS'), 'USER', true, true, true, NOW(), NOW(), 'system', 'system'),
((SELECT id FROM menus WHERE menu_code = 'HANDOVER_MANUALS'), 'ADMIN', true, true, true, NOW(), NOW(), 'system', 'system'),

-- HANDOVER_INSPECTIONS 권한
((SELECT id FROM menus WHERE menu_code = 'HANDOVER_INSPECTIONS'), 'USER', true, true, true, NOW(), NOW(), 'system', 'system'),
((SELECT id FROM menus WHERE menu_code = 'HANDOVER_INSPECTIONS'), 'ADMIN', true, true, true, NOW(), NOW(), 'system', 'system');

-- 추가된 메뉴 확인 쿼리 (참고용)
/*
SELECT 
    m.menu_code,
    m.menu_name,
    m.menu_url,
    m.parent_id,
    p.menu_name as parent_name,
    m.sort_order
FROM menus m
LEFT JOIN menus p ON m.parent_id = p.id
WHERE m.parent_id = (SELECT id FROM menus WHERE menu_code = 'USER_MGMT')
ORDER BY m.sort_order;
*/
-- 메뉴 및 메뉴 권한 초기 데이터
-- 외래키 제약 조건 오류 해결을 위한 순차적 데이터 삽입

-- 최상위 메뉴들 먼저 삽입
INSERT INTO menus (menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order, menu_url, icon_class, is_active, is_visible, description) VALUES
('LEDGER_MGMT', '책무구조도 원장 관리', 'Ledger Management', NULL, 1, 1, NULL, 'fas fa-book', true, true, '책무구조도 원장 관리 메뉴'),
('LEDGER_INQUIRY', '책무구조도 이력 점검', 'Ledger History Inquiry', NULL, 1, 2, NULL, 'fas fa-search', true, true, '책무구조도 이력 점검 메뉴'),
('COMPLIANCE_CHECK', '컴플라이언스 관리', 'Compliance Management', NULL, 1, 3, NULL, 'fas fa-shield-alt', true, true, '컴플라이언스 관리 메뉴'),
('APPROVAL_WORKFLOW', '준법지원부 모니터링', 'Approval Workflow Monitoring', NULL, 1, 4, NULL, 'fas fa-tasks', true, true, '준법지원부 모니터링 메뉴'),
('RESULT_MGMT', '결재 관리', 'Result Management', NULL, 1, 5, NULL, 'fas fa-clipboard-check', true, true, '결재 관리 메뉴'),
('USER_MGMT', '인계인수 관리', 'User Management', NULL, 1, 6, NULL, 'fas fa-users', true, true, '인계인수 관리 메뉴'),
('SYSTEM_MGMT', '시스템 관리', 'System Management', NULL, 1, 7, NULL, 'fas fa-cogs', true, true, '시스템 관리 메뉴');

-- 책무구조도 원장 관리 하위 메뉴들 (parent_id를 동적으로 조회)
INSERT INTO menus (menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order, menu_url, icon_class, is_active, is_visible, description) 
SELECT 
    'LEDGER_MGMT_MEETING', '회의체 현황', 'Meeting Status', m.id, 2, 1, '/ledger/company-status', 'fas fa-users', true, true, '회의체 현황 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_MGMT'
UNION ALL
SELECT 
    'LEDGER_MGMT_POSITION', '직책 현황', 'Position Status', m.id, 2, 2, '/ledger/position-status', 'fas fa-user-tie', true, true, '직책 현황 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_MGMT'
UNION ALL
SELECT 
    'LEDGER_MGMT_POSITION_RESPONSIBILITY', '직책별 책무 현황', 'Position Responsibility Status', m.id, 2, 3, '/ledger/detail-status', 'fas fa-list-alt', true, true, '직책별 책무 현황 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_MGMT'
UNION ALL
SELECT 
    'LEDGER_MGMT_EXECUTIVE', '임원 현황', 'Executive Status', m.id, 2, 4, '/ledger/business-status', 'fas fa-business-center', true, true, '임원 현황 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_MGMT'
UNION ALL
SELECT 
    'LEDGER_MGMT_EXECUTIVE_RESPONSIBILITY', '임원별 책무 현황', 'Executive Responsibility Status', m.id, 2, 5, '/ledger/business-detail-status', 'fas fa-analytics', true, true, '임원별 책무 현황 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_MGMT'
UNION ALL
SELECT 
    'LEDGER_MGMT_HOD_IC_ITEM', '부서장 내부통제 항목 현황', 'HOD Internal Control Item Status', m.id, 2, 6, '/ledger/internal-control', 'fas fa-shield-alt', true, true, '부서장 내부통제 항목 현황 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_MGMT'
UNION ALL
SELECT 
    'LEDGER_MGMT_STRUCTURE_SUBMISSION', '책무구조도 제출 관리', 'Structure Submission Management', m.id, 2, 7, '/ledger/structure-submission', 'fas fa-upload', true, true, '책무구조도 제출 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_MGMT';

-- 책무구조도 이력 점검 하위 메뉴들
INSERT INTO menus (menu_code, menu_name, menu_name_en, parent_id, menu_level, sort_order, menu_url, icon_class, is_active, is_visible, description) 
SELECT 
    'LEDGER_INQUIRY_SCHEDULE', '점검 계획', 'Inspection Schedule', m.id, 2, 1, '/inquiry/schedule', 'fas fa-calendar-alt', true, true, '점검 계획 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_INQUIRY'
UNION ALL
SELECT 
    'LEDGER_INQUIRY_AUDIT_PROG_MGMT_STATUS', '점검계획관리 현황', 'Audit Program Management Status', m.id, 2, 2, '/inquiry/audit-prog-mngt-status', 'fas fa-tasks', true, true, '점검계획관리 현황'
FROM menus m WHERE m.menu_code = 'LEDGER_INQUIRY'
UNION ALL
SELECT 
    'LEDGER_INQUIRY_AUDIT_ITEM_STATUS', '점검 현황(항목별)', 'Audit Item Status', m.id, 2, 3, '/inquiry/audit-item-status', 'fas fa-list-check', true, true, '항목별 점검 현황'
FROM menus m WHERE m.menu_code = 'LEDGER_INQUIRY'
UNION ALL
SELECT 
    'LEDGER_INQUIRY_HISTORY', '점검 현황(월별)', 'Monthly Inspection Status', m.id, 2, 4, '/inquiry/monthly-status', 'fas fa-calendar-check', true, true, '월별 점검 현황'
FROM menus m WHERE m.menu_code = 'LEDGER_INQUIRY'
UNION ALL
SELECT 
    'LEDGER_INQUIRY_DEPT', '점검 현황(부서별)', 'Department Inspection Status', m.id, 2, 5, '/inquiry/dept-status', 'fas fa-building', true, true, '부서별 점검 현황'
FROM menus m WHERE m.menu_code = 'LEDGER_INQUIRY'
UNION ALL
SELECT 
    'LEDGER_INQUIRY_OUTSIDER', '미종사자 현황', 'Non-employee Status', m.id, 2, 6, '/inquiry/non-employee', 'fas fa-user-times', true, true, '미종사자 현황 관리'
FROM menus m WHERE m.menu_code = 'LEDGER_INQUIRY';

-- 메뉴 권한 설정 (ADMIN 권한)
INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete) 
SELECT m.id, 'ADMIN', true, true, true
FROM menus m;

-- 메뉴 권한 설정 (USER 권한)
INSERT INTO menu_permissions (menu_id, role_name, can_read, can_write, can_delete) 
SELECT m.id, 'USER', true, false, false
FROM menus m;
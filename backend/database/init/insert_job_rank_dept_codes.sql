-- 공통코드 그룹 추가
INSERT INTO common_code_group (group_id, group_name, description, sort_order)
VALUES 
('JOB_RANK', '직급코드', '직원의 직급 분류', 1),
('DEPT', '부서코드', '조직의 부서 분류', 2)
ON CONFLICT (group_id) DO NOTHING;

-- 직급 코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order, use_yn)
VALUES 
('R001', 'JOB_RANK', '사원', 'STAFF', '일반 사원', 1, 'Y'),
('R002', 'JOB_RANK', '대리', 'ASSISTANT_MANAGER', '대리급', 2, 'Y'),
('R003', 'JOB_RANK', '과장', 'MANAGER', '과장급', 3, 'Y'),
('R004', 'JOB_RANK', '차장', 'DEPUTY_MANAGER', '차장급', 4, 'Y'),
('R005', 'JOB_RANK', '부장', 'GENERAL_MANAGER', '부장급', 5, 'Y'),
('R006', 'JOB_RANK', '이사', 'DIRECTOR', '이사급', 6, 'Y'),
('R007', 'JOB_RANK', '상무', 'EXECUTIVE_DIRECTOR', '상무이사', 7, 'Y'),
('R008', 'JOB_RANK', '전무', 'SENIOR_EXECUTIVE_DIRECTOR', '전무이사', 8, 'Y'),
('R009', 'JOB_RANK', '부사장', 'VICE_PRESIDENT', '부사장', 9, 'Y'),
('R010', 'JOB_RANK', '사장', 'PRESIDENT', '사장', 10, 'Y')
ON CONFLICT (code_id, group_id) DO NOTHING;

-- 부서 코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order, use_yn)
VALUES 
('D001', 'DEPT', '경영지원부', 'MANAGEMENT_SUPPORT', '경영지원 업무 담당', 1, 'Y'),
('D002', 'DEPT', '인사부', 'HR', '인사 관리 업무 담당', 2, 'Y'),
('D003', 'DEPT', '재무부', 'FINANCE', '재무 관리 업무 담당', 3, 'Y'),
('D004', 'DEPT', '영업부', 'SALES', '영업 업무 담당', 4, 'Y'),
('D005', 'DEPT', '마케팅부', 'MARKETING', '마케팅 업무 담당', 5, 'Y'),
('D006', 'DEPT', '개발부', 'DEVELOPMENT', '시스템 개발 업무 담당', 6, 'Y'),
('D007', 'DEPT', '연구소', 'R_AND_D', '연구 개발 업무 담당', 7, 'Y'),
('D008', 'DEPT', '품질관리부', 'QA', '품질 관리 업무 담당', 8, 'Y'),
('D009', 'DEPT', '고객지원부', 'CUSTOMER_SUPPORT', '고객 지원 업무 담당', 9, 'Y'),
('D010', 'DEPT', '총무부', 'GENERAL_AFFAIRS', '총무 업무 담당', 10, 'Y')
ON CONFLICT (code_id, group_id) DO NOTHING; 
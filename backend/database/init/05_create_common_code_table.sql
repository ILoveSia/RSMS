-- 공통코드 그룹 테이블 (코드 분류별 관리)
CREATE TABLE common_code_group (
    group_id VARCHAR(50) PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description TEXT,
    use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
);

-- 공통코드 상세 테이블
CREATE TABLE common_code (
    code_id VARCHAR(50) NOT NULL,
    group_id VARCHAR(50) NOT NULL,
    code_name VARCHAR(100) NOT NULL,
    code_value VARCHAR(200),
    description TEXT,
    use_yn CHAR(1) DEFAULT 'Y' CHECK (use_yn IN ('Y', 'N')),
    sort_order INTEGER DEFAULT 0,
    parent_code_id VARCHAR(50), -- 계층형 코드 지원
    level_depth INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    PRIMARY KEY (code_id, group_id),
    FOREIGN KEY (group_id) REFERENCES common_code_group(group_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_code_id, group_id) REFERENCES common_code(code_id, group_id) ON DELETE SET NULL
);

-- 인덱스 생성
CREATE INDEX idx_common_code_group_use_yn ON common_code_group(use_yn);
CREATE INDEX idx_common_code_group_sort_order ON common_code_group(sort_order);
CREATE INDEX idx_common_code_use_yn ON common_code(use_yn);
CREATE INDEX idx_common_code_sort_order ON common_code(sort_order);
CREATE INDEX idx_common_code_parent ON common_code(parent_code_id, group_id);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_common_code_group_updated_at 
    BEFORE UPDATE ON common_code_group 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_common_code_updated_at 
    BEFORE UPDATE ON common_code 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 공통코드 그룹 데이터 삽입
INSERT INTO common_code_group (group_id, group_name, description, sort_order) VALUES
('DEPT', '부서코드', '조직의 부서 분류', 1),
('POSITION', '직책코드', '직원의 직책 분류', 2),
('RANK', '직급코드', '직원의 직급 분류', 3),
('PROGRESS_STATUS', '진행상태구분코드', '업무 진행 상태 분류', 4),
('APPROVAL_STATUS', '결재상태구분코드', '결재 진행 상태 분류', 5),
('USER_STATUS', '사용자상태코드', '사용자 계정 상태 분류', 6),
('DOCUMENT_TYPE', '문서유형코드', '문서 분류 코드', 7),
('PRIORITY', '우선순위코드', '업무 우선순위 분류', 8);

-- 부서코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order) VALUES
('D001', 'DEPT', '경영지원팀', 'MGMT_SUPPORT', '경영지원 업무', 1),
('D002', 'DEPT', '인사팀', 'HR', '인사 관리 업무', 2),
('D003', 'DEPT', '재무팀', 'FINANCE', '재무 관리 업무', 3),
('D004', 'DEPT', '개발팀', 'DEVELOPMENT', '시스템 개발 업무', 4),
('D005', 'DEPT', '영업팀', 'SALES', '영업 관리 업무', 5),
('D006', 'DEPT', '마케팅팀', 'MARKETING', '마케팅 업무', 6);

-- 직책코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order) VALUES
('P001', 'POSITION', '대표이사', 'CEO', '최고경영자', 1),
('P002', 'POSITION', '이사', 'DIRECTOR', '이사급', 2),
('P003', 'POSITION', '부장', 'GENERAL_MANAGER', '부장급', 3),
('P004', 'POSITION', '차장', 'DEPUTY_MANAGER', '차장급', 4),
('P005', 'POSITION', '과장', 'MANAGER', '과장급', 5),
('P006', 'POSITION', '대리', 'ASSISTANT_MANAGER', '대리급', 6),
('P007', 'POSITION', '주임', 'SUPERVISOR', '주임급', 7),
('P008', 'POSITION', '사원', 'STAFF', '사원급', 8);

-- 직급코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order) VALUES
('R001', 'RANK', '임원', 'EXECUTIVE', '임원급', 1),
('R002', 'RANK', '부장급', 'SENIOR_MANAGER', '부장급', 2),
('R003', 'RANK', '차장급', 'MANAGER', '차장급', 3),
('R004', 'RANK', '과장급', 'ASSISTANT_MANAGER', '과장급', 4),
('R005', 'RANK', '대리급', 'SENIOR_STAFF', '대리급', 5),
('R006', 'RANK', '주임급', 'JUNIOR_STAFF', '주임급', 6),
('R007', 'RANK', '사원급', 'STAFF', '사원급', 7);

-- 진행상태구분코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order) VALUES
('PS001', 'PROGRESS_STATUS', '대기', 'PENDING', '처리 대기 상태', 1),
('PS002', 'PROGRESS_STATUS', '진행중', 'IN_PROGRESS', '처리 진행 중', 2),
('PS003', 'PROGRESS_STATUS', '완료', 'COMPLETED', '처리 완료', 3),
('PS004', 'PROGRESS_STATUS', '보류', 'ON_HOLD', '처리 보류', 4),
('PS005', 'PROGRESS_STATUS', '취소', 'CANCELLED', '처리 취소', 5);

-- 결재상태구분코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order) VALUES
('AS001', 'APPROVAL_STATUS', '결재요청', 'REQUESTED', '결재 요청 상태', 1),
('AS002', 'APPROVAL_STATUS', '검토중', 'REVIEWING', '결재 검토 중', 2),
('AS003', 'APPROVAL_STATUS', '승인', 'APPROVED', '결재 승인', 3),
('AS004', 'APPROVAL_STATUS', '반려', 'REJECTED', '결재 반려', 4),
('AS005', 'APPROVAL_STATUS', '회수', 'WITHDRAWN', '결재 회수', 5);

-- 사용자상태코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order) VALUES
('US001', 'USER_STATUS', '활성', 'ACTIVE', '활성 사용자', 1),
('US002', 'USER_STATUS', '비활성', 'INACTIVE', '비활성 사용자', 2),
('US003', 'USER_STATUS', '휴직', 'ON_LEAVE', '휴직 상태', 3),
('US004', 'USER_STATUS', '퇴사', 'RESIGNED', '퇴사한 사용자', 4),
('US005', 'USER_STATUS', '정지', 'SUSPENDED', '계정 정지', 5);

-- 문서유형코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order) VALUES
('DT001', 'DOCUMENT_TYPE', '공문', 'OFFICIAL_DOCUMENT', '공식 문서', 1),
('DT002', 'DOCUMENT_TYPE', '보고서', 'REPORT', '업무 보고서', 2),
('DT003', 'DOCUMENT_TYPE', '제안서', 'PROPOSAL', '사업 제안서', 3),
('DT004', 'DOCUMENT_TYPE', '계약서', 'CONTRACT', '계약 문서', 4),
('DT005', 'DOCUMENT_TYPE', '회의록', 'MEETING_MINUTES', '회의 기록', 5);

-- 우선순위코드 데이터
INSERT INTO common_code (code_id, group_id, code_name, code_value, description, sort_order) VALUES
('PR001', 'PRIORITY', '긴급', 'URGENT', '즉시 처리 필요', 1),
('PR002', 'PRIORITY', '높음', 'HIGH', '우선 처리', 2),
('PR003', 'PRIORITY', '보통', 'NORMAL', '일반 처리', 3),
('PR004', 'PRIORITY', '낮음', 'LOW', '여유시 처리', 4);

-- 데이터 확인용 뷰 생성
CREATE VIEW v_common_code AS
SELECT 
    ccg.group_id,
    ccg.group_name,
    cc.code_id,
    cc.code_name,
    cc.code_value,
    cc.description,
    cc.use_yn,
    cc.sort_order,
    cc.parent_code_id,
    cc.level_depth
FROM common_code_group ccg
JOIN common_code cc ON ccg.group_id = cc.group_id
WHERE ccg.use_yn = 'Y' AND cc.use_yn = 'Y'
ORDER BY ccg.sort_order, cc.sort_order;

-- 코멘트 추가
COMMENT ON TABLE common_code_group IS '공통코드 그룹 테이블 - 코드 분류별 관리';
COMMENT ON TABLE common_code IS '공통코드 상세 테이블 - 실제 코드 데이터';
COMMENT ON VIEW v_common_code IS '활성화된 공통코드 조회용 뷰';

COMMENT ON COLUMN common_code_group.group_id IS '그룹 식별자';
COMMENT ON COLUMN common_code_group.group_name IS '그룹명';
COMMENT ON COLUMN common_code_group.use_yn IS '사용여부 (Y/N)';
COMMENT ON COLUMN common_code_group.sort_order IS '정렬순서';

COMMENT ON COLUMN common_code.code_id IS '코드 식별자';
COMMENT ON COLUMN common_code.group_id IS '그룹 식별자';
COMMENT ON COLUMN common_code.code_name IS '코드명';
COMMENT ON COLUMN common_code.code_value IS '코드값 (영문)';
COMMENT ON COLUMN common_code.parent_code_id IS '상위 코드 (계층형 구조)';
COMMENT ON COLUMN common_code.level_depth IS '계층 깊이'; 
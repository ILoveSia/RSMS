-- =================================================================
--  테이블명: departments
--  설명    : 조직의 부서 정보를 관리하는 테이블 (ID 타입: VARCHAR)
-- =================================================================

-- 만약 동일한 이름의 테이블이 이미 존재하면 삭제합니다. (개발 환경에서 유용)
DROP TABLE IF EXISTS departments CASCADE;

-- 'departments' 테이블 생성
CREATE TABLE departments (
    -- 부서 ID (기본 키, 직접 생성 필요)
    -- VARCHAR(20) 타입을 사용하여 'HR-01'과 같은 문자열 기반의 고유 ID를 저장합니다.
    -- 애플리케이션에서 직접 고유 ID를 생성하여 INSERT 해야 합니다.
    department_id VARCHAR(20) PRIMARY KEY,

    -- 부서명 (최대 100자, 필수, 중복 불가)
    -- VARCHAR(100)은 최대 100자까지의 문자열을 저장합니다.
    -- NOT NULL은 이 컬럼이 비어 있을 수 없음을 의미합니다.
    -- UNIQUE는 모든 부서명이 고유해야 함을 보장합니다.
    department_name VARCHAR(100) NOT NULL UNIQUE,

    -- 사용 여부 (Y: 사용, N: 미사용)
    -- 기본값으로 'Y'를 설정하여, 별도 입력이 없으면 '사용' 상태가 됩니다.
    use_yn VARCHAR(1) NOT NULL DEFAULT 'Y',

    -- 레코드를 생성한 사용자 ID
    created_id VARCHAR(100),

    -- 레코드를 마지막으로 수정한 사용자 ID
    updated_id VARCHAR(100),

    -- 레코드 생성 일시 (필수, 기본값: 현재 시간)
    -- 레코드가 처음 생성될 때의 타임스탬프를 저장합니다.
    -- 기본값으로 CURRENT_TIMESTAMP를 사용하여 자동으로 현재 시간이 입력됩니다.
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 레코드 마지막 수정 일시 (필수, 기본값: 현재 시간)
    -- 레코드가 마지막으로 수정될 때의 타임스탬프를 저장합니다.
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 테이블 및 컬럼에 대한 주석(Comment) 추가 (DB 가독성을 높임)
COMMENT ON TABLE departments IS '부서 정보를 저장하는 테이블';
COMMENT ON COLUMN departments.department_id IS '부서의 고유 식별자 (PK, VARCHAR 타입, 직접 생성 필요)';
COMMENT ON COLUMN departments.department_name IS '부서의 이름';
COMMENT ON COLUMN departments.use_yn IS '사용 여부 (Y: 사용, N: 미사용)';
COMMENT ON COLUMN departments.created_id IS '레코드를 생성한 사용자의 ID';
COMMENT ON COLUMN departments.updated_id IS '레코드를 마지막으로 수정한 사용자의 ID';
COMMENT ON COLUMN departments.created_at IS '레코드가 생성된 일시';
COMMENT ON COLUMN departments.updated_at IS '레코드가 마지막으로 수정된 일시';


-- 인덱스 추가: 빠른 조회를 위해 자주 사용되는 컬럼에 인덱스를 생성합니다.
-- 부서명으로 검색하는 경우가 많으므로 인덱스를 추가합니다.
CREATE INDEX idx_department_name ON departments(department_name);


-- 예시 데이터 추가 (선택 사항)
-- department_id를 직접 지정하여 INSERT 해야 합니다.
INSERT INTO departments (department_id, department_name, use_yn, created_id, updated_id) VALUES
('SUP001', '경영지원본부', 'Y', 'system', 'system'),
('DEV001', '개발본부', 'Y', 'system', 'system'),
('HR001', '인사팀', 'Y', 'system', 'system'),
('FIN001', '재무팀', 'Y', 'system', 'system'),
('DEV101', '프론트엔드개발팀', 'Y', 'system', 'system'),
('DEV201', '백엔드개발팀', 'Y', 'system', 'system'),
('YOU101', '영업부', 'Y', 'system', 'system'),
('MAR101', '마케팅부', 'Y', 'system', 'system'),
('DEV301', 'AI개발부', 'Y', 'system', 'system'),
('RE101', '연구소', 'Y', 'system', 'system'),
('QC101', '품질관리부', 'Y', 'system', 'system'),
('CS101', '고객지원부', 'Y', 'system', 'system'),
('AC101', '총무부', 'Y', 'system', 'system'),
('GAM101', '감사부', 'Y', 'system', 'system');

-- updated_at 컬럼 자동 갱신을 위한 트리거 함수 생성 (선택 사항, 고급 기능)
-- 레코드가 업데이트될 때마다 updated_at 필드를 현재 시간으로 자동 업데이트합니다.
-- 참고: updated_id는 애플리케이션 레벨에서 처리하는 것이 일반적입니다.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- departments 테이블에 트리거 적용
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 사업계획 점검 관리 테이블
-- business_plan_inspections

DROP TABLE IF EXISTS public.business_plan_inspections CASCADE;

CREATE TABLE public.business_plan_inspections (
    inspection_id BIGSERIAL PRIMARY KEY,
    dept_cd VARCHAR(10) NOT NULL,                   -- 부서코드
    
    -- 점검 기본 정보
    inspection_year INTEGER NOT NULL,               -- 점검 연도
    inspection_quarter INTEGER,                     -- 점검 분기 (1,2,3,4)
    inspection_title VARCHAR(200) NOT NULL,         -- 점검 제목
    inspection_type VARCHAR(50) NOT NULL,           -- 점검 유형 (QUARTERLY, SEMI_ANNUAL, ANNUAL, SPECIAL)
    
    -- 점검 계획
    planned_start_date DATE,                        -- 점검 시작 예정일
    planned_end_date DATE,                          -- 점검 완료 예정일
    inspection_scope TEXT,                          -- 점검 범위
    inspection_criteria TEXT,                       -- 점검 기준
    
    -- 점검 실행
    actual_start_date DATE,                         -- 실제 점검 시작일
    actual_end_date DATE,                           -- 실제 점검 완료일
    
    -- 점검 상태
    status VARCHAR(20) DEFAULT 'PLANNED' NOT NULL,  -- 상태 (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
    
    -- 담당자 정보
    inspector_emp_no VARCHAR(20),                   -- 점검자 사번
    
    -- 감사 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_id VARCHAR(100),
    updated_id VARCHAR(100),
    
    -- 제약 조건
    CONSTRAINT chk_business_plan_inspections_status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_business_plan_inspections_type CHECK (inspection_type IN ('QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'SPECIAL')),
    CONSTRAINT chk_business_plan_inspections_quarter CHECK (inspection_quarter IS NULL OR (inspection_quarter >= 1 AND inspection_quarter <= 4)),
    CONSTRAINT chk_business_plan_inspections_year CHECK (inspection_year >= 2020 AND inspection_year <= 2099)
);

-- 인덱스 생성
CREATE INDEX idx_business_plan_inspections_dept_cd ON public.business_plan_inspections(dept_cd);
CREATE INDEX idx_business_plan_inspections_year_quarter ON public.business_plan_inspections(inspection_year, inspection_quarter);
CREATE INDEX idx_business_plan_inspections_status ON public.business_plan_inspections(status);
CREATE INDEX idx_business_plan_inspections_type ON public.business_plan_inspections(inspection_type);
CREATE INDEX idx_business_plan_inspections_inspector ON public.business_plan_inspections(inspector_emp_no);
CREATE INDEX idx_business_plan_inspections_dates ON public.business_plan_inspections(planned_start_date, planned_end_date);

-- 트리거 생성
CREATE TRIGGER update_business_plan_inspections_updated_at 
    BEFORE UPDATE ON public.business_plan_inspections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트
COMMENT ON TABLE public.business_plan_inspections IS '사업계획 점검 관리 테이블';
COMMENT ON COLUMN public.business_plan_inspections.dept_cd IS '부서코드';
COMMENT ON COLUMN public.business_plan_inspections.inspection_type IS '점검 유형 (QUARTERLY: 분기별, SEMI_ANNUAL: 반기별, ANNUAL: 연간, SPECIAL: 특별점검)';
COMMENT ON COLUMN public.business_plan_inspections.inspection_quarter IS '점검 분기 (1,2,3,4분기, 분기별 점검이 아닐 시 NULL)';
COMMENT ON COLUMN public.business_plan_inspections.status IS '상태 (PLANNED: 계획, IN_PROGRESS: 진행중, COMPLETED: 완료, CANCELLED: 취소)';
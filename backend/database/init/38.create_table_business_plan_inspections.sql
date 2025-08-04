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
    inspection_type VARCHAR(50) NOT NULL,           -- 점검 유형 (QUARTERLY, ANNUAL, SPECIAL)
    
    -- 점검 계획
    planned_start_date DATE,                        -- 점검 시작 예정일
    planned_end_date DATE,                          -- 점검 완료 예정일
    inspection_scope TEXT,                          -- 점검 범위
    inspection_criteria TEXT,                       -- 점검 기준
    
    -- 점검 실행
    actual_start_date TIMESTAMP,                    -- 실제 점검 시작일시
    actual_end_date TIMESTAMP,                      -- 실제 점검 완료일시
    inspection_results TEXT,                        -- 점검 결과
    
    -- 점검 상태
    status VARCHAR(20) DEFAULT 'PLANNED' NOT NULL,  -- 상태 (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
    overall_grade VARCHAR(10),                      -- 종합 등급 (A, B, C, D)
    
    -- 담당자 정보
    inspector_emp_no VARCHAR(20),                   -- 점검자 사번
    inspectee_emp_no VARCHAR(20),                   -- 피점검자 사번 (부서 담당자)
    
    -- 개선사항
    improvement_items TEXT,                         -- 개선사항
    improvement_due_date DATE,                      -- 개선 완료 예정일
    improvement_status VARCHAR(20),                 -- 개선 상태 (PENDING, IN_PROGRESS, COMPLETED)
    
    -- 감사 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_id VARCHAR(100),
    updated_id VARCHAR(100),
    
    -- 제약 조건
    CONSTRAINT chk_business_plan_inspections_status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_business_plan_inspections_type CHECK (inspection_type IN ('QUARTERLY', 'ANNUAL', 'SPECIAL')),
    CONSTRAINT chk_business_plan_inspections_quarter CHECK (inspection_quarter IS NULL OR (inspection_quarter >= 1 AND inspection_quarter <= 4)),
    CONSTRAINT chk_business_plan_inspections_grade CHECK (overall_grade IS NULL OR overall_grade IN ('A', 'B', 'C', 'D')),
    CONSTRAINT chk_business_plan_inspections_improvement_status CHECK (improvement_status IS NULL OR improvement_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    CONSTRAINT chk_business_plan_inspections_year CHECK (inspection_year >= 2020 AND inspection_year <= 2099)
);

-- 인덱스 생성
CREATE INDEX idx_business_plan_inspections_dept_cd ON public.business_plan_inspections(dept_cd);
CREATE INDEX idx_business_plan_inspections_year_quarter ON public.business_plan_inspections(inspection_year, inspection_quarter);
CREATE INDEX idx_business_plan_inspections_status ON public.business_plan_inspections(status);
CREATE INDEX idx_business_plan_inspections_type ON public.business_plan_inspections(inspection_type);
CREATE INDEX idx_business_plan_inspections_inspector ON public.business_plan_inspections(inspector_emp_no);
CREATE INDEX idx_business_plan_inspections_inspectee ON public.business_plan_inspections(inspectee_emp_no);
CREATE INDEX idx_business_plan_inspections_dates ON public.business_plan_inspections(planned_start_date, planned_end_date);
CREATE INDEX idx_business_plan_inspections_improvement ON public.business_plan_inspections(improvement_status, improvement_due_date);

-- 트리거 생성
CREATE TRIGGER update_business_plan_inspections_updated_at 
    BEFORE UPDATE ON public.business_plan_inspections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트
COMMENT ON TABLE public.business_plan_inspections IS '사업계획 점검 관리 테이블';
COMMENT ON COLUMN public.business_plan_inspections.dept_cd IS '부서코드';
COMMENT ON COLUMN public.business_plan_inspections.inspection_type IS '점검 유형 (QUARTERLY: 분기별, ANNUAL: 연간, SPECIAL: 특별점검)';
COMMENT ON COLUMN public.business_plan_inspections.inspection_quarter IS '점검 분기 (1,2,3,4분기, 연간점검시 NULL)';
COMMENT ON COLUMN public.business_plan_inspections.status IS '상태 (PLANNED: 계획, IN_PROGRESS: 진행중, COMPLETED: 완료, CANCELLED: 취소)';
COMMENT ON COLUMN public.business_plan_inspections.overall_grade IS '종합 등급 (A: 우수, B: 양호, C: 보통, D: 미흡)';
COMMENT ON COLUMN public.business_plan_inspections.improvement_status IS '개선 상태 (PENDING: 대기, IN_PROGRESS: 진행중, COMPLETED: 완료)';
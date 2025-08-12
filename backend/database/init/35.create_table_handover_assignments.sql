-- 인수인계 지정 관리 테이블
-- handover_assignments

DROP TABLE IF EXISTS public.handover_assignments CASCADE;

CREATE TABLE public.handover_assignments (
    assignment_id BIGSERIAL PRIMARY KEY,
    handover_type VARCHAR(20) NOT NULL,             -- 인수인계 유형 HANDOVER_TYPE (POSITION, RESPONSIBILITY)
    
    -- 인계자 정보
    handover_from_emp_no VARCHAR(20),               -- 인계자 사번
    -- 인수자 정보  
    handover_to_emp_no VARCHAR(20) NOT NULL,        -- 인수자 사번
    
    -- 일정 정보
    planned_start_date DATE,                        -- 인수인계 시작 예정일
    planned_end_date DATE,                          -- 인수인계 완료 예정일
    actual_start_date TIMESTAMP,                    -- 실제 시작일시
    actual_end_date TIMESTAMP,                      -- 실제 완료일시
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'PLANNED' NOT NULL,  -- 상태 HANDOVER_STATUS (PLANNED, IN_PROGRESS, COMPLETED, CANCELLED)
    
    -- 비고
    notes TEXT,                                     -- 특이사항
    
    -- 감사 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_id VARCHAR(100),
    updated_id VARCHAR(100),
    
    -- 제약 조건
    CONSTRAINT chk_handover_assignments_status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    CONSTRAINT chk_handover_assignments_type CHECK (handover_type IN ('POSITION', 'RESPONSIBILITY'))
);

-- 인덱스 생성
CREATE INDEX idx_handover_assignments_status ON public.handover_assignments(status);
CREATE INDEX idx_handover_assignments_from_emp ON public.handover_assignments(handover_from_emp_no);
CREATE INDEX idx_handover_assignments_to_emp ON public.handover_assignments(handover_to_emp_no);
CREATE INDEX idx_handover_assignments_dates ON public.handover_assignments(planned_start_date, planned_end_date);

-- 트리거 생성
CREATE TRIGGER update_handover_assignments_updated_at 
    BEFORE UPDATE ON public.handover_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트
COMMENT ON TABLE public.handover_assignments IS '인수인계 지정 관리 테이블';
COMMENT ON COLUMN public.handover_assignments.handover_type IS '인수인계 유형 (POSITION: 직책, RESPONSIBILITY: 책무)';
COMMENT ON COLUMN public.handover_assignments.status IS '상태 (PLANNED: 계획, IN_PROGRESS: 진행중, COMPLETED: 완료, CANCELLED: 취소)';
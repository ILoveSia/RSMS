-- 인수인계 이력 관리 테이블
-- handover_histories

DROP TABLE IF EXISTS public.handover_histories CASCADE;

CREATE TABLE public.handover_histories (
    history_id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL,                  -- handover_assignments.assignment_id FK
    
    -- 이력 정보
    activity_type VARCHAR(50) NOT NULL,             -- 활동 유형 (DOCUMENT_CREATED, MANUAL_UPLOADED, INSPECTION_COMPLETED 등)
    activity_description TEXT,                      -- 활동 설명
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 활동 일시
    
    -- 담당자 정보
    actor_emp_no VARCHAR(20),                       -- 작업자 사번
    actor_name VARCHAR(50),                         -- 작업자 이름
    
    -- 연관 정보
    related_entity_type VARCHAR(50),                -- 연관 엔티티 타입 (RESPONSIBILITY_DOCUMENT, INTERNAL_CONTROL_MANUAL 등)
    related_entity_id BIGINT,                       -- 연관 엔티티 ID
    
    -- 감사 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_id VARCHAR(100),
    
    -- 제약 조건
    CONSTRAINT chk_handover_histories_activity_type CHECK (activity_type IN (
        'ASSIGNMENT_CREATED', 'ASSIGNMENT_UPDATED', 'ASSIGNMENT_STARTED', 'ASSIGNMENT_COMPLETED',
        'DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_APPROVED', 'DOCUMENT_PUBLISHED',
        'MANUAL_CREATED', 'MANUAL_UPDATED', 'MANUAL_APPROVED', 'MANUAL_PUBLISHED',
        'INSPECTION_PLANNED', 'INSPECTION_STARTED', 'INSPECTION_COMPLETED',
        'FILE_UPLOADED', 'FILE_DOWNLOADED', 'COMMENT_ADDED', 'STATUS_CHANGED'
    )),
    CONSTRAINT chk_handover_histories_related_entity CHECK (related_entity_type IS NULL OR related_entity_type IN (
        'HANDOVER_ASSIGNMENT', 'RESPONSIBILITY_DOCUMENT', 'INTERNAL_CONTROL_MANUAL', 
        'BUSINESS_PLAN_INSPECTION', 'ATTACHMENT'
    )),
    CONSTRAINT fk_handover_histories_assignment FOREIGN KEY (assignment_id) REFERENCES handover_assignments(assignment_id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_handover_histories_assignment_id ON public.handover_histories(assignment_id);
CREATE INDEX idx_handover_histories_activity_type ON public.handover_histories(activity_type);
CREATE INDEX idx_handover_histories_activity_date ON public.handover_histories(activity_date);
CREATE INDEX idx_handover_histories_actor ON public.handover_histories(actor_emp_no);
CREATE INDEX idx_handover_histories_entity ON public.handover_histories(related_entity_type, related_entity_id);

-- 테이블 코멘트
COMMENT ON TABLE public.handover_histories IS '인수인계 이력 관리 테이블';
COMMENT ON COLUMN public.handover_histories.assignment_id IS '인수인계 지정 ID (handover_assignments 테이블 FK)';
COMMENT ON COLUMN public.handover_histories.activity_type IS '활동 유형 (ASSIGNMENT_*, DOCUMENT_*, MANUAL_*, INSPECTION_*, FILE_*, 등)';
COMMENT ON COLUMN public.handover_histories.related_entity_type IS '연관 엔티티 타입 (HANDOVER_ASSIGNMENT, RESPONSIBILITY_DOCUMENT, INTERNAL_CONTROL_MANUAL, BUSINESS_PLAN_INSPECTION, ATTACHMENT)';
COMMENT ON COLUMN public.handover_histories.related_entity_id IS '연관 엔티티 ID (해당 테이블의 기본키)';
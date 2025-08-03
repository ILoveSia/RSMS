-- public.approval_steps definition

-- Drop table

-- DROP TABLE public.approval_steps CASCADE;

CREATE TABLE public.approval_steps (
    step_id serial4 NOT NULL,                          -- 단계 ID (PK)
    approval_id int4 NOT NULL,                         -- 결재 ID (FK → approval.approval_id)
    step_order int4 NOT NULL,                          -- 결재 순서 (1, 2, 3)
    approver_id varchar(100) NOT NULL,                 -- 결재자 ID
    step_status varchar(20) DEFAULT 'PENDING'::varchar NOT NULL, -- 단계 상태
    approved_datetime timestamptz NULL,                -- 승인 일시
    comments text NULL,                                -- 결재 의견
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
    created_id varchar(100) DEFAULT 'system'::varchar NULL, -- 생성자 ID
    updated_id varchar(100) DEFAULT 'system'::varchar NULL, -- 수정자 ID
    
    CONSTRAINT approval_steps_pkey PRIMARY KEY (step_id),
    CONSTRAINT fk_approval_steps_approval 
        FOREIGN KEY (approval_id) REFERENCES approval(approval_id) ON DELETE CASCADE,
    CONSTRAINT uk_approval_step_order 
        UNIQUE (approval_id, step_order),  -- 같은 결재에서 순서 중복 방지
    CONSTRAINT approval_steps_step_status_check 
        CHECK (step_status IN ('PENDING', 'APPROVED', 'REJECTED', 'WAITING', 'SKIPPED'))
);

-- 인덱스 생성
CREATE INDEX idx_approval_steps_approval_id ON public.approval_steps USING btree (approval_id);
CREATE INDEX idx_approval_steps_approver_id ON public.approval_steps USING btree (approver_id);
CREATE INDEX idx_approval_steps_status ON public.approval_steps USING btree (step_status);
CREATE INDEX idx_approval_steps_order ON public.approval_steps USING btree (approval_id, step_order);

-- 업데이트 트리거 생성
CREATE TRIGGER update_approval_steps_updated_at
BEFORE UPDATE ON approval_steps
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트
COMMENT ON TABLE public.approval_steps IS '결재 단계별 상세 정보 테이블';
COMMENT ON COLUMN public.approval_steps.step_id IS '단계 ID (Primary Key)';
COMMENT ON COLUMN public.approval_steps.approval_id IS '결재 ID (Foreign Key)';
COMMENT ON COLUMN public.approval_steps.step_order IS '결재 순서 (1차, 2차, 3차)';
COMMENT ON COLUMN public.approval_steps.approver_id IS '결재자 사용자 ID';
COMMENT ON COLUMN public.approval_steps.step_status IS '단계 상태 (PENDING, APPROVED, REJECTED, WAITING, SKIPPED)';
COMMENT ON COLUMN public.approval_steps.approved_datetime IS '승인 처리 일시';
COMMENT ON COLUMN public.approval_steps.comments IS '결재 의견 또는 반려 사유';
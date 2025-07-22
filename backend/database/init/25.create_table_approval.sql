-- public.approval definition

-- Drop table

-- DROP TABLE public.approval CASCADE;
-- 결재 테이블

CREATE TABLE public.approval (
	approval_id serial4 NOT NULL,       -- 결재ID
	task_type_cd varchar(100) NOT NULL,    -- 업무 유형코드
	task_id int8 NOT NULL,      -- 관련 업무 ID (어떤 업무에 대한 결재인지 식별)
	requester_id varchar(100) NOT NULL, -- 결재 요청자 ID
	approver_id varchar(100) NULL,     -- 결재자 ID
	appr_stat_cd varchar(20) NULL,     -- 결재 상태 코드
	request_datetime timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 결재 요청 일시
	approval_datetime timestamptz NULL, -- 결재 완료 일시
	"comments" text NULL,               -- 결재 메모
	created_id varchar(100) NULL,        -- 생성자 ID
	updated_id varchar(100) NULL,        -- 수정자 ID
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	CONSTRAINT approval_pkey PRIMARY KEY (approval_id)
);

CREATE INDEX idx_approval_appr_stat_cd ON public.approval USING btree (appr_stat_cd);
CREATE INDEX idx_approval_approver_id ON public.approval USING btree (approver_id);
CREATE INDEX idx_approval_requester_id ON public.approval USING btree (requester_id);
CREATE INDEX idx_approval_task_id ON public.approval USING btree (task_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_approval_updated_at
BEFORE UPDATE ON approval
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

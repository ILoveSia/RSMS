-- public.approval definition

-- Drop table

-- DROP TABLE public.approval;

CREATE TABLE public.approval (
	approval_id serial4 NOT NULL,
	task_id varchar(100) NOT NULL,
	requester_id varchar(100) NOT NULL,
	approver_id varchar(100) NULL,
	appr_stat_cd varchar(20) NULL,
	request_datetime timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	approval_datetime timestamptz NULL,
	"comments" text NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT approval_pkey PRIMARY KEY (approval_id)
);
CREATE INDEX idx_approval_appr_stat_cd ON public.approval USING btree (appr_stat_cd);
CREATE INDEX idx_approval_approver_id ON public.approval USING btree (approver_id);
CREATE INDEX idx_approval_requester_id ON public.approval USING btree (requester_id);
CREATE INDEX idx_approval_task_id ON public.approval USING btree (task_id);

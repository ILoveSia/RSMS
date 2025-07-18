-- public.meeting_body definition

-- Drop table

-- DROP TABLE public.meeting_body;

CREATE TABLE public.meeting_body (
	meeting_body_id varchar(100) NOT NULL, -- 회의체ID
	gubun varchar(100) NOT NULL, -- 회의체구분
	meeting_name varchar(500) NOT NULL, -- 회의체명
	meeting_period varchar(10) NOT NULL, -- 회의체기간
	"content" text NULL, -- 회의체내용
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT meeting_body_pkey PRIMARY KEY (meeting_body_id)
);
CREATE INDEX idx_meeting_body_gubun ON public.meeting_body USING btree (gubun);
CREATE INDEX idx_meeting_body_period ON public.meeting_body USING btree (meeting_period);

-- Table Triggers

create trigger update_meeting_body_updated_at before
update
    on
    public.meeting_body for each row execute function update_updated_at_column();

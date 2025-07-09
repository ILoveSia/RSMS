-- public.meeting_body definition

-- Drop table

-- DROP TABLE public.meeting_body;

CREATE TABLE public.meeting_body (
	meeting_body_id varchar(100) NOT NULL,
	gubun varchar(100) NOT NULL,
	meeting_name varchar(500) NOT NULL,
	meeting_period varchar(10) NOT NULL,
	"content" text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT meeting_body_pkey PRIMARY KEY (meeting_body_id)
);
CREATE INDEX idx_meeting_body_gubun ON public.meeting_body USING btree (gubun);
CREATE INDEX idx_meeting_body_period ON public.meeting_body USING btree (meeting_period);

-- Table Triggers

create trigger update_meeting_body_updated_at before
update
    on
    public.meeting_body for each row execute function update_updated_at_column();

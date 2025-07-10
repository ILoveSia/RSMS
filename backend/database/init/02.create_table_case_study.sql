-- public.case_study definition

-- Drop table

-- DROP TABLE public.case_study;

CREATE TABLE public.case_study (
	case_study_id bigserial NOT NULL,
	case_study_title varchar(300) NULL,
	case_study_content text NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT case_study_pkey PRIMARY KEY (case_study_id)
);
CREATE INDEX idx_case_study_created_at ON public.case_study USING btree (created_at);
CREATE INDEX idx_case_study_created_id ON public.case_study USING btree (created_id);

-- Table Triggers

create trigger update_case_study_updated_at before
update
    on
    public.case_study for each row execute function update_updated_at_column();

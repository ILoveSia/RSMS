-- public.case_study definition

-- Drop table

-- DROP TABLE public.case_study;

CREATE TABLE public.case_study (
	case_study_id bigserial NOT NULL, -- 사례연구ID
	case_study_title varchar(300) NULL, -- 사례연구제목
	case_study_content text NULL, -- 사례연구내용
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	CONSTRAINT case_study_pkey PRIMARY KEY (case_study_id)
);
CREATE INDEX idx_case_study_created_at ON public.case_study USING btree (created_at);
CREATE INDEX idx_case_study_created_id ON public.case_study USING btree (created_id);

-- Table Triggers

create trigger update_case_study_updated_at before
update
    on
    public.case_study for each row execute function update_updated_at_column();

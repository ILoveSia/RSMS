-- public.responsibility_detail definition

-- Drop table

-- DROP TABLE public.responsibility_detail;

CREATE TABLE public.responsibility_detail (
	responsibility_detail_id bigserial NOT NULL, -- 책무상세ID
	responsibility_id int8 NOT NULL,             -- 책무ID
	responsibility_detail_content text NULL,     -- 책무상세내용
	responsibility_mgt_sts text NULL,            -- 책무관리상태
	responsibility_rel_evid text NULL,           -- 책무관련증거
	responsibility_use_yn varchar(255) DEFAULT 'Y'::character varying NOT NULL, -- 책무사용여부
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT chk_responsibility_use_yn CHECK (((responsibility_use_yn)::text = ANY (ARRAY[('Y'::character varying)::text, ('N'::character varying)::text]))),
	CONSTRAINT responsibility_detail_pkey PRIMARY KEY (responsibility_detail_id),
	CONSTRAINT fk_responsibility_detail_responsibility FOREIGN KEY (responsibility_id) REFERENCES public.responsibility(responsibility_id) ON DELETE CASCADE
);
CREATE INDEX idx_responsibility_detail_responsibility_id ON public.responsibility_detail USING btree (responsibility_id);
CREATE INDEX idx_responsibility_detail_use_yn ON public.responsibility_detail USING btree (responsibility_use_yn);

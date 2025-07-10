-- public.responsibility_detail definition

-- Drop table

-- DROP TABLE public.responsibility_detail;

CREATE TABLE public.responsibility_detail (
	responsibility_detail_id bigserial NOT NULL,
	responsibility_id int8 NOT NULL,
	responsibility_detail_content text NULL,
	responsibility_mgt_sts text NULL,
	responsibility_rel_evid text NULL,
	responsibility_use_yn varchar(255) DEFAULT 'Y'::character varying NOT NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT chk_responsibility_use_yn CHECK (((responsibility_use_yn)::text = ANY (ARRAY[('Y'::character varying)::text, ('N'::character varying)::text]))),
	CONSTRAINT responsibility_detail_pkey PRIMARY KEY (responsibility_detail_id),
	CONSTRAINT fk_responsibility_detail_responsibility FOREIGN KEY (responsibility_id) REFERENCES public.responsibility(responsibility_id) ON DELETE CASCADE
);
CREATE INDEX idx_responsibility_detail_responsibility_id ON public.responsibility_detail USING btree (responsibility_id);
CREATE INDEX idx_responsibility_detail_use_yn ON public.responsibility_detail USING btree (responsibility_use_yn);

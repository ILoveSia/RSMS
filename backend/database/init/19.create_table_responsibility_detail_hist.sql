-- public.responsibility_detail_hist definition

-- Drop table

-- DROP TABLE public.responsibility_detail_hist;

CREATE TABLE public.responsibility_detail_hist (
	history_seq bigserial NOT NULL,
	history_id timestamp NOT NULL,
	responsibility_detail_id int8 NOT NULL,
	responsibility_id int8 NOT NULL,
	responsibility_detail_content text NULL,
	responsibility_mgt_sts text NULL,
	responsibility_rel_evid text NULL,
	responsibility_use_yn varchar(255) NOT NULL,
	responsibility_detail_gubun varchar(2) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT responsibility_detail_hist_pkey PRIMARY KEY (history_seq)
);

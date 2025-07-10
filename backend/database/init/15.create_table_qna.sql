-- public.qna definition

-- Drop table

-- DROP TABLE public.qna;

CREATE TABLE public.qna (
	id bigserial NOT NULL,
	department varchar(100) NOT NULL,
	title varchar(500) NOT NULL,
	"content" text NULL,
	questioner_id varchar(100) NOT NULL,
	questioner_name varchar(100) NOT NULL,
	answer_content text NULL,
	answerer_id varchar(100) NULL,
	answerer_name varchar(100) NULL,
	status varchar(20) DEFAULT 'PENDING'::character varying NOT NULL,
	priority varchar(10) DEFAULT 'NORMAL'::character varying NULL,
	category varchar(50) NULL,
	is_public bool DEFAULT true NOT NULL,
	view_count int4 DEFAULT 0 NOT NULL,
	answered_at timestamp NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT chk_qna_priority CHECK (((priority)::text = ANY ((ARRAY['LOW'::character varying, 'NORMAL'::character varying, 'HIGH'::character varying, 'URGENT'::character varying])::text[]))),
	CONSTRAINT chk_qna_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ANSWERED'::character varying, 'CLOSED'::character varying])::text[]))),
	CONSTRAINT chk_qna_view_count CHECK ((view_count >= 0)),
	CONSTRAINT qna_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_qna_answerer_id ON public.qna USING btree (answerer_id);
CREATE INDEX idx_qna_category ON public.qna USING btree (category);
CREATE INDEX idx_qna_created_at ON public.qna USING btree (created_at);
CREATE INDEX idx_qna_department ON public.qna USING btree (department);
CREATE INDEX idx_qna_is_public ON public.qna USING btree (is_public);
CREATE INDEX idx_qna_priority ON public.qna USING btree (priority);
CREATE INDEX idx_qna_questioner_id ON public.qna USING btree (questioner_id);
CREATE INDEX idx_qna_status ON public.qna USING btree (status);

-- public.qna definition

-- Drop table

-- DROP TABLE public.qna;

CREATE TABLE public.qna (
	id bigserial NOT NULL, -- 문의ID
	department varchar(100) NOT NULL, -- 부서
	title varchar(500) NOT NULL, -- 제목
	"content" text NULL, -- 내용
	questioner_id varchar(100) NOT NULL,      -- 문의자ID
	questioner_name varchar(100) NOT NULL,    -- 문의자명
	answer_content text NULL,                 -- 답변내용
	answerer_id varchar(100) NULL,            -- 답변자ID
	answerer_name varchar(100) NULL,          -- 답변자명
	status varchar(20) DEFAULT 'PENDING'::character varying NOT NULL, -- 상태
	priority varchar(10) DEFAULT 'NORMAL'::character varying NULL, -- 우선순위
	category varchar(50) NULL,                -- 카테고리
	is_public bool DEFAULT true NOT NULL,     -- 공개여부
	view_count int4 DEFAULT 0 NOT NULL,       -- 조회수
	answered_at timestamp NULL,                -- 답변일시
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
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

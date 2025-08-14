-- public.submitted_reports definition

-- Drop table

-- DROP TABLE public.submitted_reports;

CREATE TABLE public.submitted_reports (
	submitted_report_id bigserial NOT NULL,
	year int4 NOT NULL, -- 연도
	quarter varchar(2) NOT NULL, -- 분기 (1Q,2Q,3Q,4Q)
	bank_cd varchar(100) NOT NULL, -- 기관 코드 (rm_submit_mgmt.bank_cd 기준)
	document_name varchar(255) NOT NULL, -- 문서명
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	CONSTRAINT submitted_reports_pkey PRIMARY KEY (submitted_report_id),
	CONSTRAINT submitted_reports_quarter_chk CHECK (quarter IN ('1Q','2Q','3Q','4Q')),
	CONSTRAINT submitted_reports_unique UNIQUE (year, quarter, bank_cd, document_name)
);

-- 인덱스
CREATE INDEX idx_submitted_reports_year_quarter ON public.submitted_reports(year, quarter);
CREATE INDEX idx_submitted_reports_bank_cd ON public.submitted_reports(bank_cd);
CREATE INDEX idx_submitted_reports_document_name ON public.submitted_reports(document_name);

-- 주석
COMMENT ON TABLE public.submitted_reports IS '제출 보고서 관리: 연도/분기/기관별 보고서 메타 정보';
COMMENT ON COLUMN public.submitted_reports.year IS '연도';
COMMENT ON COLUMN public.submitted_reports.quarter IS '분기 (1Q,2Q,3Q,4Q)';
COMMENT ON COLUMN public.submitted_reports.bank_cd IS '기관 코드';
COMMENT ON COLUMN public.submitted_reports.document_name IS '문서명';
COMMENT ON COLUMN public.submitted_reports.created_at IS '생성일시';
COMMENT ON COLUMN public.submitted_reports.updated_at IS '수정일시';



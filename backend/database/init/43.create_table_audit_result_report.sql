-- DROP TABLE public.audit_result_report cascade;

CREATE TABLE public.audit_result_report (
    audit_result_report_id bigserial NOT NULL,      -- 점검결과보고ID
    audit_prog_mngt_id bigint NOT NULL,             -- 점검계획관리ID    
    dept_cd varchar(100) NOT NULL,                  -- 결과보고 작성 부서
    emp_no varchar(100) NOT NULL,                   -- 결과보고 작성 부서장 사번
    audit_result_content text NULL,                 -- 부서장 종합의견
    emp_no_01 varchar(100) NULL,                    -- 1차 승인자 사번
    audit_result_content_01 text NULL,              -- 1차 승인자 종합의견
    emp_no_02 varchar(100) NULL,                    -- 2차 승인자 사번
    audit_result_content_02 text NULL,              -- 2차 승인자 종합의견
    req_memo text NULL,                             -- 점검항목 요구사항 
    created_id varchar(100) NULL, -- 생성자 ID
    updated_id varchar(100) NULL, -- 수정자 ID
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
    CONSTRAINT audit_result_report_pkey PRIMARY KEY (audit_result_report_id)
);
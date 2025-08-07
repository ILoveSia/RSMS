--31.create_table_audit_prog_mngt.sql
-- 점검계획관리 table
-- DROP TABLE public.audit_prog_mngt CASCADE;

CREATE TABLE public.audit_prog_mngt (
    audit_prog_mngt_id      bigserial           NOT NULL,       --점검계획관리ID 
    audit_prog_mngt_cd      varchar(100)        NOT NULL,       --점검계획코드(자동생성) 상태코드 아님
    ledger_orders_hod       int8                NOT NULL,       --부서장 원장차수
    audit_title             varchar(300)        NOT NULL,       --점검회차명
    audit_start_dt          date                NOT NULL,       --점검기간 start
    audit_end_dt            date                NOT NULL,       --점검기간 end
    audit_status_cd         varchar(100)        NULL,           --점검계획_진행상태 (점검신청 , 점검마감)
    audit_contents          varchar(1000)       NULL,           --비고
    created_id varchar(100)                     NULL,           -- 생성자 ID
    updated_id varchar(100)                     NULL,           -- 수정자 ID
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,      -- 생성일시
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,      -- 수정일시
    CONSTRAINT audit_prog_mngt_pkey PRIMARY KEY (audit_prog_mngt_id)
)

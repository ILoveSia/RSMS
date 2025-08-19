--32.create_table_audit_prog_mngt.sql
-- 점검계획관리상세 table
-- DROP TABLE public.audit_prog_mngt_detail CASCADE;
CREATE TABLE public.audit_prog_mngt_detail (
    audit_prog_mngt_detail_id       bigserial           NOT NULL,           -- 점검계획관리상세ID
    audit_prog_mngt_id              int8                NOT NULL,           -- 점검계획관리ID
    audit_prog_mngt_cd              varchar(100)        NOT NULL,           -- 점검계획코드
    hod_ic_item_id                  int8                NOT NULL,           -- 부서장 내부통제 항목 id
    audit_men_id                    varchar(100)        NULL,               -- 점검자 지정
    audit_result                    varchar(500)        NULL,               -- 점검 결과 작성
    audit_result_status_cd          varchar(30)         NULL,               -- 점검 결과 상태 코드 (진행중,적성,미흡,제외)
    before_audit_yn                 varchar(1)          NULL DEFAULT 'N',   -- 이전회차의 개선과제와 동일한 건 _ YN
    audit_detail_content           varchar(1000)       NULL,                -- 개선계획 세부내용
    audit_done_dt                   date                NULL,               -- 이행완료 예정일자
    audit_done_content              varchar(1000)       NULL,               -- 이행완료 내용
    imp_pl_status_cd                varchar(10) NULL,                       -- 개선계획상태코드(개선계획작성, 이행결과작성, 이행결과결재완료) PLAN_IMP
    responsibility_id               int8                NULL,               -- 책무id
    responsibility_detail_id        int8                NULL,               -- 책무상세id
    audit_final_result_yn           varchar(1)          NULL DEFAULT 'N',   -- 점검결과 최종 결과 여부
    created_id varchar(100)                             NULL,               -- 생성자 ID
    updated_id varchar(100)                             NULL,               -- 수정자 ID
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP    NULL,               -- 생성일시
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP    NULL,               -- 수정일시
    
    CONSTRAINT audit_prog_mngt_detail_pkey PRIMARY KEY (audit_prog_mngt_detail_id)
)

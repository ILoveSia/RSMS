--부서장 내부통제 항목 현황 테이블
--hod_ic_item

DROP TABLE public.hod_ic_item CASCADE;

CREATE TABLE public.hod_ic_item (
    hod_ic_item_id              bigserial               NOT NULL,               -- 부서장 내부통제 항목 id
    responsibility_id           int8                    NOT NULL,               -- 책무id
    responsibility_detail_id    int8                    NULL,                   -- 책무상세id
    ledger_orders               int8                    NULL,                   -- 책무번호(원장차수)
    ledger_orders_hod           int8                    NULL,                   -- 부서장책무번호(원장차수)
    order_status                varchar(20)             NULL,                   -- 책무상태코드
    approval_id                 int8                    NULL,                   -- 결재ID
    date_expired                date        DEFAULT '9999-12-31'::date NULL,    -- 만료일
    field_type_cd               varchar(10)             NULL,                   --항목구분 (부서공통항목, 부서고유항목) FIELD_TYPE
    role_type_cd                varchar(10)             NULL,                   --직무구분코드 (COM_ROLE_TYPE, UNI_ROLE_TYPE)
    dept_cd                     varchar(10)             NULL,                   --부서코드
    ic_task                     varchar(1000)           NULL,                   --내부통제업무
    measure_id                  varchar(100)            NULL,                   --조치활동ID 삭제예정
    measure_desc                varchar(1000)           NULL,                   --조치활동내용
    measure_type                varchar(1000)           NULL,                   --조치유형
    period_cd                   varchar(10)             NULL,                   --주기 (PERIOD)
    support_doc                 varchar(1000)           NULL,                   --관련근거
    check_period                varchar(10)             NULL,                   --점검시기(MONTH)
    check_way                   varchar(1000)           NULL,                   --점검방법
    proof_doc                   varchar(1000)           NULL,                   --증빙자료
    created_id                  VARCHAR(100)            NULL,
    updated_id                  VARCHAR(100)            NULL,
    created_at                  timestamptz DEFAULT CURRENT_TIMESTAMP NULL,      -- 생성일
    updated_at                  timestamptz DEFAULT CURRENT_TIMESTAMP NULL,      -- 수정일
    CONSTRAINT hod_ic_item_pkey PRIMARY KEY (hod_ic_item_id)
)

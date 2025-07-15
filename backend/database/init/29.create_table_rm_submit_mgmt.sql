--책무구조도 제출 관리
--rm_submit_mgmt

-- public.rm_submit_mgmt definition

-- Drop table

-- DROP TABLE public.rm_submit_mgmt;

CREATE TABLE public.rm_submit_mgmt (
    rm_submit_mgmt_id           bigserial               NOT NULL,               --책무구조도 제출 관리 id
    submit_hist_cd              VARCHAR(100)            NOT NULL,               --제출이력코드
    execofficer_id              int8                    NOT NULL,               --임원현황ID
    rm_submit_dt                date                    NULL,                   --책무구조도 제출일
    update_yn                   VARCHAR(1)              DEFAULT 'N',
    rm_submit_remarks           VARCHAR(1000)           NULL,                     --비고
    created_id                  VARCHAR(100)            NULL,
    updated_id                  VARCHAR(100)            NULL,
    created_at                  timestamptz DEFAULT CURRENT_TIMESTAMP NULL,      -- 생성일
    updated_at                  timestamptz DEFAULT CURRENT_TIMESTAMP NULL,      -- 수정일
    CONSTRAINT rm_submit_mgmt_pkey PRIMARY KEY (rm_submit_mgmt_id)
);

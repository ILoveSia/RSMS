-- public.common_code definition

-- Drop table

-- DROP TABLE public.common_code;

CREATE TABLE public.common_code (
	code varchar(50) NOT NULL, -- 코드
	group_code varchar(50) NOT NULL, -- 그룹코드
	code_name varchar(100) NOT NULL, -- 코드명
	created_at timestamp(6) NOT NULL, -- 생성일시
	description varchar(255) NULL, -- 설명
	sort_order int4 NOT NULL, -- 정렬순서
	updated_at timestamp(6) NOT NULL, -- 수정일시
	use_yn varchar(1) NOT NULL, -- 사용여부
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT common_code_pkey PRIMARY KEY (code, group_code)
);

-- public.api_permissions definition

-- Drop table

-- DROP TABLE public.api_permissions;

CREATE TABLE public.api_permissions (
	permission_id varchar(20) NOT NULL,   -- 권한ID
	api_pattern varchar(200) NOT NULL,    -- API패턴
	http_method varchar(10) NULL,         -- HTTP메서드
	permission_name varchar(100) NOT NULL, -- 권한명
	description varchar(500) NULL,         -- 설명
	is_public varchar(1) DEFAULT 'N'::bpchar NULL, -- 공개여부
	use_yn varchar(1) DEFAULT 'Y'::bpchar NULL, -- 사용여부
	created_id varchar(100) DEFAULT 'system'::character varying NULL, -- 생성자 ID
	updated_id varchar(100) DEFAULT 'system'::character varying NULL, -- 수정자 ID
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	CONSTRAINT api_permissions_is_public_check CHECK (((is_public)::bpchar = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
	CONSTRAINT api_permissions_pkey PRIMARY KEY (permission_id),
	CONSTRAINT api_permissions_use_yn_check CHECK (((use_yn)::bpchar = ANY (ARRAY['Y'::bpchar, 'N'::bpchar])))
);
CREATE INDEX idx_api_permissions_pattern ON public.api_permissions USING btree (api_pattern);
CREATE INDEX idx_api_permissions_public ON public.api_permissions USING btree (is_public);

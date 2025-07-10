-- public.api_permissions definition

-- Drop table

-- DROP TABLE public.api_permissions;

CREATE TABLE public.api_permissions (
	permission_id varchar(20) NOT NULL,
	api_pattern varchar(200) NOT NULL,
	http_method varchar(10) NULL,
	permission_name varchar(100) NOT NULL,
	description varchar(500) NULL,
	is_public varchar(1) DEFAULT 'N'::bpchar NULL,
	use_yn varchar(1) DEFAULT 'Y'::bpchar NULL,
	created_id varchar(100) DEFAULT 'system'::character varying NULL,
	updated_id varchar(100) DEFAULT 'system'::character varying NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT api_permissions_is_public_check CHECK (((is_public)::bpchar = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
	CONSTRAINT api_permissions_pkey PRIMARY KEY (permission_id),
	CONSTRAINT api_permissions_use_yn_check CHECK (((use_yn)::bpchar = ANY (ARRAY['Y'::bpchar, 'N'::bpchar])))
);
CREATE INDEX idx_api_permissions_pattern ON public.api_permissions USING btree (api_pattern);
CREATE INDEX idx_api_permissions_public ON public.api_permissions USING btree (is_public);

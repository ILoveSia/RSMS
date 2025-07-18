-- public.user_roles definition

-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles (
	user_id varchar(50) NOT NULL,    -- 사용자ID
	role_id varchar(20) NOT NULL,    -- 역할ID
	assigned_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- 부여일시
	assigned_by varchar(50) DEFAULT 'system'::character varying NULL, -- 부여자ID
	use_yn varchar(1) DEFAULT 'Y'::bpchar NULL, -- 사용여부
	CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
	CONSTRAINT user_roles_use_yn_check CHECK (((use_yn)::bpchar = ANY (ARRAY['Y'::bpchar, 'N'::bpchar]))),
	CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE
);
CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);

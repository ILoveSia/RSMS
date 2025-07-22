-- public.role_permissions definition

-- Drop table

-- DROP TABLE public.role_permissions CASCADE;

CREATE TABLE public.role_permissions (
	role_id varchar(20) NOT NULL, -- 역할ID
	permission_id varchar(20) NOT NULL, -- 권한ID
	granted_at timestamp DEFAULT CURRENT_TIMESTAMP NULL, -- 부여일시
	granted_by varchar(50) DEFAULT 'system'::character varying NULL, -- 부여자ID
	CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),    -- 역할ID와 권한ID를 기본키로 설정
	CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.api_permissions(permission_id) ON DELETE CASCADE,
	CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE
);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);

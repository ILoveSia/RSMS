-- public.role_permissions definition

-- Drop table

-- DROP TABLE public.role_permissions;

CREATE TABLE public.role_permissions (
	role_id varchar(20) NOT NULL,
	permission_id varchar(20) NOT NULL,
	granted_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	granted_by varchar(50) DEFAULT 'system'::character varying NULL,
	CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
	CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.api_permissions(permission_id) ON DELETE CASCADE,
	CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE
);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);

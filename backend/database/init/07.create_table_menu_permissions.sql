-- public.menu_permissions definition

-- Drop table

-- DROP TABLE public.menu_permissions;

CREATE TABLE public.menu_permissions (
	id bigserial NOT NULL,      -- 메뉴권한ID
	menu_id int8 NOT NULL,      -- 메뉴ID
	role_name varchar(50) NOT NULL, -- 역할명
	can_read bool DEFAULT false NOT NULL, -- 읽기권한
	can_write bool DEFAULT false NOT NULL, -- 쓰기권한
	can_delete bool DEFAULT false NOT NULL, -- 삭제권한
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT menu_permissions_pkey PRIMARY KEY (id),
	CONSTRAINT uk_menu_permission UNIQUE (menu_id, role_name),
	CONSTRAINT fk_menu_permission_menu FOREIGN KEY (menu_id) REFERENCES public.menus(id) ON DELETE CASCADE
);

-- Table Triggers

create trigger trigger_update_menu_permission_updated_at before
update
    on
    public.menu_permissions for each row execute function update_menu_updated_at();

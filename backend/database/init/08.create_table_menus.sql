-- public.menus definition

-- Drop table

-- DROP TABLE public.menus;

CREATE TABLE public.menus (
	id bigserial NOT NULL,
	menu_code varchar(50) NOT NULL,
	menu_name varchar(100) NOT NULL,
	menu_name_en varchar(100) NULL,
	parent_id int8 NULL,
	menu_level int4 DEFAULT 1 NOT NULL,
	sort_order int4 DEFAULT 0 NOT NULL,
	menu_url varchar(200) NULL,
	icon_class varchar(50) NULL,
	is_active bool DEFAULT true NOT NULL,
	is_visible bool DEFAULT true NOT NULL,
	description text NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT menus_menu_code_key UNIQUE (menu_code),
	CONSTRAINT menus_pkey PRIMARY KEY (id),
	CONSTRAINT fk_menu_parent FOREIGN KEY (parent_id) REFERENCES public.menus(id) ON DELETE CASCADE
);
CREATE INDEX idx_menus_menu_code ON public.menus USING btree (menu_code);
CREATE INDEX idx_menus_parent_id ON public.menus USING btree (parent_id);
CREATE INDEX idx_menus_sort_order ON public.menus USING btree (sort_order);

-- Table Triggers

create trigger trigger_update_menu_updated_at before
update
    on
    public.menus for each row execute function update_menu_updated_at();

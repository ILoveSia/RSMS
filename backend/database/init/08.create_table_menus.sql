-- public.menus definition

-- Drop table

-- DROP TABLE public.menus CASCADE;

CREATE TABLE public.menus (
	id bigserial NOT NULL, -- 메뉴ID
	menu_code varchar(50) NOT NULL, -- 메뉴코드
	menu_name varchar(100) NOT NULL, -- 메뉴명
	menu_name_en varchar(100) NULL, -- 메뉴명(영문)
	parent_id int8 NULL, -- 상위메뉴ID
	menu_level int4 DEFAULT 1 NOT NULL, -- 메뉴레벨
	sort_order int4 DEFAULT 0 NOT NULL, -- 정렬순서
	menu_url varchar(200) NULL, -- 메뉴URL
	icon_class varchar(50) NULL, -- 아이콘클래스
	is_active bool DEFAULT true NOT NULL, -- 활성여부
	is_visible bool DEFAULT true NOT NULL, -- 표시여부
	description text NULL, -- 설명
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT menus_menu_code_key UNIQUE (menu_code),
	CONSTRAINT menus_pkey PRIMARY KEY (id),
	CONSTRAINT fk_menu_parent FOREIGN KEY (parent_id) REFERENCES public.menus(id) ON DELETE CASCADE
);
CREATE INDEX idx_menus_menu_code ON public.menus USING btree (menu_code);
CREATE INDEX idx_menus_parent_id ON public.menus USING btree (parent_id);
CREATE INDEX idx_menus_sort_order ON public.menus USING btree (sort_order);

-- Table Triggers 생략 (update_menu_updated_at 함수 의존성 제거)

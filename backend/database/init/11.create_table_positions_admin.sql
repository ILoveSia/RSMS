-- public.positions_admin definition

-- Drop table

-- DROP TABLE public.positions_admin;

CREATE TABLE public.positions_admin (
	positions_admin_seq bigserial NOT NULL,
	positions_id int8 NOT NULL,
	positions_admin_id varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT positions_admin_pkey PRIMARY KEY (positions_admin_seq),
	CONSTRAINT fk_positions_admin_positions FOREIGN KEY (positions_id) REFERENCES public.positions(positions_id) ON DELETE CASCADE
);
CREATE INDEX idx_positions_admin_admin_id ON public.positions_admin USING btree (positions_admin_id);
CREATE INDEX idx_positions_admin_positions_id ON public.positions_admin USING btree (positions_id);

-- Table Triggers

create trigger update_positions_admin_updated_at before
update
    on
    public.positions_admin for each row execute function update_updated_at_column();

-- public.positions definition

-- Drop table

-- DROP TABLE public.positions;

CREATE TABLE public.positions (
	positions_id bigserial NOT NULL,
	ledger_order varchar(100) NULL,
	positions_nm varchar(200) NULL,
	approval_id int8 NULL,
	order_status varchar(20) NULL,
	write_dept_cd varchar(10) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT positions_pkey PRIMARY KEY (positions_id)
);
CREATE INDEX idx_positions_ledger_order ON public.positions USING btree (ledger_order);
CREATE INDEX idx_positions_order_status ON public.positions USING btree (order_status);
CREATE INDEX idx_positions_write_dept_cd ON public.positions USING btree (write_dept_cd);

-- Table Triggers

create trigger update_positions_updated_at before
update
    on
    public.positions for each row execute function update_updated_at_column();

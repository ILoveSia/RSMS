-- public.responsibility definition

-- Drop table

-- DROP TABLE public.responsibility;

CREATE TABLE public.responsibility (
	responsibility_id bigserial NOT NULL,
	responsibility_content text NULL,
  ledger_order varchar(100) NULL,
	appr_stat_cd varchar(10) NULL,
	order_status varchar(20) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT responsibility_pkey PRIMARY KEY (responsibility_id)
);

-- Table Triggers

create trigger update_responsibility_updated_at before
update
    on
    public.responsibility for each row execute function update_updated_at_column();

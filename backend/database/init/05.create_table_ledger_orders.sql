-- public.ledger_orders definition

-- Drop table

-- DROP TABLE public.ledger_orders;

CREATE TABLE public.ledger_orders (
	ledger_orders_id bigserial NOT NULL,
	ledger_orders_title varchar(300) NULL,
	ledger_orders_status_cd varchar(2) NULL,
	ledger_orders_conf_cd varchar(2) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT ledger_orders_pkey PRIMARY KEY (ledger_orders_id)
);

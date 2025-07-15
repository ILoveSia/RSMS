-- public.ledger_orders definition

-- Drop table

-- DROP TABLE public.ledger_orders;

CREATE TABLE public.ledger_orders (
	ledger_orders_id bigserial NOT NULL, -- 원장차수ID
	ledger_orders_title varchar(300) NULL, -- 원장차수제목
	ledger_orders_status_cd varchar(2) NULL, -- 원장차수상태코드
	ledger_orders_conf_cd varchar(2) NULL, -- 원장차수확정코드
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자 ID
	updated_id varchar(100) NULL, -- 수정자 ID
	CONSTRAINT ledger_orders_pkey PRIMARY KEY (ledger_orders_id)
);

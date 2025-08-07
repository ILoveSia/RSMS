-- public.ledger_orders_hod definition

-- Drop table

-- DROP TABLE public.ledger_orders_hod;

CREATE TABLE public.ledger_orders_hod (
	ledger_orders_id 				int8 			NOT NULL, 					-- 원장차수ID
	ledger_orders_hod_id 			bigserial 		NOT NULL, 					-- 부서장장원장차수ID
	ledger_orders_hod_title 		varchar(300) 	NULL, 						-- 원장차수제목
    ledger_orders_hod_field_type_cd varchar(2) 		NULL, 						-- 원장차수필드타입코드
	ledger_orders_hod_status_cd 	varchar(2) 		NULL, 						-- 원장차수진행상태코드
	ledger_orders_hod_conf_cd 		varchar(2) 		NULL, 						-- 원장차수확정코드
	created_at 						timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at 						timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	created_id 						varchar(100) NULL, -- 생성자 ID
	updated_id 						varchar(100) NULL, -- 수정자 ID
	CONSTRAINT ledger_orders_hod_pkey PRIMARY KEY (ledger_orders_id, ledger_orders_hod_id)
);

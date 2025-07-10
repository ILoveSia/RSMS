-- public.positions_meeting definition

-- Drop table

-- DROP TABLE public.positions_meeting;

CREATE TABLE public.positions_meeting (
	positions_meeting_id bigserial NOT NULL,
	positions_id int8 NOT NULL,
	meeting_body_id varchar(100) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT positions_meeting_pkey PRIMARY KEY (positions_meeting_id),
	CONSTRAINT fk_positions FOREIGN KEY (positions_id) REFERENCES public.positions(positions_id) ON DELETE CASCADE,
	CONSTRAINT fknjjnb40fdh90k2gdh80qnoqo8 FOREIGN KEY (meeting_body_id) REFERENCES public.meeting_body(meeting_body_id)
);

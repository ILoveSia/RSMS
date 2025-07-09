-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id varchar(100) NOT NULL,
	username varchar(50) NOT NULL,
	email varchar(100) NOT NULL,
	address varchar(255) NOT NULL,
	mobile varchar(20) NOT NULL,
	"password" varchar(255) NOT NULL,
	dept_cd varchar(100) NULL,
	num varchar(100) NULL,
	job_rank_cd varchar(100) NULL,
	job_title_cd varchar(100) NULL,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
	created_id varchar(100) NULL,
	updated_id varchar(100) NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username)
);
CREATE INDEX idx_users_dept_cd ON public.users USING btree (dept_cd);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_username ON public.users USING btree (username);

-- Table Triggers

create trigger update_users_updated_at before
update
    on
    public.users for each row execute function update_updated_at_column();

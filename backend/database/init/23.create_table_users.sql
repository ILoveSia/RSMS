-- public.users definition

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id varchar(100) NOT NULL, -- 사용자ID
	emp_no varchar(20) NULL, -- 사번
	--username varchar(50) NOT NULL, -- 사용자명
	"password" varchar(255) NOT NULL, -- 비밀번호
	--dept_cd varchar(100) NULL, -- 부서코드
	--num varchar(100) NULL, -- 사번
	--job_rank_cd varchar(100) NULL, -- 직급코드
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 생성일시
	updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL, -- 수정일시
	created_id varchar(100) NULL, -- 생성자ID
	updated_id varchar(100) NULL, -- 수정자ID
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

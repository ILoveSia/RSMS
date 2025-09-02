CREATE TABLE IF NOT EXISTS employee (
    emp_no VARCHAR(20) PRIMARY KEY,
    emp_name VARCHAR(50) NOT NULL,
    dept_code VARCHAR(20),
    dept_name VARCHAR(100),
    position_code VARCHAR(20),
    position_name VARCHAR(50),
    email VARCHAR(100),
    phone_no VARCHAR(20),
    use_yn VARCHAR(1) NOT NULL DEFAULT 'Y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_id VARCHAR(50) DEFAULT 'SYSTEM',
    updated_id VARCHAR(50) DEFAULT 'SYSTEM',
    job_rank_cd VARCHAR(100) --common_code.group_code = JOB_RANK 직급코드
);

-- 직원 테이블 생성 (존재하지 않는 경우)
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
    updated_id VARCHAR(50) DEFAULT 'SYSTEM'
);

-- 샘플 직원 데이터 삽입
INSERT INTO employee (emp_no, emp_name, dept_code, dept_name, position_code, position_name, email, phone_no, use_yn)
VALUES 
    ('EMP001', '김철수', 'D001', '리스크관리부', 'P003', '과장', 'kim.cs@bank.com', '02-1234-5678', 'Y'),
    ('EMP002', '김영희', 'D002', '내부통제부', 'P004', '차장', 'kim.yh@bank.com', '02-1234-5679', 'Y'),
    ('EMP003', '김민수', 'D003', '준법감시부', 'P002', '대리', 'kim.ms@bank.com', '02-1234-5680', 'Y'),
    ('EMP004', '이수진', 'D001', '리스크관리부', 'P005', '부장', 'lee.sj@bank.com', '02-1234-5681', 'Y'),
    ('EMP005', '박진우', 'D004', '감사부', 'P003', '과장', 'park.jw@bank.com', '02-1234-5682', 'Y'),
    ('EMP006', '최미연', 'D002', '내부통제부', 'P002', '대리', 'choi.my@bank.com', '02-1234-5683', 'Y'),
    ('EMP007', '장동혁', 'D005', '컴플라이언스부', 'P004', '차장', 'jang.dh@bank.com', '02-1234-5684', 'Y'),
    ('EMP008', '윤서영', 'D003', '준법감시부', 'P003', '과장', 'yoon.sy@bank.com', '02-1234-5685', 'Y'),
    ('EMP009', '강태윤', 'D006', '신용위험부', 'P002', '대리', 'kang.ty@bank.com', '02-1234-5686', 'Y'),
    ('EMP010', '정하늘', 'D007', '운영위험부', 'P003', '과장', 'jung.hn@bank.com', '02-1234-5687', 'Y')
ON CONFLICT (emp_no) DO NOTHING;
-- 부서장 내부통제 업무메뉴얼 관리 테이블
-- internal_control_manuals

DROP TABLE IF EXISTS public.internal_control_manuals CASCADE;

CREATE TABLE public.internal_control_manuals (
    manual_id BIGSERIAL PRIMARY KEY,
    dept_cd VARCHAR(10) NOT NULL,                   -- 부서코드
    
    -- 메뉴얼 정보
    manual_title VARCHAR(200) NOT NULL,             -- 메뉴얼 제목
    manual_version VARCHAR(20) DEFAULT '1.0',       -- 메뉴얼 버전
    manual_content TEXT,                            -- 메뉴얼 내용
    
    -- 유효 기간
    effective_date DATE,                            -- 시행일
    expiry_date DATE DEFAULT '9999-12-31',          -- 만료일
    
    -- 담당자 정보
    author_emp_no VARCHAR(20),                      -- 작성자 사번
    
    -- 감사 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_id VARCHAR(100),
    updated_id VARCHAR(100)
    
);

-- 인덱스 생성
CREATE INDEX idx_internal_control_manuals_dept_cd ON public.internal_control_manuals(dept_cd);
CREATE INDEX idx_internal_control_manuals_author ON public.internal_control_manuals(author_emp_no);
CREATE INDEX idx_internal_control_manuals_effective ON public.internal_control_manuals(effective_date, expiry_date);

-- 트리거 생성
CREATE TRIGGER update_internal_control_manuals_updated_at 
    BEFORE UPDATE ON public.internal_control_manuals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트
COMMENT ON TABLE public.internal_control_manuals IS '부서장 내부통제 업무메뉴얼 관리 테이블';
COMMENT ON COLUMN public.internal_control_manuals.dept_cd IS '부서코드';
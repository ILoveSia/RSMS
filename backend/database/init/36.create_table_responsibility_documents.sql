-- 책무기술서 관리 테이블
-- responsibility_documents

DROP TABLE IF EXISTS public.responsibility_documents CASCADE;

CREATE TABLE public.responsibility_documents (
    document_id BIGSERIAL PRIMARY KEY,
    -- 문서 정보
    document_title VARCHAR(200) NOT NULL,           -- 문서 제목
    document_version VARCHAR(20) DEFAULT '1.0',     -- 문서 버전
    document_content TEXT,                          -- 문서 내용
    
    -- 유효 기간
    effective_date DATE,                            -- 시행일
    expiry_date DATE DEFAULT '9999-12-31',          -- 만료일
    
    -- 담당자 정보
    author_emp_no VARCHAR(20),                      -- 작성자 사번
 
    
    -- 감사 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_id VARCHAR(100),
    updated_id VARCHAR(100),
    
    -- 제약 조건
    CONSTRAINT chk_responsibility_documents_status CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'))
);

-- 인덱스 생성
CREATE INDEX idx_responsibility_documents_author ON public.responsibility_documents(author_emp_no);
CREATE INDEX idx_responsibility_documents_effective ON public.responsibility_documents(effective_date, expiry_date);
CREATE INDEX idx_responsibility_documents_version ON public.responsibility_documents(document_title, document_version);

-- 트리거 생성
CREATE TRIGGER update_responsibility_documents_updated_at 
    BEFORE UPDATE ON public.responsibility_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트
COMMENT ON TABLE public.responsibility_documents IS '책무기술서 관리 테이블';
COMMENT ON COLUMN public.responsibility_documents.document_version IS '문서 버전 (예: 1.0, 1.1, 2.0)';
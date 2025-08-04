-- 부서장 내부통제 업무메뉴얼 관리 테이블
-- internal_control_manuals

DROP TABLE IF EXISTS public.internal_control_manuals CASCADE;

CREATE TABLE public.internal_control_manuals (
    manual_id BIGSERIAL PRIMARY KEY,
    dept_cd VARCHAR(10) NOT NULL,                   -- 부서코드
    hod_ic_item_id BIGINT,                          -- hod_ic_item.hod_ic_item_id FK (선택)
    
    -- 메뉴얼 정보
    manual_title VARCHAR(200) NOT NULL,             -- 메뉴얼 제목
    manual_version VARCHAR(20) DEFAULT '1.0',       -- 메뉴얼 버전
    manual_description TEXT,                        -- 메뉴얼 설명
    manual_content TEXT,                            -- 메뉴얼 내용
    
    -- 분류 정보
    manual_category VARCHAR(50),                    -- 메뉴얼 분류
    ic_task_category VARCHAR(100),                  -- 내부통제 업무 분류
    
    -- 상태 관리
    status VARCHAR(20) DEFAULT 'DRAFT' NOT NULL,    -- 상태 (DRAFT, REVIEW, APPROVED, PUBLISHED)
    approval_id BIGINT,                             -- 승인 ID
    
    -- 유효 기간
    effective_date DATE,                            -- 시행일
    expiry_date DATE DEFAULT '9999-12-31',          -- 만료일
    review_cycle_months INTEGER DEFAULT 12,         -- 검토 주기 (월)
    next_review_date DATE,                          -- 차기 검토일
    
    -- 담당자 정보
    author_emp_no VARCHAR(20),                      -- 작성자 사번
    hod_emp_no VARCHAR(20),                         -- 부서장 사번
    
    -- 감사 필드
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_id VARCHAR(100),
    updated_id VARCHAR(100),
    
    -- 제약 조건
    CONSTRAINT chk_internal_control_manuals_status CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED')),
    CONSTRAINT chk_internal_control_manuals_review_cycle CHECK (review_cycle_months > 0 AND review_cycle_months <= 60),
    CONSTRAINT fk_internal_control_manuals_hod_ic_item FOREIGN KEY (hod_ic_item_id) REFERENCES hod_ic_item(hod_ic_item_id) ON DELETE SET NULL
);

-- 인덱스 생성
CREATE INDEX idx_internal_control_manuals_dept_cd ON public.internal_control_manuals(dept_cd);
CREATE INDEX idx_internal_control_manuals_hod_ic_item_id ON public.internal_control_manuals(hod_ic_item_id);
CREATE INDEX idx_internal_control_manuals_status ON public.internal_control_manuals(status);
CREATE INDEX idx_internal_control_manuals_category ON public.internal_control_manuals(manual_category);
CREATE INDEX idx_internal_control_manuals_author ON public.internal_control_manuals(author_emp_no);
CREATE INDEX idx_internal_control_manuals_hod ON public.internal_control_manuals(hod_emp_no);
CREATE INDEX idx_internal_control_manuals_effective ON public.internal_control_manuals(effective_date, expiry_date);
CREATE INDEX idx_internal_control_manuals_review ON public.internal_control_manuals(next_review_date);

-- 트리거 생성
CREATE TRIGGER update_internal_control_manuals_updated_at 
    BEFORE UPDATE ON public.internal_control_manuals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 테이블 코멘트
COMMENT ON TABLE public.internal_control_manuals IS '부서장 내부통제 업무메뉴얼 관리 테이블';
COMMENT ON COLUMN public.internal_control_manuals.dept_cd IS '부서코드';
COMMENT ON COLUMN public.internal_control_manuals.hod_ic_item_id IS '부서장 내부통제 항목 ID (hod_ic_item 테이블 FK, 선택)';
COMMENT ON COLUMN public.internal_control_manuals.status IS '상태 (DRAFT: 초안, REVIEW: 검토중, APPROVED: 승인완료, PUBLISHED: 발행완료)';
COMMENT ON COLUMN public.internal_control_manuals.manual_category IS '메뉴얼 분류 (예: 리스크관리, 준법감시, 자금세탁방지 등)';
COMMENT ON COLUMN public.internal_control_manuals.ic_task_category IS '내부통제 업무 분류';
COMMENT ON COLUMN public.internal_control_manuals.review_cycle_months IS '검토 주기 (월 단위, 1-60개월)';
COMMENT ON COLUMN public.internal_control_manuals.next_review_date IS '차기 검토 예정일';
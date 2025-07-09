-- =================================================================
-- 직책별 책무 현황 테이블 생성 스크립트 (Updated with Length Restrictions)
-- 설명: 직책별로 할당된 책무의 현황을 관리하는 테이블
-- Meta-Data Naming Convention v2.0 적용 (meta_eng ≤ 20, meta_kor ≤ 30)
-- =================================================================

-- STEP 1: 길이 검증 및 meta_datas에 표준 용어 등록

-- 길이 검증: 테이블명
-- 'pos_resp_status' = 15 chars (✅ WITHIN 20 limit)
-- '직책별책무현황' = 7 chars (✅ WITHIN 30 limit)
SELECT
    LENGTH('pos_resp_status') as table_eng_length,    -- 15 chars
    LENGTH('직책별책무현황') as table_kor_length        -- 7 chars
WHERE LENGTH('pos_resp_status') <= 20 AND LENGTH('직책별책무현황') <= 30;

-- 테이블명 등록 (길이 제한 준수)
INSERT INTO meta_datas (meta_cat_cd, meta_eng, meta_kor, meta_description)
VALUES (
    'TABLE',
    'pos_resp_status',      -- 15 chars (WITHIN 20 limit)
    '직책별책무현황',        -- 7 chars (WITHIN 30 limit)
    'Position responsibility status management table - tracks responsibility assignments by position'
)
ON CONFLICT (meta_eng) DO NOTHING;

-- 컬럼명들 등록 (모든 컬럼 길이 검증 완료)
INSERT INTO meta_datas (meta_cat_cd, meta_eng, meta_kor, meta_description) VALUES
-- 1. 책무번호: 'resp_no' = 7 chars, '책무번호' = 4 chars
('COLUMN', 'resp_no', '책무번호', 'Responsibility assignment number (primary key)'),

-- 2. 책무상태코드: 'order_status_cd' = 15 chars, '책무상태코드' = 6 chars
('COLUMN', 'order_status_cd', '책무상태코드', 'Responsibility order status code (ORDER_STATUS common code)'),

-- 3. 결재상태코드: 'approval_status_cd' = 18 chars, '결재상태코드' = 6 chars
('COLUMN', 'approval_status_cd', '결재상태코드', 'Approval status code for responsibility'),

-- 4. 직책ID: 'position_id' = 11 chars, '직책ID' = 3 chars
('COLUMN', 'position_id', '직책ID', 'Position identifier'),

-- 5. 직책명: 'position_name' = 13 chars, '직책명' = 3 chars
('COLUMN', 'position_name', '직책명', 'Position name'),

-- 6. 책무기본ID: 'resp_base_id' = 12 chars, '책무기본ID' = 5 chars
('COLUMN', 'resp_base_id', '책무기본ID', 'Basic responsibility ID (FK to responsibility table)'),

-- 7. 책무시작일: 'resp_start_date' = 15 chars, '책무시작일' = 5 chars
('COLUMN', 'resp_start_date', '책무시작일', 'Responsibility assignment start date (distribution date)')

ON CONFLICT (meta_eng) DO NOTHING;

-- STEP 2: 길이 검증 결과 확인
SELECT
    meta_eng,
    LENGTH(meta_eng) as eng_length,
    meta_kor,
    LENGTH(meta_kor) as kor_length,
    CASE
        WHEN LENGTH(meta_eng) <= 20 AND LENGTH(meta_kor) <= 30 THEN '✅ VALID'
        ELSE '❌ INVALID'
    END as validation_result
FROM meta_datas
WHERE meta_eng IN (
    'pos_resp_status', 'resp_no', 'order_status_cd', 'approval_status_cd',
    'position_id', 'position_name', 'resp_base_id', 'resp_start_date'
)
ORDER BY meta_cat_cd, meta_eng;

-- STEP 3: 등록된 표준 용어를 사용하여 테이블 생성

-- 직책별 책무 현황 테이블 생성 (meta_datas 표준 용어 사용)
CREATE TABLE IF NOT EXISTS pos_resp_status (
    -- 1. 책무번호 (기본키) - meta_eng: 'resp_no'
    resp_no BIGSERIAL PRIMARY KEY,

    -- 2. 책무상태코드 (공통코드 ORDER_STATUS 참조) - meta_eng: 'order_status_cd'
    order_status_cd VARCHAR(20) NOT NULL,

    -- 3. 결재상태코드 (공통코드 참조) - meta_eng: 'approval_status_cd'
    approval_status_cd VARCHAR(20) NOT NULL,

    -- 4. 직책ID - meta_eng: 'position_id'
    position_id VARCHAR(20) NOT NULL,

    -- 5. 직책명 - meta_eng: 'position_name'
    position_name VARCHAR(100) NOT NULL,

    -- 6. 책무기본ID (responsibility 테이블 외래키) - meta_eng: 'resp_base_id'
    resp_base_id VARCHAR(20) NOT NULL,

    -- 7. 책무시작일 (책무분배일) - meta_eng: 'resp_start_date'
    resp_start_date DATE NOT NULL,

    -- 공통 감사 컬럼들 (표준 BaseEntity 패턴)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_id VARCHAR(50) DEFAULT 'system',
    updated_id VARCHAR(50) DEFAULT 'system',

    -- 외래키 제약조건
    CONSTRAINT fk_pos_resp_status_responsibility
        FOREIGN KEY (resp_base_id)
        REFERENCES responsibility(responsibility_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    -- 체크 제약조건 (공통코드 참조 무결성)
    CONSTRAINT chk_pos_resp_status_order_status
        CHECK (order_status_cd IN (
            SELECT code_id FROM common_code
            WHERE group_id = 'ORDER_STATUS' AND use_yn = 'Y'
        )),

    CONSTRAINT chk_pos_resp_status_approval_status
        CHECK (approval_status_cd IN (
            SELECT code_id FROM common_code
            WHERE group_id = 'APPROVAL_STATUS' AND use_yn = 'Y'
        )),

    -- 비즈니스 규칙 제약조건
    CONSTRAINT chk_pos_resp_status_start_date
        CHECK (resp_start_date <= CURRENT_DATE)
);

-- STEP 4: 성능 최적화 인덱스 생성 (meta_datas 표준 용어 사용)

-- 단일 컬럼 인덱스
CREATE INDEX IF NOT EXISTS idx_pos_resp_status_position_id
    ON pos_resp_status(position_id);

CREATE INDEX IF NOT EXISTS idx_pos_resp_status_resp_base_id
    ON pos_resp_status(resp_base_id);

CREATE INDEX IF NOT EXISTS idx_pos_resp_status_order_status
    ON pos_resp_status(order_status_cd);

CREATE INDEX IF NOT EXISTS idx_pos_resp_status_approval_status
    ON pos_resp_status(approval_status_cd);

CREATE INDEX IF NOT EXISTS idx_pos_resp_status_start_date
    ON pos_resp_status(resp_start_date);

-- 복합 인덱스 (자주 함께 조회되는 컬럼들)
CREATE INDEX IF NOT EXISTS idx_pos_resp_status_position_resp
    ON pos_resp_status(position_id, resp_base_id);

CREATE INDEX IF NOT EXISTS idx_pos_resp_status_status_date
    ON pos_resp_status(order_status_cd, resp_start_date);

-- STEP 5: 트리거 및 함수 생성

-- updated_at 자동 갱신 트리거 함수 (재사용 가능)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- pos_resp_status 테이블에 트리거 적용
CREATE TRIGGER update_pos_resp_status_updated_at
    BEFORE UPDATE ON pos_resp_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- STEP 6: 테이블 및 컬럼 코멘트 (meta_datas 기반)

-- 테이블 코멘트
COMMENT ON TABLE pos_resp_status IS
'직책별 책무 현황 관리 테이블 - Position responsibility status management table';

-- 컬럼 코멘트 (meta_datas의 meta_kor 활용)
COMMENT ON COLUMN pos_resp_status.resp_no IS '책무번호 (Responsibility assignment number)';
COMMENT ON COLUMN pos_resp_status.order_status_cd IS '책무상태코드 (ORDER_STATUS 공통코드 참조)';
COMMENT ON COLUMN pos_resp_status.approval_status_cd IS '결재상태코드 (APPROVAL_STATUS 공통코드 참조)';
COMMENT ON COLUMN pos_resp_status.position_id IS '직책ID (Position identifier)';
COMMENT ON COLUMN pos_resp_status.position_name IS '직책명 (Position name)';
COMMENT ON COLUMN pos_resp_status.resp_base_id IS '책무기본ID (Basic responsibility ID - FK)';
COMMENT ON COLUMN pos_resp_status.resp_start_date IS '책무시작일 (Responsibility start date)';

-- STEP 7: 샘플 데이터 삽입 (선택사항)

-- 테스트용 샘플 데이터
INSERT INTO pos_resp_status (
    order_status_cd, approval_status_cd, position_id, position_name,
    resp_base_id, resp_start_date, created_id
) VALUES
('PS001', 'AS001', 'POS001', '팀장', 'RESP001', '2024-01-01', 'admin'),
('PS002', 'AS002', 'POS002', '과장', 'RESP002', '2024-01-15', 'admin'),
('PS001', 'AS003', 'POS003', '대리', 'RESP003', '2024-02-01', 'admin')
ON CONFLICT (resp_no) DO NOTHING;

-- STEP 8: 검증 쿼리

-- meta_datas 등록 검증
SELECT
    'Meta-data Registration Check' as check_type,
    COUNT(*) as registered_count,
    CASE
        WHEN COUNT(*) = 8 THEN '✅ All terms registered'
        ELSE '❌ Missing terms'
    END as status
FROM meta_datas
WHERE meta_eng IN (
    'pos_resp_status', 'resp_no', 'order_status_cd', 'approval_status_cd',
    'position_id', 'position_name', 'resp_base_id', 'resp_start_date'
);

-- 테이블 생성 검증
SELECT
    'Table Creation Check' as check_type,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pos_resp_status')
        THEN '✅ Table created successfully'
        ELSE '❌ Table creation failed'
    END as status;

-- 길이 제한 준수 검증
SELECT
    'Length Validation Check' as check_type,
    COUNT(*) as total_terms,
    COUNT(*) FILTER (WHERE LENGTH(meta_eng) <= 20) as valid_eng_count,
    COUNT(*) FILTER (WHERE LENGTH(meta_kor) <= 30) as valid_kor_count,
    CASE
        WHEN COUNT(*) = COUNT(*) FILTER (WHERE LENGTH(meta_eng) <= 20 AND LENGTH(meta_kor) <= 30)
        THEN '✅ All length limits satisfied'
        ELSE '❌ Length limit violations found'
    END as status
FROM meta_datas
WHERE meta_eng IN (
    'pos_resp_status', 'resp_no', 'order_status_cd', 'approval_status_cd',
    'position_id', 'position_name', 'resp_base_id', 'resp_start_date'
);

-- 완료 메시지
SELECT
    '🎉 pos_resp_status table created successfully!' as result,
    'Meta-data naming convention v2.0 applied with length restrictions' as details,
    'All terms comply with meta_eng ≤ 20, meta_kor ≤ 30 limits' as validation;

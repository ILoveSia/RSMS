-- Q&A 테이블 생성
CREATE TABLE IF NOT EXISTS qna (
    id BIGSERIAL PRIMARY KEY,
    department VARCHAR(100) NOT NULL COMMENT '담당업무/부서',
    title VARCHAR(500) NOT NULL COMMENT '제목/질문내용',
    content TEXT COMMENT '상세 질문 내용',
    questioner_id VARCHAR(100) NOT NULL COMMENT '질문자 ID',
    questioner_name VARCHAR(100) NOT NULL COMMENT '질문자 이름',
    answer_content TEXT COMMENT '답변 내용',
    answerer_id VARCHAR(100) COMMENT '답변자 ID',
    answerer_name VARCHAR(100) COMMENT '답변자 이름',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '상태 (PENDING: 답변대기, ANSWERED: 답변완료, CLOSED: 종료)',
    priority VARCHAR(10) DEFAULT 'NORMAL' COMMENT '우선순위 (HIGH: 높음, NORMAL: 보통, LOW: 낮음)',
    category VARCHAR(50) COMMENT '카테고리',
    is_public BOOLEAN NOT NULL DEFAULT true COMMENT '공개여부',
    view_count INTEGER NOT NULL DEFAULT 0 COMMENT '조회수',
    answered_at TIMESTAMP WITH TIME ZONE COMMENT '답변일시',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_qna_questioner FOREIGN KEY (questioner_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_qna_answerer FOREIGN KEY (answerer_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_qna_status CHECK (status IN ('PENDING', 'ANSWERED', 'CLOSED')),
    CONSTRAINT chk_qna_priority CHECK (priority IN ('HIGH', 'NORMAL', 'LOW'))
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_qna_department ON qna(department);
CREATE INDEX IF NOT EXISTS idx_qna_questioner_id ON qna(questioner_id);
CREATE INDEX IF NOT EXISTS idx_qna_answerer_id ON qna(answerer_id);
CREATE INDEX IF NOT EXISTS idx_qna_status ON qna(status);
CREATE INDEX IF NOT EXISTS idx_qna_created_at ON qna(created_at);
CREATE INDEX IF NOT EXISTS idx_qna_category ON qna(category);
CREATE INDEX IF NOT EXISTS idx_qna_priority ON qna(priority);

-- Q&A 첨부파일 테이블 생성
CREATE TABLE IF NOT EXISTS qna_attachments (
    id BIGSERIAL PRIMARY KEY,
    qna_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    stored_filename VARCHAR(255) NOT NULL COMMENT '저장된 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '파일 경로',
    file_size BIGINT NOT NULL COMMENT '파일 크기(bytes)',
    content_type VARCHAR(100) COMMENT '파일 타입',
    uploaded_by VARCHAR(100) NOT NULL COMMENT '업로드한 사용자 ID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_qna_attachment_qna FOREIGN KEY (qna_id) REFERENCES qna(id) ON DELETE CASCADE,
    CONSTRAINT fk_qna_attachment_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 첨부파일 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_qna_attachments_qna_id ON qna_attachments(qna_id);
CREATE INDEX IF NOT EXISTS idx_qna_attachments_uploaded_by ON qna_attachments(uploaded_by);

-- Q&A 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_qna_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_qna_updated_at ON qna;
CREATE TRIGGER trigger_update_qna_updated_at
    BEFORE UPDATE ON qna
    FOR EACH ROW
    EXECUTE FUNCTION update_qna_updated_at();

-- 답변 완료 시 answered_at 자동 설정 트리거
CREATE OR REPLACE FUNCTION update_qna_answered_at()
RETURNS TRIGGER AS $$
BEGIN
    -- 상태가 ANSWERED로 변경되고 답변 내용이 있을 때
    IF NEW.status = 'ANSWERED' AND NEW.answer_content IS NOT NULL AND OLD.answered_at IS NULL THEN
        NEW.answered_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_qna_answered_at ON qna;
CREATE TRIGGER trigger_update_qna_answered_at
    BEFORE UPDATE ON qna
    FOR EACH ROW
    EXECUTE FUNCTION update_qna_answered_at();

-- 초기 샘플 데이터 삽입
INSERT INTO qna (department, title, content, questioner_id, questioner_name, category, priority) VALUES
('단말업무', '부서장 내부통제 점검 관리 업무 수행을 위한 시간이 소요되며, KPI와 같은 보상 방안이 존재하나요?', 
 '내부통제 점검 업무가 추가 업무로 인식되어 부담스럽습니다. 이에 대한 보상 체계나 인센티브가 있는지 궁금합니다.', 
 'admin', '김○○', '업무프로세스', 'NORMAL'),

('단말업무', '부서장 내부통제 점검 관리를 하지 않을 경우 사내 패널티 받는건가요?', 
 '내부통제 점검을 소홀히 할 경우 어떤 제재나 패널티가 있는지 알고 싶습니다.', 
 'testuser', '이○○', '규정/제재', 'HIGH'),

('단말업무', '부서장 내부통제 점검 관리를 하지 않을 경우 사내 패널티 받는건가요?', 
 '점검 업무를 제대로 수행하지 않았을 때의 후속 조치에 대해 문의드립니다.', 
 'admin', '박○○', '규정/제재', 'NORMAL'),

('단말업무', '부서장 내부통제 점검 관리를 하지 않을 경우 사내 패널티 받는건가요?', 
 '내부통제 점검 미이행 시 발생할 수 있는 문제점과 대응방안을 알고 싶습니다.', 
 'testuser', '이○○', '규정/제재', 'NORMAL');

-- Q&A 통계 조회용 뷰 생성
CREATE OR REPLACE VIEW v_qna_statistics AS
SELECT 
    department,
    COUNT(*) as total_count,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'ANSWERED' THEN 1 END) as answered_count,
    COUNT(CASE WHEN status = 'CLOSED' THEN 1 END) as closed_count,
    ROUND(
        COUNT(CASE WHEN status = 'ANSWERED' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as answer_rate,
    AVG(
        CASE WHEN answered_at IS NOT NULL AND created_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (answered_at - created_at)) / 3600 
        END
    ) as avg_response_hours
FROM qna
GROUP BY department;

-- 월별 Q&A 현황 조회용 뷰
CREATE OR REPLACE VIEW v_qna_monthly_stats AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    department,
    COUNT(*) as question_count,
    COUNT(CASE WHEN status = 'ANSWERED' THEN 1 END) as answered_count,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count
FROM qna
GROUP BY DATE_TRUNC('month', created_at), department
ORDER BY month DESC, department;

-- 사용자별 Q&A 활동 조회용 뷰
CREATE OR REPLACE VIEW v_qna_user_activity AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(q1.id) as question_count,
    COUNT(q2.id) as answer_count,
    MAX(q1.created_at) as last_question_date,
    MAX(q2.answered_at) as last_answer_date
FROM users u
LEFT JOIN qna q1 ON u.id = q1.questioner_id
LEFT JOIN qna q2 ON u.id = q2.answerer_id
GROUP BY u.id, u.username;

-- 데이터 확인용 쿼리 (주석)
/*
-- Q&A 목록 조회 (페이징)
SELECT 
    id,
    department,
    title,
    questioner_name,
    status,
    created_at,
    view_count
FROM qna 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;

-- 부서별 Q&A 통계
SELECT * FROM v_qna_statistics ORDER BY total_count DESC;

-- 월별 Q&A 현황
SELECT * FROM v_qna_monthly_stats WHERE month >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months');

-- 사용자별 활동 현황
SELECT * FROM v_qna_user_activity WHERE question_count > 0 OR answer_count > 0;
*/
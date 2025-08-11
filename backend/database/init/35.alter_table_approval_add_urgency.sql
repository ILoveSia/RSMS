-- approval 테이블에 긴급도 컬럼 추가

-- 긴급도 컬럼 추가
ALTER TABLE public.approval 
ADD COLUMN urgency_cd varchar(20) DEFAULT 'NORMAL';

-- 긴급도 컬럼에 대한 인덱스 추가
CREATE INDEX idx_approval_urgency_cd ON public.approval USING btree (urgency_cd);

-- 긴급도 체크 제약 조건 추가
ALTER TABLE public.approval 
ADD CONSTRAINT approval_urgency_cd_check 
CHECK (urgency_cd IN ('NORMAL', 'URGENT'));

-- 테이블 코멘트 업데이트
COMMENT ON COLUMN public.approval.urgency_cd IS '긴급도 (NORMAL: 일반, URGENT: 긴급)';
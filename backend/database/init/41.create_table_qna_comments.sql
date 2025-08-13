-- Idempotent DDL: clean up existing objects for re-run safety
DROP TABLE IF EXISTS public.qna_comments CASCADE;
DROP FUNCTION IF EXISTS ensure_qna_comment_parent_same_qna();

CREATE TABLE public.qna_comments (
  id          BIGSERIAL PRIMARY KEY,
  qna_id      BIGINT NOT NULL,
  parent_id   BIGINT NULL,
  content     TEXT NOT NULL,
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_id  VARCHAR(100),
  updated_id  VARCHAR(100),

  CONSTRAINT fk_qna_comments_qna
    FOREIGN KEY (qna_id) REFERENCES public.qna(id) ON DELETE CASCADE,
  CONSTRAINT fk_qna_comments_parent
    FOREIGN KEY (parent_id) REFERENCES public.qna_comments(id) ON DELETE CASCADE,
  CONSTRAINT chk_parent_not_self
    CHECK (parent_id IS NULL OR parent_id <> id)
);

-- 부모/정렬 조회에 필요한 인덱스
CREATE INDEX idx_qna_comments_qna_created_at ON public.qna_comments (qna_id, created_at DESC);
CREATE INDEX idx_qna_comments_parent_created_at ON public.qna_comments (parent_id, created_at ASC);

-- updated_at 자동 갱신 (프로젝트에 이미 사용하는 함수가 있다면 동일 사용)
-- CREATE TRIGGER update_qna_comments_updated_at
--   BEFORE UPDATE ON public.qna_comments
--   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 부모-자식 댓글이 반드시 동일 qna에 속하도록 보장하는 트리거
CREATE OR REPLACE FUNCTION ensure_qna_comment_parent_same_qna()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;

  PERFORM 1 FROM public.qna_comments p
   WHERE p.id = NEW.parent_id AND p.qna_id = NEW.qna_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'parent_id % does not belong to same qna_id %', NEW.parent_id, NEW.qna_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_qna_comment_parent_same_qna
BEFORE INSERT OR UPDATE ON public.qna_comments
FOR EACH ROW EXECUTE FUNCTION ensure_qna_comment_parent_same_qna();

-- 설명
COMMENT ON TABLE public.qna_comments IS 'QnA 댓글 테이블 (self-referencing via parent_id)';
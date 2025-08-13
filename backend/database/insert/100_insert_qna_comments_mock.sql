-- QnA Comments Mock Seed (psql-friendly, idempotent)
-- 이 스크립트는 public.qna에서 최대 2개의 QnA를 골라 다양한 댓글/대댓글 케이스를 생성합니다.
-- 재실행 시 기존 시드 레코드(created_id='SEED_QNA_COMMENTS')를 삭제하고 다시 생성합니다.

-- 0) 이전 시드 데이터 제거
DELETE FROM public.qna_comments WHERE created_id = 'SEED_QNA_COMMENTS';

-- 1) 시드 생성 (qna가 없으면 아무것도 수행되지 않음)
WITH q AS (
  SELECT id FROM public.qna ORDER BY id ASC LIMIT 2
), vals AS (
  SELECT
    (array_agg(id))[1] AS q1,
    COALESCE((array_agg(id))[2], (array_agg(id))[1]) AS q2
  FROM q
),

-- q1 스레드
top1 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT q1, NULL, '첫 댓글 (최상위). 기본 케이스입니다.', FALSE, NOW() - INTERVAL '5 days', 'SEED_QNA_COMMENTS'
  FROM vals WHERE q1 IS NOT NULL
  RETURNING id
),
top1_r1 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q1, t1.id, '첫 댓글에 대한 첫 답글입니다.', FALSE, NOW() - INTERVAL '4 days', 'SEED_QNA_COMMENTS'
  FROM vals v, top1 t1
  RETURNING id
),
top1_r1_r1 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q1, t1r1.id, '대댓글의 답글(3단계) 케이스입니다.', FALSE, NOW() - INTERVAL '3 days', 'SEED_QNA_COMMENTS'
  FROM vals v, top1_r1 t1r1
  RETURNING id
),
top1_r2 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q1, t1.id, '형제 답글 케이스입니다. 정렬/스레드 확인용.', FALSE, NOW() - INTERVAL '2 days', 'SEED_QNA_COMMENTS'
  FROM vals v, top1 t1
  RETURNING id
),
top2 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT q1, NULL, $txt$
멀티라인 댓글입니다.

- Markdown 스타일 목록
- 따옴표: 'single' "double"
- 이모지: 😀👍
- SQL 예약어 예시: SELECT, FROM, WHERE
- 긴 문장 테스트를 위한 샘플 텍스트입니다.
$txt$, FALSE, NOW() - INTERVAL '1 day', 'SEED_QNA_COMMENTS'
  FROM vals WHERE q1 IS NOT NULL
  RETURNING id
),
del_parent AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT q1, NULL, '삭제된 최상위 댓글(자식은 존재).', TRUE, NOW() - INTERVAL '6 days', 'SEED_QNA_COMMENTS'
  FROM vals WHERE q1 IS NOT NULL
  RETURNING id
),
del_child AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q1, dp.id, '부모는 삭제되었지만 자식은 표시되는 케이스입니다.', FALSE, NOW() - INTERVAL '5 days', 'SEED_QNA_COMMENTS'
  FROM vals v, del_parent dp
  RETURNING id
),
deep1 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT q1, NULL, '깊은 중첩 체인의 루트입니다 (4단계).', FALSE, NOW() - INTERVAL '10 days', 'SEED_QNA_COMMENTS'
  FROM vals WHERE q1 IS NOT NULL
  RETURNING id
),
deep2 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q1, d1.id, '2단계.', FALSE, NOW() - INTERVAL '9 days', 'SEED_QNA_COMMENTS'
  FROM vals v, deep1 d1
  RETURNING id
),
deep3 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q1, d2.id, '3단계.', FALSE, NOW() - INTERVAL '8 days', 'SEED_QNA_COMMENTS'
  FROM vals v, deep2 d2
  RETURNING id
),
deep4 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q1, d3.id, '4단계 (최대 깊이 예시).', FALSE, NOW() - INTERVAL '7 days', 'SEED_QNA_COMMENTS'
  FROM vals v, deep3 d3
  RETURNING id
),

-- q2 스레드
q2_top1 AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT q2, NULL, 'q2의 최상위 댓글입니다.', FALSE, NOW() - INTERVAL '3 days', 'SEED_QNA_COMMENTS'
  FROM vals WHERE q2 IS NOT NULL
  RETURNING id
),
q2_reply AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q2, qt.id, 'q2 최상위에 대한 정상 답글입니다.', FALSE, NOW() - INTERVAL '2 days', 'SEED_QNA_COMMENTS'
  FROM vals v, q2_top1 qt
  RETURNING id
),
q2_reply_deleted AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id)
  SELECT v.q2, qt.id, 'q2 최상위에 대한 소프트삭제된 답글입니다.', TRUE, NOW() - INTERVAL '1 day', 'SEED_QNA_COMMENTS'
  FROM vals v, q2_top1 qt
  RETURNING id
),
q2_no_author AS (
  INSERT INTO public.qna_comments (qna_id, parent_id, content, is_deleted, created_at, created_id, updated_id)
  SELECT q2, NULL, '작성자 정보 없는 케이스(NULL).', FALSE, NOW() - INTERVAL '12 hours', NULL, NULL
  FROM vals WHERE q2 IS NOT NULL
  RETURNING id
)
SELECT 'ok' AS status;



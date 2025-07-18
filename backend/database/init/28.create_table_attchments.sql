CREATE TABLE public.attachments (
    attach_id int8 GENERATED BY DEFAULT AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 1 CACHE 1 NO CYCLE) NOT NULL,
    content_type varchar(100) NULL, -- 콘텐츠타입
    created_at timestamp(6) NOT NULL DEFAULT now(), -- 기본값 추가
    file_path varchar(500) NOT NULL, -- 파일경로
    file_size int8 NOT NULL, -- 파일크기
    original_filename varchar(255) NOT NULL, -- 원본파일명
    stored_filename varchar(255) NOT NULL, -- 저장파일명
    uploaded_by varchar(100) NOT NULL, -- 업로드자ID

    -- 기존 qna_id 대신 어떤 엔티티에 연결되는지 나타내는 컬럼들
    entity_type varchar(50) NOT NULL, -- 예: 'qna', 'notice', 'board_post'
    entity_id int8 NOT NULL,          -- 해당 엔티티의 ID (qna_id, notice_id 등)

    created_id varchar(100) NULL, -- 생성자ID
    updated_id varchar(100) NULL, -- 수정자ID
    updated_at timestamp(6) NOT NULL DEFAULT now(), -- 기본값 추가
    CONSTRAINT attachments_pkey PRIMARY KEY (attach_id)
    -- 외래 키 제약 조건은 애플리케이션 레벨에서 관리
);

-- 기존 qna_attachments 테이블은 삭제하거나 이름 변경 후 데이터 이전
-- DROP TABLE public.qna_attachments;

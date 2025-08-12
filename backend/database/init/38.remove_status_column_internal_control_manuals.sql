-- internal_control_manuals 테이블에서 status 컬럼 제거
-- 이미 존재하는 테이블에서 status 컬럼이 있다면 제거

DO $$
BEGIN
    -- status 컬럼이 존재하는지 확인하고 제거
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'internal_control_manuals' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.internal_control_manuals DROP COLUMN status;
        RAISE NOTICE 'Status column dropped from internal_control_manuals table';
    ELSE
        RAISE NOTICE 'Status column does not exist in internal_control_manuals table';
    END IF;
END $$;
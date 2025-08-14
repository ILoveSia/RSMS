-- 메뉴 권한 데이터 삽입
-- ADMIN: 모든 권한 (can_read, can_write, can_delete = true)  
-- USER: 읽기 권한만 (can_read = true, can_write, can_delete = false)

-- 효율적인 방법: CROSS JOIN을 사용해서 모든 메뉴와 역할 조합 생성
INSERT INTO public.menu_permissions (
    menu_id, 
    role_name, 
    can_read, 
    can_write, 
    can_delete, 
    created_at, 
    updated_at, 
    created_id, 
    updated_id
)
SELECT 
    m.id as menu_id,
    r.role_name,
    CASE 
        WHEN r.role_name = 'ADMIN' THEN true 
        WHEN r.role_name = 'USER' THEN true 
        ELSE false 
    END as can_read,
    CASE 
        WHEN r.role_name = 'ADMIN' THEN true 
        ELSE false 
    END as can_write,
    CASE 
        WHEN r.role_name = 'ADMIN' THEN true 
        ELSE false 
    END as can_delete,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at,
    'system' as created_id,
    'system' as updated_id
FROM public.menus m
CROSS JOIN (
    VALUES 
        ('ADMIN'),
        ('USER')
) r(role_name)
ORDER BY m.id, r.role_name;

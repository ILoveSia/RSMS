select
        m1_0.id,
        m1_0.created_at,
        m1_0.created_id,
        m1_0.description,
        m1_0.icon_class,
        m1_0.is_active,
        m1_0.is_visible,
        m1_0.menu_code,
        m1_0.menu_level,
        m1_0.menu_name,
        m1_0.menu_name_en,
        m1_0.menu_url,
        m1_0.parent_id,
        p1_0.menu_id,
        p1_0.id,
        p1_0.can_delete,
        p1_0.can_read,
        p1_0.can_write,
        p1_0.created_at,
        p1_0.created_id,
        p1_0.role_name,
        p1_0.updated_at,
        p1_0.updated_id,
        m1_0.sort_order,
        m1_0.updated_at,
        m1_0.updated_id 
    from
        menus m1_0 
    left join
        menu_permissions p1_0 
            on m1_0.id=p1_0.menu_id 
    where
        m1_0.is_active=true 
        and m1_0.is_visible=true 
        and (
            p1_0.role_name= 'USER'
            or p1_0.role_name is null
        ) 
    order by
        m1_0.menu_level,
        m1_0.sort_order
INSERT INTO users (
    id, username, email, address, mobile, password, 
    dept_cd, num, job_rank_cd, job_title_cd,
    created_at, updated_at, created_id, updated_id
) VALUES (
    'user001', 
    'testuser', 
    'testuser@itcen.com', 
    'Seoul Gangnam', 
    '010-1234-5678', 
    '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7zqIg1v2',
    'IT001', 
    'E001', 
    'RANK001', 
    'TITLE001',
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP,
    'system',
    'system'
) ON CONFLICT (id) DO UPDATE SET 
    password = EXCLUDED.password,
    updated_at = CURRENT_TIMESTAMP; 
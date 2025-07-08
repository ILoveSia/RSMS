-- 기존 사용자들에게 역할 할당
-- 9. 사용자 역할 할당

-- testuser에게 관리자 역할 할당 (개발 환경)
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
('testuser', 'ADMIN', 'system');

-- 다른 테스트 사용자가 있다면 여기에 추가
-- INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
-- ('user1', 'USER', 'system'),
-- ('manager1', 'MANAGER', 'system'),
-- ('readonly1', 'READONLY', 'system');

-- 사용자별 역할 확인 쿼리 (참고용)
-- SELECT u.user_id, u.username, r.role_name, r.description
-- FROM users u
-- LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.use_yn = 'Y'
-- LEFT JOIN roles r ON ur.role_id = r.role_id AND r.use_yn = 'Y'
-- ORDER BY u.user_id, r.role_id;

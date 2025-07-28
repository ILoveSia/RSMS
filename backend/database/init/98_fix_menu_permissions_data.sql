-- menu_permissions 테이블의 잘못된 외래키 참조 수정
-- 존재하지 않는 menu_id를 참조하는 데이터 삭제 또는 수정

-- 먼저 존재하는 menu_id 확인
-- SELECT DISTINCT menu_id FROM menu_permissions WHERE menu_id NOT IN (SELECT menu_id FROM menus);

-- 존재하지 않는 menu_id=15를 참조하는 데이터 삭제
DELETE FROM menu_permissions WHERE menu_id = 15;

-- 또는 다른 잘못된 외래키 참조가 있다면 모두 삭제
DELETE FROM menu_permissions 
WHERE menu_id NOT IN (SELECT menu_id FROM menus);

-- 추가로 foreign key 제약조건을 일시적으로 비활성화하고 다시 활성화할 수도 있음
-- ALTER TABLE menu_permissions DROP CONSTRAINT IF EXISTS FKgqhw0tj26d3bkn8ol6jc02mre;
-- (데이터 정리 후)
-- ALTER TABLE menu_permissions ADD CONSTRAINT FKgqhw0tj26d3bkn8ol6jc02mre FOREIGN KEY (menu_id) REFERENCES menus (menu_id);
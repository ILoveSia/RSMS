package org.itcen.domain.menu.service;

import org.itcen.domain.menu.entity.Menu;
import org.itcen.domain.menu.entity.MenuPermission;
import org.itcen.domain.menu.repository.MenuRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import static java.util.stream.Collectors.groupingBy;

/**
 * 메뉴 초기화 서비스
 * 애플리케이션 시작 시 기본 메뉴 데이터를 생성합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 메뉴 초기화만 담당
 * - Open/Closed: 새로운 메뉴 추가 시 확장 가능
 * - Dependency Inversion: 인터페이스 기반 설계
 */
@Service
public class MenuInitializationService implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(MenuInitializationService.class);
    
    private final MenuRepository menuRepository;
    
    public MenuInitializationService(MenuRepository menuRepository) {
        this.menuRepository = menuRepository;
    }
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("메뉴 초기화 시작");
        
        // 이미 메뉴가 존재하는지 확인
        if (menuRepository.count() > 0) {
            logger.info("메뉴 데이터가 이미 존재합니다. 초기화를 건너뜁니다.");
            return;
        }
        
        try {
            initializeMenus();
            logger.info("메뉴 초기화 완료");
        } catch (Exception e) {
            logger.error("메뉴 초기화 중 오류 발생", e);
            throw e;
        }
    }
    
    /**
     * 수동 메뉴 재초기화 (개발용)
     * 기존 메뉴를 모두 삭제하고 새로 생성합니다.
     */
    @Transactional
    public void forceReinitializeMenus() {
        logger.info("메뉴 강제 재초기화 시작");
        
        try {
            // 기존 메뉴가 있는지 확인
            long existingMenuCount = menuRepository.count();
            if (existingMenuCount > 0) {
                logger.info("기존 메뉴 {} 개 발견. 안전한 방법으로 삭제 시도", existingMenuCount);
                
                // 모든 메뉴 조회 후 하위 메뉴부터 개별 삭제
                List<Menu> allMenus = menuRepository.findAll();
                
                // 메뉴 레벨별로 분류 (높은 레벨부터 삭제)
                Map<Integer, List<Menu>> menusByLevel = allMenus.stream()
                    .collect(groupingBy(Menu::getMenuLevel));
                
                // 레벨을 내림차순으로 정렬하여 하위 메뉴부터 삭제
                menusByLevel.keySet().stream()
                    .sorted((a, b) -> b.compareTo(a)) // 내림차순
                    .forEach(level -> {
                        List<Menu> menusAtLevel = menusByLevel.get(level);
                        logger.info("레벨 {} 메뉴 {} 개 삭제 중", level, menusAtLevel.size());
                        menuRepository.deleteAll(menusAtLevel);
                        menuRepository.flush(); // 즉시 반영
                    });
                
                logger.info("기존 메뉴 데이터 삭제 완료");
            }
            
            // 새 메뉴 생성
            initializeMenus();
            logger.info("메뉴 강제 재초기화 완료");
        } catch (Exception e) {
            logger.error("메뉴 강제 재초기화 중 오류 발생", e);
            throw e;
        }
    }
    
    /**
     * 메뉴 데이터 초기화
     */
    private void initializeMenus() {
        List<Menu> rootMenus = createRootMenus();
        List<Menu> savedRootMenus = menuRepository.saveAll(rootMenus);
        
        // 하위 메뉴 생성
        createSubMenus(savedRootMenus);
        
        logger.info("총 {} 개의 최상위 메뉴가 생성되었습니다.", savedRootMenus.size());
    }
    
    /**
     * 최상위 메뉴 생성
     */
    private List<Menu> createRootMenus() {
        List<Menu> rootMenus = new ArrayList<>();
        
        // 1. 책무구조 원장 관리
        Menu ledgerMgmt = new Menu(
            "LEDGER_MGMT", "책무구조 원장 관리", "Ledger Management", 
            null, 1, 1, null, "fas fa-book", "책무구조 원장 관리 메뉴"
        );
        addPermissions(ledgerMgmt);
        rootMenus.add(ledgerMgmt);
        
        // 2. 책무구조도 이행 점검
        Menu ledgerInquiry = new Menu(
            "LEDGER_INQUIRY", "책무구조도 이행 점검", "Ledger History Inquiry", 
            null, 1, 2, null, "fas fa-search", "책무구조도 이행 점검 메뉴"
        );
        addPermissions(ledgerInquiry);
        rootMenus.add(ledgerInquiry);
        
        // 3. 컴플라이언스 관리
        Menu complianceCheck = new Menu(
            "COMPLIANCE_CHECK", "컴플라이언스 관리", "Compliance Management", 
            null, 1, 3, null, "fas fa-shield-alt", "컴플라이언스 관리 메뉴"
        );
        addPermissions(complianceCheck);
        rootMenus.add(complianceCheck);
        
        // 4. 준법지원부 모니터링
        Menu approvalWorkflow = new Menu(
            "APPROVAL_WORKFLOW", "준법지원부 모니터링", "Approval Workflow Monitoring", 
            null, 1, 4, null, "fas fa-tasks", "준법지원부 모니터링 메뉴"
        );
        addPermissions(approvalWorkflow);
        rootMenus.add(approvalWorkflow);
        
        // 5. 결재 관리
        Menu resultMgmt = new Menu(
            "RESULT_MGMT", "결재 관리", "Result Management", 
            null, 1, 5, null, "fas fa-clipboard-check", "결재 관리 메뉴"
        );
        addPermissions(resultMgmt);
        rootMenus.add(resultMgmt);
        
        // 6. 인계인수 관리
        Menu userMgmt = new Menu(
            "USER_MGMT", "인계인수 관리", "User Management", 
            null, 1, 6, null, "fas fa-users", "인계인수 관리 메뉴"
        );
        addPermissions(userMgmt);
        rootMenus.add(userMgmt);
        
        // 7. 시스템 관리
        Menu systemMgmt = new Menu(
            "SYSTEM_MGMT", "시스템 관리", "System Management", 
            null, 1, 7, null, "fas fa-cogs", "시스템 관리 메뉴"
        );
        addPermissions(systemMgmt);
        rootMenus.add(systemMgmt);
        
        return rootMenus;
    }
    
    /**
     * 하위 메뉴 생성
     */
    private void createSubMenus(List<Menu> rootMenus) {
        for (Menu rootMenu : rootMenus) {
            switch (rootMenu.getMenuCode()) {
                case "LEDGER_MGMT":
                    createLedgerMgmtSubMenus(rootMenu);
                    break;
                case "LEDGER_INQUIRY":
                    createLedgerInquirySubMenus(rootMenu);
                    break;
                // 다른 메뉴들의 하위 메뉴는 필요에 따라 추가
            }
        }
    }
    
    /**
     * 책무구조 원장 관리 하위 메뉴 생성
     */
    private void createLedgerMgmtSubMenus(Menu parent) {
        List<Menu> subMenus = new ArrayList<>();
        
        // 1. 회의체 현황
        Menu meetingStatus = new Menu(
            "LEDGER_MGMT_MEETING", "회의체 현황", "Meeting Status", 
            parent, 2, 1, "/ledger/company-status", "fas fa-users", "회의체 현황 관리"
        );
        addPermissions(meetingStatus);
        subMenus.add(meetingStatus);
        
        // 2. 직책 현황
        Menu positionStatus = new Menu(
            "LEDGER_MGMT_POSITION", "직책 현황", "Position Status", 
            parent, 2, 2, "/ledger/position-status", "fas fa-user-tie", "직책 현황 관리"
        );
        addPermissions(positionStatus);
        subMenus.add(positionStatus);
        
        // 3. 책무 DB현황
        Menu responsibilityDbStatus = new Menu(
            "LEDGER_MGMT_RESPONSIBILITY_DB", "책무 DB현황", "Responsibility DB Status", 
            parent, 2, 3, "/ledger/responsibility-db-status", "fas fa-database", "책무 DB현황 관리"
        );
        addPermissions(responsibilityDbStatus);
        subMenus.add(responsibilityDbStatus);
        
        // 4. 직책별 책무 현황
        Menu positionResponsibilityStatus = new Menu(
            "LEDGER_MGMT_POSITION_RESPONSIBILITY", "직책별 책무 현황", "Position Responsibility Status", 
            parent, 2, 4, "/ledger/detail-status", "fas fa-list-alt", "직책별 책무 현황 관리"
        );
        addPermissions(positionResponsibilityStatus);
        subMenus.add(positionResponsibilityStatus);
        
        // 5. 임원 현황
        Menu executiveStatus = new Menu(
            "LEDGER_MGMT_EXECUTIVE", "임원 현황", "Executive Status", 
            parent, 2, 5, "/ledger/business-status", "fas fa-business-center", "임원 현황 관리"
        );
        addPermissions(executiveStatus);
        subMenus.add(executiveStatus);
        
        // 6. 임원별 책무 현황
        Menu executiveResponsibilityStatus = new Menu(
            "LEDGER_MGMT_EXECUTIVE_RESPONSIBILITY", "임원별 책무 현황", "Executive Responsibility Status", 
            parent, 2, 6, "/ledger/business-detail-status", "fas fa-analytics", "임원별 책무 현황 관리"
        );
        addPermissions(executiveResponsibilityStatus);
        subMenus.add(executiveResponsibilityStatus);
        
        // 7. 부서장 내부통제 항목 현황
        Menu hodICItemStatus = new Menu(
            "LEDGER_MGMT_HOD_IC_ITEM", "부서장 내부통제 항목 현황", "HOD Internal Control Item Status", 
            parent, 2, 7, "/ledger/internal-control", "fas fa-shield-alt", "부서장 내부통제 항목 현황 관리"
        );
        addPermissions(hodICItemStatus);
        subMenus.add(hodICItemStatus);
        
        // 8. 책무구조도 제출 관리
        Menu structureSubmissionMgmt = new Menu(
            "LEDGER_MGMT_STRUCTURE_SUBMISSION", "책무구조도 제출 관리", "Structure Submission Management", 
            parent, 2, 8, "/ledger/structure-submission", "fas fa-upload", "책무구조도 제출 관리"
        );
        addPermissions(structureSubmissionMgmt);
        subMenus.add(structureSubmissionMgmt);
        
        menuRepository.saveAll(subMenus);
        logger.info("책무구조 원장 관리 하위 메뉴 {} 개 생성 완료", subMenus.size());
    }
    
    /**
     * 적부구조도 이력 점검 하위 메뉴 생성
     */
    private void createLedgerInquirySubMenus(Menu parent) {
        List<Menu> subMenus = new ArrayList<>();
        
        // 점검 계획
        Menu schedule = new Menu(
            "LEDGER_INQUIRY_SCHEDULE", "점검 계획", "Inspection Schedule", 
            parent, 2, 1, "/inquiry/schedule", "fas fa-calendar-alt", "점검 계획 관리"
        );
        addPermissions(schedule);
        subMenus.add(schedule);
        
        // 점검 현황(월별)
        Menu monthlyStatus = new Menu(
            "LEDGER_INQUIRY_HISTORY", "점검 현황(월별)", "Monthly Inspection Status", 
            parent, 2, 2, "/inquiry/monthly-status", "fas fa-calendar-check", "월별 점검 현황"
        );
        addPermissions(monthlyStatus);
        subMenus.add(monthlyStatus);
        
        // 점검 현황(부서별)
        Menu deptStatus = new Menu(
            "LEDGER_INQUIRY_DEPT", "점검 현황(부서별)", "Department Inspection Status", 
            parent, 2, 3, "/inquiry/dept-status", "fas fa-building", "부서별 점검 현황"
        );
        addPermissions(deptStatus);
        subMenus.add(deptStatus);
        
        // 미종사자 현황
        Menu nonEmployeeStatus = new Menu(
            "LEDGER_INQUIRY_OUTSIDER", "미종사자 현황", "Non-employee Status", 
            parent, 2, 4, "/inquiry/non-employee", "fas fa-user-times", "미종사자 현황 관리"
        );
        addPermissions(nonEmployeeStatus);
        subMenus.add(nonEmployeeStatus);
        
        menuRepository.saveAll(subMenus);
        logger.info("적부구조도 이력 점검 하위 메뉴 {} 개 생성 완료", subMenus.size());
    }
    
    /**
     * 메뉴에 기본 권한 추가
     */
    private void addPermissions(Menu menu) {
        List<MenuPermission> permissions = new ArrayList<>();
        
        // ADMIN 역할에 모든 권한 부여
        MenuPermission adminPermission = new MenuPermission(menu, "ADMIN", true, true, true);
        permissions.add(adminPermission);
        
        // USER 역할에 읽기 권한만 부여
        MenuPermission userPermission = new MenuPermission(menu, "USER", true, false, false);
        permissions.add(userPermission);
        
        menu.setPermissions(permissions);
    }
} 
package org.itcen.domain.positions.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.common.entity.CommonCode;
import org.itcen.domain.common.repository.CommonCodeRepository;
import org.itcen.domain.departments.service.DepartmentService;
import org.itcen.domain.meeting.entity.MeetingBody;
import org.itcen.domain.meeting.repository.MeetingBodyRepository;
import org.itcen.domain.positions.dto.LedgerOrderSelectDto;
import org.itcen.domain.positions.dto.PositionCreateRequestDto;
import org.itcen.domain.positions.dto.PositionDetailDto;
import org.itcen.domain.positions.dto.PositionStatusDto;
import org.itcen.domain.positions.dto.PositionStatusProjection;
import org.itcen.domain.positions.dto.PositionUpdateRequestDto;
import org.itcen.domain.positions.entity.Position;
import org.itcen.domain.positions.entity.PositionAdmin;
import org.itcen.domain.positions.entity.PositionMeeting;
import org.itcen.domain.positions.entity.PositionOwnerDept;
import org.itcen.domain.positions.repository.PositionAdminRepository;
import org.itcen.domain.positions.repository.PositionMeetingRepository;
import org.itcen.domain.positions.repository.PositionOwnerDeptRepository;
import org.itcen.domain.positions.repository.PositionRepository;
import org.itcen.domain.user.entity.User;
import org.itcen.domain.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 직책 통합 Service 구현체
 *
 * 직책 및 관련 테이블들의 비즈니스 로직을 통합 구현합니다. PositionStatusPage.tsx에서 5개 테이블을 모두 관리하기 위한 통합 서비스 구현체입니다.
 *
 * SOLID 원칙: - Single Responsibility: 직책 도메인 전체 비즈니스 로직 담당 - Open/Closed: 새로운 기능 추가 시 확장 가능 - Liskov
 * Substitution: PositionService 인터페이스를 올바르게 구현 - Interface Segregation: 필요한 인터페이스만 의존 - Dependency
 * Inversion: 구체적인 구현이 아닌 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PositionServiceImpl implements PositionService {

    private final PositionRepository positionRepository;
    private final PositionOwnerDeptRepository positionOwnerDeptRepository;
    private final PositionMeetingRepository positionMeetingRepository;
    private final PositionAdminRepository positionAdminRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final MeetingBodyRepository meetingBodyRepository;
    private final UserRepository userRepository;
    private final DepartmentService departmentService;

    @PersistenceContext
    private EntityManager em; // EntityManager를 직접 생성하지 않고 주입받습니다.

    @Override
    @Transactional(readOnly = true)
    public List<LedgerOrderSelectDto> getLedgerOrderSelectList() {
        // 원장차수+진행상태 목록 조회 (ledger_orders 테이블 사용)
        List<Object[]> rows = em.createNativeQuery("SELECT lo.ledger_orders_title, cc.code_name "
                + "FROM ledger_orders lo "
                + "LEFT JOIN common_code cc ON cc.group_code = 'ORDER_STATUS' AND cc.code = lo.ledger_orders_status_cd "
                + "ORDER BY lo.ledger_orders_title DESC").getResultList();

        List<LedgerOrderSelectDto> result = new ArrayList<>();
        for (Object[] row : rows) {
            log.info("Query Result Row: {}", (Object) row);
            String title = (String) row[0];
            String statusName = (String) row[1];
            String label = title + (statusName != null ? " (" + statusName + ")" : "");
            result.add(new LedgerOrderSelectDto(title, label));
        }
        return result;
    }

    @Override
    @Transactional
    public Long createPosition(PositionCreateRequestDto createRequestDto) {
        // 1. 직책(Position) 정보 저장
        Position position = Position.builder().ledgerOrder(createRequestDto.getLedgerOrder())
                .positionsNm(createRequestDto.getPositionsNm())
                .confirmGubunCd(createRequestDto.getConfirmGubunCd())
                .writeDeptCd(createRequestDto.getWriteDeptCd()).build();
        Position savedPosition = positionRepository.save(position);
        Long positionId = savedPosition.getPositionsId();

        // 2. 소관 부서(PositionOwnerDept) 정보 저장
        if (createRequestDto.getOwnerDeptCds() != null) {
            createRequestDto.getOwnerDeptCds().forEach(deptCd -> {
                PositionOwnerDept ownerDept = PositionOwnerDept.builder().positionsId(positionId)
                        .ownerDeptCd(deptCd).build();
                positionOwnerDeptRepository.save(ownerDept);
            });
        }

        // 4. 회의체(PositionMeeting) 정보 저장
        if (createRequestDto.getMeetingBodyIds() != null) {
            createRequestDto.getMeetingBodyIds().forEach(meetingId -> {
                PositionMeeting positionMeeting = PositionMeeting.builder().positionsId(positionId)
                        .meetingBodyId(meetingId).build();
                positionMeetingRepository.save(positionMeeting);
            });
        }

        // 5. 관리자(PositionAdmin) 정보 저장
        if (createRequestDto.getAdminIds() != null) {
            createRequestDto.getAdminIds().forEach(adminId -> {
                PositionAdmin admin = PositionAdmin.builder().positionsId(positionId)
                        .positionsAdminId(adminId).build();
                positionAdminRepository.save(admin);
            });
        }

        return positionId;
    }

    @Override
    @Transactional
    public Long updatePosition(Long positionId, PositionUpdateRequestDto updateRequestDto) {
        // 1. 기존 직책 정보 조회
        Position position = positionRepository.findById(positionId).orElseThrow(
                () -> new BusinessException("해당 직책을 찾을 수 없습니다.", "POSITION_NOT_FOUND"));

        // 2. 직책 기본 정보 수정
        position.setPositionsNm(updateRequestDto.getPositionName());
        position.setWriteDeptCd(updateRequestDto.getWriteDeptCd());
        positionRepository.save(position);

        // 3. 소관부서 정보 업데이트 (Diff Update)
        updateOwnerDepts(position, updateRequestDto.getOwnerDeptCds());

        // 5. 주관회의체 정보 업데이트 (Diff Update)
        updateMeetings(position, updateRequestDto.getMeetingBodyIds());

        // 6. 관리자 정보 업데이트 (Diff Update)
        updateAdmins(position, updateRequestDto.getAdminIds());

        return positionId;
    }

    private void updateOwnerDepts(Position position, List<String> newDeptCds) {
        Long positionId = position.getPositionsId();

        // DB에 저장된 현재 소관부서 코드 목록
        List<String> existingDeptCds =
                positionOwnerDeptRepository.findByPosition_PositionsId(positionId).stream()
                        .map(PositionOwnerDept::getOwnerDeptCd).collect(Collectors.toList());

        // 추가해야 할 부서 코드 목록
        List<String> deptsToAdd = newDeptCds.stream()
                .filter(newCd -> !existingDeptCds.contains(newCd)).collect(Collectors.toList());

        // 삭제해야 할 부서 엔티티 목록
        List<PositionOwnerDept> deptsToDelete =
                positionOwnerDeptRepository.findByPosition_PositionsId(positionId).stream()
                        .filter(existingDept -> !newDeptCds.contains(existingDept.getOwnerDeptCd()))
                        .collect(Collectors.toList());

        if (!deptsToAdd.isEmpty()) {
            List<PositionOwnerDept> newDepts =
                    deptsToAdd
                            .stream().map(deptCd -> PositionOwnerDept.builder()
                                    .positionsId(positionId).ownerDeptCd(deptCd).build())
                            .collect(Collectors.toList());
            positionOwnerDeptRepository.saveAll(newDepts);
        }

        if (!deptsToDelete.isEmpty()) {
            positionOwnerDeptRepository.deleteAll(deptsToDelete);
        }
    }

    private void updateMeetings(Position position, List<String> newMeetingBodyIds) {
        Long positionId = position.getPositionsId();

        // DB에 저장된 현재 회의체 ID 목록
        List<String> existingMeetingIds =
                positionMeetingRepository.findByPosition_PositionsId(positionId).stream()
                        .map(PositionMeeting::getMeetingBodyId).collect(Collectors.toList());

        // 추가해야 할 회의체 ID 목록
        List<String> meetingsToAddIds = newMeetingBodyIds.stream()
                .filter(newId -> !existingMeetingIds.contains(newId)).collect(Collectors.toList());

        // 삭제해야 할 회의체 엔티티 목록
        List<PositionMeeting> meetingsToDelete =
                positionMeetingRepository.findByPosition_PositionsId(positionId).stream()
                        .filter(existingMeeting -> !newMeetingBodyIds
                                .contains(existingMeeting.getMeetingBodyId()))
                        .collect(Collectors.toList());

        if (!meetingsToAddIds.isEmpty()) {
            List<PositionMeeting> newMeetings =
                    meetingsToAddIds
                            .stream().map(meetingId -> PositionMeeting.builder()
                                    .positionsId(positionId).meetingBodyId(meetingId).build())
                            .collect(Collectors.toList());
            positionMeetingRepository.saveAll(newMeetings);
        }

        if (!meetingsToDelete.isEmpty()) {
            positionMeetingRepository.deleteAll(meetingsToDelete);
        }
    }

    private void updateAdmins(Position position, List<String> newAdminIds) {
        Long positionId = position.getPositionsId();

        // DB에 저장된 현재 관리자 ID(사번) 목록
        List<String> existingAdminIds =
                positionAdminRepository.findByPosition_PositionsId(positionId).stream()
                        .map(PositionAdmin::getPositionsAdminId).collect(Collectors.toList());

        // 추가해야 할 관리자 ID 목록
        List<String> adminsToAdd = newAdminIds.stream()
                .filter(newId -> !existingAdminIds.contains(newId)).collect(Collectors.toList());

        // 삭제해야 할 관리자 엔티티 목록
        List<PositionAdmin> adminsToDelete = positionAdminRepository
                .findByPosition_PositionsId(positionId).stream()
                .filter(existingAdmin -> !newAdminIds.contains(existingAdmin.getPositionsAdminId()))
                .collect(Collectors.toList());

        if (!adminsToAdd.isEmpty()) {
            List<PositionAdmin> newAdmins =
                    adminsToAdd.stream()
                            .map(adminId -> PositionAdmin.builder().positionsId(positionId)
                                    .positionsAdminId(adminId).build())
                            .collect(Collectors.toList());
            positionAdminRepository.saveAll(newAdmins);
        }

        if (!adminsToDelete.isEmpty()) {
            positionAdminRepository.deleteAll(adminsToDelete);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PositionStatusDto> getPositionStatusList() {
        List<PositionStatusProjection> projections = positionRepository.findPositionStatusList();
        return projections.stream()
                .map(p -> PositionStatusDto.builder().positionsId(p.getPositionsId())
                        .positionsNm(p.getPositionsNm()).writeDeptNm(p.getWriteDeptNm())
                        .ownerDeptNms(p.getOwnerDeptNms()).adminCount(p.getAdminCount()).build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PositionDetailDto getPositionDetail(Long id) {
        log.info("직책 상세 조회 서비스 호출: id={}", id);
        Position position = positionRepository.findById(id).orElseThrow(
                () -> new BusinessException("해당 직책을 찾을 수 없습니다.", "POSITION_NOT_FOUND"));

        List<PositionDetailDto.OwnerDeptInfo> ownerDepts =
                positionOwnerDeptRepository.findByPosition_PositionsId(id).stream().map(pod -> {
                    String deptName = departmentService.getDepartmentNameById(pod.getOwnerDeptCd());
                    return PositionDetailDto.OwnerDeptInfo.builder().deptCode(pod.getOwnerDeptCd())
                            .deptName(deptName).build();
                }).collect(Collectors.toList());

        List<PositionDetailDto.MeetingInfo> meetings =
                positionMeetingRepository.findByPosition_PositionsId(id).stream().map(pm -> {
                    MeetingBody mb = meetingBodyRepository.findById(pm.getMeetingBodyId())
                            .orElse(new MeetingBody());
                    return PositionDetailDto.MeetingInfo.builder()
                            .meetingBodyId(pm.getMeetingBodyId())
                            .meetingBodyName(mb.getMeetingName()).memberGubun(mb.getGubun())
                            .meetingPeriod(mb.getMeetingPeriod())
                            .deliberationContent(mb.getContent()).build();
                }).collect(Collectors.toList());

        // 관리자 정보 조회 및 변환
        List<PositionDetailDto.ManagerInfo> managers =
                positionAdminRepository.findByPosition_PositionsId(id).stream().map(pa -> {
                    log.debug("관리자 조회 시작: adminId={}", pa.getPositionsAdminId());
                    Optional<User> userOpt = userRepository.findByNum(pa.getPositionsAdminId());

                    if (userOpt.isEmpty()) {
                        log.warn("사번으로 사용자를 찾을 수 없습니다: {}", pa.getPositionsAdminId());
                        return PositionDetailDto.ManagerInfo.builder()
                                .empNo(pa.getPositionsAdminId()).empName("사용자 정보 없음")
                                .position("직급정보 없음").build();
                    }

                    User user = userOpt.get();
                    log.debug("사용자 정보: {}, 직급코드: {}", user.getUsername(), user.getJobRankCd());

                    String positionName = "직급정보 없음";
                    if (user.getJobRankCd() != null && !user.getJobRankCd().isBlank()) {
                        positionName = commonCodeRepository
                                .findByGroupCodeAndCode("JOB_RANK", user.getJobRankCd())
                                .map(CommonCode::getCodeName).orElseGet(() -> {
                                    log.warn("공통코드에 해당 직급코드가 없습니다: group=JOB_RANK, code={}",
                                            user.getJobRankCd());
                                    return "직급명(코드미등록)";
                                });
                    } else {
                        log.warn("사용자에게 직급코드가 지정되지 않았습니다: {}", user.getUsername());
                    }

                    return PositionDetailDto.ManagerInfo.builder().empNo(user.getNum())
                            .empName(user.getUsername()).position(positionName).build();
                }).collect(Collectors.toList());

        return PositionDetailDto.builder().positionsId(position.getPositionsId())
                .positionName(position.getPositionsNm()).writeDeptCd(position.getWriteDeptCd())
                .ownerDepts(ownerDepts).meetings(meetings).managers(managers).build();
    }

    @Override
    @Transactional
    public void deleteBulk(List<Long> positionsIds) {
        for (Long id : positionsIds) {
            // 1. 하위 테이블부터 삭제
            positionAdminRepository.deleteByPositionsId(id);
            positionOwnerDeptRepository.deleteByPositionsId(id);
            positionMeetingRepository.deleteByPositionsId(id);
            // 2. 본 테이블 삭제
            positionRepository.deleteById(id);
        }
    }
}

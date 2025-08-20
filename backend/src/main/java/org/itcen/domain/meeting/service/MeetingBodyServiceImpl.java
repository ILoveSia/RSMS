package org.itcen.domain.meeting.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.meeting.dto.*;
import org.itcen.domain.meeting.entity.MeetingBody;
import org.itcen.domain.meeting.repository.MeetingBodyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 회의체 Service 구현체
 *
 * 회의체 비즈니스 로직을 구현하는 서비스 클래스입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 회의체 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Liskov Substitution: 인터페이스 계약을 올바르게 구현
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: Repository 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeetingBodyServiceImpl implements MeetingBodyService {

    private final MeetingBodyRepository meetingBodyRepository;
    @Override
    public List<MeetingBodyDto> getAllMeetingBodies() {
        List<MeetingBody> meetingBodies = meetingBodyRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return meetingBodies.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    /**
     * 회의체 생성
     */
    @Override
    @Transactional
    public MeetingBodyDto createMeetingBody(MeetingBodyCreateRequestDto createRequestDto) {
        // 회의체명 중복 체크
        if (meetingBodyRepository.existsByMeetingName(createRequestDto.getMeetingName())) {
            throw new BusinessException("이미 존재하는 회의체명입니다: " + createRequestDto.getMeetingName());
        }

        // Entity 생성 (UUID로 ID 생성)
        MeetingBody meetingBody = MeetingBody.builder()
                .meetingBodyId(UUID.randomUUID().toString())
                .gubun(createRequestDto.getGubun())
                .meetingName(createRequestDto.getMeetingName())
                .meetingPeriod(createRequestDto.getMeetingPeriod())
                .content(createRequestDto.getContent())
                .build();

        // 저장
        MeetingBody savedMeetingBody = meetingBodyRepository.save(meetingBody);
        return convertToDto(savedMeetingBody);
    }

    /**
     * 회의체 수정
     */
    @Override
    @Transactional
    public MeetingBodyDto updateMeetingBody(String meetingBodyId, MeetingBodyUpdateRequestDto updateRequestDto) {

        // 기존 회의체 조회
        MeetingBody existingMeetingBody = meetingBodyRepository.findById(meetingBodyId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 회의체입니다: ID=" + meetingBodyId));

        // 회의체명 중복 체크 (자신 제외)
        if (meetingBodyRepository.existsByMeetingNameAndMeetingBodyIdNot(updateRequestDto.getMeetingName(), meetingBodyId)) {
            throw new BusinessException("이미 존재하는 회의체명입니다: " + updateRequestDto.getMeetingName());
        }

        // 정보 업데이트
        existingMeetingBody.setGubun(updateRequestDto.getGubun());
        existingMeetingBody.setMeetingName(updateRequestDto.getMeetingName());
        existingMeetingBody.setMeetingPeriod(updateRequestDto.getMeetingPeriod());
        existingMeetingBody.setContent(updateRequestDto.getContent());

        // 저장
        MeetingBody updatedMeetingBody = meetingBodyRepository.save(existingMeetingBody);
        return convertToDto(updatedMeetingBody);
    }

    /**
     * 회의체 삭제
     */
    @Override
    @Transactional
    public void deleteMeetingBody(String meetingBodyId) {
        // 존재 여부 확인
        if (!meetingBodyRepository.existsById(meetingBodyId)) {
            throw new BusinessException("존재하지 않는 회의체입니다: ID=" + meetingBodyId);
        }

        // 삭제
        meetingBodyRepository.deleteById(meetingBodyId);
    }

    /**
     * 회의체 단건 조회
     */
    @Override
    public MeetingBodyDto getMeetingBody(String meetingBodyId) {
        MeetingBody meetingBody = meetingBodyRepository.findById(meetingBodyId)
                .orElseThrow(() -> new BusinessException("존재하지 않는 회의체입니다: ID=" + meetingBodyId));

        return convertToDto(meetingBody);
    }

    /**
     * 구분별 회의체 목록 조회
     */
    @Override
    public List<MeetingBodyDto> getMeetingBodiesByGubun(String gubun) {
        List<MeetingBody> meetingBodies = meetingBodyRepository.findByGubunOrderByCreatedAtDesc(gubun);
        return meetingBodies.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 회의체 검색 (페이징)
     */
    @Override
    public Page<MeetingBodyDto> searchMeetingBodies(MeetingBodySearchRequestDto searchRequestDto) {
        log.info("🔍 [MeetingBodyService] 검색 요청 받음: {}", searchRequestDto);
        
        // 네이티브 쿼리에서는 정렬을 수동으로 처리하므로 Sort 없이 Pageable 생성
        Pageable pageable = PageRequest.of(
                searchRequestDto.getPage(),
                searchRequestDto.getSize()
        );

        // 검색 조건이 모두 null이면 전체 조회
        String gubun = (searchRequestDto.getGubun() != null && !searchRequestDto.getGubun().trim().isEmpty())
                ? searchRequestDto.getGubun().trim() : null;
        String meetingName = (searchRequestDto.getMeetingName() != null && !searchRequestDto.getMeetingName().trim().isEmpty())
                ? searchRequestDto.getMeetingName().trim() : null;
        String meetingPeriod = (searchRequestDto.getMeetingPeriod() != null && !searchRequestDto.getMeetingPeriod().trim().isEmpty())
                ? searchRequestDto.getMeetingPeriod().trim() : null;
        String content = (searchRequestDto.getContent() != null && !searchRequestDto.getContent().trim().isEmpty())
                ? searchRequestDto.getContent().trim() : null;

        log.info("🔍 [MeetingBodyService] 정제된 검색 조건 - gubun: {}, meetingName: {}, meetingPeriod: {}, content: {}", 
                gubun, meetingName, meetingPeriod, content);

        // 검색 실행
        Page<MeetingBody> meetingBodyPage = meetingBodyRepository.findBySearchConditions(
                gubun, meetingName, meetingPeriod, content, pageable);

        log.info("🔍 [MeetingBodyService] 검색 결과 - 총 {}개, 현재 페이지 {}개", 
                meetingBodyPage.getTotalElements(), meetingBodyPage.getContent().size());

        // DTO 변환
        return meetingBodyPage.map(this::convertToDto);
    }
    /**
     * 회의체명 중복 체크
     */
    @Override
    public boolean isDuplicateMeetingName(String meetingName) {
        return meetingBodyRepository.existsByMeetingName(meetingName);
    }

    /**
     * 회의체명 중복 체크 (수정 시)
     */
    @Override
    public boolean isDuplicateMeetingName(String meetingName, String meetingBodyId) {
        return meetingBodyRepository.existsByMeetingNameAndMeetingBodyIdNot(meetingName, meetingBodyId);
    }

    /**
     * 여러 회의체 일괄 삭제
     *
     * @param ids 삭제할 회의체 ID 리스트
     *
     * 구조적 설명:
     * - 단일 책임 원칙: 서비스는 비즈니스 로직만 담당
     * - 확장/폐쇄 원칙: 단건/다건 삭제 모두 지원하도록 확장
     */
    @Override
    @Transactional
    public void deleteMeetingBodies(List<String> ids) {
        // 존재하지 않는 ID 검증
        List<String> existingIds = meetingBodyRepository.findAllById(ids)
                .stream()
                .map(MeetingBody::getMeetingBodyId)
                .collect(Collectors.toList());

        List<String> nonExistingIds = ids.stream()
                .filter(id -> !existingIds.contains(id))
                .collect(Collectors.toList());

        if (!nonExistingIds.isEmpty()) {
            throw new BusinessException("존재하지 않는 회의체가 포함되어 있습니다: " + String.join(", ", nonExistingIds));
        }

        meetingBodyRepository.deleteAllByIdInBatch(ids);
        
    }
    /**
     * Entity를 DTO로 변환
     *
     * @param meetingBody 회의체 Entity
     * @return 회의체 DTO
     */
    private MeetingBodyDto convertToDto(MeetingBody meetingBody) {
        return MeetingBodyDto.builder()
                .meetingBodyId(meetingBody.getMeetingBodyId())
                .gubun(meetingBody.getGubun())
                .meetingName(meetingBody.getMeetingName())
                .meetingPeriod(meetingBody.getMeetingPeriod())
                .content(meetingBody.getContent())
                .createdAt(meetingBody.getCreatedAt())
                .updatedAt(meetingBody.getUpdatedAt())
                .createdId(meetingBody.getCreatedId())
                .updatedId(meetingBody.getUpdatedId())
                .build();
    }
}

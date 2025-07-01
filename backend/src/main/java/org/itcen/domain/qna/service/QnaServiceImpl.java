package org.itcen.domain.qna.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.exception.BusinessException;
import org.itcen.domain.qna.dto.*;
import org.itcen.domain.qna.entity.Qna;
import org.itcen.domain.qna.entity.QnaPriority;
import org.itcen.domain.qna.entity.QnaStatus;
import org.itcen.domain.qna.repository.QnaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Q&A 서비스 구현체
 * 
 * Q&A 관련 비즈니스 로직을 구현합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 비즈니스 로직만 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Liskov Substitution: QnaService 인터페이스를 안전하게 구현
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: 구체 클래스가 아닌 인터페이스에 의존
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QnaServiceImpl implements QnaService {

    private final QnaRepository qnaRepository;

    @Override
    public Page<QnaListResponseDto> getQnaList(QnaSearchRequestDto searchRequest) {
        log.debug("Q&A 목록 조회 시작: {}", searchRequest);
        
        // 검색 조건 정제
        searchRequest.sanitize();
        
        // 날짜 범위 유효성 검증
        if (!searchRequest.isValidDateRange()) {
            throw new BusinessException("검색 시작일이 종료일보다 늦을 수 없습니다.");
        }
        
        // 페이징 및 정렬 설정
        Sort sort = createSort(searchRequest.getSortBy(), searchRequest.getSortDirection());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        // 검색 조건에 따른 조회
        Page<Qna> qnaPage;
        if (searchRequest.hasSearchCondition()) {
            LocalDateTime startDateTime = searchRequest.getStartDate() != null ? 
                searchRequest.getStartDate().atStartOfDay() : null;
            LocalDateTime endDateTime = searchRequest.getEndDate() != null ? 
                searchRequest.getEndDate().atTime(LocalTime.MAX) : null;
                
            qnaPage = qnaRepository.findBySearchConditions(
                searchRequest.getKeyword(),
                searchRequest.getDepartment(),
                searchRequest.getStatus(),
                searchRequest.getPriority(),
                searchRequest.getCategory(),
                searchRequest.getIsPublic(),
                startDateTime,
                endDateTime,
                pageable
            );
        } else {
            qnaPage = qnaRepository.findAll(pageable);
        }
        
        log.debug("Q&A 목록 조회 완료: 총 {}건", qnaPage.getTotalElements());
        return qnaPage.map(QnaListResponseDto::from);
    }

    @Override
    @Transactional
    public QnaDetailResponseDto getQnaDetail(Long id, String currentUserId) {
        log.debug("Q&A 상세 조회 시작: ID={}, 사용자={}", id, currentUserId);
        
        Qna qna = qnaRepository.findById(id)
            .orElseThrow(() -> new BusinessException("존재하지 않는 Q&A입니다."));
        
        // 조회수 증가 (본인이 작성한 글이 아닌 경우에만)
        if (!qna.getQuestionerId().equals(currentUserId)) {
            qnaRepository.incrementViewCount(id);
            qna.incrementViewCount(); // 메모리상 객체도 업데이트
        }
        
        log.debug("Q&A 상세 조회 완료: {}", qna.getTitle());
        return QnaDetailResponseDto.from(qna);
    }

    @Override
    @Transactional
    public Long createQna(QnaCreateRequestDto createRequest, String currentUserId, String currentUserName) {
        log.debug("Q&A 생성 시작: 사용자={}", currentUserId);
        
        // 요청 데이터 정제 및 검증
        createRequest.sanitize();
        if (!createRequest.isValid()) {
            throw new BusinessException("필수 입력 항목이 누락되었습니다.");
        }
        
        // Q&A 엔티티 생성
        Qna qna = Qna.builder()
            .department(createRequest.getDepartment())
            .title(createRequest.getTitle())
            .content(createRequest.getContent())
            .questionerId(currentUserId)
            .questionerName(currentUserName)
            .priority(createRequest.getPriority())
            .category(createRequest.getCategory())
            .isPublic(createRequest.getIsPublic())
            .status(QnaStatus.PENDING)
            .viewCount(0)
            .build();
        
        Qna savedQna = qnaRepository.save(qna);
        
        log.info("Q&A 생성 완료: ID={}, 제목={}", savedQna.getId(), savedQna.getTitle());
        return savedQna.getId();
    }

    @Override
    @Transactional
    public void updateQna(Long id, QnaUpdateRequestDto updateRequest, String currentUserId) {
        log.debug("Q&A 수정 시작: ID={}, 사용자={}", id, currentUserId);
        
        // 요청 데이터 정제 및 검증
        updateRequest.sanitize();
        if (!updateRequest.isValid()) {
            throw new BusinessException("필수 입력 항목이 누락되었습니다.");
        }
        
        // Q&A 조회 및 권한 확인
        Qna qna = qnaRepository.findByIdAndQuestionerId(id, currentUserId)
            .orElseThrow(() -> new BusinessException("수정 권한이 없거나 존재하지 않는 Q&A입니다."));
        
        // 답변 완료된 Q&A는 수정 불가
        if (qna.isAnswered()) {
            throw new BusinessException("답변이 완료된 Q&A는 수정할 수 없습니다.");
        }
        
        // Q&A 정보 업데이트
        qna.setDepartment(updateRequest.getDepartment());
        qna.setTitle(updateRequest.getTitle());
        qna.setContent(updateRequest.getContent());
        qna.setPriority(updateRequest.getPriority());
        qna.setCategory(updateRequest.getCategory());
        qna.setIsPublic(updateRequest.getIsPublic());
        
        log.info("Q&A 수정 완료: ID={}, 제목={}", qna.getId(), qna.getTitle());
    }

    @Override
    @Transactional
    public void deleteQna(Long id, String currentUserId) {
        log.debug("Q&A 삭제 시작: ID={}, 사용자={}", id, currentUserId);
        
        // Q&A 조회 및 권한 확인
        Qna qna = qnaRepository.findByIdAndQuestionerId(id, currentUserId)
            .orElseThrow(() -> new BusinessException("삭제 권한이 없거나 존재하지 않는 Q&A입니다."));
        
        // 답변 완료된 Q&A는 삭제 불가
        if (qna.isAnswered()) {
            throw new BusinessException("답변이 완료된 Q&A는 삭제할 수 없습니다.");
        }
        
        qnaRepository.delete(qna);
        
        log.info("Q&A 삭제 완료: ID={}, 제목={}", id, qna.getTitle());
    }

    @Override
    @Transactional
    public void addAnswer(Long id, QnaAnswerRequestDto answerRequest, String currentUserId, String currentUserName) {
        log.debug("Q&A 답변 등록 시작: ID={}, 답변자={}", id, currentUserId);
        
        // 요청 데이터 정제 및 검증
        answerRequest.sanitize();
        if (!answerRequest.isValid()) {
            throw new BusinessException("답변 내용은 필수입니다.");
        }
        
        // Q&A 조회
        Qna qna = qnaRepository.findById(id)
            .orElseThrow(() -> new BusinessException("존재하지 않는 Q&A입니다."));
        
        // 이미 답변이 있는 경우 확인
        if (qna.isAnswered()) {
            throw new BusinessException("이미 답변이 완료된 Q&A입니다.");
        }
        
        // 답변 등록
        qna.addAnswer(currentUserId, currentUserName, answerRequest.getAnswerContent());
        
        log.info("Q&A 답변 등록 완료: ID={}, 답변자={}", id, currentUserName);
    }

    @Override
    @Transactional
    public void updateAnswer(Long id, QnaAnswerRequestDto answerRequest, String currentUserId) {
        log.debug("Q&A 답변 수정 시작: ID={}, 답변자={}", id, currentUserId);
        
        // 요청 데이터 정제 및 검증
        answerRequest.sanitize();
        if (!answerRequest.isValid()) {
            throw new BusinessException("답변 내용은 필수입니다.");
        }
        
        // Q&A 조회 및 권한 확인
        Qna qna = qnaRepository.findByIdAndAnswererId(id, currentUserId)
            .orElseThrow(() -> new BusinessException("답변 수정 권한이 없거나 존재하지 않는 Q&A입니다."));
        
        // 답변 수정
        qna.setAnswerContent(answerRequest.getAnswerContent());
        
        log.info("Q&A 답변 수정 완료: ID={}", id);
    }

    @Override
    @Transactional
    public void closeQna(Long id, String currentUserId) {
        log.debug("Q&A 종료 시작: ID={}, 사용자={}", id, currentUserId);
        
        // Q&A 조회 및 권한 확인 (질문자 또는 답변자만 종료 가능)
        Qna qna = qnaRepository.findById(id)
            .orElseThrow(() -> new BusinessException("존재하지 않는 Q&A입니다."));
        
        if (!qna.getQuestionerId().equals(currentUserId) && 
            (qna.getAnswererId() == null || !qna.getAnswererId().equals(currentUserId))) {
            throw new BusinessException("Q&A 종료 권한이 없습니다.");
        }
        
        // Q&A 종료
        qna.close();
        
        log.info("Q&A 종료 완료: ID={}", id);
    }

    @Override
    public Page<QnaListResponseDto> getMyQnaList(String currentUserId, QnaSearchRequestDto searchRequest) {
        log.debug("내 Q&A 목록 조회 시작: 사용자={}", currentUserId);
        
        searchRequest.sanitize();
        Sort sort = createSort(searchRequest.getSortBy(), searchRequest.getSortDirection());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        Page<Qna> qnaPage = qnaRepository.findByQuestionerId(currentUserId, pageable);
        
        return qnaPage.map(QnaListResponseDto::from);
    }

    @Override
    public Page<QnaListResponseDto> getMyAnsweredQnaList(String currentUserId, QnaSearchRequestDto searchRequest) {
        log.debug("내 답변 Q&A 목록 조회 시작: 사용자={}", currentUserId);
        
        searchRequest.sanitize();
        Sort sort = createSort(searchRequest.getSortBy(), searchRequest.getSortDirection());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        Page<Qna> qnaPage = qnaRepository.findByAnswererId(currentUserId, pageable);
        
        return qnaPage.map(QnaListResponseDto::from);
    }

    @Override
    public List<QnaListResponseDto> getRecentQnaList(int limit) {
        log.debug("최근 Q&A 목록 조회 시작: limit={}", limit);
        
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Qna> qnaPage = qnaRepository.findByIsPublicTrue(pageable);
        
        return qnaPage.getContent().stream()
            .map(QnaListResponseDto::from)
            .collect(Collectors.toList());
    }

    @Override
    public List<QnaListResponseDto> getPopularQnaList(int limit) {
        log.debug("인기 Q&A 목록 조회 시작: limit={}", limit);
        
        Pageable pageable = PageRequest.of(0, limit, 
            Sort.by(Sort.Direction.DESC, "viewCount", "createdAt"));
        Page<Qna> qnaPage = qnaRepository.findByIsPublicTrue(pageable);
        
        return qnaPage.getContent().stream()
            .map(QnaListResponseDto::from)
            .collect(Collectors.toList());
    }

    @Override
    public Long getPendingQnaCount() {
        return qnaRepository.countByStatus(QnaStatus.PENDING);
    }

    @Override
    public List<QnaStatisticsDto> getDepartmentStatistics() {
        return qnaRepository.findDepartmentStatistics();
    }

    @Override
    public List<QnaMonthlyStatisticsDto> getMonthlyStatistics(int months) {
        LocalDateTime startDate = LocalDateTime.now().minusMonths(months);
        List<Object[]> rawResults = qnaRepository.findMonthlyStatisticsRaw(startDate);
        
        return rawResults.stream()
            .map(row -> new QnaMonthlyStatisticsDto(
                (String) row[0],  // month
                (String) row[1],  // department
                ((Number) row[2]).longValue(),  // question_count
                ((Number) row[3]).longValue(),  // answer_count
                ((Number) row[4]).longValue()   // pending_count
            ))
            .collect(Collectors.toList());
    }

    @Override
    public boolean existsQna(Long id) {
        return qnaRepository.existsById(id);
    }

    @Override
    public boolean canEditQna(Long id, String currentUserId) {
        return qnaRepository.findByIdAndQuestionerId(id, currentUserId).isPresent();
    }

    @Override
    public boolean canAnswerQna(Long id, String currentUserId) {
        // 답변 권한은 질문자가 아닌 경우에만 허용 (실제 권한 체크는 별도 구현 필요)
        return qnaRepository.findById(id)
            .map(qna -> !qna.getQuestionerId().equals(currentUserId))
            .orElse(false);
    }

    @Override
    public Long getTotalQnaCount() {
        return qnaRepository.count();
    }

    @Override
    @Transactional
    public String createTestData() {
        // 테스트 데이터 생성 (실제 운영에서는 제거 필요)
        log.info("Q&A 테스트 데이터 생성 시작");
        
        // 테스트 Q&A 생성
        Qna testQna = Qna.builder()
            .department("IT지원팀")
            .title("테스트 Q&A")
            .content("테스트용 질문입니다.")
            .questionerId("testuser")
            .questionerName("테스트사용자")
            .priority(QnaPriority.NORMAL)
            .category("테스트")
            .isPublic(true)
            .build();
        
        qnaRepository.save(testQna);
        
        return "테스트 데이터 생성 완료";
    }

    /**
     * 정렬 조건 생성
     */
    private Sort createSort(String sortBy, String sortDirection) {
        Sort.Direction direction = "DESC".equalsIgnoreCase(sortDirection) ? 
            Sort.Direction.DESC : Sort.Direction.ASC;
        
        // 기본 정렬: 생성일 내림차순
        String sortField = sortBy != null ? sortBy : "createdAt";
        
        return Sort.by(direction, sortField);
    }
}
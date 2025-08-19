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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

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

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<QnaListResponseDto> getQnaList(QnaSearchRequestDto searchRequest) {
        
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
                null, // department 제거
                searchRequest.getStatus(),
                null, // priority 제거
                searchRequest.getCategory(),
                searchRequest.getIsPublic(),
                startDateTime,
                endDateTime,
                pageable
            );
        } else {
            qnaPage = qnaRepository.findAll(pageable);
        }
        
        return qnaPage.map(QnaListResponseDto::from);
    }

    @Override
    @Transactional
    public QnaDetailResponseDto getQnaDetail(Long id, String currentUserId) {
        
        Qna qna = qnaRepository.findById(id)
            .orElseThrow(() -> new BusinessException("존재하지 않는 Q&A입니다."));
        
        // 조회수 증가 (본인이 작성한 글이 아닌 경우에만)
        if (!qna.getQuestionerId().equals(currentUserId)) {
            qnaRepository.incrementViewCount(id);
            qna.incrementViewCount(); // 메모리상 객체도 업데이트
        }
        
        return QnaDetailResponseDto.from(qna);
    }

    @Override
    @Transactional
    public Long createQna(QnaCreateRequestDto createRequest, String currentUserId, String currentUserName) {
        
        // 요청 데이터 정제 및 검증
        createRequest.sanitize();
        if (!createRequest.isValid()) {
            throw new BusinessException("필수 입력 항목이 누락되었습니다.");
        }
        
        // 시퀀스가 테이블의 MAX(id)보다 뒤쳐져 있을 수 있으므로, 사전 보정
        // (운영 중 수동 데이터 마이그레이션/직접 Insert 이후 발생하는 PK 충돌 예방)
        ensureQnaSequenceAhead();

        // Q&A 엔티티 생성
        Qna qna = Qna.builder()
            // department 제거됨
            .title(createRequest.getTitle())
            .content(createRequest.getContent())
            .questionerId(currentUserId)
            // 이름 비정규화 제거됨
            .priority(createRequest.getPriority())
            .category(createRequest.getCategory())
            .isPublic(createRequest.getIsPublic())
            .status(QnaStatus.PENDING)
            .viewCount(0)
            .build();
        
        Qna savedQna = qnaRepository.save(qna);
        
        return savedQna.getId();
    }

    /**
     * qna 테이블의 id 시퀀스(qna_id_seq)가 MAX(id)+1 이상이 되도록 보정한다.
     * 필요할 때만 setval을 호출 (불필요한 변경 방지).
     */
    private void ensureQnaSequenceAhead() {
        try {
            // MAX(id)
            Number maxIdNum = (Number) entityManager
                .createNativeQuery("SELECT COALESCE(MAX(id), 0) FROM public.qna")
                .getSingleResult();
            long maxId = maxIdNum != null ? maxIdNum.longValue() : 0L;

            // 시퀀스 현재값(last_value)
            Number lastValNum = (Number) entityManager
                .createNativeQuery("SELECT last_value FROM public.qna_id_seq")
                .getSingleResult();
            long lastVal = lastValNum != null ? lastValNum.longValue() : 0L;

            // 뒤쳐져 있으면 보정
            if (maxId >= lastVal) {
                long newVal = maxId + 1;
                entityManager
                    .createNativeQuery("SELECT setval('public.qna_id_seq', :newVal, false)")
                    .setParameter("newVal", newVal)
                    .getSingleResult();
                log.info("[QNA] 시퀀스 보정: last_value={} -> {} (maxId={})", lastVal, newVal, maxId);
            }
        } catch (Exception e) {
            // 보정 실패 시 로깅만 하고 계속 진행 (DB 권한/시퀀스명 변경 등 환경 이슈에 대비)
            log.warn("[QNA] 시퀀스 보정 실패: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void updateQna(Long id, QnaUpdateRequestDto updateRequest, String currentUserId) {

        // 요청 데이터 정제 및 검증
        updateRequest.sanitize();
        if (!updateRequest.isValid()) {
            throw new BusinessException("필수 입력 항목이 누락되었습니다.");
        }

        // 권한 체크 임시 비활성화: 답변대기 상태(PENDING)인 경우에만 수정 허용
        Qna qna = qnaRepository.findById(id)
            .orElseThrow(() -> new BusinessException("존재하지 않는 Q&A입니다."));

        if (!qna.isPending()) {
            throw new BusinessException("답변대기 상태에서만 수정할 수 있습니다.");
        }

        // Q&A 정보 업데이트
        // department 제거됨
        qna.setTitle(updateRequest.getTitle());
        qna.setContent(updateRequest.getContent());
        // priority 제거됨
        qna.setCategory(updateRequest.getCategory());
        qna.setIsPublic(updateRequest.getIsPublic());

    }

    @Override
    @Transactional
    public void deleteQna(Long id, String currentUserId) {

        // 권한 체크 임시 비활성화: 작성자와 무관하게 삭제 허용 (요청 반영)
        Qna qna = qnaRepository.findById(id)
            .orElseThrow(() -> new BusinessException("존재하지 않는 Q&A입니다."));

        // 답변 완료된 Q&A는 삭제 불가 (유지)
        if (qna.isAnswered()) {
            throw new BusinessException("답변이 완료된 Q&A는 삭제할 수 없습니다.");
        }

        qnaRepository.delete(qna);

    }

    @Override
    @Transactional
    public void addAnswer(Long id, QnaAnswerRequestDto answerRequest, String currentUserId, String currentUserName) {
        
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
        
    }

    @Override
    @Transactional
    public void updateAnswer(Long id, QnaAnswerRequestDto answerRequest, String currentUserId) {
        
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
        
    }

    @Override
    public Page<QnaListResponseDto> getMyQnaList(String currentUserId, QnaSearchRequestDto searchRequest) {
        
        searchRequest.sanitize();
        Sort sort = createSort(searchRequest.getSortBy(), searchRequest.getSortDirection());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        Page<Qna> qnaPage = qnaRepository.findByQuestionerId(currentUserId, pageable);
        
        return qnaPage.map(QnaListResponseDto::from);
    }

    @Override
    public Page<QnaListResponseDto> getMyAnsweredQnaList(String currentUserId, QnaSearchRequestDto searchRequest) {
        searchRequest.sanitize();
        Sort sort = createSort(searchRequest.getSortBy(), searchRequest.getSortDirection());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
        
        Page<Qna> qnaPage = qnaRepository.findByAnswererId(currentUserId, pageable);
        
        return qnaPage.map(QnaListResponseDto::from);
    }


    @Override
    public Long getPendingQnaCount() {
        return qnaRepository.countByStatus(QnaStatus.PENDING);
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
package org.itcen.domain.submission.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.submission.dto.SubmissionDto;
import org.itcen.domain.submission.entity.Submission;
import org.itcen.domain.submission.repository.SubmissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {
    private final SubmissionRepository repository;

    @Override
    @Transactional
    public SubmissionDto createSubmission(SubmissionDto dto) {
        // submit_hist_cd 자동생성 (submitHistCd가 없거나 빈 문자열인 경우)
        String submitHistCd = dto.getSubmitHistCd();
        if (submitHistCd == null || submitHistCd.trim().isEmpty()) {
            submitHistCd = generateSubmitHistCd();
            dto.setSubmitHistCd(submitHistCd);
        }
        
        Submission entity = Submission.builder()
            .submitHistCd(submitHistCd)
            .execofficerId(dto.getExecofficerId())
            .rmSubmitDt(dto.getRmSubmitDt())
            .updateYn(dto.getUpdateYn() != null ? dto.getUpdateYn() : "N")
            .rmSubmitRemarks(dto.getRmSubmitRemarks())
            .positionsId(dto.getPositionsId())
            .bankCd(dto.getBankCd())
            .createdId(dto.getCreatedId())
            .updatedId(dto.getUpdatedId())
            .createdAt(dto.getCreatedAt())
            .updatedAt(dto.getUpdatedAt())
            .build();
        Submission saved = repository.save(entity);
        dto.setId(saved.getId());
        return dto;
    }
    
    /**
     * submit_hist_cd 자동생성 메서드
     * 형식: SUB + YYYYMMDDHHMMSS (최대 20자리)
     * 예: SUB20241221143022
     */
    private String generateSubmitHistCd() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = now.format(formatter);
        
        String submitHistCd = "SUB" + timestamp;
        
        // 중복 체크 및 유니크 보장
        int counter = 1;
        String originalCode = submitHistCd;
        
        while (repository.existsBySubmitHistCd(submitHistCd)) {
            // 중복된 경우 뒤에 숫자 추가 (최대 20자리 제한)
            String suffix = String.format("%02d", counter);
            if (originalCode.length() + suffix.length() <= 20) {
                submitHistCd = originalCode + suffix;
            } else {
                // 20자리를 초과하는 경우 타임스탬프 일부를 제거하고 숫자 추가
                int maxTimestampLength = 20 - 3 - suffix.length(); // SUB(3) + suffix 길이
                String truncatedTimestamp = timestamp.substring(0, Math.min(timestamp.length(), maxTimestampLength));
                submitHistCd = "SUB" + truncatedTimestamp + suffix;
            }
            counter++;
            
            // 무한루프 방지 (counter가 너무 커지면 현재 밀리초 추가)
            if (counter > 99) {
                long millis = System.currentTimeMillis() % 1000;
                submitHistCd = String.format("SUB%s%03d", timestamp.substring(0, 11), millis);
                break;
            }
        }
        
        return submitHistCd;
    }

    @Override
    @Transactional
    public SubmissionDto updateSubmission(Long id, SubmissionDto dto) {
        Submission entity = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("제출 이력이 존재하지 않습니다."));
        entity.setSubmitHistCd(dto.getSubmitHistCd());
        entity.setExecofficerId(dto.getExecofficerId());
        entity.setRmSubmitDt(dto.getRmSubmitDt());
        entity.setUpdateYn(dto.getUpdateYn());
        entity.setRmSubmitRemarks(dto.getRmSubmitRemarks());
        entity.setPositionsId(dto.getPositionsId());
        entity.setBankCd(dto.getBankCd());
        entity.setUpdatedId(dto.getUpdatedId());
        entity.setUpdatedAt(java.time.LocalDateTime.now());
        repository.save(entity);
        dto.setId(entity.getId());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionDto getSubmission(Long id) {
        Submission entity = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("제출 이력이 존재하지 않습니다."));
        return SubmissionDto.builder()
            .id(entity.getId())
            .submitHistCd(entity.getSubmitHistCd())
            .execofficerId(entity.getExecofficerId())
            .rmSubmitDt(entity.getRmSubmitDt())
            .updateYn(entity.getUpdateYn())
            .rmSubmitRemarks(entity.getRmSubmitRemarks())
            .positionsId(entity.getPositionsId())
            .bankCd(entity.getBankCd())
            .createdId(entity.getCreatedId())
            .updatedId(entity.getUpdatedId())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissionHistoryWithPositions(LocalDate startDate, LocalDate endDate, String ledgerOrder) {
        
        // 모든 데이터를 가져온 후 서비스 레이어에서 필터링
        List<Object[]> results = repository.findAllSubmissionHistoryWithPositions();
        
        return results.stream()
            .map(this::mapToSubmissionDto)
            .filter(dto -> {
                // 날짜 필터링
                if (startDate != null && dto.getSubmissionDate() != null && dto.getSubmissionDate().isBefore(startDate)) {
                    return false;
                }
                if (endDate != null && dto.getSubmissionDate() != null && dto.getSubmissionDate().isAfter(endDate)) {
                    return false;
                }
                // 원장차수 필터링 ("전체" 또는 null/빈문자열이면 모든 데이터 포함)
                if (ledgerOrder != null && !ledgerOrder.trim().isEmpty() && !"전체".equals(ledgerOrder)) {
                    return ledgerOrder.equals(dto.getLedgerOrder());
                }
                return true;
            })
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public void deleteSubmissions(List<Long> ids) {
        repository.deleteAllById(ids);
    }
    
    private SubmissionDto mapToSubmissionDto(Object[] row) {
        return SubmissionDto.builder()
            .id(row[0] != null ? ((Number) row[0]).longValue() : null)  // rm_submit_mgmt_id
            .historyCode((String) row[1])  // submit_hist_cd
            .execofficerId((String) row[2])  // execofficer_id (직원 ID)
            .executiveName((String) row[3])  // COALESCE(u.username, s.execofficer_id) (실제 임원 이름)
            .position((String) row[4])  // positions_nm (직책명)
            .submissionDate(row[5] != null ? ((Date) row[5]).toLocalDate() : null)  // rm_submit_dt
            .attachmentFile((String) row[6])  // 첨부파일명 (COALESCE(a.original_name, ''))
            .remarks((String) row[7])  // rm_submit_remarks
            .positionsId(row[8] != null ? ((Number) row[8]).longValue() : null)  // positions_id
            .positionsNm((String) row[9])  // positions_nm
            .ledgerOrder(row[10] != null ? ((Number) row[10]).longValue() : null)  // ledger_order
            .confirmGubunCd((String) row[11])  // confirm_gubun_cd
            .writeDeptCd((String) row[12])  // write_dept_cd
            .bankCd((String) row[13]) // bank_cd
            .hasAttachment(row[14] != null ? (Boolean) row[14] : false)  // 첨부파일 존재 여부
            .attachmentCount(row[15] != null ? ((Number) row[15]).intValue() : 0)  // 첨부파일 개수
            // 중복 필드들 (DTO 호환성을 위해)
            .submitHistCd((String) row[1])  // submit_hist_cd
            .rmSubmitDt(row[5] != null ? ((Date) row[5]).toLocalDate() : null)  // rm_submit_dt
            .rmSubmitRemarks((String) row[7])  // rm_submit_remarks
            .build();
    }
}

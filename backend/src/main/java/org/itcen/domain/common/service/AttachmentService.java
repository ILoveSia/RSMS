package org.itcen.domain.common.service;

import org.itcen.domain.common.dto.AttachmentDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * 첨부파일 서비스 인터페이스
 * 
 * 첨부파일 관련 비즈니스 로직을 정의하는 인터페이스입니다.
 * 
 * 설계 원칙:
 * - Interface Segregation: 첨부파일 관련 기능만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 * - Single Responsibility: 첨부파일 관련 비즈니스 로직만 담당
 */
public interface AttachmentService {

    /**
     * 파일 업로드
     * 
     * @param files 업로드할 파일 목록
     * @param uploadRequest 업로드 요청 정보
     * @return 업로드 결과 목록
     * @throws IOException 파일 저장 중 오류 발생 시
     */
    List<AttachmentDto.UploadResult> uploadFiles(List<MultipartFile> files, AttachmentDto.UploadRequest uploadRequest) throws IOException;

    /**
     * 단일 파일 업로드
     * 
     * @param file 업로드할 파일
     * @param uploadRequest 업로드 요청 정보
     * @return 업로드 결과
     * @throws IOException 파일 저장 중 오류 발생 시
     */
    AttachmentDto.UploadResult uploadFile(MultipartFile file, AttachmentDto.UploadRequest uploadRequest) throws IOException;

    /**
     * 단일 파일 업데이트
     * 
     * @param file 업로드할 파일
     * @param attachId 업데이트할 첨부파일 ID
     * @param uploadRequest 업로드 요청 정보
     * @return 업로드 결과
     * @throws IOException 파일 저장 중 오류 발생 시
     */
    AttachmentDto.UploadResult updateFile(MultipartFile file, Long attachId, AttachmentDto.UploadRequest uploadRequest) throws IOException;

    /**
     * 엔티티의 첨부파일 목록 조회
     * 
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @return 첨부파일 목록
     */
    List<AttachmentDto.Response> getAttachmentsByEntity(String entityType, Long entityId);

    /**
     * 첨부파일 상세 조회
     * 
     * @param attachId 첨부파일 ID
     * @return 첨부파일 정보
     */
    AttachmentDto.Response getAttachmentById(Long attachId);

    /**
     * 첨부파일 다운로드 정보 조회
     * 
     * @param attachId 첨부파일 ID
     * @return 다운로드 정보
     */
    AttachmentDto.DownloadInfo getDownloadInfo(Long attachId);

    /**
     * 첨부파일 삭제
     * 
     * @param attachId 첨부파일 ID
     * @param deletedBy 삭제자 ID
     */
    void deleteAttachment(Long attachId, String deletedBy);

    /**
     * 첨부파일 일괄 삭제
     * 
     * @param attachIds 첨부파일 ID 목록
     * @param deletedBy 삭제자 ID
     */
    void deleteAttachments(List<Long> attachIds, String deletedBy);

    /**
     * 엔티티의 모든 첨부파일 삭제
     * 
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @param deletedBy 삭제자 ID
     */
    void deleteAllAttachmentsByEntity(String entityType, Long entityId, String deletedBy);

    /**
     * 엔티티의 첨부파일 개수 조회
     * 
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @return 첨부파일 개수
     */
    long getAttachmentCount(String entityType, Long entityId);

    /**
     * 파일 존재 여부 확인
     * 
     * @param attachId 첨부파일 ID
     * @return 존재 여부
     */
    boolean exists(Long attachId);

    /**
     * 업로드자의 첨부파일 목록 조회
     * 
     * @param uploadedBy 업로드자 ID
     * @return 첨부파일 목록
     */
    List<AttachmentDto.Response> getAttachmentsByUploader(String uploadedBy);

    /**
     * 첨부파일을 엔티티에 연결합니다.
     * 파일 업로드 시에는 entityType과 entityId가 null로 저장될 수 있으므로,
     * 실제 엔티티 생성 후 이 메서드를 통해 연결 정보를 업데이트합니다.
     *
     * @param entityId 연결할 엔티티의 ID
     * @param entityType 연결할 엔티티의 타입 (예: "SUBMISSION_REPORT")
     * @param attachIds 연결할 첨부파일 ID 목록
     */
    void linkAttachments(Long entityId, String entityType, List<Long> attachIds);

}
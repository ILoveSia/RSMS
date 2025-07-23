/**
 * 첨부파일 API 클라이언트
 * 
 * attachments 테이블과 연동하여 파일 업로드, 다운로드, 삭제 기능을 제공합니다.
 */
import apiClient from '@/app/common/api/client';

export interface AttachmentUploadRequest {
  entityType: string;
  entityId: number;
  uploadedBy: string;
}

export interface AttachmentResponse {
  attachId: number;
  contentType: string;
  filePath: string;
  fileSize: number;
  originalFilename: string;
  storedFilename: string;
  uploadedBy: string;
  entityType: string;
  entityId: number;
  createdId: string;
  createdAt: string;
  updatedId: string;
  updatedAt: string;
}

export interface AttachmentUploadResult {
  attachId?: number;
  originalFilename: string;
  storedFilename?: string;
  fileSize?: number;
  message: string;
}

export interface AttachmentDownloadInfo {
  originalFilename: string;
  contentType: string;
  fileSize: number;
  filePath: string;
}

/**
 * 첨부파일 API 클라이언트 클래스
 */
class AttachmentApiClient {
  private readonly baseUrl = '/attachments';

  /**
   * 여러 파일 업로드
   */
  async uploadFiles(
    files: File[], 
    request: AttachmentUploadRequest
  ): Promise<AttachmentUploadResult[]> {
    const formData = new FormData();
    
    // 파일들 추가
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // 추가 정보 추가
    formData.append('entityType', request.entityType);
    formData.append('entityId', request.entityId.toString());
    formData.append('uploadedBy', request.uploadedBy);

    const response = await apiClient.post<AttachmentUploadResult[]>(
      `${this.baseUrl}/upload`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  }

  /**
   * 단일 파일 업로드
   */
  async uploadFile(
    file: File, 
    request: AttachmentUploadRequest
  ): Promise<AttachmentUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', request.entityType);
    formData.append('entityId', request.entityId.toString());
    formData.append('uploadedBy', request.uploadedBy);

    const response = await apiClient.post<AttachmentUploadResult>(
      `${this.baseUrl}/upload/single`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  }

  /**
   * 엔티티의 첨부파일 목록 조회
   */
  async getAttachmentsByEntity(
    entityType: string, 
    entityId: number
  ): Promise<AttachmentResponse[]> {
    const response = await apiClient.get<AttachmentResponse[]>(
      `${this.baseUrl}/entity/${entityType}/${entityId}`
    );

    return response;
  }

  /**
   * 첨부파일 상세 조회
   */
  async getAttachmentById(attachId: number): Promise<AttachmentResponse> {
    const response = await apiClient.get<AttachmentResponse>(
      `${this.baseUrl}/${attachId}`
    );

    return response;
  }

  /**
   * 첨부파일 다운로드 URL 생성
   */
  getDownloadUrl(attachId: number): string {
    return `${this.baseUrl}/download/${attachId}`;
  }

  /**
   * 첨부파일 다운로드 정보 조회
   */
  async getDownloadInfo(attachId: number): Promise<AttachmentDownloadInfo> {
    const response = await apiClient.get<AttachmentDownloadInfo>(
      `${this.baseUrl}/${attachId}/download-info`
    );

    return response;
  }

  /**
   * 첨부파일 삭제
   */
  async deleteAttachment(attachId: number, deletedBy: string): Promise<void> {
    await apiClient.delete(
      `${this.baseUrl}/${attachId}?deletedBy=${encodeURIComponent(deletedBy)}`
    );
  }

  /**
   * 첨부파일 일괄 삭제
   */
  async deleteAttachments(attachIds: number[], deletedBy: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/bulk`, {
      data: {
        attachIds,
        deletedBy,
      },
    });
  }

  /**
   * 엔티티의 모든 첨부파일 삭제
   */
  async deleteAllAttachmentsByEntity(
    entityType: string, 
    entityId: number, 
    deletedBy: string
  ): Promise<void> {
    await apiClient.delete(
      `${this.baseUrl}/entity/${entityType}/${entityId}?deletedBy=${encodeURIComponent(deletedBy)}`
    );
  }

  /**
   * 엔티티의 첨부파일 개수 조회
   */
  async getAttachmentCount(entityType: string, entityId: number): Promise<number> {
    const response = await apiClient.get<number>(
      `${this.baseUrl}/count/${entityType}/${entityId}`
    );

    return response;
  }

  /**
   * 업로드자의 첨부파일 목록 조회
   */
  async getAttachmentsByUploader(uploadedBy: string): Promise<AttachmentResponse[]> {
    const response = await apiClient.get<AttachmentResponse[]>(
      `${this.baseUrl}/uploader/${encodeURIComponent(uploadedBy)}`
    );

    return response;
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const attachmentApi = new AttachmentApiClient();
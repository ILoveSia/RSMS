import apiClient from '@/app/common/api/client';
import type { AttachmentType } from '@/domains/report/pages/types';
export interface AttachmentUploadRequest {
  entityType: string;
  entityId: number;
  uploadedBy: string;
}

/**
 * 첨부파일 업로드
 */
export async function uploadAttachment(
  file: File,
  request: AttachmentUploadRequest
): Promise<AttachmentType> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', request.entityType);
  formData.append('entityId', request.entityId.toString());
  formData.append('uploadedBy', request.uploadedBy);

  const response = await apiClient.post('/common/attachments/upload/single', formData);
  if (response !== false) {
    return response as AttachmentType;
  } else {
    throw new Error(response || '파일 업로드에 실패했습니다.');
  }
}
export async function writeAttachment(
  file: File,
  request: AttachmentUploadRequest
): Promise<AttachmentType> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', request.entityType);
  formData.append('entityId', request.entityId.toString());
  formData.append('uploadedBy', request.uploadedBy);

  const response = await apiClient.post('/common/attachments/write/single', formData);
  if (response !== false) {
    return response as AttachmentType;
  } else {
    throw new Error(response || '파일 업로드에 실패했습니다.');
  }
}
/**
 * 첨부파일 목록 조회
 */
export async function getAttachments(entityType: string, entityId: number): Promise<AttachmentType> {
  const response:AttachmentType[] = await apiClient.get(`/common/attachments`, {
    params: {
      entityType,
      entityId
    }
  });
  if (response.length > 0) {
    return response[0] as AttachmentType;
  } else {
    throw new Error('첨부파일 목록 조회에 실패했습니다.');
  }
}

/**
 * 첨부파일 다운로드
 */
export async function downloadAttachment(attachmentId: number): Promise<Blob> {
  // Blob 응답을 위해 fetch API를 직접 사용
  const response = await fetch(`/api/common/attachments/${attachmentId}/download`, {
    method: 'GET',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('파일 다운로드에 실패했습니다.');
  }
  
  return await response.blob();
}

/**
 * 첨부파일 삭제
 */
export async function deleteAttachment(attachmentId: number, deletedBy: string = 'system'): Promise<void> {
  const response = await apiClient.delete(`/common/attachments/${attachmentId}?deletedBy=${deletedBy}`);
  
  if (response === false) {
    throw new Error(response || '첨부파일 삭제에 실패했습니다.');
  }
}

/**
 * 첨부파일 정보 조회
 */
export async function getAttachmentInfo(attachmentId: number): Promise<AttachmentType> {
  const response = await apiClient.get(`/common/attachments/${attachmentId}`);
  
  if (response !== false) {
    return response as AttachmentType;
  } else {
    throw new Error(response || '첨부파일 정보 조회에 실패했습니다.');
  }
}
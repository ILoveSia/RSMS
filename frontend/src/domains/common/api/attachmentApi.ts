import apiClient from '@/app/common/api/client';

export interface AttachmentInfo {
  id: number;
  fileName: string;
  originalName: string;
  fileSize: number;
  filePath: string;
  contentType: string;
  uploadDate: string;
  refTable: string;
  refId: number;
}

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
): Promise<AttachmentInfo> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('entityType', request.entityType);
  formData.append('entityId', request.entityId.toString());
  formData.append('uploadedBy', request.uploadedBy);

  const response = await apiClient.post('/attachments/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.success !== false) {
    return response.data || response;
  } else {
    throw new Error(response.message || '파일 업로드에 실패했습니다.');
  }
}

/**
 * 첨부파일 목록 조회
 */
export async function getAttachments(entityType: string, entityId: number): Promise<AttachmentInfo[]> {
  const response = await apiClient.get(`/attachments/entity/${entityType}/${entityId}`);
  
  if (response.success !== false) {
    return response.data || response || [];
  } else {
    throw new Error(response.message || '첨부파일 목록 조회에 실패했습니다.');
  }
}

/**
 * 첨부파일 다운로드
 */
export async function downloadAttachment(attachmentId: number): Promise<Blob> {
  const response = await apiClient.get(`/attachments/download/${attachmentId}`, {
    responseType: 'blob'
  });
  
  return response;
}

/**
 * 첨부파일 삭제
 */
export async function deleteAttachment(attachmentId: number, deletedBy: string = 'system'): Promise<void> {
  const response = await apiClient.delete(`/attachments/${attachmentId}?deletedBy=${deletedBy}`);
  
  if (response.success === false) {
    throw new Error(response.message || '첨부파일 삭제에 실패했습니다.');
  }
}

/**
 * 첨부파일 정보 조회
 */
export async function getAttachmentInfo(attachmentId: number): Promise<AttachmentInfo> {
  const response = await apiClient.get(`/attachments/${attachmentId}`);
  
  if (response.success !== false) {
    return response.data || response;
  } else {
    throw new Error(response.message || '첨부파일 정보 조회에 실패했습니다.');
  }
}
import { FileUploader, IconButton, DownloadIcon, TrashIcon } from 'evergreen-ui';
import React, { useCallback, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { uploadAttachment, writeAttachment, downloadAttachment } from '@/domains/common/api/attachmentApi';
import type { AttachmentType } from '@/domains/report/pages/types';
import CustomFileCard from './CustomFileCard'; // Import the custom component

interface FileUploadProps {
    /**
     * 해당 데이터의 기존 첨부파일 정보, 없을 시 null
     */
  existingFiles?: AttachmentType | null;
  onSubmit?: (attachId: number | null) => void; // onSubmit에 attachId를 전달
  /**
   * 업로드할 엔티티 타입, 페이지별로 상이하게 지정
   */
  entityType: string;
  /**
   * 업로드한 사용자
   */
  uploadedBy: string;
  /**
   * 이 첨부파일이 연결되어있는 데이터의 id
   */
  entityId?: number;
  /**
   * 읽기 전용 모드
   */
  readonly?: boolean;
  /**
   * 컴포넌트 준비 완료 콜백
   */
  onReady?: () => void;
  /**
   * 기존 파일 제거 콜백
   */
  onRemoveExisting?: () => void;
}

// Ref를 통해 부모 컴포넌트에서 호출할 수 있는 메서드 정의
export interface FileUploadHandle {
  handleSubmit: (id:number|null,mode?: 'create' | 'edit') => Promise<void>;
}

interface FileRejection {
  file: File;
  message?: string;
}

const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>((
    {
     existingFiles=null,
     onSubmit=null, 
     entityType=null, 
     uploadedBy=null, 
     entityId=null, 
     readonly = false, 
     onReady,
     onRemoveExisting
    }, ref) => {
    const [files, setFiles] = useState<File[]>([]);
    const [fileRejections, setFileRejections] = useState<FileRejection[]>([]);
    const [showUploader, setShowUploader] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (onReady) {
            setTimeout(() => {
                onReady();
            }, 0);
        }
    }, [onReady]);
    
    // 기존 파일을 제거하고 업로더를 표시하는 함수
    const handleRemoveExisting = useCallback(() => {
        if (onRemoveExisting) {
            onRemoveExisting();
        }
        setShowUploader(true);
    }, [onRemoveExisting]);
    
    // 새로운 파일 선택 핸들러
    const handleChange = useCallback((files: File[]) => {
        if (files && files.length > 0) {
            setFiles([files[0]]);
            setUploadError(null); // 새로운 파일 선택 시 오류 메시지 초기화
        }
    }, []);
    
    const handleSubmit = useCallback(async (id:number|null,mode?: 'create' | 'edit') => {
        
        // readonly 모드일 경우 업로드를 막음
        if (readonly) {
            if (onSubmit) {
                onSubmit(null);
            }
            return;
        }
        
        if (files.length === 0) {
            if (onSubmit) {
                onSubmit(null);
            }
            return;
        }
        
        const file = files[0];
        setIsUploading(true);
        setUploadError(null);
        
        try {
            // 파일 업로드
            let RID = 0;
            if(mode === 'edit'){
                RID = entityId ?? -1;
            }
            else if(mode === 'create'){
                RID = id ?? -1;
            }
            
            if (RID === -1) {
                throw new Error('유효하지 않은 엔티티 ID입니다.');
            }
            
            const uploadRequest = {
                entityType:entityType as string,
                entityId: RID,
                uploadedBy:uploadedBy as string
            };
            
            const result = await writeAttachment(file, uploadRequest);
            
            // 업로드 성공 시, onSubmit에 attachId를 전달
            if (onSubmit) {
                onSubmit(result.attachId);
            }
        } catch (error: any) {
            // 오류 메시지 추출
            let errorMessage = '파일 업로드에 실패했습니다.';
            
            // HTTP 상태 코드별 오류 메시지 처리
            if (error?.response?.status === 400) {
                if (error?.response?.data?.message) {
                    errorMessage = `${file.name}: ${error.response.data.message}`;
                } else if (error?.response?.data?.error) {
                    errorMessage = `${file.name}: ${error.response.data.error}`;
                } else {
                    errorMessage = `${file.name}: 파일 형식이나 크기가 올바르지 않습니다.`;
                }
            } else if (error?.response?.status === 413) {
                errorMessage = `${file.name}: 파일 크기가 너무 큽니다. (최대 10MB)`;
            } else if (error?.response?.data?.message) {
                errorMessage = `${file.name}: ${error.response.data.message}`;
            } else if (error?.response?.data?.error) {
                errorMessage = `${file.name}: ${error.response.data.error}`;
            } else if (error?.response?.message) {
                errorMessage = `${file.name}: ${error.response.message}`;
            } else if (error?.message) {
                errorMessage = `${file.name}: ${error.message}`;
            } else if (typeof error === 'string') {
                errorMessage = `${file.name}: ${error}`;
            }
            
            setUploadError(errorMessage);
            if (onSubmit) {
                onSubmit(null); // 업로드 실패 시 null을 전달
            }
        } finally {
            setIsUploading(false);
        }
    }, [files, onSubmit, entityType, uploadedBy, entityId, readonly]);

    // ref를 통해 부모 컴포넌트에서 호출할 수 있도록 메서드 노출
    useImperativeHandle(ref, () => ({
        handleSubmit: (id:number|null,mode?: 'create' | 'edit') => {
            return handleSubmit(id, mode);
        }
    }), [handleSubmit]);

    // 선택된 파일 제거 핸들러
    const handleRemove = useCallback(() => {
        setFiles([]);
        setFileRejections([]);
        setUploadError(null);
    }, []);

    // 파일 다운로드 핸들러
    const handleDownload = useCallback(async (attachmentId: number, filename: string) => {
        try {
            const blob = await downloadAttachment(attachmentId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('File download failed:', error);
            setUploadError('파일 다운로드에 실패했습니다.');
        }
    }, []);

    // 기존 파일이 있고, 삭제 버튼을 누르지 않았다면 기존 파일 표시
    if (existingFiles && !showUploader) {
        return (
            <>
                <CustomFileCard
                    name={existingFiles.originalFilename}
                    sizeInBytes={existingFiles.fileSize}
                    type={existingFiles.contentType}
                    isInvalid={false}
                    onRemove={readonly ? undefined : handleRemoveExisting}
                    onDownload={() => handleDownload(existingFiles.attachId, existingFiles.originalFilename)}
                />
                {/* 오류 메시지 표시 */}
                {uploadError && (
                    <div style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
                        {uploadError}
                    </div>
                )}
            </>
        );
    }
    
    // readonly 모드이고 기존 파일이 없으면 아무것도 표시하지 않음
    if (readonly && !existingFiles) {
        return (
            <div style={{ color: 'var(--bank-text-secondary)', fontSize: '14px', padding: '16px', textAlign: 'center' }}>
                첨부된 파일이 없습니다.
            </div>
        );
    }

    // 기존 파일이 없거나 삭제 버튼을 눌렀다면 파일 업로더 표시
    return (
        <>
            <FileUploader
                maxSizeInBytes={10 * 1024 * 1024} // 10MB
                maxFiles={1}
                onChange={handleChange}
                renderFile={(file: File) => {
                    const { name, size, type } = file;
                    const fileRejection = fileRejections.find((fileRejection) => fileRejection.file === file);
                    const { message } = fileRejection || {};
                    return (
                        <CustomFileCard // Use CustomFileCard instead of FileCard
                            name={name}
                            sizeInBytes={size}
                            type={type}
                            isInvalid={fileRejection != null}
                            validationMessage={message}
                            onRemove={handleRemove}
                            // onDownload is not provided for new files, so no download button will be shown
                        />
                    );
                }}
                values={files}
                disabled={isUploading}
            />
            {/* 오류 메시지 표시 */}
            {uploadError && (
                <div style={{ color: 'red', fontSize: '14px', marginTop: '8px' }}>
                    {uploadError}
                </div>
            )}
        </>
    );
});

export default FileUpload;
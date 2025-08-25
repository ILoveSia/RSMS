import { FileUploader, FileCard } from 'evergreen-ui';
import React, { useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { uploadAttachment } from '@/domains/common/api/attachmentApi';
import type { AttachmentType } from '@/domains/report/pages/types';

interface FileUploadProps {
  existingFiles?: AttachmentType | null;
  onRemoveExisting?: () => void;
  onSubmit?: (attachId: number | null) => void; // onSubmit에 attachId를 전달
  entityType: string; // 업로드할 엔티티 타입
  uploadedBy: string; // 업로드한 사용자
  submissionReportId?: number;
}

// Ref를 통해 부모 컴포넌트에서 호출할 수 있는 메서드 정의
export interface FileUploadHandle {
  handleSubmit: (mode?: 'create' | 'edit') => Promise<void>;
}

interface FileRejection {
  file: File;
  message?: string;
}

const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(({ existingFiles, onRemoveExisting, onSubmit, entityType, uploadedBy,submissionReportId }, ref) => {
    const [files, setFiles] = useState<File[]>([]);
    const [fileRejections, setFileRejections] = useState<FileRejection[]>([]);
    const [showUploader, setShowUploader] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
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
    
    const handleSubmit = useCallback(async (mode?: 'create' | 'edit') => {
        console.log("handleSubmit");
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
                RID = submissionReportId ?? -1;
            }
            else if(mode === 'create'){
                RID = 0;
            }
            const result = await uploadAttachment(file, {
                entityType,
                entityId: RID, // 임시 업로드이므로 entityId는 0
                uploadedBy
            });
            
            // 업로드 성공 시, onSubmit에 attachId를 전달
            if (onSubmit) {
                onSubmit(result.attachId);
                console.log("onSubmit",result.attachId);
            }
        } catch (error: any) {
            console.error('File upload failed:', file.name, error);
            
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
    }, [files, onSubmit, entityType, uploadedBy]);

    // ref를 통해 부모 컴포넌트에서 호출할 수 있도록 메서드 노출
    useImperativeHandle(ref, () => ({
        handleSubmit:(mode?: 'create' | 'edit') => handleSubmit(mode)
    }));

    // 선택된 파일 제거 핸들러
    const handleRemove = useCallback(() => {
        setFiles([]);
        setFileRejections([]);
        setUploadError(null);
    }, []);

    // 기존 파일이 있고, 삭제 버튼을 누르지 않았다면 기존 파일 표시
    if (existingFiles && !showUploader) {
        return (
            <>
                <FileCard
                    key={existingFiles.attachId}
                    name={existingFiles.originalFilename}
                    sizeInBytes={existingFiles.fileSize}
                    type={existingFiles.contentType}
                    isInvalid={false}
                    onRemove={handleRemoveExisting}
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
                        <FileCard
                            key={name}
                            isInvalid={fileRejection != null}
                            name={name}
                            onRemove={handleRemove}
                            sizeInBytes={size}
                            type={type}
                            validationMessage={message}
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
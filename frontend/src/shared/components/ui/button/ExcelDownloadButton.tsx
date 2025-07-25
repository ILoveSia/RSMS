/**
 * 엑셀 다운로드 버튼 공통 컴포넌트
 * 
 * 사용법:
 * <ExcelDownloadButton 
 *   onDownload={handleExcelDownload}
 *   filename="audit_report"
 *   disabled={isLoading}
 * />
 */
import { FileDownload as ExcelIcon } from '@mui/icons-material';
import React from 'react';
import Button from './Button';

export interface ExcelDownloadButtonProps {
  /** 다운로드 핸들러 함수 */
  onDownload: () => void | Promise<void>;
  /** 다운로드할 파일명 (확장자 제외, 기본값: 'excel_export') */
  filename?: string;
  /** 버튼 비활성화 여부 */
  disabled?: boolean;
  /** 버튼 크기 */
  size?: 'small' | 'medium' | 'large';
  /** 로딩 상태 */
  loading?: boolean;
  /** 버튼 텍스트 (기본값: '엑셀다운로드') */
  children?: React.ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 버튼 스타일 커스터마이징 */
  sx?: any;
}

/**
 * 엑셀 다운로드 버튼 컴포넌트
 * 
 * 기능:
 * - 일관된 엑셀 다운로드 버튼 UI 제공
 * - 로딩 상태 및 비활성화 상태 지원
 * - 파일명 자동 생성 (날짜/시간 포함)
 * - 다운로드 진행 상태 표시
 */
const ExcelDownloadButton: React.FC<ExcelDownloadButtonProps> = ({
  onDownload,
  filename = 'excel_export',
  disabled = false,
  size = 'small',
  loading = false,
  children = '엑셀다운로드',
  className,
  sx,
}) => {
  
  const [isDownloading, setIsDownloading] = React.useState(false);

  /**
   * 엑셀 다운로드 핸들러
   * 날짜/시간이 포함된 파일명 생성 및 다운로드 실행
   */
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // 현재 날짜/시간으로 파일명 생성
      const now = new Date();
      const timestamp = now.toISOString()
        .replace(/:/g, '')
        .replace(/\..+/, '')
        .replace('T', '_');
      
      const finalFilename = `${filename}_${timestamp}`;
      
      console.log(`엑셀 다운로드 시작: ${finalFilename}.xlsx`);
      
      // 부모 컴포넌트의 다운로드 핸들러 실행
      await onDownload();
      
      console.log('엑셀 다운로드 완료');
      
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      // 에러는 부모 컴포넌트에서 처리하도록 위임
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  const isButtonDisabled = disabled || loading || isDownloading;

  return (
    <Button
      variant="contained"
      size={size}
      onClick={handleDownload}
      disabled={isButtonDisabled}
      color="primary"
      startIcon={<ExcelIcon />}
      className={className}
      sx={{
        minWidth: '120px',
        ...sx,
      }}
    >
      {isDownloading ? '다운로드 중...' : children}
    </Button>
  );
};

export default ExcelDownloadButton;
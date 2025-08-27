/**
 * 관리 버튼 그룹 컴포넌트
 * 등록, 수정, 삭제 등 데이터 관리용 버튼들을 제공합니다.
 */
import React from 'react';
import { Box } from '@mui/material';
import RegisterButton from '@/shared/components/ui/button/RegisterButton';
import ExcelDownloadButton from '@/shared/components/ui/button/ExcelDownloadButton';
import RefreshButton from '@/shared/components/ui/button/RefreshButton';
import EditButton from '@/shared/components/ui/button/EditButton';
import SaveButton from '@/shared/components/ui/button/SaveButton';
import CancelButton from '@/shared/components/ui/button/CancelButton';
import DeleteButton from '@/shared/components/ui/button/DeleteButton';

export interface ManagementButtonGroupProps {
  onRegister?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onRefresh?: () => void;
  onExcelDownload?: () => void | Promise<void>;
  filename?: string;
  // 버튼 활성화/비활성화
  registerDisabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  saveDisabled?: boolean;
  cancelDisabled?: boolean;
  refreshDisabled?: boolean;
  excelDisabled?: boolean;
  
  // 로딩 상태
  registerLoading?: boolean;
  editLoading?: boolean;
  deleteLoading?: boolean;
  saveLoading?: boolean;
  cancelLoading?: boolean;
  refreshLoading?: boolean;
  excelLoading?: boolean;
  
  // 스타일
  spacing?: number;
  align?: 'left' | 'center' | 'right';
  sx?: any;
}

/**
 * 관리 버튼 그룹 컴포넌트
 */
const ManagementButtonGroup: React.FC<ManagementButtonGroupProps> = ({
  onRegister,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onRefresh,
  onExcelDownload,
  
  registerDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  saveDisabled = false,
  cancelDisabled = false,
  refreshDisabled = false,
  excelDisabled = false,
  
  registerLoading = false,
  editLoading = false,
  deleteLoading = false,
  saveLoading = false,
  cancelLoading = false,
  refreshLoading = false,
  excelLoading = false,
  filename = 'excel_export',
  
  spacing = 1,
  align = 'right',
  sx,
}) => {
  // 정렬 설정
  const getJustifyContent = () => {
    switch (align) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
      default:
        return 'flex-end';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: spacing,
        justifyContent: getJustifyContent(),
        alignItems: 'center',
        mb: 1,
        flexShrink: 0,
        ...sx,
      }}
    >
      {/* 새로고침 버튼 */}
      {onRefresh && (
        <RefreshButton
          onClick={onRefresh}
          loading={refreshLoading}
          disabled={refreshDisabled}
        />
      )}

      {/* 엑셀 다운로드 버튼 (공통 컴포넌트) */}
      {onExcelDownload && (
        <ExcelDownloadButton
          filename={filename}
          onDownload={onExcelDownload}
          disabled={excelDisabled || excelLoading}
          loading={excelLoading}
        />
      )}

      {/* 등록 버튼 (공통 컴포넌트) */}
      {onRegister && (
        <RegisterButton
          onClick={onRegister}
          disabled={registerDisabled}
          loading={registerLoading}
        />
      )}

      {/* 수정 버튼 */}
      {onEdit && (
        <EditButton
          onClick={onEdit}
          disabled={editDisabled}
          loading={editLoading}
        />
      )}

      {/* 저장 버튼 */}
      {onSave && (
        <SaveButton
          onClick={onSave}
          disabled={saveDisabled}
          loading={saveLoading}
        />
      )}

      {/* 취소 버튼 */}
      {onCancel && (
        <CancelButton
          onClick={onCancel}
          disabled={cancelDisabled}
          loading={cancelLoading}
        />
      )}

      {/* 삭제 버튼 */}
      {onDelete && (
        <DeleteButton
          onClick={onDelete}
          disabled={deleteDisabled}
          loading={deleteLoading}
        />
      )}
    </Box>
  );
};

export default ManagementButtonGroup;
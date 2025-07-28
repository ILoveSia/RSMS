/**
 * 이행결과 작성 다이얼로그 컴포넌트
 * 미흡상황에 대한 이행결과를 작성하는 팝업
 */
import BaseDialog from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';

import { Box, Typography, Divider } from '@mui/material';
import React, { useState, useCallback } from 'react';

export interface ImplementationResultData {
  id: number;
  deficiencyContent: string;
  improvementPlan: string;
  auditDetailCoantent?: string;
  auditDoneContent?: string;
  auditDoneDt?: string;
  implementationStatus?: string;
}

export interface ImplementationResultDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 닫기 핸들러 */
  onClose: () => void;
  /** 선택된 미흡상황 데이터 */
  data?: ImplementationResultData;
  /** 저장 핸들러 */
  onSave: (data: ImplementationResultData) => Promise<void>;
}

const ImplementationResultDialog: React.FC<ImplementationResultDialogProps> = ({
  open,
  onClose,
  data,
  onSave,
}) => {
  const [auditDoneContent, setAuditDoneContent] = useState<string>('');
  const [auditDoneDt, setAuditDoneDt] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // 다이얼로그가 열릴 때 데이터 초기화
  React.useEffect(() => {
    if (open && data) {
      setAuditDoneContent(data.auditDoneContent || '');
      setAuditDoneDt(data.auditDoneDt ? new Date(data.auditDoneDt) : null);
    }
  }, [open, data]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!data) return;

    if (!auditDoneContent.trim()) {
      alert('이행결과를 입력해주세요.');
      return;
    }



    setLoading(true);
    try {
      const updatedData: ImplementationResultData = {
        ...data,
        auditDoneContent: auditDoneContent.trim(),
        auditDoneDt: auditDoneDt ? auditDoneDt.toISOString().split('T')[0] : '',
        implementationStatus: '완료', // 기본값으로 완료 설정
      };

      await onSave(updatedData);
      onClose();
    } catch (error) {
      console.error('이행결과 저장 실패:', error);
      alert('이행결과 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [data, auditDoneContent, auditDoneDt, onSave, onClose]);

  // 취소 핸들러

  return (
    <BaseDialog
      open={open}
      onClose={onClose}
      title="이행결과 작성"
      maxWidth="md"
      mode="create"
      onSave={handleSave}
      disableSave={loading || !auditDoneContent.trim()}
      loading={loading}
    >
      {/* 미흡사항 정보 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          미흡사항
        </Typography>
        <Box sx={{
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300'
        }}>
          <Typography variant="body2">
            {data?.deficiencyContent || '미흡사항 내용이 없습니다.'}
          </Typography>
        </Box>
      </Box>

      {/* 개선계획 세부내용 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          개선계획 세부내용
        </Typography>
        <Box sx={{
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300'
        }}>
          <Typography variant="body2">
            {data?.auditDetailCoantent || '개선계획 세부내용이 없습니다.'}
          </Typography>
        </Box>
      </Box>

      {/* 이행완료 예정일자 (읽기 전용) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          이행완료 예정일자
        </Typography>
        <Box sx={{
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300'
        }}>
          <Typography variant="body2">
            {auditDoneDt ? auditDoneDt.toLocaleDateString('ko-KR') : '예정일자가 설정되지 않았습니다.'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* 이행결과 입력 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          이행결과 <span style={{ color: 'red' }}>*</span>
        </Typography>
        <TextField
          multiline
          rows={4}
          fullWidth
          value={auditDoneContent}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuditDoneContent(e.target.value)}
          placeholder="이행결과를 상세히 입력해주세요."
          variant="outlined"
          size="small"
        />
      </Box>

    </BaseDialog>
  );
};

export default ImplementationResultDialog;
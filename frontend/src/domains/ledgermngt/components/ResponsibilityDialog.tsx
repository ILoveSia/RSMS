/**
 * 책무 등록/수정/조회 다이얼로그 컴포넌트
 */
import Alert from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import { Box, Chip, Typography } from '@mui/material';
import React, { useState } from 'react';

interface PositionResponsibility {
  id: number;
  classification: string;
  positionId: string;
  positionName: string;
  responsibilityOverview: string;
  responsibilityStartDate: string;
  lastModifiedDate: string;
  createdAt: string;
  updatedAt: string;
}

interface IResponsibilityDialogProps {
  open: boolean;
  mode: DialogMode;
  responsibility: PositionResponsibility | null;
  onClose: () => void;
  onSave: () => void;
  onModeChange: (mode: DialogMode) => void;
}

const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
  open,
  mode,
  responsibility,
  onClose,
  onSave,
  onModeChange,
}) => {
  const [formData, setFormData] = useState<Partial<PositionResponsibility>>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  React.useEffect(() => {
    if (responsibility && open) {
      setFormData(responsibility);
    } else {
      setFormData({});
    }
  }, [responsibility, open]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave();

      setShowSuccessAlert(true);
      onClose();

      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 2000);
    } catch (err) {
      console.error('책무 저장 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverviewChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilityOverview: value
    }));
  };

  return (
    <>
      <BaseDialog
        open={open}
        mode={mode}
        title={`책무 ${mode === 'view' ? '상세 정보' : '수정'}`}
        onClose={onClose}
        onSave={handleSave}
        onModeChange={onModeChange}
        maxWidth="md"
        fullWidth
        disableSave={loading}
        loading={loading}
      >
        {responsibility && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">구분</Typography>
              <Chip
                label={responsibility.classification}
                size="small"
                color={
                  responsibility.classification === '핵심' ? 'error' :
                  responsibility.classification === '중요' ? 'warning' :
                  responsibility.classification === '일반' ? 'default' : 'default'
                }
              />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <div>
                <Typography variant="subtitle2">직책 ID</Typography>
                <Typography>{responsibility.positionId}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2">직책명</Typography>
                <Typography>{responsibility.positionName}</Typography>
              </div>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">책무 개요</Typography>
              {mode === 'edit' ? (
                <textarea
                  value={formData.responsibilityOverview || ''}
                  onChange={(e) => handleOverviewChange(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '8px',
                    border: '1px solid var(--bank-border)',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <Typography style={{ whiteSpace: 'pre-wrap' }}>
                  {responsibility.responsibilityOverview || '미작성'}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <div>
                <Typography variant="subtitle2">책무 시작일</Typography>
                <Typography>{responsibility.responsibilityStartDate}</Typography>
              </div>
              <div>
                <Typography variant="subtitle2">최종 수정일</Typography>
                <Typography>{responsibility.lastModifiedDate}</Typography>
              </div>
            </Box>
          </Box>
        )}
      </BaseDialog>

      <Alert
        open={showSuccessAlert}
        message="책무가 수정되었습니다."
        severity="success"
        autoHideDuration={2000}
        onClose={() => setShowSuccessAlert(false)}
      />
    </>
  );
};

export default ResponsibilityDialog;

/**
 * 책무 등록/수정/조회 다이얼로그 컴포넌트
 */
import type { Responsibility, ResponsibilityDetail } from '@/app/types';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import {
    Box,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { responsibilityApi } from '../api/responsibilityApi';

interface IResponsibilityDialogProps {
  open: boolean;
  mode: DialogMode;
  responsibilityId: number | null;
  onClose: () => void;
  onSave: () => void;
  onChangeMode: (mode: DialogMode) => void;
}

const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
  open,
  mode,
  responsibilityId,
  onClose,
  onSave,
  onChangeMode,
}) => {
  const [formData, setFormData] = useState<Partial<Responsibility>>({});
  const [details, setDetails] = useState<ResponsibilityDetail[]>([
    {
      id: `temp-${Date.now()}`,
      responsibilityDetailContent: '',
      keyManagementTasks: '',
      relatedBasis: '',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponsibility = async () => {
      if (!responsibilityId) return;

      try {
        setLoading(true);
        const data = await responsibilityApi.getById(responsibilityId);
        setFormData(data);
        if (data.details && data.details.length > 0) {
          setDetails(data.details);
        }
      } catch (err) {
        console.error('책무 상세 정보 조회 실패:', err);
        setError('책무 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (open && responsibilityId) {
      fetchResponsibility();
    } else {
      setFormData({});
      setDetails([
        {
          id: `temp-${Date.now()}`,
          responsibilityDetailContent: '',
          keyManagementTasks: '',
          relatedBasis: '',
        },
      ]);
    }
  }, [open, responsibilityId]);

  const handleInputChange = (field: keyof Responsibility, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailChange = (id: string, field: keyof ResponsibilityDetail, value: string) => {
    setDetails(prev =>
      prev.map(detail =>
        detail.id === id ? { ...detail, [field]: value } : detail
      )
    );
  };

  const addDetail = () => {
    setDetails(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        responsibilityDetailContent: '',
        keyManagementTasks: '',
        relatedBasis: '',
      },
    ]);
  };

  const removeDetail = (id: string) => {
    if (details.length > 1) {
      setDetails(prev => prev.filter(detail => detail.id !== id));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        responsibilityContent: formData.responsibilityContent,
        details: details.map(detail => ({
          responsibilityDetailContent: detail.responsibilityDetailContent,
          keyManagementTasks: detail.keyManagementTasks,
          relatedBasis: detail.relatedBasis,
        })),
      };

      if (mode === 'create') {
        await responsibilityApi.create(payload);
      } else if (mode === 'edit' && responsibilityId) {
        await responsibilityApi.update(responsibilityId, payload);
      }

      onSave();
    } catch (err) {
      console.error('책무 저장 실패:', err);
      setError('책무 정보 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return !!(
      formData.responsibilityContent &&
      details.every(
        detail =>
          detail.responsibilityDetailContent &&
          detail.keyManagementTasks &&
          detail.relatedBasis
      )
    );
  };

  return (
    <BaseDialog
      open={open}
      mode={mode}
      title={mode === 'create' ? '책무 등록' : mode === 'edit' ? '책무 수정' : '책무 상세'}
      onClose={onClose}
      onSave={handleSave}
      onModeChange={onChangeMode}
      disableSave={!isFormValid() || loading}
      loading={loading}
      maxWidth="xl"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 책무 섹션 */}
        <Box>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            책무
          </Typography>
          <TextField
            fullWidth
            required
            label="필수기재"
            value={formData.responsibilityContent || ''}
            onChange={e => handleInputChange('responsibilityContent', e.target.value)}
            disabled={mode === 'view'}
          />
        </Box>

        {/* 책무 상세등록 섹션 */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              책무 상세등록
            </Typography>
            {mode !== 'view' && (
              <IconButton
                onClick={addDetail}
                color="primary"
                sx={{
                  backgroundColor: 'var(--bank-primary-light)',
                  '&:hover': { backgroundColor: 'var(--bank-primary)' },
                }}
              >
                <AddIcon />
              </IconButton>
            )}
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '30%', fontWeight: 'bold' }}>책무 세부내용</TableCell>
                  <TableCell sx={{ width: '40%', fontWeight: 'bold' }}>
                    책무이행을 위한 주요 관리업무
                  </TableCell>
                  <TableCell sx={{ width: '30%', fontWeight: 'bold' }}>관련 근거</TableCell>
                  {mode !== 'view' && <TableCell align="center" sx={{ width: '50px' }}>동작</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map(detail => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <TextField
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        value={detail.responsibilityDetailContent}
                        onChange={e =>
                          handleDetailChange(detail.id, 'responsibilityDetailContent', e.target.value)
                        }
                        disabled={mode === 'view'}
                        placeholder="책무 세부내용을 입력하세요"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        value={detail.keyManagementTasks}
                        onChange={e =>
                          handleDetailChange(detail.id, 'keyManagementTasks', e.target.value)
                        }
                        disabled={mode === 'view'}
                        placeholder="주요 관리업무를 입력하세요"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        required
                        multiline
                        minRows={3}
                        value={detail.relatedBasis}
                        onChange={e => handleDetailChange(detail.id, 'relatedBasis', e.target.value)}
                        disabled={mode === 'view'}
                        placeholder="관련 근거를 입력하세요"
                      />
                    </TableCell>
                    {mode !== 'view' && (
                      <TableCell align="center">
                        <IconButton
                          onClick={() => removeDetail(detail.id)}
                          disabled={details.length <= 1}
                          sx={{
                            color: 'var(--bank-error)',
                            '&:hover': { backgroundColor: 'var(--bank-error-light)' },
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {error && (
        <Box sx={{ color: 'error.main', mt: 2, textAlign: 'center' }}>
          {error}
        </Box>
      )}
    </BaseDialog>
  );
};

export default ResponsibilityDialog;

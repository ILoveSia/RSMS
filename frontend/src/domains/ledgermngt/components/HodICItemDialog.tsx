import { Close as CloseIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import type { HodICItemCreateRequest } from '../api/hodIcItemApi';
import { hodICItemApi } from '../api/hodIcItemApi';

interface HodICItemDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  itemId?: number;
  onSuccess?: () => void;
}

interface FormData extends Omit<HodICItemCreateRequest, 'responsibilityId'> {
  responsibilityId: number | '';
}

const initialFormData: FormData = {
  responsibilityId: '',
  deptCd: '',
  fieldTypeCd: '',
  roleTypeCd: '',
  icTask: '',
  measureDesc: '',
  measureType: '',
  periodCd: '',
  supportDoc: '',
  checkPeriod: '',
  checkWay: '',
};

const HodICItemDialog: React.FC<HodICItemDialogProps> = ({
  open,
  onClose,
  mode,
  itemId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestingApproval, setRequestingApproval] = useState(false);
  const [canRequestApproval, setCanRequestApproval] = useState(false);

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  const title = {
    create: '부서장 내부통제항목 등록',
    edit: '부서장 내부통제항목 수정',
    view: '부서장 내부통제항목 상세보기',
  }[mode];

  // 데이터 로드
  useEffect(() => {
    if (open && itemId && (isEditMode || isViewMode)) {
      loadItemData();
      if (isViewMode) {
        checkApprovalPermission();
      }
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [open, itemId, mode]);

  const loadItemData = async () => {
    if (!itemId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await hodICItemApi.getHodICItemById(itemId);
      setFormData({
        responsibilityId: data.responsibilityId,
        deptCd: data.deptCd,
        fieldTypeCd: data.fieldTypeCd,
        roleTypeCd: data.roleTypeCd,
        icTask: data.icTask,
        measureDesc: data.measureDesc,
        measureType: data.measureType,
        periodCd: data.periodCd,
        supportDoc: data.supportDoc,
        checkPeriod: data.checkPeriod,
        checkWay: data.checkWay,
      });
    } catch (err) {
      console.error('Failed to load item data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const checkApprovalPermission = async () => {
    if (!itemId) return;

    try {
      const canRequest = await hodICItemApi.isCreatedBy(itemId);
      setCanRequestApproval(canRequest);
    } catch (err) {
      console.error('Failed to check approval permission:', err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.responsibilityId) {
      setError('책무ID를 선택해주세요.');
      return false;
    }
    if (!formData.deptCd.trim()) {
      setError('부서명을 입력해주세요.');
      return false;
    }
    if (!formData.fieldTypeCd.trim()) {
      setError('항목구분을 입력해주세요.');
      return false;
    }
    if (!formData.roleTypeCd.trim()) {
      setError('직무구분을 입력해주세요.');
      return false;
    }
    if (!formData.icTask.trim()) {
      setError('내부통제업무를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const requestData: HodICItemCreateRequest = {
        ...formData,
        responsibilityId: formData.responsibilityId as number,
      };

      if (isCreateMode) {
        await hodICItemApi.createHodICItem(requestData);
      } else if (isEditMode && itemId) {
        await hodICItemApi.updateHodICItem(itemId, requestData);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save item:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleApprovalRequest = async () => {
    if (!itemId) return;

    setRequestingApproval(true);
    setError(null);

    try {
      await hodICItemApi.requestApproval(itemId);
      alert('승인요청이 완료되었습니다.');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to request approval:', err);
      setError('승인요청 중 오류가 발생했습니다.');
    } finally {
      setRequestingApproval(false);
    }
  };

  const handleClose = () => {
    if (saving || requestingApproval) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '600px',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--bank-border)',
          pb: 2,
        }}
      >
        <Typography variant='h6' component='h2'>
          {title}
        </Typography>
        <Button
          onClick={handleClose}
          sx={{ minWidth: 'auto', p: 1 }}
          disabled={saving || requestingApproval}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* 책무ID */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isViewMode}>
                  <InputLabel>책무ID *</InputLabel>
                  <Select
                    value={formData.responsibilityId}
                    onChange={e => handleInputChange('responsibilityId', e.target.value)}
                    label='책무ID *'
                  >
                    <MenuItem value=''>선택하세요</MenuItem>
                    <MenuItem value={1}>R001</MenuItem>
                    <MenuItem value={2}>R002</MenuItem>
                    <MenuItem value={3}>R003</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* 부서명 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='부서명 *'
                  value={formData.deptCd}
                  onChange={e => handleInputChange('deptCd', e.target.value)}
                  disabled={isViewMode}
                />
              </Grid>

              {/* 항목구분 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='항목구분 *'
                  value={formData.fieldTypeCd}
                  onChange={e => handleInputChange('fieldTypeCd', e.target.value)}
                  disabled={isViewMode}
                />
              </Grid>

              {/* 직무구분 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='직무구분 *'
                  value={formData.roleTypeCd}
                  onChange={e => handleInputChange('roleTypeCd', e.target.value)}
                  disabled={isViewMode}
                />
              </Grid>

              {/* 내부통제업무 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='내부통제업무 *'
                  value={formData.icTask}
                  onChange={e => handleInputChange('icTask', e.target.value)}
                  disabled={isViewMode}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* 조치활동 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='조치활동'
                  value={formData.measureDesc}
                  onChange={e => handleInputChange('measureDesc', e.target.value)}
                  disabled={isViewMode}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* 조치유형 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='조치유형'
                  value={formData.measureType}
                  onChange={e => handleInputChange('measureType', e.target.value)}
                  disabled={isViewMode}
                />
              </Grid>

              {/* 주기 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='주기'
                  value={formData.periodCd}
                  onChange={e => handleInputChange('periodCd', e.target.value)}
                  disabled={isViewMode}
                />
              </Grid>

              {/* 관련근거 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='관련근거'
                  value={formData.supportDoc}
                  onChange={e => handleInputChange('supportDoc', e.target.value)}
                  disabled={isViewMode}
                />
              </Grid>

              {/* 점검시기 */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='점검시기'
                  value={formData.checkPeriod}
                  onChange={e => handleInputChange('checkPeriod', e.target.value)}
                  disabled={isViewMode}
                />
              </Grid>

              {/* 점검방법 */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='점검방법'
                  value={formData.checkWay}
                  onChange={e => handleInputChange('checkWay', e.target.value)}
                  disabled={isViewMode}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid var(--bank-border)' }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
          {isViewMode && canRequestApproval && (
            <Button
              variant='contained'
              color='warning'
              onClick={handleApprovalRequest}
              disabled={requestingApproval}
            >
              {requestingApproval ? '처리중...' : '승인요청'}
            </Button>
          )}

          <Button onClick={handleClose} disabled={saving || requestingApproval}>
            {isViewMode ? '닫기' : '취소'}
          </Button>

          {!isViewMode && (
            <Button variant='contained' onClick={handleSave} disabled={saving || loading}>
              {saving ? '저장중...' : '저장'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default HodICItemDialog;

/**
 * 점검결과보고서 작성/수정/상세조회 다이얼로그
 */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  Grid,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import {
  createAuditResultReport,
  updateAuditResultReport,
  getAuditResultReport,
  type AuditResultReportDto
} from '../api/auditResultReportApi';

export interface AuditResultReportDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';  // 등록, 수정, 상세조회
  auditResultReportId?: number;      // 수정/조회 시 필요
  auditProgMngtId?: number;          // 점검계획관리ID
  deptCd?: string;                   // 부서코드
  deptName?: string;                 // 부서명
  empNo?: string;                    // 부서장 사번
  empName?: string;                  // 부서장명
  onClose: () => void;
  onSave?: (data: AuditResultReportDto) => void;
}

const AuditResultReportDialog: React.FC<AuditResultReportDialogProps> = ({
  open,
  mode,
  auditResultReportId,
  auditProgMngtId,
  deptCd,
  deptName,
  empNo,
  empName,
  onClose,
  onSave
}) => {
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AuditResultReportDto>({
    auditProgMngtId: auditProgMngtId || 0,
    deptCd: deptCd || '',
    deptName: deptName || '',
    empNo: empNo || '',
    empName: empName || '',
    auditResultContent: '',
    empNo01: '',
    auditResultContent01: '',
    empNo02: '',
    auditResultContent02: '',
    reqMemo: '',
  });

  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  // 다이얼로그 제목 결정
  const getDialogTitle = () => {
    switch (mode) {
      case 'create':
        return '점검결과보고서 등록';
      case 'edit':
        return '점검결과보고서 수정';
      case 'view':
        return '점검결과보고서 상세조회';
      default:
        return '점검결과보고서';
    }
  };

  // 읽기 전용 모드 여부
  const isReadOnly = mode === 'view';

  // props 변경 시 formData 초기화 (기본정보 자동 설정)
  useEffect(() => {
    if (open && mode === 'create') {
      setFormData({
        auditProgMngtId: auditProgMngtId || 0,
        deptCd: deptCd || '',
        deptName: deptName || '',
        empNo: empNo || '',
        empName: empName || '',
        auditResultContent: '',
        empNo01: '',
        auditResultContent01: '',
        empNo02: '',
        auditResultContent02: '',
        reqMemo: '',
      });
    }
  }, [open, mode, auditProgMngtId, deptCd, deptName, empNo, empName]);

  // 데이터 로드 (수정/조회 모드)
  useEffect(() => {
    const loadData = async () => {
      if ((mode === 'edit' || mode === 'view') && auditResultReportId) {
        try {
          setLoading(true);
          const data = await getAuditResultReport(auditResultReportId);
          setFormData(data);
        } catch (error) {
          console.error('점검결과보고서 데이터 로드 실패:', error);
          showError('데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
          setLoading(false);
        }
      }
    };

    if (open) {
      loadData();
    }
  }, [open, mode, auditResultReportId]);

  // 폼 데이터 변경 처리
  const handleInputChange = (field: keyof AuditResultReportDto) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!isReadOnly) {
      setFormData(prev => ({
        ...prev,
        [field]: event.target.value
      }));
    }
  };

  // 저장 처리
  const handleSave = async () => {
    try {
      setLoading(true);

      let savedData: AuditResultReportDto;

      if (mode === 'create') {
        savedData = await createAuditResultReport(formData);
        showSuccess('점검결과보고서가 등록되었습니다.');
      } else if (mode === 'edit') {
        savedData = await updateAuditResultReport(formData.auditResultReportId!, formData);
        showSuccess('점검결과보고서가 수정되었습니다.');
      } else {
        return; // view 모드에서는 저장하지 않음
      }

      onSave?.(savedData);
      onClose();
    } catch (error) {
      console.error('점검결과보고서 저장 실패:', error);
      showError('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 닫기 처리
  const handleClose = () => {
    setFormData({
      auditProgMngtId: auditProgMngtId || 0,
      deptCd: deptCd || '',
      deptName: deptName || '',
      empNo: empNo || '',
      empName: empName || '',
      auditResultContent: '',
      empNo01: '',
      auditResultContent01: '',
      empNo02: '',
      auditResultContent02: '',
      reqMemo: '',
    });
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: '70%',
            maxWidth: '800px',
            height: '85vh',
            maxHeight: '700px',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--bank-border)',
            padding: '16px 24px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {getDialogTitle()}
            </Typography>
            {formData.auditTitle && (
              <Typography variant="body2" color="textSecondary">
                - {formData.auditTitle}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: '24px', overflow: 'auto' }}>
          <Grid container spacing={3}>
            {/* 기본 정보 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                기본 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="부서명"
                value={formData.deptName || ''}
                fullWidth
                size="small"
                disabled
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="부서장명"
                value={formData.empName || ''}
                fullWidth
                size="small"
                disabled
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* 부서장 종합의견 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                부서장 종합의견
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="부서장 종합의견"
                value={formData.auditResultContent || ''}
                onChange={handleInputChange('auditResultContent')}
                multiline
                rows={4}
                fullWidth
                disabled={isReadOnly}
                placeholder="점검 결과에 대한 부서장의 종합적인 의견을 입력해주세요."
              />
            </Grid>

            {/* 점검항목 요구사항 */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                점검항목 요구사항
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="점검항목 요구사항"
                value={formData.reqMemo || ''}
                onChange={handleInputChange('reqMemo')}
                multiline
                rows={3}
                fullWidth
                disabled={isReadOnly}
                placeholder="점검항목별 요구사항이나 개선방안을 입력해주세요."
              />
            </Grid>

            {/* 1차 승인자 - 주석처리 */}
            {/*
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                1차 승인자 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="1차 승인자 사번"
                value={formData.empNo01 || ''}
                onChange={handleInputChange('empNo01')}
                fullWidth
                size="small"
                disabled={isReadOnly}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="1차 승인자명"
                value={formData.empName01 || ''}
                fullWidth
                size="small"
                disabled
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="1차 승인자 종합의견"
                value={formData.auditResultContent01 || ''}
                onChange={handleInputChange('auditResultContent01')}
                multiline
                rows={3}
                fullWidth
                disabled={isReadOnly}
                placeholder="1차 승인자의 종합의견을 입력해주세요."
              />
            </Grid>
            */}

            {/* 2차 승인자 - 주석처리 */}
            {/*
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                2차 승인자 정보
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="2차 승인자 사번"
                value={formData.empNo02 || ''}
                onChange={handleInputChange('empNo02')}
                fullWidth
                size="small"
                disabled={isReadOnly}
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="2차 승인자명"
                value={formData.empName02 || ''}
                fullWidth
                size="small"
                disabled
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="2차 승인자 종합의견"
                value={formData.auditResultContent02 || ''}
                onChange={handleInputChange('auditResultContent02')}
                multiline
                rows={3}
                fullWidth
                disabled={isReadOnly}
                placeholder="2차 승인자의 종합의견을 입력해주세요."
              />
            </Grid>
            */}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid var(--bank-border)' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isReadOnly && (
              <Button
                variant="outlined"
                startIcon={mode === 'create' ? <SaveIcon /> : <EditIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                {mode === 'create' ? '등록' : '저장'}
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{
                height: '36px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {isReadOnly ? '닫기' : '취소'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Toast 알림 */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </>
  );
};

export default AuditResultReportDialog;
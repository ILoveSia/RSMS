/**
 * 책무 등록/수정/조회 다이얼로그 컴포넌트
 */
import Alert from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Box, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

interface ResponsibilityDetail {
  id: string;
  responsibilityDetailContent: string;
  keyManagementTasks: string;
  relatedBasis: string;
}

interface FormData {
  responsibilityContent: string;
  details: ResponsibilityDetail[];
}

interface IResponsibilityDialogProps {
  open: boolean;
  mode: DialogMode;
  responsibilityId: number | null;
  onClose: () => void;
  onSave: () => void;
  onChangeMode: (mode: DialogMode) => void;
}

const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
const ResponsibilityDialog: React.FC<IResponsibilityDialogProps> = ({
  open,
  mode,
  responsibilityId,
  onClose,
  onSave,
  onChangeMode,
}) => {
  const [formData, setFormData] = useState<FormData>({
    responsibilityContent: '',
    details: [
      {
        id: '1',
        responsibilityDetailContent: '',
        keyManagementTasks: '',
        relatedBasis: '',
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 책무 데이터 조회
  React.useEffect(() => {
    const fetchResponsibility = async () => {
      if (responsibilityId && open) {
        try {
          setLoading(true);
          // TODO: API 호출로 책무 데이터 조회
          const data = {
            responsibilityContent: '테스트 책무',
            details: [
              {
                id: '1',
                responsibilityDetailContent: '테스트 세부내용',
                keyManagementTasks: '테스트 관리업무',
                relatedBasis: '테스트 근거',
              },
            ],
          };
          setFormData(data);
        } catch (err) {
          console.error('책무 조회 실패:', err);
        } finally {
          setLoading(false);
        }
      } else if (mode === 'create') {
        setFormData({
          responsibilityContent: '',
          details: [
            {
              id: '1',
              responsibilityDetailContent: '',
              keyManagementTasks: '',
              relatedBasis: '',
            },
          ],
        });
      }
    };

    fetchResponsibility();
  }, [responsibilityId, open, mode]);

  // 폼 검증
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.responsibilityContent.trim()) {
      errors.responsibilityContent = '책무 내용을 입력해주세요.';
    }

    formData.details.forEach((detail, index) => {
      if (!detail.responsibilityDetailContent.trim()) {
        errors[`detail_${index}_content`] = '책무 세부내용을 입력해주세요.';
      }
      if (!detail.keyManagementTasks.trim()) {
        errors[`detail_${index}_tasks`] = '주요 관리업무를 입력해주세요.';
      }
      if (!detail.relatedBasis.trim()) {
        errors[`detail_${index}_basis`] = '관련 근거를 입력해주세요.';
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // TODO: API 호출로 책무 저장
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

  // 책무 내용 변경
  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      responsibilityContent: value,
    }));
  };

  // 세부내용 변경
  const handleDetailChange = (id: string, field: keyof ResponsibilityDetail, value: string) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.map(detail =>
        detail.id === id ? { ...detail, [field]: value } : detail
      ),
    }));
  };

  // 세부내용 추가
  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      details: [
        ...prev.details,
        {
          id: String(prev.details.length + 1),
          responsibilityDetailContent: '',
          keyManagementTasks: '',
          relatedBasis: '',
        },
      ],
    }));
  };

  // 세부내용 삭제
  const removeDetail = (id: string) => {
    if (formData.details.length === 1) return;
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter(detail => detail.id !== id),
    }));
  };

  return (
    <>
      <BaseDialog
        open={open}
        mode={mode}
        title={`책무 ${mode === 'create' ? '등록' : mode === 'edit' ? '수정' : '상세 정보'}`}
        onClose={onClose}
        onSave={handleSave}
        onModeChange={onChangeMode}
        maxWidth="lg"
        fullWidth
        disableSave={loading}
        loading={loading}
      >
        <Box sx={{ p: 2 }}>
          {/* 책무 내용 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              책무 내용
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.responsibilityContent}
              onChange={(e) => handleContentChange(e.target.value)}
              disabled={mode === 'view'}
              error={!!validationErrors.responsibilityContent}
              helperText={validationErrors.responsibilityContent}
              placeholder="책무 내용을 입력하세요"
            />
          </Box>

          {/* 세부내용 목록 */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                세부내용 목록
              </Typography>
              {mode !== 'view' && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addDetail}
                  size="small"
                >
                  세부내용 추가
                </Button>
              )}
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>책무 세부내용</TableCell>
                    <TableCell>책무이행을 위한 주요 관리업무</TableCell>
                    <TableCell>관련 근거</TableCell>
                    {mode !== 'view' && <TableCell width={50}>삭제</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={detail.responsibilityDetailContent}
                          onChange={(e) =>
                            handleDetailChange(detail.id, 'responsibilityDetailContent', e.target.value)
                          }
                          disabled={mode === 'view'}
                          error={!!validationErrors[`detail_${detail.id}_content`]}
                          helperText={validationErrors[`detail_${detail.id}_content`]}
                          placeholder="세부내용을 입력하세요"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={detail.keyManagementTasks}
                          onChange={(e) =>
                            handleDetailChange(detail.id, 'keyManagementTasks', e.target.value)
                          }
                          disabled={mode === 'view'}
                          error={!!validationErrors[`detail_${detail.id}_tasks`]}
                          helperText={validationErrors[`detail_${detail.id}_tasks`]}
                          placeholder="주요 관리업무를 입력하세요"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          value={detail.relatedBasis}
                          onChange={(e) =>
                            handleDetailChange(detail.id, 'relatedBasis', e.target.value)
                          }
                          disabled={mode === 'view'}
                          error={!!validationErrors[`detail_${detail.id}_basis`]}
                          helperText={validationErrors[`detail_${detail.id}_basis`]}
                          placeholder="관련 근거를 입력하세요"
                        />
                      </TableCell>
                      {mode !== 'view' && (
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => removeDetail(detail.id)}
                            disabled={formData.details.length === 1}
                            color="error"
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
      </BaseDialog>

      <Alert
        open={showSuccessAlert}
        message={`책무가 ${mode === 'create' ? '등록' : '수정'}되었습니다.`}
        severity="success"
        autoHideDuration={2000}
        onClose={() => setShowSuccessAlert(false)}
      />
    </>
  );
};

export default ResponsibilityDialog;

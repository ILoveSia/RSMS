/**
 * 회의체 등록/수정/조회 다이얼로그 컴포넌트
 */
import { useReduxState } from '@/app/store/use-store';
import type { MeetingBody } from '@/app/types';
import type { CommonCode } from '@/app/types/common';
import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button, Select } from '@/shared/components/ui';
import TextField from '@/shared/components/ui/data-display/TextField';
import { Alert, Box, CircularProgress } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { meetingStatusApi } from '../api/meetingStatusApi';

interface IMeetingBodyDialogProps {
  open: boolean;
  mode: DialogMode;
  meetingBody: MeetingBody | null;
  onClose: () => void;
  onSave: () => void;
  onModeChange: (mode: DialogMode) => void;
}

const MeetingBodyDialog: React.FC<IMeetingBodyDialogProps> = ({
  open,
  mode,
  meetingBody,
  onClose,
  onSave,
  onModeChange,
}) => {
  const [formData, setFormData] = useState<Partial<MeetingBody>>({});
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>('codeStore/allCodes');

  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) return allCodes;
    if ('data' in allCodes && Array.isArray(allCodes.data)) return allCodes.data;
    return [];
  };

  // 공통코드 헬퍼 함수
  const getMeetingBodyCodes = () => {
    const codes = getCodesArray();
    return codes
      .filter(code => code.groupCode === 'MEETING_BODY' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getPeriodCodes = () => {
    const codes = getCodesArray();
    return codes
      .filter(code => code.groupCode === 'PERIOD' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  useEffect(() => {
    if (meetingBody && open) {
      setFormData(meetingBody);
    } else {
      setFormData({});
    }
    setValidationErrors({});
  }, [meetingBody, open]);

  // 입력값 변경 핸들러 (TextField와 직접 값 변경 모두 지원)
  const handleInputChange = (
    field: keyof MeetingBody,
    valueOrEvent: string | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: string } }
  ) => {
    const value = typeof valueOrEvent === 'string' ? valueOrEvent : valueOrEvent.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    // 값이 입력되면 해당 필드의 에러 상태를 제거
    if (value) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // Select 컴포넌트용 변경 핸들러
  const handleSelectChange = (field: keyof MeetingBody) => (value: string | number | string[] | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value as string,
    }));

    // 입력 시 해당 필드의 검증 에러 제거
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  // 폼 유효성 검사
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, boolean> = {};

    if (!formData.gubun?.trim()) {
      errors.gubun = true;
    }
    if (!formData.meetingPeriod?.trim()) {
      errors.meetingPeriod = true;
    }
    if (!formData.meetingName?.trim()) {
      errors.meetingName = true;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (mode === 'create') {
        await meetingStatusApi.create(formData as MeetingBody);
      } else if (mode === 'edit') {
        if (!formData.meetingBodyId) {
          throw new Error('회의체 ID가 없습니다.');
        }
        await meetingStatusApi.update(
          formData.meetingBodyId,
          formData as Omit<MeetingBody, 'meetingBodyId' | 'createdAt' | 'updatedAt'>
        );
      }

      setShowSuccessAlert(true);
      onSave();
      onClose();

      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 1000);
    } catch (err) {
      console.error('회의체 저장 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 수정 모드로 전환 핸들러
  const handleEditMode = () => {
    if (onModeChange) {
      onModeChange('edit');
    }
  };

  // 다이얼로그 액션 버튼
  const renderActions = () => {
    if (mode === 'view') {
      return (
        <>
          <Button onClick={onClose} variant='outlined'>
            닫기
          </Button>
          <Button onClick={handleEditMode} variant='contained' color='warning'>
            수정
          </Button>
        </>
      );
    }

    return (
      <>
        <Button onClick={onClose} variant='outlined' disabled={loading}>
          취소
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {mode === 'create' ? '등록' : '저장'}
        </Button>
      </>
    );
  };

  return (
    <>
      <BaseDialog
        open={open}
        mode={mode}
        title={mode === 'create' ? '회의체 등록' : mode === 'edit' ? '회의체 수정' : '회의체 상세'}
        onClose={onClose}
        onSave={handleSave}
        onModeChange={onModeChange}
        loading={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 첫 번째 행: 구분, 개최주기 */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Select
                value={formData.gubun}
                label='구분 *'
                onChange={handleSelectChange('gubun')}
                disabled={mode === 'view'}
                error={!!validationErrors.gubun}
                helperText={validationErrors.gubun ? '필수 입력 항목입니다.' : ''}
                fullWidth
                sx={
                  mode === 'view'
                    ? { color: 'black', fontWeight: 600, backgroundColor: '#f8fafc' }
                    : {}
                }
                options={[
                  { value: '', label: '선택하세요' },
                  ...getMeetingBodyCodes().map(code => ({
                    value: code.code,
                    label: code.codeName,
                  })),
                ]}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Select
                value={formData.meetingPeriod}
                label='개최주기'
                onChange={handleSelectChange('meetingPeriod')}
                disabled={mode === 'view'}
                error={!!validationErrors.meetingPeriod}
                helperText={validationErrors.meetingPeriod ? '필수 입력 항목입니다.' : ''}
                fullWidth
                sx={
                  mode === 'view'
                    ? { color: 'black', fontWeight: 600, backgroundColor: '#f8fafc' }
                    : {}
                }
                options={[
                  { value: '', label: '선택하세요' },
                  ...getPeriodCodes().map(code => ({
                    value: code.code,
                    label: code.codeName,
                  })),
                ]}
              />
            </Box>
          </Box>

          {/* 두 번째 행: 회의체명 */}
          <TextField
            fullWidth
            required
            label="회의체명"
            value={formData.meetingName || ''}
            onChange={e => handleInputChange('meetingName', e.target.value)}
            disabled={mode === 'view'}
            placeholder="회의체명을 입력하세요"
            error={validationErrors.meetingName}
            helperText={validationErrors.meetingName ? '필수 입력 항목입니다.' : ''}
          />

          {/* 세 번째 행: 주요 심의·의결사항 */}
          <TextField
            fullWidth
            label="주요 심의·의결사항"
            value={formData.content || ''}
            onChange={e => handleInputChange('content', e.target.value)}
            disabled={mode === 'view'}
            multiline
            rows={4}
            placeholder="주요 심의·의결사항을 입력하세요"
          />

          {/* 조회 모드일 때 추가 정보 표시 */}
          {mode === 'view' && meetingBody && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="등록일시"
                value={meetingBody.createdAt || ''}
                disabled
              />
              <TextField
                fullWidth
                label="수정일시"
                value={meetingBody.updatedAt || ''}
                disabled
              />
            </Box>
          )}
        </Box>

        {/* error && (
          <Box sx={{ color: 'error.main', mt: 2, textAlign: 'center' }}>
            {error}
          </Box>
        ) */}
      </BaseDialog>
      {showSuccessAlert && (
        <Alert
          severity="success"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClose={() => setShowSuccessAlert(false)}
        >
          {mode === 'create' ? '등록되었습니다.' : '수정되었습니다.'}
        </Alert>
      )}
    </>
  );
};

export default MeetingBodyDialog;

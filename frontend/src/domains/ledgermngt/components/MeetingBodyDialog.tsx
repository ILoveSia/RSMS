/**
 * 회의체 등록/수정/조회 다이얼로그 컴포넌트
 */
import { useReduxState } from '@/app/store/use-store';
import type { MeetingBody } from '@/app/types';
import type { CommonCode } from '@/app/types/common';
import { Dialog } from '@/shared/components/modal';
import { Button, Select } from '@/shared/components/ui';
import { Alert, Box, CircularProgress, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { meetingStatusApi } from '../api/meetingStatusApi';

export interface MeetingBodyDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  meetingBody?: MeetingBody | null;
  onClose: () => void;
  onSave?: (meetingBody: MeetingBody) => void;
  onModeChange?: (newMode: 'create' | 'edit' | 'view') => void;
}

interface FormData {
  gubun: string;
  meetingName: string;
  meetingPeriod: string;
  content: string;
}

const MeetingBodyDialog: React.FC<MeetingBodyDialogProps> = ({
  open,
  mode,
  meetingBody,
  onClose,
  onSave,
  onModeChange,
}) => {
  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes, setData: setAllCodes } = useReduxState<
    { data: CommonCode[] } | CommonCode[]
  >('codeStore/allCodes');

  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    // allCodes가 {data: CommonCode[]} 형태인지 확인
    if (Array.isArray(allCodes)) {
      return allCodes;
    }
    // allCodes가 {data: CommonCode[]} 형태라면 data 프로퍼티에서 배열 추출
    if (typeof allCodes === 'object' && 'data' in allCodes && Array.isArray(allCodes.data)) {
      return allCodes.data;
    }
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

  const [formData, setFormData] = useState<FormData>({
    gubun: '',
    meetingName: '',
    meetingPeriod: '',
    content: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 다이얼로그 제목 설정
  const getDialogTitle = () => {
    switch (mode) {
      case 'create':
        return '회의체 등록';
      case 'edit':
        return '회의체 수정';
      case 'view':
        return '회의체 상세조회';
      default:
        return '회의체';
    }
  };

  // 컴포넌트 마운트 시 localStorage에서 공통코드 복원
  useEffect(() => {
    const storedCommonCodes = localStorage.getItem('commonCodes');
    console.log('🔍 [MeetingBodyDialog] localStorage 공통코드 확인:', !!storedCommonCodes);

    if (
      storedCommonCodes &&
      (!allCodes ||
        (Array.isArray(allCodes) && allCodes.length === 0) ||
        (typeof allCodes === 'object' &&
          'data' in allCodes &&
          (!allCodes.data || allCodes.data.length === 0)))
    ) {
      try {
        const parsedCodes = JSON.parse(storedCommonCodes);
        console.log(
          '✅ [MeetingBodyDialog] localStorage에서 공통코드 복원:',
          parsedCodes.length,
          '개'
        );
        setAllCodes(parsedCodes);
      } catch (error) {
        console.error('❌ [MeetingBodyDialog] localStorage 공통코드 복원 실패:', error);
        localStorage.removeItem('commonCodes');
      }
    }
  }, [allCodes, setAllCodes]);

  // 폼 데이터 초기화
  useEffect(() => {
    if (open) {
      if (mode === 'create') {
        setFormData({
          gubun: '',
          meetingName: '',
          meetingPeriod: '',
          content: '',
        });
      } else if (meetingBody) {
        setFormData({
          gubun: meetingBody.gubun || '',
          meetingName: meetingBody.meetingName || '',
          meetingPeriod: meetingBody.meetingPeriod || '',
          content: meetingBody.content || '',
        });
      }
      setError(null);
      setValidationErrors({});
    }
  }, [open, mode, meetingBody]);

  // 입력값 변경 핸들러 (TextField용)
  const handleInputChange =
    (field: keyof FormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } }
    ) => {
      const value = event.target.value;
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));

      // 입력 시 해당 필드의 검증 에러 제거
      if (validationErrors[field]) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: '',
        }));
      }
    };

  // Select 컴포넌트용 변경 핸들러
  const handleSelectChange =
    (field: keyof FormData) => (value: string | number | string[] | number[]) => {
      setFormData(prev => ({
        ...prev,
        [field]: value as string,
      }));

      // 입력 시 해당 필드의 검증 에러 제거
      if (validationErrors[field]) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: '',
        }));
      }
    };

  // 폼 검증
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.gubun.trim()) {
      errors.gubun = '구분을 선택해주세요.';
    }

    if (!formData.meetingName.trim()) {
      errors.meetingName = '회의체명을 입력해주세요.';
    } else if (formData.meetingName.trim().length > 200) {
      errors.meetingName = '회의체명은 200자 이하로 입력해주세요.';
    }

    if (formData.meetingPeriod && formData.meetingPeriod.length > 100) {
      errors.meetingPeriod = '개최주기는 100자 이하로 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let savedMeetingBody: MeetingBody;

      if (mode === 'create') {
        savedMeetingBody = await meetingStatusApi.create({
          gubun: formData.gubun,
          meetingName: formData.meetingName,
          meetingPeriod: formData.meetingPeriod,
          content: formData.content,
        });
      } else if (mode === 'edit' && meetingBody) {
        savedMeetingBody = await meetingStatusApi.update(meetingBody.meetingBodyId, {
          gubun: formData.gubun,
          meetingName: formData.meetingName,
          meetingPeriod: formData.meetingPeriod,
          content: formData.content,
        });
      } else {
        throw new Error('잘못된 모드입니다.');
      }

      onSave?.(savedMeetingBody);
      onClose();
    } catch (err: unknown) {
      console.error('회의체 저장 실패:', err);
      const errorMessage =
        err instanceof Error ? err.message : '회의체 저장 중 오류가 발생했습니다.';
      setError(errorMessage);
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
    <Dialog
      open={open}
      title={getDialogTitle()}
      maxWidth='md'
      onClose={onClose}
      disableBackdropClick={loading}
      actions={renderActions()}
    >
      <Box sx={{ mt: 2 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
                helperText={validationErrors.gubun}
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
                helperText={validationErrors.meetingPeriod}
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
            label='회의체명 *'
            value={formData.meetingName}
            onChange={handleInputChange('meetingName')}
            error={!!validationErrors.meetingName}
            helperText={validationErrors.meetingName}
            disabled={mode === 'view'}
            placeholder='회의체명을 입력하세요'
            InputProps={mode === 'view' ? { style: { color: 'black', fontWeight: 600 } } : {}}
            InputLabelProps={mode === 'view' ? { style: { color: 'black', fontWeight: 700 } } : {}}
          />

          {/* 세 번째 행: 주요 심의·의결사항 */}
          <TextField
            fullWidth
            label='주요 심의·의결사항'
            value={formData.content}
            onChange={handleInputChange('content')}
            error={!!validationErrors.content}
            helperText={validationErrors.content}
            disabled={mode === 'view'}
            multiline
            rows={4}
            placeholder='주요 심의·의결사항을 입력하세요'
            InputProps={mode === 'view' ? { style: { color: 'black', fontWeight: 600 } } : {}}
            InputLabelProps={mode === 'view' ? { style: { color: 'black', fontWeight: 700 } } : {}}
          />

          {/* 조회 모드일 때 추가 정보 표시 */}
          {mode === 'view' && meetingBody && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label='등록일시'
                value={meetingBody.createdAt || ''}
                disabled
                InputProps={{ style: { color: 'black', fontWeight: 600 } }}
                InputLabelProps={{ style: { color: 'black', fontWeight: 700 } }}
              />
              <TextField
                fullWidth
                label='수정일시'
                value={meetingBody.updatedAt || ''}
                disabled
                InputProps={{ style: { color: 'black', fontWeight: 600 } }}
                InputLabelProps={{ style: { color: 'black', fontWeight: 700 } }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default MeetingBodyDialog;

/**
 * 회의체 등록/수정/조회 다이얼로그 컴포넌트
 */
import { useReduxState } from '@/app/store/use-store';
import type { MeetingBody } from '@/app/types';
import type { CommonCode } from '@/app/types/common';
import Alert from '@/shared/components/modal/Alert';
import BaseDialog, { type DialogMode } from '@/shared/components/modal/BaseDialog';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
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

  const handleInputChange = (field: keyof MeetingBody, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 값이 입력되면 해당 필드의 에러 상태를 제거
    if (value) {
      setValidationErrors(prev => ({ ...prev, [field]: false }));
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

  const isFormValid = () => {
    return !!(formData.gubun && formData.meetingPeriod && formData.meetingName);
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
              <FormControl
                fullWidth
                error={validationErrors.gubun}
              >
                <InputLabel required>구분</InputLabel>
                <Select
                  value={formData.gubun || ''}
                  onChange={e => handleInputChange('gubun', e.target.value)}
                  disabled={mode === 'view'}
                  label="구분"
                >
                  <MenuItem value="">선택하세요</MenuItem>
                  {getMeetingBodyCodes().map(code => (
                    <MenuItem key={code.code} value={code.code}>
                      {code.codeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl
                fullWidth
                error={validationErrors.meetingPeriod}
              >
                <InputLabel required>개최주기</InputLabel>
                <Select
                  value={formData.meetingPeriod || ''}
                  onChange={e => handleInputChange('meetingPeriod', e.target.value)}
                  disabled={mode === 'view'}
                  label="개최주기"
                >
                  <MenuItem value="">선택하세요</MenuItem>
                  {getPeriodCodes().map(code => (
                    <MenuItem key={code.code} value={code.code}>
                      {code.codeName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

      <Alert
        open={showSuccessAlert}
        message={mode === 'create' ? '회의체가 등록되었습니다.' : '회의체가 수정되었습니다.'}
        severity="success"
        autoHideDuration={2000}
        onClose={() => setShowSuccessAlert(false)}
      />
    </>
  );
};

export default MeetingBodyDialog;

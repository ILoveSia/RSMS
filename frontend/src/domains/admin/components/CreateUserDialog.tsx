import React, { useCallback, useMemo, useState, useEffect } from 'react';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Box, Chip, InputAdornment, Tooltip, Typography, IconButton, Alert } from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import TextField from '@/shared/components/ui/data-display/TextField';
import { adminApi } from '../api/adminApi';
import type { CreateUserRequest, Role, UpdateUserRequest, UserWithRoles } from '../types';
import { useSnackbar } from '@/shared/hooks/useSnackbar';

export interface CreateUserDialogProps {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  /** 기본값 'create' */
  mode?: 'create' | 'edit';
  /** 편집 모드일 때 채울 사용자 */
  user?: UserWithRoles | null;
  onCreated?: () => void;
  onSaved?: (updated: UserWithRoles) => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, roles, onClose, mode = 'create', user, onCreated, onSaved }) => {
  const { showError, showSuccess } = useSnackbar();
  const [saving, setSaving] = useState(false);
  type FormState = { userId: string; userName: string; email: string; empNo: string };
  const [form, setForm] = useState<FormState>({ userId: '', userName: '', email: '', empNo: '' });
  // 소속/직무 선택 제거
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  // DB 컬럼 기반 추가 입력값
  const [address, setAddress] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // 직책코드(job_title_cd) 사용 안함
  const [touched, setTouched] = useState({ userId: false, email: false, password: false, userName: false, mobile: false });
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'userId' | 'userName' | 'email' | 'address' | 'mobile' | 'password' | 'empNo', string[]>>>({});

  // 폼 리셋 함수
  const reset = useCallback(() => {
    setForm({ userId: '', userName: '', email: '', empNo: '' });
    // 소속/직무 선택 제거로 초기화 불필요
    setSelectedRoles([]);
    setTouched({ userId: false, email: false, password: false, userName: false, mobile: false });
  }, []);

  // 이메일: 공백/공간 금지, '@' 정확히 1개, 도메인에 '.' 포함
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()), [form.email]);
  const mobileValid = useMemo(() => /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(mobile.trim()), [mobile]);
  const passwordValid = useMemo(() => password.trim().length >= 8, [password]);
  const disabled = useMemo(() => {
    if (mode === 'create') {
      return !form.userId.trim()
        || !form.userName.trim()
        || !form.email.trim()
        || !emailValid
        || !passwordValid
        || !address.trim()
        || !mobile.trim()
        || !mobileValid;
    }
    // edit 모드: 비밀번호/주소는 선택 입력 허용, 단 이메일/전화는 형식 맞아야 함
    return !form.userName.trim()
      || !form.email.trim()
      || !emailValid
      || !mobile.trim()
      || !mobileValid;
  }, [address, emailValid, mobileValid, mode, passwordValid, form.userId, form.userName]);

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoles(prev => (prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      if (mode === 'create') {
        const payload: CreateUserRequest = {
          id: form.userId.trim(),
          username: form.userName.trim(),
          email: form.email.trim(),
          address: address.trim(),
          mobile: mobile.trim(),
          password: password,
          num: form.empNo?.trim() || undefined,
        };
        const created = await adminApi.createUser(payload);
        // 초기 역할 할당 (선택 시)
        if (selectedRoles.length > 0) {
          await adminApi.updateUserRoles(created.userId, selectedRoles);
        }
        showSuccess('사용자가 등록되었습니다.');
        onCreated?.();
        reset();
        onClose();
        return;
      }

      // edit 모드
      if (!user) return;
      const updatePayload: UpdateUserRequest = {};
      if (form.userName.trim()) updatePayload.username = form.userName.trim();
      if (form.email.trim()) updatePayload.email = form.email.trim();
      if (address.trim()) updatePayload.address = address.trim();
      if (mobile.trim()) updatePayload.mobile = mobile.trim();
      // 비밀번호는 수정 API에서 지원하지 않으므로 전송하지 않음
      if (form.empNo?.trim()) updatePayload.num = form.empNo.trim();

      const updated = await adminApi.updateUser(user.userId, updatePayload);
      // 역할 일괄 업데이트
      await adminApi.updateUserRoles(user.userId, selectedRoles);

      // 콜백에 최신 정보 전달(역할은 UI 기준 반영)
      const merged: UserWithRoles = {
        ...user,
        userName: updated.username || user.userName,
        email: updated.email || user.email,
        empNo: updated.num || user.empNo,
        address: updated.address || user.address,
        mobile: updated.mobile || user.mobile,
        roles: roles
          .filter(r => selectedRoles.includes(r.roleId))
          .map(r => ({
            roleId: r.roleId,
            roleName: r.roleName,
            roleDescription: r.roleDescription,
            assignedAt: new Date().toISOString(),
            assignedBy: 'current-user',
            isActive: true,
          })),
      } as UserWithRoles;

      showSuccess('사용자 정보가 업데이트되었습니다.');
      onSaved?.(merged);
      onClose();
    } catch (e: any) {
      const message = e?.message || (mode === 'create' ? '사용자 등록에 실패했습니다.' : '사용자 업데이트에 실패했습니다.');
      showError(message);
      const details = e?.details;
      const messages: string[] = [];
      const newFieldErrors: Partial<Record<'userId' | 'userName' | 'email' | 'address' | 'mobile' | 'password' | 'empNo', string[]>> = {};
      const pushField = (field: keyof typeof newFieldErrors, msg: string) => {
        if (!newFieldErrors[field]) newFieldErrors[field] = [];
        newFieldErrors[field]!.push(msg);
      };
      const fieldLabel = (backendField: string): string => {
        switch (backendField) {
          case 'id': return '사용자 ID';
          case 'username': return '성명';
          case 'email': return '이메일';
          case 'address': return '주소';
          case 'mobile': return '전화번호';
          case 'password': return '비밀번호';
          case 'num': return '사번';
          default: return backendField;
        }
      };
      const mapBackendFieldToUi = (field: string): keyof typeof newFieldErrors | undefined => {
        switch (field) {
          case 'id': return 'userId';
          case 'username': return 'userName';
          case 'email': return 'email';
          case 'address': return 'address';
          case 'mobile': return 'mobile';
          case 'password': return 'password';
          case 'num': return 'empNo';
          default: return undefined;
        }
      };
      if (typeof details === 'string') {
        const regex = /field '([^']+)'[^\[]*default message \[([^\]]+)\]/gi;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(details)) !== null) {
          const backendField = m[1];
          const msg = m[2];
          const uiField = mapBackendFieldToUi(backendField);
          if (uiField) pushField(uiField, msg);
          messages.push(`${fieldLabel(backendField)}: ${msg}`);
        }
        if (messages.length === 0 && Object.keys(newFieldErrors).length === 0 && details.trim()) messages.push(details.trim());
      } else if (details && typeof details === 'object') {
        const obj = details as any;
        if (Array.isArray(obj.errors)) {
          obj.errors.forEach((er: any) => {
            const backendField: string | undefined = er?.field || er?.fieldName || er?.param || er?.path;
            const msg: string | undefined = er?.defaultMessage || er?.message || er?.error || er?.title;
            if (backendField && msg) {
              const uiField = mapBackendFieldToUi(backendField);
              if (uiField) pushField(uiField, msg);
              messages.push(`${fieldLabel(backendField)}: ${msg}`);
            } else if (msg) {
              messages.push(msg);
            }
          });
        }
        // ApiResponse.data 가 { fieldName: errorMessage } 형태인 경우 처리
        if (obj && obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
          Object.entries(obj.data as Record<string, unknown>).forEach(([backendField, val]) => {
            const msg = String(val ?? '유효하지 않은 값입니다.');
            const uiField = mapBackendFieldToUi(backendField);
            if (uiField) pushField(uiField, msg);
            messages.push(`${fieldLabel(backendField)}: ${msg}`);
          });
        }
        if (messages.length === 0 && typeof obj.message === 'string') messages.push(obj.message);
      }
      if (messages.length === 0 && Object.keys(newFieldErrors).length === 0) messages.push(message);
      setFieldErrors(newFieldErrors);
      setSubmitErrors(messages);
    } finally {
      setSaving(false);
    }
  }, [address, emailValid, mobileValid, mode, onClose, onCreated, onSaved, password, reset, roles, selectedRoles, showError, showSuccess, user, form.userId, form.userName, form.email, form.empNo]);

  // 입력 변경 시 서버 에러 초기화 및 모드 변경/유저 변경 시 초기화
  useEffect(() => {
    if (submitErrors.length > 0) setSubmitErrors([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.userId, form.userName, form.email, form.empNo, address, mobile, password]);

  // 모드/유저에 따른 초기값 설정
  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      reset();
      setAddress('');
      setMobile('');
      setPassword('');
      setSelectedRoles([]);
      return;
    }
    // edit 모드
    if (user) {
      setForm({
        userId: user.userId || '',
        userName: user.userName || '',
        email: user.email || '',
        empNo: user.empNo || user.employee?.num || '',
      });
      setAddress(user.address || '');
      setMobile(user.mobile || user.employee?.mobile || '');
      setPassword('');
      setSelectedRoles(user.roles.filter(r => r.isActive).map(r => r.roleId));
      setTouched({ userId: false, email: false, password: false, userName: false, mobile: false });
      setFieldErrors({});
      setSubmitErrors([]);
    }
  }, [mode, open, reset]);

  // 편집 모드에서 상세 정보 가져와 주소/전화 등 채우기
  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      if (!open || mode !== 'edit' || !user) return;
      try {
        const detail = await adminApi.getUserDetail(user.userId);
        if (!mounted) return;
        setForm(prev => ({
          ...prev,
          userName: detail.username || prev.userName,
          email: detail.email || prev.email,
          empNo: detail.num || prev.empNo,
        }));
        setAddress(detail.address || '');
        setMobile(detail.mobile || '');
      } catch (e) {
        // 무시: 주소/전화 미표시일 수 있음
      }
    };
    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [open, mode, user]);

  return (
          <BaseDialog
        open={open}
        mode={mode}
        title={mode === 'create' ? '🙋‍♂️ 새 사용자 등록' : '🙋‍♂️ 사용자 정보 수정'}
        maxWidth="md"
        onClose={() => { reset(); onClose(); }}
        onModeChange={() => { reset(); onClose(); }}
        onSave={handleSave}
        disableSave={disabled}
        loading={saving}
      >
      <Box sx={{
        '& .MuiDialog-paper': {
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        },
        '& .MuiDialogContent-root': {
          padding: '24px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        }
      }}>
        {/* 서버 검증/비즈니스 에러 표시 */}
        {submitErrors.length > 0 && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              border: '1px solid #ffcdd2',
              backgroundColor: '#ffebee',
              '& .MuiAlert-message': {
                fontSize: '0.875rem'
              }
            }}
          >
            {submitErrors.map((msg, idx) => (
              <div key={idx}>{msg}</div>
            ))}
          </Alert>
        )}

        {/* 계정 정보 */}
        <Box sx={{ 
          gridColumn: '1 / -1', 
          mb: 3, 
          p: 3, 
          backgroundColor: 'var(--bank-bg-secondary)', 
          borderRadius: '8px', 
          border: '1px solid var(--bank-border)' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <AccountCircleIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'primary.main', 
                fontWeight: 600, 
                fontSize: '1rem' 
              }}
            >
              계정 정보
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <TextField
              label="사용자 ID"
              mode="editable"
              value={form.userId}
              onChange={(e) => { setSubmitErrors([]); setFieldErrors(prev => ({ ...prev, userId: undefined })); setForm(prev => ({ ...prev, userId: e.target.value })); }}
              onBlur={() => setTouched(prev => ({ ...prev, userId: true }))}
              size="small"
              fullWidth
              required
              disabled={mode === 'edit'}
              error={(mode === 'create' && (touched.userId && !form.userId.trim())) || !!fieldErrors.userId?.length}
              helperText={(touched.userId && !form.userId.trim()) ? '필수 입력' : (fieldErrors.userId?.[0] || ' ')}
            />
            <TextField
              label="이메일"
              mode="editable"
              type="email"
              value={form.email}
              onChange={(e) => { setSubmitErrors([]); setFieldErrors(prev => ({ ...prev, email: undefined })); setForm(prev => ({ ...prev, email: e.target.value })); }}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
              size="small"
              fullWidth
              required
              error={
                (!!form.email && !emailValid) // 값이 있고 형식이 틀리면 즉시 에러
                || (touched.email && !form.email.trim()) // 블러 이후 비어있으면 에러
                || !!fieldErrors.email?.length
              }
              helperText={
                fieldErrors.email?.[0]
                  || (!!form.email && !emailValid
                        ? '올바른 이메일 형식이 아닙니다'
                        : (touched.email && !form.email.trim()
                            ? '필수 입력'
                            : ' '))
              }
            />
            <TextField
              label="비밀번호"
              mode="editable"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setSubmitErrors([]); setFieldErrors(prev => ({ ...prev, password: undefined })); setPassword(e.target.value); }}
              onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
              size="small"
              fullWidth
              required={mode === 'create'}
              error={
                (mode === 'create' && (touched.password && (!passwordValid || !password.trim())))
                || (mode === 'edit' && password.trim().length > 0 && !passwordValid)
                || !!fieldErrors.password?.length
              }
              helperText={
                mode === 'create'
                  ? (touched.password
                      ? (!password.trim() ? '필수 입력' : (!passwordValid ? '8자 이상 입력해주세요' : (fieldErrors.password?.[0] || ' ')))
                      : (fieldErrors.password?.[0] || ' '))
                  : (password.trim().length > 0 && !passwordValid
                      ? '8자 이상 입력해주세요'
                      : (fieldErrors.password?.[0] || ' '))
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                      onClick={() => setShowPassword(prev => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
            <TextField
              label="성명"
              mode="editable"
              value={form.userName}
              onChange={(e) => { setSubmitErrors([]); setFieldErrors(prev => ({ ...prev, userName: undefined })); setForm(prev => ({ ...prev, userName: e.target.value })); }}
              onBlur={() => setTouched(prev => ({ ...prev, userName: true }))}
              size="small"
              fullWidth
              required
              error={(touched.userName && !form.userName.trim()) || !!fieldErrors.userName?.length}
              helperText={(touched.userName && !form.userName.trim()) ? '필수 입력' : (fieldErrors.userName?.[0] || ' ')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="사번"
              mode="editable"
              value={form.empNo}
              onChange={(e) => { setSubmitErrors([]); setFieldErrors(prev => ({ ...prev, empNo: undefined })); setForm(prev => ({ ...prev, empNo: e.target.value })); }}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {/* 소속/직무 선택 영역 제거 */}

        {/* 연락처 */}
        <Box sx={{ 
          gridColumn: '1 / -1', 
          mb: 3, 
          p: 3, 
          backgroundColor: 'var(--bank-bg-secondary)', 
          borderRadius: '8px', 
          border: '1px solid var(--bank-border)' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <BadgeIcon sx={{ color: 'secondary.main', fontSize: '1.2rem' }} />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'secondary.main', 
                fontWeight: 600, 
                fontSize: '1rem' 
              }}
            >
              연락처
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="주소"
              mode="editable"
              value={address}
              onChange={(e) => { setSubmitErrors([]); setFieldErrors(prev => ({ ...prev, address: undefined })); setAddress(e.target.value); }}
              size="small"
              fullWidth
              required={mode === 'create'}
              error={!!fieldErrors.address?.length}
              helperText={fieldErrors.address?.[0] || ' '}
            />
            <TextField
              label="전화번호"
              mode="editable"
              value={mobile}
              onChange={(e) => { setSubmitErrors([]); setFieldErrors(prev => ({ ...prev, mobile: undefined })); setMobile(e.target.value); }}
              onBlur={() => setTouched(prev => ({ ...prev, mobile: true }))}
              size="small"
              fullWidth
              required
              error={(touched.mobile && (!mobile.trim() || !mobileValid)) || !!fieldErrors.mobile?.length}
              helperText={
                touched.mobile
                  ? (!mobile.trim() ? '필수 입력' : (!mobileValid ? '올바른 휴대폰 번호 형식이 아닙니다.' : (fieldErrors.mobile?.[0] || ' ')))
                  : (fieldErrors.mobile?.[0] || ' ')
              }
            />
          </Box>
        </Box>

        {/* 초기 역할 할당 */}
        <Box sx={{ 
          gridColumn: '1 / -1',
          p: 3, 
          backgroundColor: 'var(--bank-bg-secondary)', 
          borderRadius: '8px', 
          border: '1px solid var(--bank-border)' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: '1.2rem' }} />
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'success.main', 
                fontWeight: 600, 
                fontSize: '1rem' 
              }}
            >
              초기 역할 할당
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, maxHeight: 120, overflowY: 'auto' }}>
            {roles.map(role => {
              const selected = selectedRoles.includes(role.roleId);
              return (
                <Tooltip key={role.roleId} title={role.roleName || role.roleId} placement="top" arrow>
                  <Chip
                    label={role.roleId}
                    size="medium"
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    icon={selected ? <CheckCircleOutlineIcon fontSize="small" /> : undefined}
                    onClick={() => toggleRole(role.roleId)}
                    sx={{ 
                      cursor: 'pointer',
                      height: '36px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      borderRadius: '18px',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      </Box>
    </BaseDialog>
  );
};

export default CreateUserDialog;



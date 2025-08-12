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
import type { CreateUserRequest, Role } from '../types';
import { useSnackbar } from '@/shared/hooks/useSnackbar';

export interface CreateUserDialogProps {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onCreated?: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, roles, onClose, onCreated }) => {
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

  const reset = useCallback(() => {
    setForm({ userId: '', userName: '', email: '', empNo: '' });
    // 소속/직무 선택 제거로 초기화 불필요
    setSelectedRoles([]);
    setTouched({ userId: false, email: false, password: false, userName: false, mobile: false });
  }, []);

  const emailValid = useMemo(() => /.+@.+\..+/.test(form.email.trim()), [form.email]);
  const mobileValid = useMemo(() => /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(mobile.trim()), [mobile]);
  const passwordValid = useMemo(() => password.trim().length >= 8, [password]);
  const disabled = useMemo(
    () => !form.userId.trim() || !form.userName.trim() || !emailValid || !passwordValid || !address.trim() || !mobileValid,
    [form.userId, form.userName, emailValid, passwordValid, address, mobileValid]
  );

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoles(prev => (prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const payload: CreateUserRequest = {
        // 백엔드 DTO(UserDto.CreateRequest)의 필드명(id, username)에 맞춰 전달
        id: form.userId.trim(),
        username: form.userName.trim(),
        email: form.email.trim(),
        // 필수 입력값(빈값 불가)
        address: address.trim(),
        mobile: mobile.trim(),
        password: password,
        // 선택값
        num: form.empNo?.trim() || undefined,
      };
      await adminApi.createUser(payload);
      showSuccess('사용자가 등록되었습니다.');
      onCreated?.();
      reset();
      onClose();
    } catch (e: any) {
      // 백엔드 에러 메시지 표시 (중복 이메일 등)
      const message = e?.message || '사용자 등록에 실패했습니다.';
      showError(message);
      // 다이얼로그 내부 상세 표시 및 필드 매핑
      const details = e?.details;
      const messages: string[] = [];
      const newFieldErrors: Partial<Record<'userId' | 'userName' | 'email' | 'address' | 'mobile' | 'password' | 'empNo', string[]>> = {};
      const pushField = (field: keyof typeof newFieldErrors, msg: string) => {
        if (!newFieldErrors[field]) newFieldErrors[field] = [];
        newFieldErrors[field]!.push(msg);
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
          else messages.push(`${backendField}: ${msg}`);
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
              else messages.push(`${backendField}: ${msg}`);
            } else if (msg) {
              messages.push(msg);
            }
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
  }, [form.email, form.empNo, form.userId, form.userName, onClose, onCreated, reset, selectedRoles, address, mobile, password]);

  // 입력 변경 시 서버 에러 초기화
  useEffect(() => {
    if (submitErrors.length > 0) setSubmitErrors([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.userId, form.userName, form.email, form.empNo, address, mobile, password]);

  return (
    <BaseDialog
      open={open}
      mode="create"
      title="🙋‍♂️ 새 사용자 등록"
      maxWidth="md"
      onClose={() => { reset(); onClose(); }}
      onSave={handleSave}
      disableSave={disabled}
      loading={saving}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        },
        '& .MuiDialogContent-root': {
          padding: '24px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        }
      }}
    >
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
            error={(touched.userId && !form.userId.trim()) || !!fieldErrors.userId?.length}
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
            error={(touched.email && (!emailValid || !form.email.trim())) || !!fieldErrors.email?.length}
            helperText={
              touched.email
                ? (!form.email.trim() ? '필수 입력' : (!emailValid ? '올바른 이메일 형식이 아닙니다' : (fieldErrors.email?.[0] || ' ')))
                : (fieldErrors.email?.[0] || ' ')
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
            required
            error={(touched.password && (!passwordValid || !password.trim())) || !!fieldErrors.password?.length}
            helperText={
              touched.password
                ? (!password.trim() ? '필수 입력' : (!passwordValid ? '8자 이상 입력해주세요' : (fieldErrors.password?.[0] || ' ')))
                : (fieldErrors.password?.[0] || ' ')
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
            required
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
    </BaseDialog>
  );
};

export default CreateUserDialog;



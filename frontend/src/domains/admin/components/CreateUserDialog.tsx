import React, { useCallback, useMemo, useState } from 'react';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import DepartmentSelect, { type DepartmentSearchResult } from '@/shared/components/ui/form/DepartmentSelect';
import PositionSelect from '@/shared/components/ui/form/PositionSelect';
import { CommonCodeSelect } from '@/shared/components/ui/form';
import type { PositionSearchResult } from '@/domains/ledgermngt/api/positionApi';
import { Box, Chip, Divider, InputAdornment, Tooltip, Typography } from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Badge as BadgeIcon,
  Lock as LockIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import TextField from '@/shared/components/ui/data-display/TextField';
import { adminApi } from '../api/adminApi';
import type { CreateUserRequest, Role } from '../types';

export interface CreateUserDialogProps {
  open: boolean;
  roles: Role[];
  onClose: () => void;
  onCreated?: () => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, roles, onClose, onCreated }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Pick<CreateUserRequest, 'userId' | 'userName' | 'email' | 'empNo'>>({
    userId: '',
    userName: '',
    email: '',
    empNo: '',
  });
  const [dept, setDept] = useState<DepartmentSearchResult | null>(null);
  const [position, setPosition] = useState<PositionSearchResult | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  // DB 컬럼 기반 추가 입력값
  const [address, setAddress] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [jobRankCd, setJobRankCd] = useState<string>(''); // 직급코드
  // 직책코드(job_title_cd) 사용 안함

  const reset = useCallback(() => {
    setForm({ userId: '', userName: '', email: '', empNo: '' });
    setDept(null);
    setPosition(null);
    setSelectedRoles([]);
  }, []);

  const emailValid = useMemo(() => /.+@.+\..+/.test(form.email.trim()), [form.email]);
  const passwordValid = useMemo(() => password.trim().length >= 8, [password]);
  const disabled = useMemo(
    () => !form.userId.trim() || !form.userName.trim() || !emailValid || !passwordValid || !address.trim() || !mobile.trim(),
    [form.userId, form.userName, emailValid, passwordValid, address, mobile]
  );

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoles(prev => (prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const payload: CreateUserRequest = {
        userId: form.userId.trim(),
        userName: form.userName.trim(),
        email: form.email.trim(),
        empNo: form.empNo?.trim() || undefined,
        // DB 스키마 매핑 필드
        address: address || undefined,
        mobile: mobile || undefined,
        password: password || undefined,
        deptCd: dept?.deptCode,
        jobRankCd: jobRankCd || undefined,
        // jobTitleCd 제거
        // 호환 필드(백엔드가 변환 지원 시)
        department: dept?.deptCode,
        departmentName: dept?.deptName,
        position: position ? String(position.positionsId) : undefined,
        positionName: position?.positionsNm,
        isActive: true,
        roleIds: selectedRoles,
      };
      await adminApi.createUser(payload);
      onCreated?.();
      reset();
      onClose();
    } catch (e) {
      // 상위에서 토스트 처리하므로 여기서는 삼킴
      // console.error(e);
    } finally {
      setSaving(false);
    }
  }, [dept, form.email, form.empNo, form.userId, form.userName, onClose, onCreated, position, reset, selectedRoles]);

  return (
    <BaseDialog
      open={open}
      mode="create"
      title="사용자 등록"
      maxWidth="lg"
      onClose={() => { reset(); onClose(); }}
      onSave={handleSave}
      disableSave={disabled}
      loading={saving}
    >
      {/* 계정 정보 */}
      <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>계정 정보</Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          <TextField
            label="사용자 ID"
            mode="editable"
            value={form.userId}
            onChange={(e) => setForm(prev => ({ ...prev, userId: e.target.value }))}
            size="small"
            required
            error={!form.userId.trim()}
            helperText={!form.userId.trim() ? '필수 입력' : ' '}
          />
          <TextField
            label="이메일"
            mode="editable"
            type="email"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            size="small"
            required
            error={(!!form.email && !emailValid)||!form.email.trim()}
            helperText={form.email && !emailValid ? '올바른 이메일 형식이 아닙니다' : ' '}
          />
          <TextField
            label="비밀번호"
            mode="editable"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="small"
            required
            error={(password.length > 0 && !passwordValid)||!password.trim()}
            helperText={password.length > 0 && !passwordValid ? '8자 이상 입력해주세요' : ' '}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 1.5 }}>
          <TextField
            label="성명"
            mode="editable"
            value={form.userName}
            onChange={(e) => setForm(prev => ({ ...prev, userName: e.target.value }))}
            size="small"
            required
            error={!form.userName.trim()}
            helperText={!form.userName.trim() ? '필수 입력' : ' '}
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
            onChange={(e) => setForm(prev => ({ ...prev, empNo: e.target.value }))}
            size="small"
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

      {/* 소속/직무 */}
      <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>소속/직무</Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
          <DepartmentSelect value={dept} onChange={setDept} size="small" placeholder="부서 선택" />
          <PositionSelect value={position} onChange={setPosition} size="small" placeholder="직책 선택" />
          <CommonCodeSelect groupCode="JOB_RANK" value={jobRankCd} onChange={setJobRankCd} size="small" placeholder="직급 선택" />
        </Box>
      </Box>

      {/* 연락처 */}
      <Box sx={{ gridColumn: '1 / -1', mb: 2 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>연락처</Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <TextField
            label="주소"
            mode="editable"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            size="small"
          />
          <TextField
            label="전화번호"
            mode="editable"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            size="small"
          />
        </Box>
      </Box>

      {/* 초기 역할 할당 */}
      <Box sx={{ gridColumn: '1 / -1' }}>
        <Typography variant="overline" sx={{ color: 'text.secondary' }}>초기 역할 할당</Typography>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 140, overflowY: 'auto' }}>
          {roles.map(role => {
            const selected = selectedRoles.includes(role.roleId);
            return (
              <Tooltip key={role.roleId} title={role.roleName || role.roleId} placement="top" arrow>
                <Chip
                  label={role.roleId}
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  icon={selected ? <CheckCircleOutlineIcon /> : undefined}
                  onClick={() => toggleRole(role.roleId)}
                  sx={{ cursor: 'pointer' }}
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



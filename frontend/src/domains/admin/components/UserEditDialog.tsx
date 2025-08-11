import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { Role, UserWithRoles } from '@/domains/admin/types';
import { adminApi } from '@/domains/admin/api/adminApi';
import Confirm from '@/shared/components/modal/Confirm';
import { useSnackbar } from '@/shared/hooks/useSnackbar';

export interface UserEditDialogProps {
  open: boolean;
  user: UserWithRoles | null;
  roles: Role[];
  onClose: () => void;
  onSaved: (updatedUser: UserWithRoles | null) => void;
  onDeleted: (userId: string) => void;
}

const UserEditDialog: React.FC<UserEditDialogProps> = ({ open, user, roles, onClose, onSaved, onDeleted }) => {
  const [saving, setSaving] = useState(false);
  const [editingRoles, setEditingRoles] = useState<string[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showSuccess, showError } = useSnackbar();

  React.useEffect(() => {
    if (user) {
      setEditingRoles(user.roles.filter(r => r.isActive).map(r => r.roleId));
    } else {
      setEditingRoles([]);
    }
  }, [user]);

  const handleRoleToggle = useCallback((roleId: string) => {
    setEditingRoles(prev => (prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]));
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) return;
    try {
      setSaving(true);
      await adminApi.updateUserRoles(user.userId, editingRoles);
      showSuccess('사용자 정보가 업데이트되었습니다.');
      onSaved({ ...user, roles: roles.filter(r => editingRoles.includes(r.roleId)).map(r => ({
        roleId: r.roleId,
        roleName: r.roleName,
        roleDescription: r.roleDescription,
        assignedAt: new Date().toISOString(),
        assignedBy: 'current-user',
        isActive: true,
      }))});
      onClose();
    } catch (e: any) {
      showError(e?.message || '사용자 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [editingRoles, onClose, onSaved, roles, showError, showSuccess, user]);

  const openDeleteConfirm = useCallback(() => setConfirmOpen(true), []);
  const closeDeleteConfirm = useCallback(() => setConfirmOpen(false), []);

  const handleDelete = useCallback(async () => {
    if (!user) return;
    try {
      setSaving(true);
      await adminApi.deleteUser(user.userId);
      showSuccess('사용자가 삭제되었습니다.');
      setConfirmOpen(false);
      onDeleted(user.userId);
      onClose();
    } catch (e: any) {
      showError(e?.message || '사용자 삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }, [onClose, onDeleted, showError, showSuccess, user]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              사용자 편집
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {user && (
            <Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>{user.userName.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{user.userName}</Typography>
                  <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {user.departmentName || user.department || '-'} | {user.positionName || user.position || '-'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>역할</Typography>
              <List>
                {roles.map(role => (
                  <ListItem key={role.roleId} divider>
                    <ListItemText
                      primary={role.roleName}
                      secondary={role.roleDescription}
                    />
                    <ListItemSecondaryAction>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={editingRoles.includes(role.roleId)}
                            onChange={() => handleRoleToggle(role.roleId)}
                            color="primary"
                          />
                        }
                        label=""
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={openDeleteConfirm} color="error" variant="outlined" disabled={saving}>사용자 삭제</Button>
          <Box flexGrow={1} />
          <Button onClick={onClose}>취소</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? '저장 중...' : '저장'}</Button>
        </DialogActions>
      </Dialog>

      <Confirm
        open={confirmOpen}
        title="사용자 삭제"
        message="정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDelete}
        onCancel={closeDeleteConfirm}
      />
    </>
  );
};

export default UserEditDialog;


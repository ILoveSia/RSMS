import type { Meta, StoryObj } from '@storybook/react';
import { MenuPermissionCell } from '../../../src/shared/components/ui/form/MenuPermissionCell';
import { Box } from '@mui/material';

// Mock PermissionSet type for Storybook
type MockPermissionSet = {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
};

const meta: Meta<typeof MenuPermissionCell> = {
  title: 'shared/components/ui/form/MenuPermissionCell',
  component: MenuPermissionCell,
  parameters: { layout: 'centered' }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NonePermission: Story = {
  args: {
    menuId: 1,
    roleName: 'USER',
    permissions: { canRead: false, canWrite: false, canDelete: false } as MockPermissionSet,
    hasChanges: false,
  },
};

export const ReadOnlyPermission: Story = {
  args: {
    menuId: 2,
    roleName: 'MANAGER',
    permissions: { canRead: true, canWrite: false, canDelete: false } as MockPermissionSet,
    hasChanges: false,
  },
};

export const WritePermission: Story = {
  args: {
    menuId: 3,
    roleName: 'ADMIN',
    permissions: { canRead: true, canWrite: true, canDelete: false } as MockPermissionSet,
    hasChanges: false,
  },
};

export const FullPermission: Story = {
  args: {
    menuId: 4,
    roleName: 'AUDITOR',
    permissions: { canRead: true, canWrite: true, canDelete: true } as MockPermissionSet,
    hasChanges: false,
  },
};

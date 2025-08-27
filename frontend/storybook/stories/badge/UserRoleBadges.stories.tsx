import type { Meta, StoryObj } from '@storybook/react';
import { UserRoleBadges } from '../../../src/shared/components/ui/badge/UserRoleBadges';
import { Box } from '@mui/material';

// Mock UserRoleInfo type for Storybook
type MockUserRoleInfo = {
  roleId: string;
  isActive: boolean;
};


type Story = StoryObj<typeof meta>;

const meta:Meta<typeof UserRoleBadges>={
  title:'shared/components/ui/badge/UserRoleBadges',
  component:UserRoleBadges,
  tags:['autodocs'],
}satisfies Meta<typeof UserRoleBadges>;
export default meta;

export const AdminUser: Story = {
  args: {
    roles: [
      { roleId: 'ADMIN', isActive: true },
      { roleId: 'MANAGER', isActive: true },
      { roleId: 'USER', isActive: true },
      { roleId: 'AUDITOR', isActive: true },
      { roleId: '', isActive: true },
    ] as MockUserRoleInfo[],
  },
};


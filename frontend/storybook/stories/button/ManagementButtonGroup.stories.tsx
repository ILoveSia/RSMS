import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ManagementButtonGroup from '../../../src/shared/components/ui/button/ManagementButtonGroup';

const meta: Meta<typeof ManagementButtonGroup> = {
  title: 'Shared/components/ui/button/ManagementButtonGroup',
  component: ManagementButtonGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Default ManagementButtonGroup',
  args: {
    onRegister: () => {},
    onDelete: () => {},
    onRefresh: () => {},
    onExcelDownload: () => {},
  },
};
import type { Meta, StoryObj } from '@storybook/react';
import { ApprovalStatusBadge } from '../../../src/shared/components/ui/badge';
import React from 'react';
const meta: Meta<typeof ApprovalStatusBadge> = {
  title: 'shared/components/ui/data-display/badge/ApprovalStatusBadge',
  component: ApprovalStatusBadge,
  parameters: { layout: 'centered' }
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { 
  render: () => (
    <div style={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ApprovalStatusBadge status={'NONE'} />
      <ApprovalStatusBadge status={'SUBMITTED'} />
      <ApprovalStatusBadge status={'IN_PROGRESS'} />
      <ApprovalStatusBadge status={'APPROVED'} />
      <ApprovalStatusBadge status={'REJECTED'} />
    </div>
  )
};

import type { Meta, StoryObj } from '@storybook/react';
import { ApprovalStatusBadge } from '../../../src/shared/components/ui/badge';
import React from 'react';


type Story = StoryObj<typeof meta>;

const meta:Meta<typeof ApprovalStatusBadge>={
  title:'shared/components/ui/badge/ApprovalStatusBadge',
  component:ApprovalStatusBadge,
  tags:['autodocs'],
}satisfies Meta<typeof ApprovalStatusBadge>;
export default meta;


export const Default: Story = { 
  args:{
    status:'',
  },
};
export const None: Story = { 
  args:{
    status:'NONE',
  },
};
export const Submitted: Story = { 
  args:{
    status:'SUBMITTED',
  },
};
export const InProgress: Story = { 
  args:{
    status:'IN_PROGRESS',
  },
};
export const Approved: Story = { 
  args:{
    status:'APPROVED',
  },
};
export const Rejected: Story = { 
  args:{
    status:'REJECTED',
  },
};

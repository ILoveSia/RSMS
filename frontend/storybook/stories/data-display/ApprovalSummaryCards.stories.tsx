import type { Meta, StoryObj } from '@storybook/react';
import { ApprovalSummaryCards } from '../../../src/shared/components/ui/data-display/ApprovalSummaryCards';
import { Box } from '@mui/material';
import { ApprovalSummaryResponse } from '../../../src/domains/approval/api/approvalApi'; // Import the actual type

const meta: Meta<typeof ApprovalSummaryCards> = {
  title: 'shared/components/ui/data-display/ApprovalSummaryCards',
  component: ApprovalSummaryCards,
  parameters: { layout: 'centered' }
};

export default meta;

type Story = StoryObj<typeof meta>;

const mockSummaryData: ApprovalSummaryResponse = {
  myPendingCount: 5,
  totalCount: 120,
  approvedCount: 90,
  rejectedCount: 10,
  cancelledCount: 10,  
};

export const Default: Story = {
  args: {
    summary: mockSummaryData,
  },
};

export const ZeroCounts: Story = {
  args: {
    summary: {
      myPendingCount: 0,
      totalCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    },
  },
};

export const LargeCounts: Story = {
  args: {
    summary: {
      myPendingCount: 1234,
      totalCount: 56789,
      approvedCount: 45678,
      rejectedCount: 1234,
    },
  },
};

export const LoadingState: Story = {
  args: {
    summary: null, // Simulate loading or no data
  },
};

export const CustomSx: Story = {
  args: {
    summary: mockSummaryData,
    sx: { border: '2px dashed grey', borderRadius: '8px' },
  },
};

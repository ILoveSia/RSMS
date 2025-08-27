import type { Meta, StoryObj } from '@storybook/react';
import { AttachmentBadge } from '../../../src/shared/components/ui/badge/';
import { Box } from '@mui/material';

// Storybook의 메타데이터 설정
const meta: Meta<typeof AttachmentBadge> = {
  title: 'shared/components/ui/badge/AttachmentBadge',
  component: AttachmentBadge,
  parameters: {
    layout: 'centered', // 스토리를 캔버스 중앙에 배치
  },
  tags: ['autodocs'], 
};

export default meta;

type Story = StoryObj<typeof meta>;

// 기본 상태의 스토리
export const OneCount: Story = {
  args: {
    count: 1,
  },
};

// 첨부파일이 하나일 때의 스토리
export const ManyCount: Story = {
  args: {
    count: 987654321,
  },
};

// 첨부파일이 없을 때 (count = 0)의 스토리
export const ZeroCount: Story = {
  args: {
    count: 0,
  },
};

// 첨부파일이 없을 때 (count = null)의 스토리
export const NullCount: Story = {
  args: {
    count: null,
  },
};

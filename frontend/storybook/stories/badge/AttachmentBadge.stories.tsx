import type { Meta, StoryObj } from '@storybook/react';
import { AttachmentBadge } from '../../../src/shared/components/ui/badge/';
import { Box } from '@mui/material';

// Storybook의 메타데이터 설정
const meta: Meta<typeof AttachmentBadge> = {
  title: 'shared/components/ui/data-display/badge/AttachmentBadge',
  component: AttachmentBadge,
  parameters: {
    layout: 'centered', // 스토리를 캔버스 중앙에 배치
  },
  tags: ['autodocs'], // 컴포넌트 문서를 자동으로 생성
  argTypes: {
    count: {
      control: 'number',
      description: '표시할 첨부파일의 개수',
    },
    sx: {
      control: 'object',
      description: 'MUI SxProp을 사용하여 추가적인 스타일을 적용',
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// 기본 상태의 스토리
export const Default: Story = {
  args: {
    count: 5,
  },
};

// 첨부파일이 하나일 때의 스토리
export const SingleCount: Story = {
  args: {
    count: 1,
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

// 스타일(sx) prop을 적용한 스토리
export const WithCustomStyle: Story = {
  args: {
    count: 10,
    sx: {
      backgroundColor: '#e0f7fa',
      padding: '4px 8px',
      borderRadius: '12px',
      border: '1px solid #00acc1',
    },
  },
};

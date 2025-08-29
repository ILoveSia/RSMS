import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Loading from '../../../src/shared/components/ui/feedback/Loading';

const meta: Meta<typeof Loading> = {
    title: 'Shared/components/ui/feedback/Loading',
  component: Loading,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof Loading>;


export const Overlay: Story = {
  args: {
    overlay: true,
    message: '데이터 처리 중...',
  },
};


export const LinearProgress: Story = {
  args: {
    variant: 'linear',
    progress: 50,
    message: '파일 업로드 중...',
  },
};



export const Default: Story = {
  args: {
    message: '불러오는 중...',
  },
};
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Loading from '../../src/shared/components/ui/feedback/Loading';
import Toast from '../../src/shared/components/ui/feedback/Toast';

const meta: Meta = {
  title: 'Shared/UI/Feedback',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const LoadingIndicator: Story = {
  name: 'Loading',
  render: () => <Loading open message="로딩 중..." />,
};

export const ToastInline: Story = {
  name: 'Toast (inline)',
  render: () => (
    <Toast open message="인라인 토스트" severity="info" autoHideDuration={0} onClose={() => {}} />
  ),
};



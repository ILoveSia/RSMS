import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Toast from '../../../src/shared/components/ui/feedback/Toast';

const meta: Meta = {
  title: 'Shared/UI/Feedback/Toast'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Toast open message="토스트 메시지" severity="success" onClose={() => {}} />
  )
};



import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Alert from '../../../src/shared/components/ui/feedback/Alert';

const meta: Meta = {
  title: 'Shared/UI/Feedback/Alert'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Alert open severity="info" message="알림 메시지" onClose={() => {}} />
  )
};




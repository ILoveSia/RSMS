import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Alert from '../../../src/shared/components/ui/feedback/Alert';

const meta: Meta = {
  title: 'Shared/components/ui/feedback/Alert'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Alert severity="info" title="알림 메시지" onClose={() => {}} >
      <p>알림 메시지</p>
    </Alert>
  )
};




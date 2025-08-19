import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Loading from '../../../src/shared/components/ui/feedback/Loading';

const meta: Meta = {
    title: 'Shared/components/ui/feedback/Loading'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Loading message="불러오는 중" />
  )
};




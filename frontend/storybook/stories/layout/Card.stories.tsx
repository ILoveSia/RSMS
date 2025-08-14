import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Card from '../../../src/shared/components/ui/layout/Card';

const meta: Meta = {
  title: 'Shared/UI/Layout/Card'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Card title="카드 제목">본문 내용</Card>
  )
};



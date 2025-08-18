import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Breadcrumb from '../../../src/shared/components/ui/navigation/Breadcrumb';

const meta: Meta = {
  title: 'Shared/UI/Navigation/Breadcrumb'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Breadcrumb items={[{ label: '홈' }, { label: '리스트' }, { label: '상세', active: true }]} />
  )
};




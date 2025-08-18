import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Tabs from '../../../src/shared/components/ui/layout/Tabs';

const meta: Meta = {
  title: 'Shared/UI/Layout/Tabs'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Tabs
      tabs={[
        { label: '탭 1', content: <div>내용 1</div> },
        { label: '탭 2', content: <div>내용 2</div> }
      ]}
    />
  )
};




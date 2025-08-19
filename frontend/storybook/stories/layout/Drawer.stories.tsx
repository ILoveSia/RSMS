import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Drawer from '../../../src/shared/components/ui/layout/Drawer';

const meta: Meta = {
  title: 'Shared/components/ui/layout/Drawer'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Drawer open onClose={() => {}} anchor="right">내용</Drawer>
  )
};




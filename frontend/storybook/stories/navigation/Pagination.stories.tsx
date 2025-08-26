import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Pagination from '../../../src/shared/components/ui/navigation/Pagination';

const meta: Meta = {
  title: 'Shared/components/ui/navigation/Pagination'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Pagination page={1} onPageChange={() => {}} onPageSizeChange={() => {}} />
  )
};




import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Select from '../../../src/shared/components/ui/form/Select';

const meta: Meta = {
  title: 'Shared/UI/Form/Select'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Select
      label="기관"
      value={''}
      options={[
        { value: 'B01', label: '은행 A' },
        { value: 'B02', label: '은행 B' }
      ]}
      placeholder="선택"
      size="small"
    />
  )
};



import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RadioGroup from '../../../src/shared/components/ui/form/RadioGroup';

const meta: Meta = {
  title: 'Shared/components/ui/form/RadioGroup'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <RadioGroup
      value={'A'}
      onChange={() => {}}
      options={[
        { value: 'A', label: '옵션 A' },
        { value: 'B', label: '옵션 B' }
      ]}
      label="라디오 선택"
      row
    />
  )
};




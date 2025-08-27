import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import RadioGroup from '../../../src/shared/components/ui/form/RadioGroup';

type Story = StoryObj<typeof meta>;

const meta:Meta<typeof RadioGroup>={
  title:'shared/components/ui/form/RadioGroup',
  component:RadioGroup,
  tags:['autodocs'],
}satisfies Meta<typeof RadioGroup>;
export default meta;


export const Basic: Story = {
  args: {
    value: '1',
    onChange: () => {},
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ],
  },
};




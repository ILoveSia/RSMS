import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Select from '../../../src/shared/components/ui/form/Select';

type Story = StoryObj<typeof meta>;

const meta:Meta<typeof Select>={
  title:'shared/components/ui/form/Select',
  component:Select,
  tags:['autodocs'],
}satisfies Meta<typeof Select>;
export default meta;


export const Basic: Story = {
  args: {
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ],
    value: ['1'],
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);

    const handleChange = (newValue: string | number | string[] | number[]) => {
      setValue(newValue);
      args.onChange?.(newValue);
    };

    return (
      <Select
        {...args}
        value={value}
        onChange={handleChange}
      />
    );
  },
};


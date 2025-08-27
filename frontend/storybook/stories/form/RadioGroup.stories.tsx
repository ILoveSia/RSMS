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
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ],
    value: '1',
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.value);

    const handleChange = (newValue: string) => {
      setValue(newValue);
      args.onChange?.(newValue);
    };

    return (
      <RadioGroup
        {...args}
        value={value}
        onChange={handleChange}
      />
    );
  },
};




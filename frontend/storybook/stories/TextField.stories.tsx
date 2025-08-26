import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from '../../src/shared/components/ui/data-display';

const meta: Meta<typeof TextField> = {
  title: 'Shared/components/ui/data-display/TextField',
  component: TextField,
  tags: ['autodocs'],
  parameters: { 
    layout: 'padded',
  },
  argTypes: {
  },
};
export default meta;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    label: 'Name',
    mode: 'editable',
    value: 'Editable',
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.value);
    
    React.useEffect(() => {
      setValue(args.value);
    }, [args.value]);
    
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        <TextField 
          {...args} 
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
    );
  },
};
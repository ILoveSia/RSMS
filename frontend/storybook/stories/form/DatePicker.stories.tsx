import type { Meta, StoryObj } from '@storybook/react';
import { DatePicker } from '../../../src/shared/components/ui/form';
import { Box } from '@mui/material';

type Story = StoryObj<typeof meta>;

const meta:Meta<typeof DatePicker>={
  title:'shared/components/ui/form/DatePicker',
  component:DatePicker,
  tags:['autodocs'],
}satisfies Meta<typeof DatePicker>;
export default meta;

export const Default: Story = {
  args: {
    value: new Date(),
    onChange: () => {},
  },
};

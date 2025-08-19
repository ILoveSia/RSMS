import type { Meta, StoryObj } from '@storybook/react';
import CustomSnackbar from '../../src/shared/components/notification/CustomSnackbar';
import React from 'react';

const meta: Meta<typeof CustomSnackbar> = {
  title: 'Shared/Notification/CustomSnackbar',
  component: CustomSnackbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CustomSnackbar>;

export const Success: Story = {
  args: {
    open: true,
    message: 'This is a success message!',
    severity: 'success',
    autoHideDuration: 3000,
  },
};

export const Error: Story = {
  args: {
    open: true,
    message: 'This is an error message!',
    severity: 'error',
    autoHideDuration: 3000,
  },
};

export const Info: Story = {
  args: {
    open: true,
    message: 'This is an info message!',
    severity: 'info',
    autoHideDuration: 3000,
  },
};

export const Warning: Story = {
  args: {
    open: true,
    message: 'This is a warning message!',
    severity: 'warning',
    autoHideDuration: 3000,
  },
};

// You can also create a story that shows how to use it with a button
export const WithButton: Story = {
  render: (args) => {
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
      setOpen(true);
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }
      setOpen(false);
      args.onClose(); // Call the original onClose action for Storybook
    };

    return (
      <div>
        <button onClick={handleClick}>Show Snackbar</button>
        <CustomSnackbar {...args} open={open} onClose={handleClose} />
      </div>
    );
  },
  args: {
    message: 'Snackbar opened from a button!',
    severity: 'success',
    autoHideDuration: 3000,
  },
};

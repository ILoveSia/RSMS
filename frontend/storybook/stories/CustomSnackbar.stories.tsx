import type { Meta, StoryObj } from '@storybook/react';
import CustomSnackbar from '../../src/shared/components/notification/CustomSnackbar';
import React from 'react';
import Button from '../../src/shared/components/ui/button/Button';

const meta: Meta<typeof CustomSnackbar> = {
  title: 'shared/components/notification/CustomSnackbar',
  component: CustomSnackbar,
  // parameters: {
  //   layout: 'centered',
  // },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

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
        <Button onClick={handleClick}>Show Snackbar</Button>
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

import type { Meta, StoryObj } from '@storybook/react';
import Badge from '../../src/shared/components/ui/data-display/Badge';
import MailIcon from '@mui/icons-material/Mail';

const meta: Meta<typeof Badge> = {
  title: 'Shared/UI/Badge',
  component: Badge,
  args: {
    color: 'primary',
  },
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Standard: Story = {
  args: {
    badgeContent: 5,
    children: <MailIcon />,
  },
};

export const Dot: Story = {
  args: {
    variant: 'dot',
    color: 'error',
    children: <MailIcon />,
  },
};

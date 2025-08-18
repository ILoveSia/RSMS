import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ResponsibilitySelect from '../../../src/shared/components/ui/form/ResponsibilitySelect';

const meta: Meta = {
  title: 'Shared/UI/Form/ResponsibilitySelect'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <ResponsibilitySelect value={null} onChange={() => {}} />
  )
};




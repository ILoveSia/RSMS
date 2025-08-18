import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Stepper from '../../../src/shared/components/ui/navigation/Stepper';

const meta: Meta = {
  title: 'Shared/UI/Navigation/Stepper'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Stepper steps={[{ label: '1단계' }, { label: '2단계' }, { label: '완료' }]} activeStep={1} />
  )
};




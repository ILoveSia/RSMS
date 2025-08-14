import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Chip from '../../../src/shared/components/ui/data-display/Chip';

const meta: Meta = {
  title: 'Shared/UI/DataDisplay/Chip'
};
export default meta;

type Story = StoryObj;

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Chip label="기본" />
      <Chip label="Primary" color="primary" />
      <Chip label="Success" color="success" />
      <Chip label="Outlined" variant="outlined" />
      <Chip label="삭제 가능" onDelete={() => {}} />
    </div>
  )
};



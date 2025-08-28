import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ExcelDownloadButton from '../../../src/shared/components/ui/button/ExcelDownloadButton';
import ActionButtonGroup from '../../../src/shared/components/ui/button/ActionButtonGroup';
import Button from '../../../src/shared/components/ui/button/Button';

type Story=StoryObj<typeof meta>;

const meta:Meta<typeof Button>={
    title:'shared/components/ui/button/Button',
    component:Button,
    tags:['autodocs'],
}satisfies Meta<typeof Button>;
export default meta;

export const AllButtons: Story = {
  name: 'Default Button',
  args: {
    preset: 'search',
    onClick: () => {},
  },
};

export const ActionGroup: Story = {
  name: 'ActionButtonGroup',
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexDirection: 'column', alignItems: 'center' }}>
      <ActionButtonGroup
        buttons={[
          { type: 'search', onClick: () => {} },
          { type: 'register', onClick: () => {} },
          { type: 'delete', onClick: () => {} },
          { type: 'refresh', onClick: () => {} },
          { type: 'edit', onClick: () => {} },
          { type: 'save', onClick: () => {} },
          { type: 'cancel', onClick: () => {} },
        ]}
      />
    </div>
  ),
};



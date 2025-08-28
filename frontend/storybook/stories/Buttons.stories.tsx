import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import ExcelDownloadButton from '../../src/shared/components/ui/button/ExcelDownloadButton';
import ActionButtonGroup from '../../src/shared/components/ui/button/ActionButtonGroup';


const meta: Meta = {
  title: 'Shared/components/ui/button',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const AllButtons: Story = {
  name: 'Buttons:normal',
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
      <ExcelDownloadButton onDownload={async () => {}} />
    </div>
  ),
};

export const LoadingStates: Story = {
  name: 'Buttons:loading',
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
      <ExcelDownloadButton onDownload={async () => {}} />
    </div>
  ),
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



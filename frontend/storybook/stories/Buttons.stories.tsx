import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CancelButton from '../../src/shared/components/ui/button/CancelButton';
import DeleteButton from '../../src/shared/components/ui/button/DeleteButton';
import EditButton from '../../src/shared/components/ui/button/EditButton';
import ExcelDownloadButton from '../../src/shared/components/ui/button/ExcelDownloadButton';
import RefreshButton from '../../src/shared/components/ui/button/RefreshButton';
import RegisterButton from '../../src/shared/components/ui/button/RegisterButton';
import SaveButton from '../../src/shared/components/ui/button/SaveButton';
import SearchButton from '../../src/shared/components/ui/button/SearchButton';
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
      <RegisterButton onClick={() => {}} />
      <SaveButton onClick={() => {}} />
      <EditButton onClick={() => {}} />
      <DeleteButton onClick={() => {}} />
      <CancelButton onClick={() => {}} />
      <RefreshButton onClick={() => {}} />
      <ExcelDownloadButton onDownload={async () => {}} />
      <SearchButton onClick={() => {}} />
    </div>
  ),
};

export const LoadingStates: Story = {
  name: 'Buttons:loading',
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
      <RegisterButton onClick={() => {}} loading />
      <SaveButton onClick={() => {}} loading />
      <EditButton onClick={() => {}} loading />
      <DeleteButton onClick={() => {}} loading />
      <CancelButton onClick={() => {}} loading />
      <RefreshButton onClick={() => {}} loading />
      <ExcelDownloadButton onDownload={async () => {}} />
      <SearchButton onClick={() => {}} />
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



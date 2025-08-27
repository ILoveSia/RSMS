import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ComboBox,CommonCodeSelect} from '../../src/shared/components/ui/form';
// import {FileUploader} from 'evergreen-ui'
const meta: Meta = {
  title: 'Shared/components/ui/form',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;
export const CommonCodeSelect11: Story = {
  name: 'CommonCodeSelect',
  render: () => {
    return <CommonCodeSelect
    minWidth='100%'
    groupCode='HANDOVER_STATUS'
    value={''}
    onChange={() => {}}
    disabled={false}
  />
  },
};
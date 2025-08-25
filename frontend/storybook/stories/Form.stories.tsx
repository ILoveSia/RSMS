import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ComboBox,DatePicker,ServerFileUpload ,CommonCodeSelect,FileUpload} from '../../src/shared/components/ui/form';
import { adminApi } from '../../src/domains/admin/api/adminApi';
// import {FileUploader} from 'evergreen-ui'
const meta: Meta = {
  title: 'Shared/components/ui/form',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const ComboBox11: Story = {
  name: 'ComboBox',
  render: () => {
    return <ComboBox options={[]} />;
  },
};
export const DatePicker11: Story = {
  name: 'DatePicker',
  render: () => {
    const [value, setValue] = React.useState(new Date());
    return <DatePicker mode="editable" onChange={date => setValue(date ?? new Date())} value={value} />;
  },
};
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
export const ServerFileUpload11: Story = {
  name: 'ServerFileUpload',
  render: () => {
    return <ServerFileUpload api={adminApi} />;
  },
};
export const fileupload11: Story = {
  name: 'fileupload',
  render: () => {
      return <FileUpload />;
  },
};
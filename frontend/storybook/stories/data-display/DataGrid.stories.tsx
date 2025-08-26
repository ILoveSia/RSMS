import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid } from '../../../src/shared/components/ui/data-display';
import React from 'react';

const meta: Meta<typeof DataGrid> = {
  title: 'shared/components/ui/data-display/DataGrid',
  component: DataGrid,
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    error: { control: 'text' },
    height: { control: 'number' },
    sortable: { control: 'boolean' },
  },
};
export default meta;

type Story = StoryObj<typeof DataGrid>;

export const DataGridStory: Story = {
  name: 'DataGrid',
  args: {
    data: [
      { id: 1, name: 'John Doe', age: 28, city: 'New York' },
      { id: 2, name: 'Jane Smith', age: 34, city: 'London' },
      { id: 3, name: 'Sam Green', age: 42, city: 'Tokyo' },
      { id: 4, name: 'Alice Johnson', age: 25, city: 'Paris' },
      { id: 5, name: 'Bob Brown', age: 50, city: 'Sydney' },
    ],
    columns: [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'name', headerName: 'Name', width: 150, flex: 1 },
      { field: 'age', headerName: 'Age', width: 100 },
      { field: 'city', headerName: 'City', width: 180, flex: 1 },
    ],
    rowIdField: "id",
    loading: false,
    error: null,
    height: 400,
    sortable: true,
  },
  render: (args) => {
    return (
      <DataGrid
        {...args}
        onRowClick={() => {}}
        onRowDoubleClick={() => {}}
        onRowSelectionChange={() => {}}
        onSortChange={() => {}}
      />
    );
  },
};
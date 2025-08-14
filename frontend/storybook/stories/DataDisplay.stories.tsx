import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid,TextField } from '../../src/shared/components/ui/data-display';

const meta: Meta = {
  title: 'Shared/UI/DataDisplay',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const DataGrid11: Story = {
  name: 'DataGrid',
  render: () => {
    const mockData = [
      { id: 1, name: 'John Doe', age: 28, city: 'New York' },
      { id: 2, name: 'Jane Smith', age: 34, city: 'London' },
      { id: 3, name: 'Sam Green', age: 42, city: 'Tokyo' },
      { id: 4, name: 'Alice Johnson', age: 25, city: 'Paris' },
      { id: 5, name: 'Bob Brown', age: 50, city: 'Sydney' },
    ];
    const mockColumns = [
      { field: 'id', headerName: 'ID', width: 80 },
      { field: 'name', headerName: 'Name', width: 150, flex: 1 },
      { field: 'age', headerName: 'Age', width: 100 },
      { field: 'city', headerName: 'City', width: 180, flex: 1 },
    ];
    return (
      <DataGrid
        data={mockData}
        columns={mockColumns}
        rowIdField="id"
        onRowClick={() => {}}
        onRowDoubleClick={() => {}}
        onRowSelectionChange={() => {}}
        onSortChange={() => {}}
      />
    );
  },
};
export const TextField11: Story = {
  name: 'TextField',
  render: () => {
    const [editableValue, setEditableValue] = React.useState('Editable');
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        <TextField label="Name" mode="readonly" value="Read Only" />
        <TextField
          label="Name"
          mode="editable"
          value={editableValue}
          onChange={e => setEditableValue(e.target.value)}
        />
      </div>
    );
  },
};
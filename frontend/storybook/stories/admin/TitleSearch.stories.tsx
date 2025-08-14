import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TitleSearch from '../../../src/domains/admin/components/TitleSearch';

const meta: Meta = {
  title: 'Domains/Admin/TitleSearch'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div style={{ maxWidth: 600 }}>
        <TitleSearch
          value={value}
          onChange={setValue}
          onEnter={() => console.log('enter:', value)}
        />
      </div>
    );
  }
};



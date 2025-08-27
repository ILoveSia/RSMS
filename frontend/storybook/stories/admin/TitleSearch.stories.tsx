import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TitleSearch from '../../../src/domains/admin/components/TitleSearch';
import Button from '@mui/material/Button';

type Story = StoryObj<typeof meta>;

const meta:Meta<typeof TitleSearch>={
  title:'domains/admin/TitleSearch',
  component:TitleSearch,
  tags:['autodocs'],
}satisfies Meta<typeof TitleSearch>;

export default meta;

export const Basic: StoryObj<typeof meta> = {
  args:{
    value:'',
    onChange:()=>{},
    onEnter:()=>{},
    after: <Button>after</Button>,
    right: <Button>right</Button>,
  },
};



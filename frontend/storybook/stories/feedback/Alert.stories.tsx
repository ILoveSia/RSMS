import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Alert from '../../../src/shared/components/ui/feedback/Alert';


type Story = StoryObj<typeof meta>;

const meta:Meta<typeof Alert>={
  title:'shared/components/ui/feedback/Alert',
  component:Alert,
  tags:['autodocs'],
}satisfies Meta<typeof Alert>;
export default meta;


export const Basic: Story = {
  args:{
    severity:'info',
    title:'알림 메시지',
    onClose:()=>{},
    children:<p>알림 메시지</p>
  } 
};




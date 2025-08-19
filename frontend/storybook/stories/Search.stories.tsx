import React from 'react';
import {EmployeeSearchPopup,PositionSearchPopup,MeetingBodySearchPopup,DepartmentSearchPopup} from '../../src/domains/common/components/search/';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
    title: 'domains/common/components/search',
    parameters: { layout: 'padded' },
  };
  export default meta;
  
  type Story = StoryObj;

  export const EmployeeSearchPopupStory: Story = {
    name: 'EmployeeSearchPopup',
    render: () => {
      return <EmployeeSearchPopup open={true} onClose={() => {}} onSelect={() => {}} />;
    },
  };
  export const PositionSearchPopupStory: Story = {
    name: 'PositionSearchPopup',
    render: () => {
      return <PositionSearchPopup open={true} onClose={() => {}} onSelect={() => {}} />;
    },
  };
  export const MeetingSearchPopupStory: Story = {
    name: 'MeetingSearchPopup',
    render: () => {
      return <MeetingBodySearchPopup open={true} onClose={() => {}} onSelect={() => {}} />;
    },
  };
  
  export const DepartmentSearchPopupStory: Story = {
    name: 'DepartmentSearchPopup',
    render: () => {
      return <DepartmentSearchPopup open={true} onClose={() => {}} onSelect={() => {}} />;
    },
  };
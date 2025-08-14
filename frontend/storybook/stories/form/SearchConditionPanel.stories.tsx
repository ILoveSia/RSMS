import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SearchConditionPanel from '../../../src/shared/components/ui/form/SearchConditionPanel';

const meta: Meta = {
  title: 'Shared/UI/Form/SearchConditionPanel'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <SearchConditionPanel>
      <div>여기에 검색조건 컴포넌트들 배치</div>
    </SearchConditionPanel>
  )
};



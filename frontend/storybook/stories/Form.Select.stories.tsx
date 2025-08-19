import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ComboBox, CommonCodeSelect, LedgerOrderSelect ,PositionSearchBox,DepartmentSearchBox} from '../../src/shared/components/ui/form';
import type { DepartmentSearchResult } from '../../src/shared/components/ui/form/DepartmentSearchBox';
import type { PositionSearchResult } from '../../src/domains/ledgermngt/api/positionApi';

const meta: Meta = {
  title: 'Shared/components/ui/form/SearchBox',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const PositionSearchBoxStory: Story = {
  name: 'PositionSearchBox',
  render: () => {
    const [value, setValue] = React.useState<PositionSearchResult | null>(null);
    return <PositionSearchBox size='small' value={value} onChange={setValue} />;
  },
};
export const DepartmentSearchBoxStory: Story = {
  name: 'DepartmentSearchBox',
  render: () => {
    const [value, setValue] = React.useState<DepartmentSearchResult | null>(null);
    return <DepartmentSearchBox size='small' value={value} onChange={setValue} />;
  },
};


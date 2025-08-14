import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ComboBox, CommonCodeSelect, LedgerOrderSelect} from '../../src/shared/components/ui/form';

const meta: Meta = {
  title: 'Shared/UI/Form/ComboBox',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const ComboBoxBasic: Story = {
  name: 'ComboBox',
  render: () => {
    return <ComboBox size='small' options={[]} />;
  },
};

export const LedgerOrderSelectStory: Story = {
  name: 'LedgerOrderSelect',
  render: () => {
    const [value, setValue] = React.useState('ALL');
    return <LedgerOrderSelect size='small' value={value} onChange={setValue} />;
  },
};

export const CommonCodeSelectStory: Story = {
  name: 'CommonCodeSelect',
  render: () => {
    const [handoverValue, setHandoverValue] = React.useState('ALL');
    const [bpValue, setBpValue] = React.useState('ALL');

    return (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'column' }}>
          <CommonCodeSelect
            groupCode="HANDOVER_STATUS"
            value={handoverValue}
            onChange={setHandoverValue}
            size='small'
            sx={{ minWidth: 160, maxWidth: 220 }}
          />
          <span style={{ fontSize: 12, color: '#888' }}>HANDOVER_STATUS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'column' }}>
          <CommonCodeSelect
            groupCode="BUSINESSPLAN_STATUS"
            value={bpValue}
            onChange={setBpValue}
            size='small'
            sx={{ minWidth: 160, maxWidth: 220 }}
          />
          <span style={{ fontSize: 12, color: '#888' }}>BUSINESSPLAN_STATUS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'column' }}>
          <CommonCodeSelect
            groupCode="PLAN_IMP"
            value={bpValue}
            onChange={setBpValue}
            size='small'
            sx={{ minWidth: 160, maxWidth: 220 }}
          />
          <span style={{ fontSize: 12, color: '#888' }}>PLAN_IMP</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'column' }}>
          <CommonCodeSelect
            groupCode="JOB_RANK"
            value={bpValue}
            onChange={setBpValue}
            size='small'
            sx={{ minWidth: 160, maxWidth: 220 }}
          />
          <span style={{ fontSize: 12, color: '#888' }}>JOB_RANK</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'column' }}>
          <CommonCodeSelect
            groupCode="DEPT"
            value={bpValue}
            onChange={setBpValue}
            size='small'
            sx={{ minWidth: 160, maxWidth: 220 }}
          />
          <span style={{ fontSize: 12, color: '#888' }}>DEPT</span>
        </div>
      </div>
    )
  },
};



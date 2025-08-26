import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ComboBox, CommonCodeSelect, LedgerOrderSelect} from '../../src/shared/components/ui/form';

// Meta 타입을 any로 지정하거나, 각 컴포넌트의 props 타입을 별도로 가져와야 함
const meta: Meta<any> = {
  title: 'Shared/components/ui/form/ComboBox',
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<any>;

export const ComboBoxBasic: Story = {
  name: 'ComboBox',
  args: {
    size: 'small',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
    value: '',
    disabled: false,
    fullWidth: false,
  },
  render: function ComboBoxRenderer(args) {
    const [value, setValue] = React.useState(args.value);
    
    React.useEffect(() => {
      setValue(args.value);
    }, [args.value]);

    // ComboBox의 onChange 시그니처에 맞게 수정
    // 실제 시그니처는 컴포넌트 구현을 확인해야 하지만, 일반적인 Autocomplete 시그니처를 가정
    const handleChange = (event: React.SyntheticEvent, newValue: any) => {
      setValue(newValue?.value || newValue || ''); // newValue가 객체일 수도 있으므로
      args.onChange?.(event, newValue);
    };

    return <ComboBox 
      {...args} 
      value={value}
      onChange={handleChange}
    />;
  },
};

export const LedgerOrderSelectStory: Story = {
  name: 'LedgerOrderSelect',
  args: {
    size: 'small',
    value: 'ALL',
    disabled: false,
  },
  render: function LedgerOrderSelectRenderer(args) {
    const [value, setValue] = React.useState(args.value);
    
    React.useEffect(() => {
      setValue(args.value);
    }, [args.value]);

    const handleChange = (newValue: any) => {
      setValue(newValue);
      args.onChange?.(newValue);
    };

    return <LedgerOrderSelect 
      {...args} 
      value={value}
      onChange={handleChange}
    />;
  },
};

// CommonCodeSelect 스토리는 복잡한 구조라 단순화하여 표현
export const CommonCodeSelectStory: Story = {
  name: 'CommonCodeSelect',
  args: {
    size: 'small',
    groupCode: 'HANDOVER_STATUS', // 기본값 설정
    value: 'ALL',
    disabled: false,
  },
  render: function CommonCodeSelectRenderer(args) {
    const [value, setValue] = React.useState(args.value);
    
    React.useEffect(() => {
      setValue(args.value);
    }, [args.value]);

    const handleChange = (newValue: any) => {
      setValue(newValue);
      args.onChange?.(newValue);
    };

    return (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'column' }}>
          <CommonCodeSelect
            {...args}
            groupCode="HANDOVER_STATUS"
            value={value}
            onChange={handleChange}
            sx={{ minWidth: 160, maxWidth: 220 }}
          />
          <span style={{ fontSize: 12, color: '#888' }}>HANDOVER_STATUS</span>
        </div>
      </div>
    );
  },
};



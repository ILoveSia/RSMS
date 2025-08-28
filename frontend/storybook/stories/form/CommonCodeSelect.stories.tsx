import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CommonCodeSelect from '../../../src/shared/components/ui/form/CommonCodeSelect';
import { Box } from '@mui/material';

const meta: Meta<typeof CommonCodeSelect> = {
  title: 'Shared/components/ui/form/CommonCodeSelect',
  component: CommonCodeSelect,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '공통 코드를 API로 불러와 보여주는 Select 컴포넌트입니다.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    groupCode: 'CATEGORY', // This group code will be fetched
    value: 'ALL',
    onChange: (value) => console.log('Selected value:', value),
    includeAll: true,
    allLabel: '전체 카테고리',
  },
  render: (args) => {
    const [value, setValue] = React.useState(args.value);

    const handleChange = (newValue: string) => {
      setValue(newValue);
      args.onChange?.(newValue);
    };
    
    return (
      <Box sx={{ width: 200 }}>
        <CommonCodeSelect {...args} value={value} onChange={handleChange} />
      </Box>
    );
  }
};

export const NoAllOption: Story = {
    args: {
      groupCode: 'FIELD_TYPE', // A different group code
      value: '',
      onChange: (value) => console.log('Selected value:', value),
      includeAll: false,
      placeholder: '항목 구분 선택',
    },
    render: (args) => {
        const [value, setValue] = React.useState(args.value);
    
        const handleChange = (newValue: string) => {
          setValue(newValue);
          args.onChange?.(newValue);
        };
        
        return (
          <Box sx={{ width: 200 }}>
            <CommonCodeSelect {...args} value={value} onChange={handleChange} />
          </Box>
        );
      }
  };
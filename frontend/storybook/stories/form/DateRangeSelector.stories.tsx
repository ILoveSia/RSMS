import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import DateRangeSelector from '../../../src/shared/components/ui/form/DateRangeSelector';

const meta: Meta = {
    title: 'Shared/components/ui/form/DateRangeSelector'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const [startDate, setStartDate] = React.useState<Date | null>(new Date());
    const [endDate, setEndDate] = React.useState<Date | null>(new Date());
    return (
      <DateRangeSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSearch={() => {}}
      />
    );
  }
};




import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import InfoCard from '../../../src/shared/components/ui/data-display/InfoCard';

const meta: Meta = {
  title: 'Shared/UI/DataDisplay/InfoCard'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <div style={{ width: 360 }}>
      <InfoCard
        title="문서 정보"
        contentTitle="내부통제 보고서"
        contentDescription={
          '해당 문서는 분기별 내부통제 점검 결과를 포함합니다.\n검토자 확인 후 제출 바랍니다.'
        }
      />
    </div>
  )
};




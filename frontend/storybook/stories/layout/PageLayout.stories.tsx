import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import PageContainer from '../../../src/shared/components/ui/layout/PageContainer';
import PageHeader from '../../../src/shared/components/ui/layout/PageHeader';
import PageContent from '../../../src/shared/components/ui/layout/PageContent';

const meta: Meta = {
  title: 'Shared/components/ui/layout/PageLayout'
};
export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <PageContainer>
      <PageHeader title="페이지 타이틀" />
      <PageContent>페이지 콘텐츠</PageContent>
    </PageContainer>
  )
};




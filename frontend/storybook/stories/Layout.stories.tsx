import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PageContainer, PageHeader, PageContent } from '../../src/shared/components/ui/layout';

const meta: Meta = {
  title: 'Shared/components/ui/layout',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const PageScaffold: Story = {
  name: 'PageContainer/PageHeader/PageContent',
  render: () => {
    return (
      <PageContainer>
        <PageHeader title="샘플 페이지" description="레이아웃 컴포넌트 조합 예시" />
        <PageContent>
          본문 영역입니다.
        </PageContent>
      </PageContainer>
    );
  },
};



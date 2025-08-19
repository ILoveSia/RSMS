import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastProvider, useToastHelpers } from '../../../src/shared/components/ui/feedback/ToastProvider';
import { Button } from '../../../src/shared/components/ui/button';

const meta: Meta = {
    title: 'Shared/components/ui/feedback/ToastProvider',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const ToastButtons: React.FC = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToastHelpers();

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button onClick={() => showSuccess('성공적으로 처리되었습니다.')}>Success</Button>
      <Button onClick={() => showError('오류가 발생했습니다.')} color="error">Error</Button>
      <Button onClick={() => showWarning('주의가 필요합니다.')} color="warning">Warning</Button>
      <Button onClick={() => showInfo('정보 메시지입니다.')} color="info">Info</Button>
      <Button onClick={() => showSuccess('상단 중앙', { position: { vertical: 'top', horizontal: 'center' } })}>Top Center</Button>
    </div>
  );
};

export const ToastStory: Story = {
  name: 'ToastProvider',
  render: () => {
    return (
      <ToastProvider>
        <div style={{ padding: 16 }}>
          <ToastButtons />
        </div>
      </ToastProvider>
    );
  },
};



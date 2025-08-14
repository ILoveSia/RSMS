import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import BaseDialog from '../../src/shared/components/modal/BaseDialog';
import Confirm from '../../src/shared/components/modal/Confirm';
import Alert from '../../src/shared/components/modal/Alert';
import Dialog from '../../src/shared/components/modal/Dialog';
import Drawer from '../../src/shared/components/ui/layout/Drawer';
import { Button } from '../../src/shared/components/ui/button';

const meta: Meta = {
  title: 'Shared/components/modal',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;
export const BaseDialogStory: Story = {
  name: 'BaseDialog',
  render: () => {
    const [open, setOpen] = React.useState(true);
    const [mode, setMode] = React.useState<'create' | 'edit' | 'view' | 'onlyRead'>('view');
    return (
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>Open BaseDialog</Button>
        <BaseDialog
          open={open}
          onClose={() => setOpen(false)}
          title="BaseDialog"
          mode={mode}
          onModeChange={m => setMode(m)}
          onSave={() => {}}
          showEditButton
          showSaveButton
        >
          <div style={{ height: 120 }}>Content</div>
        </BaseDialog>
      </div>
    );
  },
};

export const ConfirmDialogStory: Story = {
  name: 'Confirm',
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>Open Confirm</Button>
        <Confirm
          open={open}
          title="확인"
          message="이 작업을 진행하시겠습니까?"
          confirmText="확인"
          cancelText="취소"
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const AlertDialogStory: Story = {
  name: 'Alert',
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>Open Alert</Button>
        <Alert
          open={open}
          title="알림"
          message="처리가 완료되었습니다."
          onClose={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const SimpleDialogStory: Story = {
  name: 'Dialog',
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>Open Dialog</Button>
        <Dialog
          open={open}
          title="심플 다이얼로그"
          maxWidth='sm'
          onClose={() => setOpen(false)}
          actions={<div />}
        >
          내용입니다.
        </Dialog>
      </div>
    );
  },
};

export const DrawerStory: Story = {
  name: 'Drawer',
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOpen(true)} style={{ marginBottom: 12 }}>Open Drawer</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          anchor='right'
          width={360}
          title='드로어'
        >
          드로어 내용입니다.
        </Drawer>
      </div>
    );
  },
};

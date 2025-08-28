import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Confirm from '../../src/shared/components/modal/Confirm';
import Dialog from '../../src/shared/components/modal/Dialog';
import { Button } from '../../src/shared/components/ui/button';
import Drawer from '../../src/shared/components/ui/layout/Drawer';

const meta: Meta = {
    title: 'Shared/components/modal',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

export const ConfirmDialogStory: Story = {
  name: 'Confirm',
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOpen(true)}>Open Confirm</Button>
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
export const SimpleDialogStory: Story = {
  name: 'Dialog',
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
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
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
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
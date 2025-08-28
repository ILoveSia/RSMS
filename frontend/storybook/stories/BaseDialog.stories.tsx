import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import BaseDialog from '../../src/shared/components/modal/BaseDialog';
import { Button } from '../../src/shared/components/ui/button';

type story=StoryObj<typeof meta>;

const meta:Meta<typeof BaseDialog>={
    title:'shared/components/modal/BaseDialog',
    component:BaseDialog,
    tags:['autodocs'],
}satisfies Meta<typeof BaseDialog>;

export const BaseDialogStory: story = {
  name: 'BaseDialog',
  args:{
    open:true,
    onClose:()=>{},
    title:'BaseDialog',
    mode:'view',
    onModeChange:()=>{},
  },
  render: () => {
    const [open, setOpen] = React.useState(true);
    const [mode, setMode] = React.useState<'create' | 'edit' | 'view' | 'onlyRead'>('view');
    return (
      <div style={{ padding: 16 }}>
        <Button onClick={() => setOpen(true)}>Open BaseDialog</Button>
        <BaseDialog
          open={open}
          onClose={() => setOpen(false)}
          title="BaseDialog"
          mode={mode}
          onModeChange={m => setMode(m)}
          onSave={() => {}}
          showEditButton
        >
          <div style={{ height: 120 }}>Content</div>
        </BaseDialog>
      </div>
    );
  },
};
export default meta;
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CommentItem, { type LocalComment } from '../../../src/shared/components/ui/data-display/CommentItem';

const meta: Meta = {
  title: 'Shared/UI/DataDisplay/CommentItem'
};
export default meta;

type Story = StoryObj;

export const Thread: Story = {
  render: () => {
    const comments: LocalComment[] = [
      { id: 1, parentId: null, content: '최상위 댓글입니다.', author: 'kim', createdAt: '2025-01-01 12:00' },
      { id: 2, parentId: 1, content: '대댓글입니다.', author: 'lee', createdAt: '2025-01-01 12:30' },
      { id: 3, parentId: 2, content: '대대댓글입니다.', author: 'park', createdAt: '2025-01-01 12:45' }
    ];
    const root = comments.find(c => c.parentId === null)!;
    return (
      <div style={{ maxWidth: 520 }}>
        <CommentItem
          comment={root}
          allComments={comments}
          depth={0}
          onRegisterReply={async () => {}}
          loading={false}
        />
      </div>
    );
  }
};



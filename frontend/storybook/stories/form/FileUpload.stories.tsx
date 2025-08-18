import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import FileUpload from '../../../src/shared/components/ui/form/FileUpload';

const meta: Meta = {
  title: 'Shared/UI/Form/FileUpload'
};
export default meta;

type Story = StoryObj;

export const ButtonVariant: Story = {
  render: () => (
    <FileUpload label="첨부파일" buttonText="파일 선택" />
  )
};

export const DropzoneVariant: Story = {
  render: () => (
    <FileUpload label="첨부파일" variant="dropzone" dropzone />
  )
};




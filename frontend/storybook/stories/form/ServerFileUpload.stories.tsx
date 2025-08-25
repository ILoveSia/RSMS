import type { Meta, StoryObj } from '@storybook/react';
import ServerFileUpload, { type ServerFileUploadApi, type UploadFile, type UploadResponse } from '../../../src/shared/components/ui/form/ServerFileUpload';
import { ToastProvider } from '../../../src/shared/components/ui/feedback/ToastProvider';
import React from 'react';

const meta: Meta<typeof ServerFileUpload> = {
  title: 'Shared/components/ui/form/ServerFileUpload',
  component: ServerFileUpload,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['button', 'dropzone'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    multiple: {
      control: 'boolean',
    },
    autoUpload: {
      control: 'boolean',
    },
    preview: {
      control: 'boolean',
    },
    showFileList: {
      control: 'boolean',
    },
    accept: {
      control: 'text',
    },
    buttonText: {
      control: 'text',
    },
    dropzoneText: {
      control: 'text',
    },
    maxFiles: {
      control: 'number',
    },
    maxSize: {
      control: 'number',
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ServerFileUpload>;

// Mock API implementation
const mockApi: ServerFileUploadApi = {
  uploadFile: async (file: File) => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock response
    const response: UploadResponse = {
      id: `file-${Date.now()}`,
      filename: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file),
    };
    return response;
  },
  deleteFile: async (fileId: string | number) => {
    // Simulate delete delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`File ${fileId} deleted`);
  },
  getFileUrl: (fileId: string | number) => {
    return `https://example.com/files/${fileId}`;
  },
};

// Sample initial files
const sampleFiles: UploadFile[] = [
  {
    id: '1',
    file: new File([''], 'document.pdf', { type: 'application/pdf' }),
    status: 'success',
    progress: 100,
    url: 'https://example.com/files/document.pdf',
    serverId: 'file-1',
  },
  {
    id: '2',
    file: new File([''], 'image.png', { type: 'image/png' }),
    status: 'pending',
    progress: 0,
  },
];

export const Default: Story = {
  args: {
    api: mockApi,
    buttonText: '파일 선택',
    dropzoneText: '파일을 드래그하여 업로드하거나 클릭하여 선택하세요',
    variant: 'button',
    multiple: false,
    autoUpload: true,
    preview: true,
    showFileList: true,
    disabled: false,
    loading: false,
  },
};

export const Dropzone: Story = {
  args: {
    ...Default.args,
    variant: 'dropzone',
  },
};

export const WithInitialFiles: Story = {
  args: {
    ...Default.args,
    initialFiles: sampleFiles,
  },
};

export const MultipleFiles: Story = {
  args: {
    ...Default.args,
    multiple: true,
    maxFiles: 5,
  },
};

export const WithValidation: Story = {
  args: {
    ...Default.args,
    accept: 'image/*,.pdf',
    maxSize: 1024 * 1024 * 5, // 5MB
    allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
  },
};
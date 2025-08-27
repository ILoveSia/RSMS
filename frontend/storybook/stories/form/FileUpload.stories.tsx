import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import FileUpload from '../../../src/shared/components/ui/form/FileUpload';

type story=StoryObj<typeof meta>;

const meta:Meta<typeof FileUpload>={
    title:'shared/components/ui/form/FileUpload',
    component:FileUpload,
    tags:['autodocs'],
}satisfies Meta<typeof FileUpload>;

export default meta;

export const Basic:StoryObj<typeof meta>={
    args:{
        entityType:'test',
        uploadedBy:'test',
        onSubmit:()=>{},
        existingFiles:null,
        readonly:false,
        onReady:()=>{},
    }
}
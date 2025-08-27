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

export const Basic:story = {
    render:() => {
        return <FileUpload
        entityType='test'
        uploadedBy='test'
        onSubmit={()=>{}}
        onRemoveExisting={()=>{}}
        existingFiles={null}
        readonly={false}
        onReady={()=>{}}
        />
    }
}
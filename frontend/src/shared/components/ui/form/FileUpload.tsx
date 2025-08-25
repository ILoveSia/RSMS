import {FileUploader,FileCard} from 'evergreen-ui'
import React from 'react';


const [files, setFiles] = React.useState([])
const [fileRejections, setFileRejections] = React.useState([])
const handleChange = React.useCallback((files) => setFiles([files[0]]), [])
const handleRemove = React.useCallback(() => {
  setFiles([])
  setFileRejections([])
}, [])
const FileUpload = () => {
    return (
        <FileUploader
            maxSizeInBytes={50 * 1024 ** 2}
            maxFiles={1}
            onChange={handleChange}
            renderFile={(file) => {
                const { name, size, type } = file
                const fileRejection = fileRejections.find((fileRejection) => fileRejection.file === file)
                const { message } = fileRejection || {}
                return (
                  <FileCard
                    key={name}
                    isInvalid={fileRejection != null}
                    name={name}
                    onRemove={handleRemove}
                    sizeInBytes={size}
                    type={type}
                    validationMessage={message}
                  />
                )
              }}
         />
    )
}

export default FileUpload;


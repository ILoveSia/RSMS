import React, { useState } from 'react';
import { IconButton, DownloadIcon, TrashIcon } from 'evergreen-ui';

// Define the props for the CustomFileCard component
interface CustomFileCardProps {
  name: string;
  sizeInBytes?: number;
  type?: string;
  isInvalid?: boolean;
  validationMessage?: string;
  onRemove?: () => void;
  onDownload?: () => void;
  readonly?: boolean;
}

// A helper function to format file size
const formatFileSize = (bytes: number = 0): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// A helper function to get file icon based on type
// This is a simplified version. You might want to use a more comprehensive solution.
const getFileIcon = (type: string = '') => {
  // Basic logic to determine icon based on MIME type
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('zip') || type.includes('compressed')) return '📦';
  return '📄'; // Default file icon
};

const CustomFileCard: React.FC<CustomFileCardProps> = ({
  name,
  sizeInBytes,
  type,
  isInvalid = false,
  validationMessage,
  onRemove,
  onDownload,
  readonly = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Basic styling to mimic Evergreen UI FileCard
  // In a real application, you would use the theme or more sophisticated styling
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    border: `1px solid ${isInvalid ? '#ec4c47' : '#dfe3e8'}`, // Red border for invalid, grey otherwise
    borderRadius: '6px',
    backgroundColor: '#f9fafc',
    fontSize: '14px',
    color: '#425a70',
    cursor: 'default',
    position: 'relative',
    minHeight: '40px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease-in-out',
  };

  const fileIconStyle: React.CSSProperties = {
    fontSize: '20px',
    marginRight: '8px',
    minWidth: '20px',
    // Align icon vertically with text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const fileNameStyle: React.CSSProperties = {
    flexGrow: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    cursor: onDownload ? 'pointer' : 'default',
    color: onDownload ? '#1070ca' : 'inherit', // Blue color for clickable file name
    textDecoration: onDownload ? 'underline' : 'none',
    minWidth: 0, // Allow the div to shrink below its content's intrinsic size
  };

  const fileSizeStyle: React.CSSProperties = {
    color: '#66788a', // Muted color for file size
    fontSize: '12px',
    marginLeft: '8px',
    whiteSpace: 'nowrap',
  };

  const actionButtonStyle: React.CSSProperties = {
    marginLeft: '8px',
  };

  const errorMessageStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '-20px',
    left: 0,
    color: '#ec4c47',
    fontSize: '12px',
    width: '100%',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={fileIconStyle}>{getFileIcon(type)}</div>
      <div
        style={fileNameStyle}
        onClick={onDownload}
        title={name} // Show full name on hover
      >
        {name}
      </div>
      {sizeInBytes !== undefined && (
        <div style={fileSizeStyle}>{formatFileSize(sizeInBytes)}</div>
      )}
      {!readonly && onRemove && (
        <IconButton
          icon={TrashIcon}
          appearance="minimal"
          onClick={onRemove}
          style={actionButtonStyle}
          title="삭제"
        />
      )}
      {isInvalid && validationMessage && (
        <div style={errorMessageStyle}>{validationMessage}</div>
      )}
    </div>
  );
};

export default CustomFileCard;
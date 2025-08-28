import {
  Archive as ArchiveIcon,
  AudioFile as AudioIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  VideoFile as VideoIcon
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Paper,
  Typography
} from '@mui/material';
import React, { useState } from 'react';

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
const getFileIcon = (type: string = '') => {
  // Basic logic to determine icon based on MIME type
  if (type.startsWith('image/')) return <ImageIcon sx={{ color: '#1976d2' }} />;
  if (type.startsWith('video/')) return <VideoIcon sx={{ color: '#d32f2f' }} />;
  if (type.startsWith('audio/')) return <AudioIcon sx={{ color: '#9c27b0' }} />;
  if (type.includes('pdf')) return <PdfIcon sx={{ color: '#f44336' }} />;
  if (type.includes('zip') || type.includes('compressed')) return <ArchiveIcon sx={{ color: '#ff9800' }} />;
  return <FileIcon sx={{ color: '#757575' }} />; // Default file icon
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

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        border: `1px solid ${isInvalid ? '#f44336' : '#e0e0e0'}`,
        borderRadius: '4px',
        backgroundColor: '#f9fafc',
        minHeight: '40px',
        position: 'relative',
        transition: 'border-color 0.2s ease-in-out',
        '&:hover': {
          borderColor: isInvalid ? '#f44336' : '#1976d2'
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ marginRight: 1, display: 'flex', alignItems: 'center' }}>
        {getFileIcon(type)}
      </Box>
      
      <Typography
        variant="body2"
        sx={{
          flexGrow: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          cursor: onDownload ? 'pointer' : 'default',
          color: onDownload ? '#1976d2' : 'inherit',
          textDecoration: onDownload ? 'underline' : 'none',
          minWidth: 0,
        }}
        onClick={onDownload}
        title={name}
      >
        {name}
      </Typography>

      {sizeInBytes !== undefined && (
        <Typography
          variant="caption"
          sx={{
            color: '#757575',
            marginLeft: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {formatFileSize(sizeInBytes)}
        </Typography>
      )}

      {!readonly && onRemove && (
        <IconButton
          size="small"
          onClick={onRemove}
          title="삭제"
          sx={{ marginLeft: 1, color: '#757575' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}

      {isInvalid && validationMessage && (
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: '-20px',
            left: 0,
            color: '#f44336',
            width: '100%',
          }}
        >
          {validationMessage}
        </Typography>
      )}
    </Paper>
  );
};

export default CustomFileCard;
import React from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export interface TitleSearchProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onEnter?: () => void;
  after?: React.ReactNode;
  right?: React.ReactNode;
}

const TitleSearch: React.FC<TitleSearchProps> = ({ value, onChange, disabled = false, onEnter, after, right }) => (
  <Box
    sx={{
      display: 'flex',
      gap: 1,
      mb: 2,
      alignItems: 'center',
      backgroundColor: 'var(--bank-bg-secondary)',
      border: '1px solid var(--bank-border)',
      px: 2,
      py: 1,
      borderRadius: '4px',
    }}
  >
    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>제목</span>
    <TextField
      size='small'
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder='제목 입력'
      sx={{ minWidth: 220, maxWidth: 360 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <SearchIcon fontSize='small' />
          </InputAdornment>
        ),
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onEnter?.();
        }
      }}
      disabled={disabled}
    />
    {after}
    {right && (
      <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
        {right}
      </Box>
    )}
  </Box>
);

export default TitleSearch;



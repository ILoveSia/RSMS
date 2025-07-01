/**
 * React 19 + MUI v7 테마 토글 컴포넌트
 * useColorScheme 훅을 활용한 다크/라이트 모드 전환
 */

import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useColorScheme } from '@mui/material/styles';

export default function ThemeToggle() {
  const { mode, setMode } = useColorScheme();

  const handleToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  return (
    <Tooltip title={`${mode === 'light' ? '다크' : '라이트'} 모드로 전환`}>
      <IconButton onClick={handleToggle} color="inherit">
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
} 
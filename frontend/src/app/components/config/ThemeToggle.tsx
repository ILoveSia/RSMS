/**
 * 테마 토글 컴포넌트
 * 커스텀 테마 컨텍스트를 활용한 다크/라이트 모드 전환
 */

import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '@/app/theme/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={`${isDarkMode ? '라이트' : '다크'} 모드로 전환`}>
      <IconButton onClick={toggleTheme} color="inherit">
        {isDarkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
} 
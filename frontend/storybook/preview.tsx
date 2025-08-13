import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { lightTheme, darkTheme, updateCssVariables } from '../src/app/theme/themeConfig';

const withMuiTheme = (Story, context) => {
  const isDark = context.globals.theme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  // Ensure CSS variables used by components (e.g., --bank-border) are set in Storybook
  updateCssVariables(isDark);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Story />
    </MuiThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [withMuiTheme],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;

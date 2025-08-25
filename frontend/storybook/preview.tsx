import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { lightTheme, darkTheme, updateCssVariables } from '../src/app/theme/themeConfig';
import { configureAppStore, setGlobalStore } from '../src/app/store';
import createRootReducer from '../src/shared/store';
import ToastProvider from '../src/shared/components/ui/feedback/ToastProvider';

// Initialize Redux store for Storybook
setGlobalStore();
const reducers = createRootReducer();
const store = configureAppStore(reducers);

const withProviders = (Story, context) => {
  const isDark = context.globals.theme === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  // Ensure CSS variables used by components (e.g., --bank-border) are set in Storybook
  updateCssVariables(isDark);

  return (
    <Provider store={store}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </MuiThemeProvider>
    </Provider>
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
  decorators: [withProviders],
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

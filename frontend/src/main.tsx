import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { configureAppStore, setGlobalStore } from './app/store';
import './assets/scss/style.css';
import './index.css';
import createRootReducer from './shared/store';
import { NotificationProvider } from './shared/context/NotificationContext';

// Redux store 초기화
setGlobalStore();
const reducers = createRootReducer();
const store = configureAppStore(reducers);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </Provider>
  </StrictMode>
);

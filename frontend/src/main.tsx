import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import './index.css'
import './assets/scss/style.css'
import App from './App'
import { theme } from './app/theme'
import { configureAppStore, setGlobalStore } from './app/store'
import createRootReducer from './shared/store'

// Redux store 초기화
setGlobalStore();
const reducers = createRootReducer();
console.log('생성된 reducers:', reducers);
const store = configureAppStore(reducers);
console.log('생성된 store:', store);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)

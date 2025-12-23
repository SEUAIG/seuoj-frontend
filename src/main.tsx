import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from "react-redux";
import { store } from './app/store.ts'
import { Toaster } from 'sonner'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <HelmetProvider>
      <Provider store={store}>
        <Toaster/>
    <App />
      </Provider>
    </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
)

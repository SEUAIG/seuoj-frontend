import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "katex/dist/katex.min.css";
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from "react-redux";
import { store } from './app/store.ts'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <HelmetProvider>
      <Provider store={store}>
        
    <App />
      </Provider>
    </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
)

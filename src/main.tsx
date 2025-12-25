import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from "react-redux";
import { Toaster } from 'sonner'
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/app/store";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <HelmetProvider>
      <Provider store={store}>
         <PersistGate loading={null} persistor={persistor}>
        <Toaster/>
    <App />
         </PersistGate>
      </Provider>
    </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
)

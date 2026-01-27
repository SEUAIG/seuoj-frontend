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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from './../node_modules/@tanstack/react-query-devtools/src/production';
const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      staleTime:60*1000,//以毫秒为单位
      retry:1,
      refetchOnWindowFocus: false, // 窗口聚焦时不自动刷新
    },
    }
  },
)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
      <Provider store={store}>
         <PersistGate loading={null} persistor={persistor}>
        <Toaster/>
    <App />
         </PersistGate>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false}/>
      </QueryClientProvider>
    </HelmetProvider>
    </BrowserRouter>
  </StrictMode>,
)

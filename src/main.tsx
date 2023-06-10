import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App'
import { theme } from "./useCustomTheme"
import { AuthProvider } from './hooks/useAuth'
import { GoogleOAuthProvider } from '@react-oauth/google';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

const GOOGLECRED = import.meta.env.VITE_GOOGLECRED

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
  <GoogleOAuthProvider clientId={GOOGLECRED}>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <ColorModeScript initialColorMode={theme.config.initialColorMode} />
              <App />
              <ReactQueryDevtools/>
            </AuthProvider>
          </QueryClientProvider>
        </ChakraProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

import { extendTheme } from '@chakra-ui/react'
import '@fontsource/raleway/400.css'
import '@fontsource/open-sans/700.css'
import '@fontsource/inter/700.css'

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
  fonts: {
    heading: 'Inter, Open Sans, sans-serif',
    body: 'Roboto, Raleway, sans-serif'
  },
  styles: {
    global: {
      body: {
        bg: 'gray.100',
        _dark: {
          bg: 'blackAlpha.50',
          // bgGradient: 'linear(to-r, blackAlpha.100, whiteAlpha.100, blackAlpha.100)'
          color: 'whiteAlpha.700'
        }
      },
      '#main': {
        py: "20px",
        display: "flex",
        justifyContent: "center"
      },
      '.main-content': {
        w: "100%",
        // px: "20px",
        maxW: '1000px'
      },
      '.chat-content': {
        w: "100%",
        maxW: "1500px"
        // px: "20px",
        // maxW: '1000px'
      },
      '.main-content-smaller': {
        w: "100%",
        // px: "20px",
        maxW: '700px'
      },
      '.well': {
        bg: 'gray.50',
        p: 4,
        m: '0.25rem!important',
        boxShadow: "base",
        borderRadius: 10,
        _dark: {
          bg: 'blackAlpha.300'
        }
      },
      '.well-card': {
        padding: 4, 
        boxShadow: "base",
        m: 1, 
        rounded: "md",
        bg: "white",
        _dark: {
          bg: 'blackAlpha.300'
        }
      },
      '.profile-card': {
        padding: 4, 
        boxShadow: "base",
        m: 1, 
        rounded: "md",
        bg: "white",
        _dark: {
          bg: 'blackAlpha.500'
        }
      }
    },
  },
}

export const theme = extendTheme( config )
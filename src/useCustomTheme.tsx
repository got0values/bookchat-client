import { extendTheme } from '@chakra-ui/react'
import '@fontsource/raleway/400.css'
import '@fontsource/open-sans/700.css'
import '@fontsource/inter/700.css'

const customTheme = {
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false
  },
  // colors: {
  //   gray: {
  //     "50": "#F2F3F3",
  //     "100": "#DADCDC",
  //     "200": "#C2C6C6",
  //     "300": "#ABB0B0",
  //     "400": "#939A9A",
  //     "500": "#7B8484",
  //     "600": "#636969",
  //     "700": "#4A4F4F",
  //     "800": "#313535",
  //     "900": "#191A1A"
  //   }
  // },
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
          color: 'whiteAlpha.700',
          fontFeatureSettings: "'lnum' 1"
        }
      },
      '#main': {
        // py: "20px",
        display: "flex",
        justifyContent: "center"
      },
      '.main-content': {
        w: "100%",
        py: "20px",
        maxW: '1200px'
      },
      '.main-content-smaller': {
        w: "100%",
        py: "20px",
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
      },
      '.chakra-menu__menu-list': {
        // bg: "white",
        _dark: {
          bg: "black"
        },
        'button': {
          _dark: {
            bg: "black",
            "&:hover": {
              bg: "whiteAlpha.300"
            }
          }
        }
      },
      '.chakra-modal__content': {
        _dark: {
          bg: "black"
        }
      }
    }
  },
}

export const theme = extendTheme( customTheme )
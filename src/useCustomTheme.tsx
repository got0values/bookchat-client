import { extendTheme } from '@chakra-ui/react'
import '@fontsource/raleway/400.css'
import '@fontsource/open-sans/700.css'
import '@fontsource/inter/700.css'
import '@fontsource/noto-color-emoji/400.css'
import 'openmoji/font/openmoji.css'
// import 'openmoji/font/OpenMoji-Color.ttf'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  fonts: {
    heading: 'Inter, Open Sans, sans-serif',
    body: 'Roboto, Raleway, sans-serif, OpenMojiColor, Noto Color Emoji'
  },
  styles: {
    global: {
      body: {
        bg: 'gray.100',
        _dark: {
          bg: 'gray.800'
        }
      },
      '#main': {
        py: "20px",
        display: "flex",
        justifyContent: "center"
      },
      '.main-content': {
        w: "100%",
        px: "20px",
        maxW: '1000px'
      },
      '.main-content-smaller': {
        w: "100%",
        px: "20px",
        maxW: '700px'
      },
      '.well': {
        bg: 'white',
        p: 4,
        m: '0.5rem!important',
        borderRadius: 10,
        _dark: {
          bg: 'gray.700'
        }
      },
      '.profile-card': {
        bg: 'white',
        p: 4,
        m: '0.5rem!important',
        borderRadius: 10,
        _dark: {
          bg: 'gray.900'
        }
      }
    },
  },
}

export const theme = extendTheme( config )
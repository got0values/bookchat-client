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
        // bg: 'gray.100',
        bg: 'white',
        _dark: {
          bg: 'blackAlpha.50',
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
        pt: ["5px","20px"],
        pb: ["80px","20px"],
        maxW: '1200px'
      },
      '.main-content-smaller': {
        w: "100%",
        pt: ["5px","20px"],
        pb: ["80px","20px"],
        maxW: '700px'
      },
      '.well': {
        // bg: 'gray.50',
        bg: 'white',
        p: 2,
        m: '0.25rem!important',
        boxShadow: "1px 1px 2px 1px black",
        border: "1px solid black",
        rounded: "sm",
        _dark: {
          bg: 'blackAlpha.300'
        }
      },
      '.well-card': {
        padding: 4, 
        boxShadow: "1px 1px 1px 1px black",
        border: "1px solid black",
        m: 1, 
        rounded: "sm",
        bg: "white",
        _dark: {
          bg: 'blackAlpha.300'
        }
      },
      '.non-well': {
        m: '0.4rem!important'
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
      },
      '.visually-hidden': {
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }
    }
  },
  components: {
    // Button: {
    //   baseStyle: {
    //     border: "1px solid",
    //     borderColor: "black"
    //   }
    // }
  }
}

export const theme = extendTheme( customTheme )
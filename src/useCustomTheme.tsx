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
      '.main-content-medium': {
        w: "100%",
        pt: ["5px","20px"],
        pb: ["80px","20px"],
        maxW: '900px'
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
        m: '0.25rem!important'
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
      },
      '.tab-button': {
        fontSize: ['.9rem!important','1rem!important'],
        px: ['.9rem!important','1rem!important'],
        py: ['.4rem!important','.5rem!important']
      }
    }
  },
  components: {
    // Button: {
    //   baseStyle: {
    //     border: "1px solid",
    //     borderColor: "black"
    //   }
    // },
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                transform: "scale(0.85) translateY(-24px)"
              }
            },
            "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label": {
              transform: "scale(0.85) translateY(-24px)"
            },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: "absolute",
              backgroundColor: "white",
              pointerEvents: "none",
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: "left top",
              _dark: {
                backgroundColor: "blackAlpha.300"
              }
            }
          }
        },
        floatingstatic: {
          container: {
            "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label": {
              transform: "scale(0.85) translateY(-22px)"
            },
            '& > label': {
              top: 0,
              left: 0,
              zIndex: 2,
              position: "absolute",
              backgroundColor: "white",
              pointerEvents: "none",
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: "left top",
              transform: "scale(0.85) translateY(-22px)",
              _dark: {
                backgroundColor: "blackAlpha.300"
              }
            }
          }
        }
      }
    }
  }
}

export const theme = extendTheme( customTheme )
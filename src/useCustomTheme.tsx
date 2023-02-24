import React, {useState, useEffect, useRef, useCallback} from 'react';
import { extendTheme } from '@chakra-ui/react'
import '@fontsource/raleway/400.css'
import '@fontsource/open-sans/700.css'
import '@fontsource/inter/700.css'
import axios from 'axios';

// export const useCustomTheme = (props) => {
//   const {server} = props;

//   const [primaryColor,setPrimaryColor] = useState("black")
//   const [secondaryColor,setSecondaryColor] = useState("black")
//   const [customSettings,setCustomSettings] = useState(null);

//   const fetchCustomTheme = useCallback(async (e) => {
//     const subdomain = window.location.host.split(".")[0];
//     try {
//         await axios
//         .get(server + `/customtheme?subdomain=${subdomain}`)
//         .then((response) => {
//           let r = response.data;
//           let cSettings = r;
//           let pColors = typeof r.primaryColor !== "undefined" ? JSON.parse(r.primaryColor) : (
//             {
//               hex: "#fefefe",
//               rgb: 'rgb(100,100,100)'
//             }
//           );
//           let sColors = typeof r.primaryColor !== "undefined" ? JSON.parse(r.secondaryColor) : (
//             {
//               hex: "#fefefe",
//               rgb: 'rgb(100,100,100)'
//             }
//           );
//           setPrimaryColor(pColors.rgb)
//           setSecondaryColor(sColors.rgb)
//           setCustomSettings(cSettings)
//         })
//     } catch(error) {
//         console.log(error);
//     }
//   },[server])
//   useEffect(()=>{
//     fetchCustomTheme()
//   },[fetchCustomTheme])
//   return {customSettings,primaryColor,secondaryColor}
// }

const config = {
  initialColorMode: 'light',
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
        maxW: '1218px'
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
import { useEffect } from 'react';
import { Box, Heading } from "@chakra-ui/react";


export const Commento = ({server}: {server: string}) => {

  let scriptElement: HTMLScriptElement = document.createElement("script");
  scriptElement.id = "scriptelement"
  scriptElement.src = "https://commento.communitybookclub.com/js/commento.js";
  scriptElement.async = true;

  useEffect(()=>{
    let documentScriptElement = document.getElementById("scriptelement");
    if (!documentScriptElement){
      document.body.appendChild(scriptElement);
    }
    return ()=>{
      document.body.removeChild(scriptElement)
      documentScriptElement = null;
    }
  },[])

  return (
    <Box>
      <Heading as="h1" size="xl" mb={5}>Commento</Heading>
      <Box id="commento"></Box>
    </Box>
  )
}
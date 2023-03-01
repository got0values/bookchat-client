import { useState, useEffect } from "react";
import { Box, Heading } from "@chakra-ui/react"
import { useSearchParams } from 'react-router-dom'

export const RedirectPage = () => {
  const [searchParams] = useSearchParams();
  const [errorType,setErrorType] = useState<string | null>(null);

  useEffect(()=>{
    if(searchParams.get("errortype")) {
      const type = searchParams.get("errortype")
      setErrorType(type)
    }
  },[])

  return (
    (
      <Box id="main" flexDirection="column" gap={2} h="70vh">
        <Heading as="h1" size="4xl" mx="auto">{errorType ? errorType : ""}</Heading>
        <Heading as="h1" size="2xl" mx="auto">Error</Heading>
      </Box>
    )
  )
}
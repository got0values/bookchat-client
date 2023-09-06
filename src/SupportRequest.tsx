import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FormLabel, 
  Input, 
  Button, 
  Box,
  Flex,
  Switch,
  Textarea,
  Stack,
  Heading,
  Text,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useToast
} from "@chakra-ui/react";
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";

interface SupportRequestProps {
  server: string;
}

export default function SupportRequest({server}: SupportRequestProps) {
  const {user} = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const supportRequestRef = useRef({} as HTMLTextAreaElement);
  const emailRef = useRef({} as HTMLInputElement);
  const [error,setError] = useState("");
  async function sendSupportRequestFeature(e: any) {
    e.preventDefault();
    let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        if (!supportRequestRef.current.value) {
          setError("Please enter support/request text")
          return
        }
        if (!emailRef.current.value) {
          setError("Please enter your email address")
          return
        }
        await axios
          .post(server + "/api/supportrequestfeature",
            {
              supportrequest: supportRequestRef.current.value,
              email: emailRef.current.value
            },
            {
              headers: {
                'authorization': tokenCookie
              }
            }
          )
          .then(()=>{
            toast({
              description: "Support/Request Sent!",
              status: "success",
              duration: 15000,
              isClosable: true
            });
            navigate("/settings")
          })
          .catch(({response})=>{
            console.log(response)
            setError(response.error.message)
          })
      }
      else {
        throw new Error("SR101")
      }
  }

  return (
    <Box className="main-content-smaller">
      <Heading as="h1" className="visually-hidden">Support/Request</Heading>
      <Flex direction="column" gap={4} px={2}>
        {error && (
          <Alert status='error'>
            <AlertIcon />
            <Box>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Box>
            <CloseButton
              alignSelf='flex-start'
              position='absolute'
              right={1}
              top={1}
              onClick={e=>setError("")}
            />
          </Alert>
        )}
        <form onSubmit={e=>sendSupportRequestFeature(e)}>
          <Flex direction="column" gap={2}>
            <Heading as="h4" size="md">
              Support/Request a Feature
            </Heading>
            <Box flex="1 1 45%" minW="150px">
              <Input 
                id="first-name" 
                type="text"
                defaultValue={user.email}
                ref={emailRef}
                readOnly={true}
                required={true}
              />
            </Box>
            <Box flex="1 1 45%" minW="150px">
              <Textarea 
                id="first-name"
                placeholder="Enter a message for support or request a feature."
                ref={supportRequestRef}
                rows={6}
                required={true}
              />
            </Box>
            <Flex justify="flex-end">
              <Button
                colorScheme="green"
                type="submit"
              >
                Send
              </Button>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </Box>
  );
};

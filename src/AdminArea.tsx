import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FormLabel, 
  Input, 
  Button, 
  Box,
  Flex,
  Switch,
  Skeleton,
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

interface AdminAreaProps {
  server: string;
}

export default function AdminArea({server}: AdminAreaProps) {
  const {user} = useAuth();
  const toast = useToast();

  const [error,setError] = useState("");
  const emailRef = useRef({} as HTMLInputElement);
  async function createRegistrationLink() {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      if (user.id !== 20) {
        return
      }
      await axios
        .post(server + "/api/createregistrationlink",
          {
            email: emailRef.current.value
          },
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          toast({
            description: response.data.message,
            status: "success",
            duration: 15000,
            isClosable: true
          });
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
    <>
      {user.id === 20 ? (
        <Box className="main-content-smaller">
          <Heading as="h1" size="lg" textAlign="center" mb={5}>Admin Area</Heading>
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
            <Flex direction="column" gap={2}>
              <Stack>
                <Heading as="h4" size="md">
                  Create Registration Link
                </Heading>
                <Flex w="100%" gap={5} flexWrap="wrap" justify="space-between">
                  <Box flex="1 1 45%" minW="150px">
                    <FormLabel htmlFor="first-name" mb={1}>Email</FormLabel>
                    <Input 
                      id="first-name" 
                      type="text"
                      ref={emailRef}
                    />
                  </Box>
                </Flex>
              </Stack>
              <Flex justify="flex-end">
                <Button
                  colorScheme="green"
                  onClick={e=>createRegistrationLink()}
                >
                  Save
                </Button>
              </Flex>
            </Flex>

          </Flex>
        </Box>
      ): (
        <Heading>Unauthorized</Heading>
      )}
    </>
  );
};

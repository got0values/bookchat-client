import React, { useState, useEffect } from "react";
import { 
  FormLabel, 
  Input, 
  Button, 
  Box,
  Flex,
  Checkbox,
  Stack,
  Heading,
  useToast
} from "@chakra-ui/react";
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";

interface SettingsProps {
  server: string;
}

export default function Settings({server}: SettingsProps) {
  const {onLogout} = useAuth();
  const toast = useToast();

  async function deleteAccount() {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      if (window.confirm("Are you sure you would like to delete your account. This cannot be undone.")) {
        await axios
        .delete(server + "/api/deleteaccount",
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          onLogout();
          toast({
            description: "Account deleted",
            status: "success",
            duration: 9000,
            isClosable: true
          });
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data?.message)
        })
      }
    }
    else {
      toast({
        description: "An error has occurred (DA100)",
        status: "error",
        duration: 9000,
        isClosable: true
      })
    }
  }

  return (
    <Box className="main-content-smaller">
      <Stack>

      <Flex className="well" direction="column">
          <Stack>
            <Heading as="h4" size="md">
              Name
            </Heading>
            <Flex w="100%" gap={5} flexWrap="wrap" justify="space-between">
              <Box flex="1 1 45%" minW="150px">
                <FormLabel htmlFor="first-name">First Name</FormLabel>
                <Input id="first-name" type="text"/>
              </Box>
              <Box flex="1 1 45%" minW="150px">
                <FormLabel htmlFor="last-name">Last Name</FormLabel>
                <Input id="last-name" type="text"/>
              </Box>
            </Flex>
          </Stack>
        </Flex>

        <Flex className="well" direction="column">
          <Stack>
            <Heading as="h4" size="md">
              Email
            </Heading>
            <Checkbox>Email me when someone replies to my comment?</Checkbox>
          </Stack>
        </Flex>

        <Flex className="well" direction="column">
          <Stack>
            <Heading as="h4" size="md">
              Profile
            </Heading>
            <Checkbox>Hide my profile?</Checkbox>
          </Stack>
        </Flex>

        <Flex justify="space-between" m=".5rem!important">
          <Button
            colorScheme="red"
            onClick={e=>deleteAccount()}
          >
            Delete account
          </Button>
          <Button
            colorScheme="green"
          >
            Save
          </Button>
        </Flex>

      </Stack>
    </Box>
  );
};

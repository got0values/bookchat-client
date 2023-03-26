import React, { useState, useEffect } from "react";
import { 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Text,
  Box,
  Flex,
  Checkbox,
  Stack,
  Link,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";

interface SettingsProps {
  server: string;
}

export default function Settings({server}: SettingsProps) {
  const user = window.localStorage.getItem("user");
  useEffect(()=>{
    if (user) {
      console.log(JSON.parse(user))
    }
  },[])

  return (
    <Box className="main-content">
      <Stack>

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

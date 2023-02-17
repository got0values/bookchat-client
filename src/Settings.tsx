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
    <>
      <Heading as="h1" size="lg">
        Settings
      </Heading>
    </>
  );
};

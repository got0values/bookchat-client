import React, { useState } from "react";
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

  return (
    <>
      <Heading as="h1" size="lg">
        Settings
      </Heading>
    </>
  );
};

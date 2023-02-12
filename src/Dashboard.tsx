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

interface DashboardProps {
  server: string;
}

export default function Dashboard({server}: DashboardProps) {

  return (
    <>
      <Heading as="h1" size="lg">
        Dashboard
      </Heading>
    </>
  );
};

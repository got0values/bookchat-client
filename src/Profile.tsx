import React, { useState } from "react";
import { ProfileProps } from './types/types';
import { 
  Heading
} from "@chakra-ui/react";
import axios from "axios";


export default function Profile({server}: ProfileProps) {

  return (
    <>
      <Heading as="h1" size="lg">
        Profile
      </Heading>
    </>
  );
};

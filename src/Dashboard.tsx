import React, { useState } from "react";
import { DashboardProps } from './types/types';
import { 
  Heading
} from "@chakra-ui/react";
import axios from "axios";


export default function Dashboard({server}: DashboardProps) {

  return (
    <>
      <Heading as="h1" size="2xl">
        Dashboard
      </Heading>
    </>
  );
};

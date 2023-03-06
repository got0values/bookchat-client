import React, { useState, useLayoutEffect } from "react";
import { DashboardProps } from './types/types';
import { 
  Box,
  Heading
} from "@chakra-ui/react";
import { useAuth } from './hooks/useAuth';
import axios from "axios";


export default function Dashboard({server}: DashboardProps) {
  // const { getUser } = useAuth();
  // useLayoutEffect(()=>{
  //   getUser()
  //   return(()=>{
  //     null
  //   })
  // },[])

  return (
    <Box className="main-content">
      <Heading as="h1" size="2xl" textAlign="center">
        Dashboard
      </Heading>
    </Box>
  );
};

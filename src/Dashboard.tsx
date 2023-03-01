import React, { useState, useLayoutEffect } from "react";
import { DashboardProps } from './types/types';
import { 
  Heading
} from "@chakra-ui/react";
import { useAuth } from './hooks/useAuth';
import axios from "axios";


export default function Dashboard({server}: DashboardProps) {
  const { getUser } = useAuth();
  useLayoutEffect(()=>{
    getUser()
    return(()=>{
      null
    })
  },[])

  return (
    <>
      <Heading as="h1" size="2xl">
        Dashboard
      </Heading>
    </>
  );
};

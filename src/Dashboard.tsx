import React, { useState } from "react";
import { 
  Heading
} from "@chakra-ui/react";
import axios from "axios";

interface DashboardProps {
  server: string;
  onLogout: ()=>void;
}

export default function Dashboard({server,onLogout}: DashboardProps) {

  return (
    <>
      <Heading as="h1" size="lg">
        Dashboard
      </Heading>
    </>
  );
};

import { useQuery } from "@tanstack/react-query";
import { Navigate, useLocation } from "react-router-dom";
import { 
  Flex,
  Heading,
  Spinner
} from "@chakra-ui/react";
import { ProtectedRouteProps } from '../types/types';
import {  } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({children}: ProtectedRouteProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // const { isLoading, isError, data, error } = useQuery({ queryKey: ['protectedKey'], queryFn: getUser });
  // const user = data;

  // if (isLoading) {
  //   return (
  //     <Flex align="center" justify="center" minH="100vh">
  //       <Spinner size="xl"/>
  //     </Flex>
  //   )
  // }
  // if (isError) {
  //   // navigate("/login")
  //   return (
  //     <Flex align="center" justify="center" minH="100vh">
  //       <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
  //     </Flex>
  //   )
  // }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ redirectTo: location.pathname }}/>
    )
  }
  
  else {
    return children;
  }
}
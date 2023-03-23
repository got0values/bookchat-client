import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Flex,
  Heading,
  Spinner
} from "@chakra-ui/react";
import { ProtectedRouteProps } from '../types/types';
import { Navigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({children}: ProtectedRouteProps) => {
  const { getUser } = useAuth();
  const navigate = useNavigate();

  const { isLoading, isError, data, error } = useQuery({ queryKey: ['protectedKey'], queryFn: getUser });
  const user = data;
  console.log("FROM user VARIABLE:", user)

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="100vh">
        <Spinner size="xl"/>
      </Flex>
    )
  }
  if (isError) {
    navigate("/login")
    // return (
    //   <Flex align="center" justify="center" minH="100vh">
    //     <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    //   </Flex>
    // )
  }

  if (!user) {
    return (
      <Navigate to="./login" replace/>
    )
  }
  
  else {
    return children;
  }
}
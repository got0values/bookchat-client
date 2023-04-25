import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LoginFormProps } from "./types/types";
import { 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Text,
  Box,
  Flex,
  Image,
  Stack,
  Link,
  Heading,
  useColorModeValue
} from "@chakra-ui/react";
import logo from './assets/community-book-club-logo3.png';
import logoWhite from './assets/community-book-club-logo3-white.png';
import { getLibraryFromSubdomain } from './utils/getLibraryFromSubdomain';
import Cookies from "js-cookie";
import { useAuth } from "./hooks/useAuth";
import axios from "axios";


const Login: React.FC<LoginFormProps> = ({ onLogin, server }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user,getUser } = useAuth();

  const subdomain = window.location.hostname.split(".")[0];
  const {libraryFromSubdomain} = getLibraryFromSubdomain({subdomain,server});

  useEffect(()=>{
    const tokenCookie = Cookies.get().token;
    getUser()
    if (user && user !== null && tokenCookie) {
      if (window.location.host.includes(".com")) {
        window.location.href = `${window.location.protocol}//${user.Library.subdomain}.${window.location.host.split(".")[1]}.com`
      }
      else {
        window.location.href = `${window.location.protocol}//${user.Library.subdomain}.${window.location.host.split(".")[1]}`
      }
    }
  },[user])

  const handleSubmitMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await axios
      .post(server + "/api/login", { 
        email: email, 
        password: password 
      })
      .then((response)=>{
        if (response.data.success) {
          onLogin(response.data.token);
        }
      })
      .catch(({response})=>{
        console.log(response?.data)
        setError(response?.data?.message)
      })
    }
  });
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    handleSubmitMutation.mutate(e);
  }

  if (!libraryFromSubdomain) {
    return (
      <Flex h="100vh" align="center" justify="center">
          <Heading as="h1" size="2xl">404</Heading>
      </Flex>
    )
  }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Stack align="center">
            {libraryFromSubdomain ? (
              <Text>{libraryFromSubdomain.name}</Text>
            ): null}
            <Image src={useColorModeValue(logo,logoWhite)} maxH="75px"/>
          </Stack>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}></Stack>
          <form onSubmit={handleSubmit}>
            {error && (
              <Text color="red" mb={4}>
                {error}
              </Text>
            )}
            <FormControl mb={4}>
              <FormLabel htmlFor="email">Email:</FormLabel>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
                required
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel htmlFor="password">Password:</FormLabel>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="lg"
                required
              />
            </FormControl>
            <Box textAlign="center">
              <Button 
                type="submit"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                size="lg"
              >
                Login
              </Button>
            </Box>
          </form>
        </Box>
        <Text fontSize={'lg'} color={'gray.600'} textAlign="center">
          Don't have an account? <Link href="/register" color={'blue.400'}>Register</Link>
        </Text>
      </Stack>
    </Flex>
  );
};

export default Login;

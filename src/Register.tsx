import React, { useState, useRef } from "react";
import { RegisterFormProps } from './types/types';
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
  useColorModeValue,
  useToast
} from "@chakra-ui/react";
import logo from './assets/community-book-club-logo3.png';
import logoWhite from './assets/community-book-club-logo3-white.png';
import axios from "axios";


const Register: React.FC<RegisterFormProps> = ({ onLogin, server, libraryFromSubdomain }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");

  const toast = useToast();

  function confirmPasswordCheck(text: string) {
    setConfirmPassword(text)
    if (text !== password) {
      setConfirmPasswordError("Password and confirm password do not match")
    }
    else {
      setConfirmPasswordError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await axios
    .post(server + "/api/register", { 
      email: email, 
      password: password,
      confirmPassword: confirmPassword,
      libraryId: libraryFromSubdomain.id
    })
    .then((response)=>{
      onLogin(response.data.token);
      toast({
        title: 'Account created.',
        description: "We've created your account.",
        status: 'success',
        duration: 9000,
        isClosable: true
      })
    })
    .catch(({response})=>{
      console.log(response.data)
      setError(response.data.errorMessage)
    })
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align="center">
          {libraryFromSubdomain ? (
            <Text>{libraryFromSubdomain.name}</Text>
          ): null}
          <Image src={useColorModeValue(logo,logoWhite)} maxH="75px"/>
        </Stack>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Register for an account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to enjoy all of our cool <Link color={'blue.400'}>features</Link> ✌️
          </Text>
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
                required
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel htmlFor="confirm-password">Confirm Password:</FormLabel>
              <Input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => confirmPasswordCheck(e.target.value)}
                required
              />
              <Text color="red" mb={4}>
                {confirmPasswordError}
              </Text>
            </FormControl>
            <Button 
              type="submit"
              bg={'blue.400'}
              color={'white'}
              _hover={{
                bg: 'blue.500',
              }}
            >
              Register
            </Button>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Register;

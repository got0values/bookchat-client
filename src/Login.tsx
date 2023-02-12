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

interface LoginFormProps {
  onLogin: (token: string) => void;
  server: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, server }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await axios
    .post(server + "/api/login", { 
      email: email, 
      password: password 
    })
    .then((response)=>{
      console.log(response)
      onLogin(response.data.token);
    })
    .catch((error)=>{
      console.log(error)
      setError(error.message)
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
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
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
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel htmlFor="password">Password:</FormLabel>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button 
              type="submit"
              bg={'blue.400'}
              color={'white'}
              _hover={{
                bg: 'blue.500',
              }}
            >
              Login
            </Button>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
};

export default LoginForm;

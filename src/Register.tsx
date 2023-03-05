import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { HTMLInputEvent, RegisterFormProps } from './types/types';
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
import { getLibraryFromSubdomain } from './utils/getLibraryFromSubdomain';
import axios from "axios";


const Register: React.FC<RegisterFormProps> = ({ onLogin, server }) => {
  const [searchParams] = useSearchParams();
  const [role,setRole] = useState("user");

  useEffect(()=>{
    if (searchParams.get("role")) {
      let paramsRole = searchParams.get("role");
      if (paramsRole === "admin") {
        setRole(paramsRole)
      }
      else {
        setRole("user");
      }
    }
  },[searchParams])

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");

  const subdomain = window.location.hostname.split(".")[0];
  const {libraryFromSubdomain} = getLibraryFromSubdomain({subdomain,server});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("")
    if (role === "user" || role === "admin"){
      await axios
      .post(server + "/api/register", { 
        firstName: firstName,
        lastName: lastName,
        email: email, 
        password: password,
        confirmPassword: confirmPassword,
        libraryId: libraryFromSubdomain.id,
        role: role
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
        setError(response.data.message ? response.data.message : response.data.error)
      })
    }
    else {
      setError("An error has occurred")
    }
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
            to enjoy all of our cool <Link href="https://communitybookclub.com" color={'blue.400'}>features</Link> ✌️
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}></Stack>
          <form onSubmit={e=>handleSubmit(e)}>
            <Box>
              {error && (
                <Text color="red" mb={4}>
                  {error}
                </Text>
              )}
              <Flex as={FormControl} mb={4} gap={2}>
                <Input
                  type="text"
                  placeholder="First name*"
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  flex="1 1 auto"
                  size="lg"
                  required
                />
                <Input
                  type="text"
                  placeholder="Last name*"
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  flex="1 1 auto"
                  size="lg"
                  required
                />
              </Flex>
              <FormControl mb={4}>
                <Input
                  type="email"
                  placeholder="Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  size="lg"
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <Input
                  type="password"
                  placeholder="Password*"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="lg"
                  minLength={8}
                  required
                />
              </FormControl>
              <FormControl mb={4}>
                <Input
                  type="password"
                  placeholder="Confirm password*"
                  value={confirmPassword}
                  onChange={(e) => confirmPasswordCheck(e.target.value)}
                  size="lg"
                  minLength={8}
                  required
                />
                <Text color="red" mb={4}>
                  {confirmPasswordError}
                </Text>
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
                  Register
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
        <Text fontSize={'lg'} color={'gray.600'} textAlign="center">
          Already have an account? <Link href="/login" color={'blue.400'}>Login</Link>
        </Text>
      </Stack>
    </Flex>
  );
};

export default Register;

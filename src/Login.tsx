import React, { useState, useEffect, useRef } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Center,
  useColorMode,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import logo from './assets/BookChatNoirNewBlack.png';
import logoWhite from './assets/BookChatNoirNewWhite.png';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "./hooks/useAuth";
import axios from "axios";


const Login: React.FC<LoginFormProps> = ({ onLogin, server }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user,getUser } = useAuth();
  const toast = useToast();
  const {colorMode} = useColorMode()

  // const handleSubmitMutation = useMutation({
  //   mutationFn: async (e,googleRegister) => {
  //     console.log(googleRegister)
  //     if (!googleRegister) {
  //       e.preventDefault();
  //     }
  //     await axios
  //     .post(server + "/api/login", { 
  //       email: googleRegister ? null : email, 
  //       password: googleRegister ? null : password,
  //       googleCredentials: googleRegister ? e.credential : null
  //     })
  //     .then((response)=>{
  //       if (response.data.success) {
  //         onLogin(response.data.token);
  //       }
  //     })
  //     .catch(({response})=>{
  //       console.log(response?.data)
  //       setError(response?.data?.message)
  //     })
  //   }
  // });
  async function handleSubmit(e: React.FormEvent | any, googleRegister: boolean) {
      if (!googleRegister) {
        e.preventDefault();
      }
      await axios
      .post(server + "/api/login", { 
        email: googleRegister ? null : email, 
        password: googleRegister ? null : password,
        googleCredential: googleRegister ? e.credential : null
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

  const { 
    isOpen: isOpenPasswordResetModal, 
    onOpen: onOpenPasswordResetModal, 
    onClose: onClosePasswordResetModal 
  } = useDisclosure()
  function openPasswordResetModal(e: any) {
    onOpenPasswordResetModal()
  }
  function closePasswordResetModal(){
    setPwResetError("")
    onClosePasswordResetModal()
  }

  const pwResetEmailRef = useRef();
  const [pwResetError,setPwResetError] = useState("");
  async function pwResetEmailCallback() {
    const pwResetEmail = (pwResetEmailRef.current as any).value;
    if (pwResetEmail !== "") {
      await axios
      .post(server + "/api/pwresetemail", 
      {
        pwResetEmail: pwResetEmail
      })
      .then((response)=>{
        closePasswordResetModal();
        toast({
          description: "Password reset email sent",
          status: "success",
          duration: 9000,
          isClosable: true
        })
      })
      .catch(({response})=>{
        setPwResetError(response.data.message)
        console.log(response.data.message)
        throw new Error("An error has occurred")
      })
    }
    else {
      setPwResetError("Please enter your email address")
    }
  }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
    >
      <Stack spacing={5} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Stack align="center">
            <Image src={colorMode === "light" ? logo : logoWhite} maxH="150px"/>
          </Stack>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
        </Stack>
        <Box
          rounded="sm"
          bg={colorMode === "light" ? "white" : "blackAlpha.300"}
          boxShadow="1px 1px 2px 1px black"
          border="1px solid black"
          p={8}
        >
          <Stack spacing={4}></Stack>
          <form onSubmit={e=>handleSubmit(e,false)}>
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
                borderColor="black"
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
                borderColor="black"
                required
              />
            </FormControl>
            <Box textAlign="center">
              <Button 
                type="submit"
                bg={'black'}
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
          <Text textAlign="center" mt={3}>
            Forgot password? <Link 
              href="#"
              onClick={openPasswordResetModal}
            >
              Click here
            </Link>
          </Text>
        </Box>
        <Center>
          <Text>OR</Text>
        </Center>
        <Center>
          <GoogleLogin 
            onSuccess={(e)=>handleSubmit(e,true)} 
            onError={()=>setError("error")} 
          />
        </Center>
        <Text fontSize={'lg'} color={'gray.600'} textAlign="center">
          Don't have an account? <Link href="/register" fontWeight="bold">Register</Link>
        </Text>
      </Stack>

      <Modal 
        isOpen={isOpenPasswordResetModal} 
        onClose={closePasswordResetModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Reset Password
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody>
              <FormLabel htmlFor="pwResetEmail">
                Email
              </FormLabel>
              <Input
                id="pwResetEmail"
                type="email"
                ref={pwResetEmailRef as any}
                borderColor="black"
              />
            </ModalBody>
            <ModalFooter justifyContent="space-between">
              <Text color="red">
                {pwResetError}
              </Text>
              <Button
                onClick={e=>pwResetEmailCallback()}
                variant="outline"
                borderColor="black"
              >
                Submit
              </Button>
            </ModalFooter>
        </ModalContent>
      </Modal>

    </Flex>
  );
};

export default Login;

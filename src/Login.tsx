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
import logo from './assets/BookChatNoirLogoSquare2Black.png';
import logoWhite from './assets/BookChatNoirLogoSquare2White.png';
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
  const [following,setFollowing] = useState<any[] | null>(null)
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
        setPwResetError("Error: PWR200")
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
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Stack align="center">
            <Image src={colorMode === "light" ? logo : logoWhite} maxH="150px"/>
          </Stack>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={colorMode === "light" ? "white" : "blackAlpha.300"}
          boxShadow="base"
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
          <Text textAlign="center" mt={3}>
            Forgot password? <Link 
              href="#"
              onClick={openPasswordResetModal}
            >
              Click here
            </Link>
          </Text>
        </Box>
        <Text fontSize={'lg'} color={'gray.600'} textAlign="center">
          Don't have an account? <Link href="/register" color={'blue.400'}>Register</Link>
        </Text>
        {/* <Center>
          <GoogleLogin onSuccess={(e)=>handleSubmit(e,true)} onError={()=>setError("error")} />
        </Center> */}
      </Stack>

      <Modal 
        isOpen={isOpenPasswordResetModal} 
        onClose={closePasswordResetModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh">
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
              />
            </ModalBody>
            <ModalFooter justifyContent="space-between">
              <Text color="red">
                {pwResetError}
              </Text>
              <Button
                onClick={e=>pwResetEmailCallback()}
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

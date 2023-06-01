import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { HTMLInputEvent, RegisterFormProps } from './types/types';
import { 
  FormControl, 
  Tooltip, 
  Input, 
  Button, 
  Text,
  Box,
  Flex,
  Image,
  Stack,
  Link,
  Heading,
  useColorMode,
  Checkbox,
  Center,
  useToast
} from "@chakra-ui/react";
import { ImInfo } from 'react-icons/im';
import logo from './assets/BookChatNoirLogoSquare2Black.png';
import logoWhite from './assets/BookChatNoirLogoSquare2White.png';
import passwordValidator from "password-validator";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";

const Register: React.FC<RegisterFormProps> = ({ onLogin, server }) => {
  const{colorMode} = useColorMode();
  const toast = useToast();
  var schema = new passwordValidator();
  schema
  .is().min(8)// Minimum length 8
  .is().max(100)// Maximum length 100
  .has().uppercase()// Must have uppercase letters
  .has().lowercase()// Must have lowercase letters
  .has().digits(2)// Must have at least 2 digits
  .has().symbols(1)
  .has().not().spaces()// Should not have spaces

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [termsChecked,setTermsChecked] = useState(false);
  const [error, setError] = useState("");

  const subdomain = window.location.hostname.split(".")[0];

  function handleTermsChecked(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setTermsChecked(true)
    }
    else if (!e.target.checked) {
      setTermsChecked(false)
    }
  }

  function confirmPasswordCheck(text: string) {
    setConfirmPassword(text)
    if (text !== password) {
      setConfirmPasswordError("Password and confirm password do not match")
    }
    else {
      setConfirmPasswordError(null)
    }
  }

  const [passwordError,setPasswordError] = useState(null)
  function checkPassword(pwInput: string) {
    const pwValidationErrors = schema.validate(pwInput, {details:true})
    if ((pwValidationErrors as any[]).length) {
      setPasswordError((pwValidationErrors as any[]).length ? (pwValidationErrors as any[])[0].message : null)
    }
    else {
      setPasswordError(null)
    }
    setPassword(prev=>pwInput)
    return
  }

  const handleSubmit = async (e: React.FormEvent | any, googleRegister: boolean) => {
    if (!googleRegister) {
      e.preventDefault();
    }
    setError("")
    await axios
      .post(server + "/api/register", { 
        firstName: googleRegister ? null : firstName,
        lastName: googleRegister ? null : lastName,
        email: googleRegister ? null : email, 
        password: googleRegister ? null : password,
        confirmPassword: googleRegister ? null : confirmPassword,
        googleCredential: googleRegister ? e.credential : null
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
  };

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align="center">
          <Image src={colorMode === "light" ? logo : logoWhite} maxH="75px"/>
        </Stack>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Register for an account</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            to enjoy all of our cool <Link href="https://bookchatnoir.com" color={'blue.400'}>features</Link> ✌️
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={colorMode === "light" ? "white" : "blackAlpha.300"}
          boxShadow="base"
          p={8}
        >
          <Stack spacing={4}></Stack>
          <form onSubmit={e=>handleSubmit(e, false)}>
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
                  <Flex gap={2}>
                    <Input
                      type="password"
                      placeholder="Password*"
                      value={password}
                      onChange={(e) => checkPassword(e.target.value)}
                      size="lg"
                      minLength={8}
                      required
                    />
                    <Tooltip label="Passwords requirements: Minimum length of 8, maximum length of 100, minimum of 1 uppercase letter, must have lowercase letters, minimum of 2 digits, minimum of 1 symbol, should not have spaces" hasArrow>
                      <Flex align="center" justify="center">
                        <ImInfo size={25} color="gray" />
                      </Flex>
                    </Tooltip>
                  </Flex>
                <Text color="red" mt={2} mb={4}>
                  {passwordError}
                </Text>
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
                <Text color="red" mt={2} mb={4}>
                  {confirmPasswordError}
                </Text>
              </FormControl>
              <FormControl mb={4}>
                <Checkbox
                  onChange={e=>handleTermsChecked(e)}
                >
                  <Text>
                    I agree to the <Link color="blue.400" href="/terms" target="_blank">Book Chat Noir Terms</Link>
                  </Text>
                </Checkbox>
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
                  isDisabled={Boolean(passwordError) || password === "" || Boolean(confirmPasswordError) || confirmPassword === "" || email === "" || firstName === "" || lastName === "" || !termsChecked}
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
        {/* <Center>
          <GoogleLogin onSuccess={(e)=>handleSubmit(e, true)} onError={()=>setError("error")} />
        </Center> */}
      </Stack>
    </Flex>
  );
};

export default Register;

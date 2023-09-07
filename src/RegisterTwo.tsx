import React, { useState, useLayoutEffect, useEffect } from "react";
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
  Center,
  useToast
} from "@chakra-ui/react";
import { ImInfo } from 'react-icons/im';
import logo from './assets/BookChatNoirNewBlack.png';
import logoWhite from './assets/BookChatNoirNewWhite.png';
import passwordValidator from "password-validator";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

const RegisterTwo: React.FC<RegisterFormProps> = ({ onLogin, server }) => {
  const{colorMode} = useColorMode();
  dayjs.extend(utc);
  const toast = useToast();
  let [searchParams] = useSearchParams();

  const [linkId,setLinkId] = useState(searchParams.get("linkid") ? parseInt(searchParams.get("linkid")!) - 3000 : null);
  const [inviteId,setInviteId] = useState(searchParams.get("inviteid") ? parseInt(searchParams.get("inviteid")!) - 9500 : null);
  const [valid,setValid] = useState(false);
  const [linkActivated,setLinkActivated] = useState("");
  useEffect(()=>{
    async function getRegInfo() {
      await axios
        .get(server + "/api/reginfo",
          {
            params: {
              linkId: linkId,
              inviteId: inviteId
            }
          }
        )
        .then((response)=>{
          const {data} = response;
          if (data.success && data.message) {
            setValid(true);
            if (data.message.activated !== null) {
              setLinkActivated(data.message.activated)
              if (linkId) {
                setValid(false)
              }
            }
            else {
              setEmail(data.message.email)
              if (inviteId) {
                setValid(false)
              }
            }
          }
          else {
            setValid(false)
          }
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.error)
        })
    }
    getRegInfo()
  },[])

  useLayoutEffect(()=>{
    setTimeout(()=>{
      const toastManagers = document.querySelectorAll("ul[id^='chakra-toast-manager']");
      toastManagers.forEach((tm)=>{
        tm.removeAttribute("role");
        const divElement = document.createElement("div");
        divElement.setAttribute("role","alert")
        tm.parentNode?.insertBefore(divElement,tm);
        divElement.appendChild(tm);
        return;
      })
    },1000)
  },[])

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
  const [error, setError] = useState("");

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
        googleCredential: googleRegister ? e.credential : null,
        mainRegister: linkActivated ? null : linkId
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
    <>
      {valid && (linkId || inviteId) ? (
        <Flex
          minH={'100vh'}
          align={'center'}
          justify={'center'}
        >
          {linkActivated && dayjs().isAfter(dayjs(linkActivated!).add(5,'day')) ? (
            <Heading as="h1" size="lg">Link Expired</Heading>
          ): (
            <Stack spacing={5} mx={'auto'} maxW={'lg'} py={12} px={6} role="main">
              <Stack align="center">
                <Image src={colorMode === "light" ? logo : logoWhite} maxH="75px" alt="book chat noir logo"/>
              </Stack>
              <Stack align={'center'}>
                <Heading fontSize={'4xl'}>Register for an account</Heading>
                <Text fontSize={'lg'} color={'gray.600'}>
                  to enjoy all of our cool <Link href="https://bookchatnoir.com" color={'purple'} fontWeight="bold">features</Link> ✌️
                </Text>
              </Stack>
              <Box
                rounded={'sm'}
                bg={colorMode === "light" ? "white" : "blackAlpha.300"}
                boxShadow="1px 1px 2px 1px black"
                border="1px solid black"
                p={8}
              >
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
                        borderColor="black"
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
                        borderColor="black"
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
                        borderColor="black"
                        required
                        isDisabled={!linkActivated}
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
                            borderColor="black"
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
                        borderColor="black"
                        required
                      />
                      <Text color="red" mt={2} mb={4}>
                        {confirmPasswordError}
                      </Text>
                    </FormControl>
                    <Text mb={4}>
                      By creating an account, you agree to the Book Chat Noir's<Link color="black" fontWeight="bold" href="/terms" target="_blank"> Terms and Conditions</Link>
                    </Text>
                    <Box textAlign="center">
                      <Button 
                        type="submit"
                        bg={'black'}
                        color={'white'}
                        _hover={{
                          bg: 'blue.500',
                        }}
                        size="lg"
                        isDisabled={Boolean(passwordError) || password === "" || Boolean(confirmPasswordError) || confirmPassword === "" || email === "" || firstName === "" || lastName === ""}
                      >
                        Register
                      </Button>
                    </Box>
                  </Box>
                </form>
              </Box>
              <Center>
                <Text>OR</Text>
              </Center>
              <Center>
                <GoogleLogin 
                  onSuccess={(e)=>handleSubmit(e, true)} 
                  onError={()=>setError("error")} 
                  text="signup_with"
                />
              </Center>
              <Text fontSize={'lg'} color={'gray.600'} textAlign="center">
                Already have an account? <Link href="/login" color={'black'} fontWeight="bold">Login</Link>
              </Text>
              {linkActivated ? (
                <Text fontStyle="italic" mb={4} textAlign="center">
                  This page expires {dayjs(linkActivated).add(5,'day').format("MMM DD, YYYY h:mm a")}
                </Text>
              ): null}
            </Stack>
          )}
        </Flex>
      ): (
        <Heading as="h1" size="lg">Invalid Link</Heading>
      )}
    </>
  );
};

export default RegisterTwo;

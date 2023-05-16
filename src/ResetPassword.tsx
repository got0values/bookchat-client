import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ResetPasswordFormProps } from './types/types';
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
  Heading,
  useColorMode,
  useToast
} from "@chakra-ui/react";
import { ImInfo } from 'react-icons/im';
import logo from './assets/community-book-club-logo3.png';
import logoWhite from './assets/community-book-club-logo3-white.png';
import passwordValidator from "password-validator";
import axios from "axios";

const ResetPassword: React.FC<ResetPasswordFormProps> = ({ server }) => {
  const {colorMode} = useColorMode()
  const [searchParams] = useSearchParams();
  const [paramsError,setParamsError] = useState(false);
  const [token,setToken] = useState<string | null>(null);
  const [userId,setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  var schema = new passwordValidator();
  schema
  .is().min(8)// Minimum length 8
  .is().max(100)// Maximum length 100
  .has().uppercase()// Must have uppercase letters
  .has().lowercase()// Must have lowercase letters
  .has().digits(2)// Must have at least 2 digits
  .has().symbols(1)
  .has().not().spaces()// Should not have spaces

  useEffect(()=>{
    if (searchParams.get("token") && searchParams.get("id")) {
      setToken(searchParams.get("token"));
      setUserId(searchParams.get("id"));
    }
    else {
      setParamsError(true);
    }
  },[searchParams])

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [error, setError] = useState("");

  const subdomain = window.location.hostname.split(".")[0];
  const toast = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("")
    await axios
    .post(server + "/api/resetpw", { 
      userId: parseInt(userId as string),
      password: password,
      confirmPassword: confirmPassword,
      token: token
    })
    .then((response)=>{
      navigate("/login")
      toast({
        description: "Password reset!.",
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
      bg={colorMode === "light" ? "gray.50" : "gray.800"}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align="center">
          <Image src={colorMode === "light" ? logo : logoWhite} maxH="75px"/>
        </Stack>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Reset Password</Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={colorMode === "light" ? "white" : "gray.700"}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}></Stack>
          {paramsError ? (
            <Heading as="h3" size="md">URL Error</Heading>
          ) : (
            <form onSubmit={e=>handleSubmit(e)}>
              <Box>
                {error && (
                  <Text color="red" mb={4}>
                    {error}
                  </Text>
                )}
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
                <Box textAlign="center">
                  <Button 
                    type="submit"
                    bg={'blue.400'}
                    color={'white'}
                    _hover={{
                      bg: 'blue.500',
                    }}
                    size="lg"
                    isDisabled={Boolean(passwordError) || password === "" || Boolean(confirmPasswordError) || confirmPassword === ""}
                  >
                    Register
                  </Button>
                </Box>
              </Box>
            </form>
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default ResetPassword;

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FormLabel, 
  Input, 
  Button, 
  Box,
  Flex,
  Switch,
  Skeleton,
  Stack,
  Heading,
  Text,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  useToast
} from "@chakra-ui/react";
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";

interface SettingsProps {
  server: string;
}

export default function Settings({server}: SettingsProps) {
  const {onLogout} = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  async function getSettings() {
    let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        const settingsData = await axios
          .get(server + "/api/settings",
            {
              headers: {
                'authorization': tokenCookie
              }
            }
          )
          .then((response)=>{
            const {data} = response;
            return data;
          })
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.error)
          })
        return settingsData
      }
      else {
        throw new Error("S101")
      }
  }

  async function deleteAccount() {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      if (window.confirm("Are you sure you would like to delete your account. This cannot be undone.")) {
        await axios
        .delete(server + "/api/deleteaccount",
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          onLogout();
          toast({
            description: "Account deleted",
            status: "success",
            duration: 9000,
            isClosable: true
          });
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data?.message)
        })
      }
    }
    else {
      toast({
        description: "An error has occurred (DA100)",
        status: "error",
        duration: 9000,
        isClosable: true
      })
    }
  }

  const firstNameRef = useRef({} as HTMLInputElement);
  const lastNameRef = useRef({} as HTMLInputElement);
  const notificationsEmailRef = useRef({} as HTMLInputElement);
  const [settingsError,setSettingsError] = useState("");
  const updateSettingsMutation = useMutation({
    mutationFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      await axios
        .put(server + "/api/settings", 
        {
          firstName: firstNameRef.current.value,
          lastName: lastNameRef.current.value,
          emailNotifications: notificationsEmailRef.current.checked === true ? 1 : 0
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            toast({
              description: "Settings updated!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
            setSettingsError("");
          }
          // window.location.reload();
        })
        .catch(({response})=>{
          console.log(response)
          setSettingsError(response.data.message)
          throw new Error(response.data.message)
        })
      return getSettings()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['settingsKey'] })
      queryClient.resetQueries({queryKey: ['settingsKey']})
      queryClient.setQueryData(["settingsKey"],data)
    }
  })
  function updateSettings() {
    updateSettingsMutation.mutate();
  }

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['settingsKey'], 
    queryFn: getSettings
  });
  const settings = data?.message;
  const role = settings?.role;
  const firstName = settings?.first_name;
  const lastName = settings?.last_name;
  const emailNotifications = settings?.email_notifications;
  const emailNewsletter = settings?.email_newsletter;

  if (isError) {
    return (
      <Flex align="center" justify="center" minH="90vh">
        <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
      </Flex>
    )
  }

  return (
    <Box className="main-content-smaller">

      <Skeleton
        isLoaded={!isLoading}
      >
        <Flex direction="column" gap={4} px={2}>
          {settingsError && (
            <Alert status='error'>
              <AlertIcon />
              <Box>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {settingsError}
                </AlertDescription>
              </Box>
              <CloseButton
                alignSelf='flex-start'
                position='absolute'
                right={1}
                top={1}
                onClick={e=>setSettingsError("")}
              />
            </Alert>
          )}
          <Flex direction="column" gap={2}>
            <Stack>
              <Heading as="h4" size="md">
                Name
              </Heading>
              <Flex w="100%" gap={5} flexWrap="wrap" justify="space-between">
                <Box flex="1 1 45%" minW="150px">
                  <FormLabel htmlFor="first-name" mb={1}>First Name</FormLabel>
                  <Input 
                    id="first-name" 
                    type="text"
                    defaultValue={firstName}
                    ref={firstNameRef}
                  />
                </Box>
                <Box flex="1 1 45%" minW="150px">
                  <FormLabel htmlFor="last-name" mb={1}>Last Name</FormLabel>
                  <Input 
                    id="last-name" 
                    type="text"
                    defaultValue={lastName}
                    ref={lastNameRef}
                  />
                </Box>
              </Flex>
            </Stack>
            <Stack maxW="25%">
              <Heading as="h4" size="md">
                Email
              </Heading>
              <Flex align="center" justify="space-between" gap={2}>
                <Text>Notifications:</Text>
                <Switch
                  ref={notificationsEmailRef}
                  defaultChecked={emailNotifications === 1 ? true : false}
                />
              </Flex>
            </Stack>
          </Flex>

          <Divider/>

          <Flex justify="space-between">
            <Button
              colorScheme="red"
              onClick={e=>deleteAccount()}
            >
              Delete account
            </Button>
            <Button
              colorScheme="green"
              onClick={e=>updateSettings()}
              isLoading={updateSettingsMutation.isLoading}
            >
              Save
            </Button>
          </Flex>

        </Flex>
      </Skeleton>
    </Box>
  );
};

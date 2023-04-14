import { ProfileButtonProps } from "../types/types"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "./Profile";
import { Button } from "@chakra-ui/react"
import Cookies from "js-cookie"
import axios from "axios"

export const FollowProfileButton = ({server,profileId,setProfileActionError}: ProfileButtonProps) => {
  const queryClient = useQueryClient();
  const {getProfile} = useProfile({server});

  async function followFn() {
    const tokenCookie = Cookies.get().token;
    await axios
      .post(server + "/api/profileaction",
        {
          action: "follow",
          profileId: profileId
        },
        {headers: {
          Authorization: tokenCookie
        }}
      )
      .catch(({response})=>{
        setProfileActionError(response.data?.error ? response.data?.error : response.status)
      })
    return getProfile()
  }
  const followMutation = useMutation({
    mutationFn: followFn,
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['profileKey'] })
      queryClient.resetQueries({queryKey: ['profileKey']})
      queryClient.setQueryData(["profileKey"],data)
    }
  })
  function follow() {
    followMutation.mutate();
  }

  return (
    <Button
      flex={1}
      rounded={'full'}
      bg='blue.400'
      color={'white'}
      _hover={{
        bg: 'blue.500',
      }}
      _focus={{
        bg: 'blue.500',
      }}
      onClick={follow}
    >
      Follow
    </Button>
  )
}

export const CancelRequestButton = ({server,profileId,setProfileActionError}: ProfileButtonProps) => {
  const queryClient = useQueryClient();
  const {getProfile} = useProfile({server});

  async function cancelRequestFn() {
    const tokenCookie = Cookies.get().token;
    await axios
      .post(server + "/api/profileaction",
        {
          action: "cancelrequest",
          profileId: profileId
        },
        {headers: {
          Authorization: tokenCookie
        }}
      )
      .catch(({response})=>{
        console.log(response)
        setProfileActionError(response.data?.error ? response.data?.error : response.status)
      })
    return getProfile();
  }
  const cancelRequestMutation = useMutation({
    mutationFn: cancelRequestFn,
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['profileKey'] })
      queryClient.resetQueries({queryKey: ['profileKey']})
      queryClient.setQueryData(["profileKey"],data)
    }
  })
  function cancelRequest() {
    cancelRequestMutation.mutate();
  }

  return (
    <Button
      flex={1}
      rounded={'full'}
      bg='gray.400'
      color={'white'}
      _hover={{
        bg: 'gray.500',
      }}
      _focus={{
        bg: 'gray.500',
      }}
      onClick={cancelRequest}
    >
      Cancel Request
    </Button>
  )
}

export const UnFollowProfileButton = ({server,profileId,setProfileActionError}: ProfileButtonProps) => {
  const queryClient = useQueryClient();
  const {getProfile} = useProfile({server});

  async function unFollowFn() {
    const tokenCookie = Cookies.get().token;
    await axios
    .post(server + "/api/profileaction",
      {
        action: "unfollow",
        profileId: profileId
      },
      {headers: {
        Authorization: tokenCookie
      }}
    )
    .catch(({response})=>{
      console.log(response)
      setProfileActionError(response.data?.error ? response.data?.error : response.status)
    })
    return getProfile();
  }
  const unFollowMutation = useMutation({
    mutationFn: unFollowFn,
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['profileKey'] })
      queryClient.resetQueries({queryKey: ['profileKey']})
      queryClient.setQueryData(["profileKey"],data)
    }
  })
  function unFollow() {
    unFollowMutation.mutate();
  }

  return (
    <Button
      flex={1}
      rounded={'full'}
      bg='blue.400'
      color={'white'}
      _hover={{
        bg: 'blue.500',
      }}
      _focus={{
        bg: 'blue.500',
      }}
      onClick={unFollow}
    >
      Unfollow
    </Button>
  )
}
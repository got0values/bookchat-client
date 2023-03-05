import { ProfileButtonProps } from "../types/types"
import { Button } from "@chakra-ui/react"
import Cookies from "js-cookie"
import axios from "axios"

export const FollowProfileButton = ({server,profileId,setProfileDataUpdated,setProfileActionError}: ProfileButtonProps) => {
  async function follow() {
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
    .then((response)=>{
      if (response.data.success) {
        setProfileDataUpdated(true)
      }
    })
    .catch(({response})=>{
      console.log(response)
      setProfileActionError(response.error ? response.error : response.status)
    })
    
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

export const CancelRequestButton = ({server,profileId,setProfileDataUpdated,setProfileActionError}: ProfileButtonProps) => {
  async function cancelRequest() {
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
    .then((response)=>{
      if (response.data.success) {
        setProfileDataUpdated(true)
      }
    })
    .catch(({response})=>{
      console.log(response)
      setProfileActionError(response.error ? response.error : response.status)
    })
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

export const UnFollowProfileButton = ({server,profileId,setProfileDataUpdated,setProfileActionError}: ProfileButtonProps) => {
  async function unFollow() {
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
    .then((response)=>{
      if (response.data.success) {
        setProfileDataUpdated(true)
      }
    })
    .catch(({response})=>{
      console.log(response)
      setProfileActionError(response.error ? response.error : response.status)
    })
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
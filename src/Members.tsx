import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box,
  Heading,
  Stack,
  HStack,
  Flex,
  Text,
  Input,
  Badge
} from "@chakra-ui/react";
import { ProfileType } from './types/types';
import Cookies from 'js-cookie';
import axios from 'axios';

interface MembersProps {
  server: string;
}

export const Members = ({server}: MembersProps) => {
  const [members,setMembers] = useState<ProfileType[] | []>([]);

  useEffect(()=>{
    const tokenCookie = Cookies.get().token;
    axios
    .post(server + "/api/getmembers", 
    {nothing: "nothing"},
    {headers: {
      authorization: tokenCookie
    }})
    .then((response)=>{
      console.log(response.data.message)
      if (response.data.success) {
        return setMembers(response.data.message)
      }
    })
    .catch(({response})=>{
      console.error(response)
    })
  },[])

  return (
    <Box id="main" flexDirection="column">
      <Heading as="h1" size="3xl">Members</Heading>
      {members?.map((member,i)=>{
        return (
          <Box key={i}>
            <Link to={`/profile/${member.username}`}>{member.username}</Link>
          </Box>
        )
      })}
    </Box>
  )
}
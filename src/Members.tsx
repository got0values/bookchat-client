import { Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { 
  Box,
  Heading,
  OrderedList,
  ListItem,
  Center,
  Text,
  Spinner
} from "@chakra-ui/react";
import { ProfileType } from './types/types';
import Cookies from 'js-cookie';
import axios from 'axios';

interface MembersProps {
  server: string;
}

export const Members = ({server}: MembersProps) => {

  async function getMembers() {
    const tokenCookie = Cookies.get().token;
    const membersData = await axios
      .post(server + "/api/getmembers", 
      {nothing: "nothing"},
      {headers: {
        authorization: tokenCookie
      }})
      .then((response)=>{
        if (response.data.success) {
          return response.data
        }
      })
      .catch(({response})=>{
        console.error(response.data)
        throw new Error(response.data)
      })
    return membersData
  }

  const { isLoading, isError, data, error } = useQuery({ queryKey: ['memberKey'], queryFn: getMembers });
  const members = data?.message;
  if (isLoading) {
    return <Center><Spinner size="xl"/></Center>
  }
  if (isError) {
    return <Center><Heading as="h1" size="xl">Error: {(error as Error).message}</Heading></Center>
  }

  return (
    <Box id="main" flexDirection="column">
      <Heading as="h1" size="3xl" mb={5}>Members</Heading>
      <OrderedList>
        {members?.map((member: ProfileType, i: number)=>{
          return (
            <ListItem key={i} m={5}>
              <Link to={`/profile/${member.username}`}>{member.username}</Link>
            </ListItem>
          )
        })}
      </OrderedList>
    </Box>
  )
}
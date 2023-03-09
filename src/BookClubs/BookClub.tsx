import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookClubGeneralCommentsType } from "../types/types";
import { BookClubType } from '../types/types';
import { 
  Box,
  Heading,
  Text,
  Avatar,
  AvatarGroup,
  Button,
  Stack,
  Flex,
  Skeleton,
  Textarea,
  useToast
} from "@chakra-ui/react";
import { BookClubGeneralComments } from "../shared/BookClubGeneralComments";
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";


export default function BookClub({server}: {server: string}) {
  const toast = useToast();
  const navigate = useNavigate();
  const { paramsBookClubId } = useParams();
  const { user } = useAuth();
  const [bookClubError,setBookClubError] = useState<string | null>(null);
  const [bookClub,setBookClub] = useState<BookClubType | null>(null);
  const [isBookClubCreator,setIsBookClubCreator] = useState<boolean>(false);
  const [isLoading,setIsLoading] = useState<boolean>(true);

  

  function getBookClub() {
    let tokenCookie: string | null = Cookies.get().token;
    setIsLoading(true);
    if (tokenCookie) {
      axios
      .get(server + "/api/getbookclub?bookclubid=" + paramsBookClubId,
        {
          headers: {
            authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        console.log(response)
        if (response.data.success) {
          const responseBookClub = response.data.message
          setBookClub(responseBookClub)
          if (responseBookClub.creator === user.Profile.id) {
            setIsBookClubCreator(true);
          }
          else {
            setIsBookClubCreator(false);
          }
          setIsLoading(false);
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data?.message) {
          setBookClubError(response.data?.message)
        }
      })
      setIsLoading(false);
    }
    else {
      setBookClubError("An error has occured")
    }
  }

  useEffect(()=>{
    getBookClub()
    
    return ()=>{
      setBookClub(null)
    }
  },[])
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={!isLoading}
      >
        {bookClubError ? (
          <Heading as="h2" size="2xl" >bookClubError</Heading>
          ) : (
          <Flex flexWrap="wrap" w="100%" align="start" justify="space-between">
            <Stack flex="1 1 30%">

              {isBookClubCreator ? (
                <Box className="well">
                  <Heading as="h4" size="sm">Admin</Heading>
                </Box>
              ): null}

              <Box className="well">
                <Heading as="h4" size="sm">About</Heading>
              </Box>

              <Box className="well">
                <Heading as="h4" size="sm">Members</Heading>
              </Box>
            </Stack>

            <Stack flex="1 1 65%">
              <Box className="well">
                <Heading as="h4" size="sm">Currently Reading</Heading>
              </Box>

              <Box className="well">
                <Heading as="h4" size="sm">Next Meeting</Heading>
              </Box>

              <Box className="well">
                <Heading as="h4" size="sm" mb={2}>General Discussion</Heading>
                <BookClubGeneralComments 
                  server={server}
                  bookClubId={paramsBookClubId}
                  subdomain={window.location.host.split(".")[0]}
                  uri={window.location.pathname}
                />
              </Box>
            </Stack>
          </Flex>
        )}
      </Skeleton>
    </Box>
  );
};

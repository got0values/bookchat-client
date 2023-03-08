import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookClubType } from '../types/types';
import { 
  Box,
  Heading,
  Text,
  Avatar,
  AvatarGroup,
  Stack,
  HStack,
  Button,
  Input,
  Flex,
  Skeleton,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { IoIosAdd } from 'react-icons/io';
import { MdGroups } from 'react-icons/md';
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

  let scriptElement: HTMLScriptElement = document.createElement("script");
  scriptElement.id = "scriptelement"
  scriptElement.src = "https://isso.communitybookclub.com/js/embed.min.js";

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

    let documentScriptElement = document.getElementById("scriptelement");
    if (!documentScriptElement){
      document.body.appendChild(scriptElement);
    }
    return ()=>{
      document.body.removeChild(scriptElement)
      documentScriptElement = null;
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
                <Heading as="h4" size="sm">General Discussion</Heading>
                <Box as="section" id="isso-thread">
                  <noscript>Javascript needs to be activated to view comments.</noscript>
                </Box>
              </Box>
            </Stack>
          </Flex>
        )}
      </Skeleton>
    </Box>
  );
};

import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookClubGeneralCommentsType } from "../types/types";
import { BookClubBookType } from '../types/types';
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
  const { paramsBookClubBookId } = useParams();
  const { user } = useAuth();
  const [bookClubBookError,setBookClubBookError] = useState<string | null>(null);
  const [bookClubBook,setBookClubBook] = useState<BookClubBookType | null>(null);
  const [isBookClubCreator,setIsBookClubCreator] = useState<boolean>(false);
  const [isLoading,setIsLoading] = useState<boolean>(true);

  
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={!isLoading}
      >
        {bookClubBookError ? (
          <Heading as="h2" size="2xl" >bookClubError</Heading>
          ) : (
          <Flex flexWrap="wrap" w="100%" align="start" justify="space-between">
            <Stack flex="1 1 30%" top="0">
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

            <Stack flex="1 1 65%" maxW="100%">
              <Box className="well">
                <Heading as="h4" size="sm">Currently Reading</Heading>
              </Box>

              <Box className="well">
                <Heading as="h4" size="sm">Next Meeting</Heading>
              </Box>

              <Box className="well">
                <Heading as="h4" size="sm" mb={2}>Book Discussion</Heading>
              </Box>
            </Stack>
          </Flex>
        )}
      </Skeleton>
    </Box>
  );
};

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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  useToast
} from "@chakra-ui/react";
import { BookClubGeneralComments } from "../shared/BookClubGeneralComments";
import { MdChevronRight } from 'react-icons/md';
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
      <Breadcrumb 
        spacing='8px' 
        separator={<MdChevronRight color='gray.500' />}
        m=".5rem"
      >
        <BreadcrumbItem>
          <BreadcrumbLink href='/bookclubs'>Book Clubs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href='#'>Book Club</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href='#'>Discussion</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Skeleton 
        isLoaded={true}
      >
        <Stack flex="1 1 65%" maxW="100%">
          <Box className="well">
            <Heading as="h4" size="sm">Book</Heading>
          </Box>

          <Box className="well">
            <Heading as="h4" size="sm">Topic/Question</Heading>
          </Box>

          <Box className="well">
            <Heading as="h4" size="sm" mb={2}>Book Discussion</Heading>
          </Box>
        </Stack>
      </Skeleton>
    </Box>
  );
};

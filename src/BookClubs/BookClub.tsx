import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { SetStateAction, Dispatch } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { ProfileProps, HTMLInputEvent, ProfileType } from '../types/types';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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

  let scriptElement: HTMLScriptElement = document.createElement("script");
  scriptElement.id = "scriptelement"
  scriptElement.src = "https://commento.communitybookclub.com/js/commento.js";
  scriptElement.async = true;

  useEffect(()=>{
    //check if viewer is from same library
    //check if user is a member of book club

    let documentScriptElement = document.getElementById("scriptelement");
    if (!documentScriptElement){
      document.body.appendChild(scriptElement);
    }
    return ()=>{
      document.body.removeChild(scriptElement)
      documentScriptElement = null;
    }
  },[])
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={true}
      >
        <Flex flexWrap="wrap" w="100%" align="start" justify="space-between">
          <Stack flex="1 1 30%">
            <Box className="well">
              <Heading as="h4" size="sm">Admin</Heading>
            </Box>
          </Stack>

          <Stack flex="1 1 65%">
            <Box className="well">

              <Flex align="center" justify="space-between">
              </Flex>

              <Box>
              </Box>

              <Box 
                id="commento" 
              >
              </Box>

            </Box>

          </Stack>

        </Flex>
      </Skeleton>
    </Box>
  );
};

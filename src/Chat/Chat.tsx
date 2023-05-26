import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ActiveRoom } from "../types/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardProps, Following_Following_self_profile_idToProfile, CurrentlyReading, CurrentlyReadingComment } from '../types/types';
import { 
  Box,
  Heading,
  Flex,
  Text,
  Link,
  Button,
  Skeleton,
  Input,
  InputGroup,
  InputRightElement,
  Avatar,
  Portal,
  Popover,
  PopoverTrigger,
  PopoverContent,
  IconButton,
  useColorMode,
  useToast
} from "@chakra-ui/react";
import { useAuth } from '../hooks/useAuth';
import { BsReplyFill, BsEmojiSmile } from 'react-icons/bs';
import { FiSend } from "react-icons/fi";
import Picker from '@emoji-mart/react';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {socket} from "./customSocket";


export default function Chat() {
  dayjs.extend(utc);
  const navigate = useNavigate();

  function disconnectSocket() {
    socket.disconnect();
  }

  const [activeRooms,setActiveRooms] = useState<ActiveRoom[]>([]);
  useEffect(()=>{
    socket.connect()
    socket.on("receive-active-rooms",(rooms)=>{
      if (rooms.length) {
        setActiveRooms(prev=>{
          const roomsWithNumberOfUsers = rooms.map((room: ActiveRoom,i: number,arr: ActiveRoom[])=>{
            return {
              ...room,
              numberOfUsers: arr.filter((r)=>r.roomId === room.roomId).length
            }
          })
          const noDuplicatRooms = roomsWithNumberOfUsers.filter((room: ActiveRoom,index: number)=>{
            return roomsWithNumberOfUsers.findIndex((r: ActiveRoom)=>r.roomId === room.roomId) === index;
          })
          return noDuplicatRooms;
        })
      }
    })
    socket.emit("get-active-rooms",socket.id)
    setInterval(()=>{
      socket.emit("get-active-rooms",socket.id)
    },10000)
    window.addEventListener("beforeunload", disconnectSocket)
    return(()=>{
      socket.off("connect")
      socket.off("disconnect")
      socket.off("receive-active-rooms")
      window.removeEventListener("beforeunload", disconnectSocket)
      disconnectSocket();
    })
  },[socket])

  return (
    <>
      <Box className="main-content-smaller">
        <Skeleton isLoaded={true}>
          <Box
            className="well"
          >
            <Heading size="md" mb={2}>Active</Heading>
            <Flex
              direction="column"
              gap={2}
            >
            {activeRooms.length ? (
              activeRooms.map((room,i,arr)=>{
                return (
                  <Flex 
                    className="well-card"
                    justify="space-between"
                    _hover={{
                      cursor: "pointer"
                    }}
                    onClick={e=>navigate(`/chat/room?title=${room?.bookTitle ? room.bookTitle : ""}&author=${room?.bookAuthor ? room.bookAuthor : ""}`)}
                    key={i}
                  >
                    <Flex
                      gap={1}
                      wrap="wrap"
                    >
                      <Text fontStyle="italic">{room?.bookTitle ? room?.bookTitle : ""} </Text>
                      <Text>{room?.bookAuthor ? room?.bookAuthor : ""}</Text>
                    </Flex>
                    <Text>
                      {room?.numberOfUsers ? room.numberOfUsers : "0"}
                    </Text>
                  </Flex>
                )
              })
            ) : (
              <Heading
                as="h4"
                size="sm"
                fontStyle="italic"
              >
                No Rooms Active
              </Heading>
            )}
            </Flex>
          </Box>
        </Skeleton>
      </Box>

      {/* <Modal 
        isOpen={isOpenCommentModal} 
        onClose={closeCommentModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>
            
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody h="auto" maxH="75vh" overflow="auto">

            </ModalBody>
            <ModalFooter flexDirection="column">

            </ModalFooter>
        </ModalContent>
      </Modal> */}

    </>
  );
};

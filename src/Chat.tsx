import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardProps, Following_Following_self_profile_idToProfile, CurrentlyReading, CurrentlyReadingComment } from './types/types';
import { 
  Box,
  Heading,
  Flex,
  Spinner,
  CloseButton,
  Text,
  Image,
  HStack,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  InputGroup,
  InputRightElement,
  Portal,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Stack,
  Center,
  useColorMode,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { useAuth } from './hooks/useAuth';
import { BsReplyFill, BsEmojiSmile } from 'react-icons/bs';
import Cookies from "js-cookie";
import Picker from '@emoji-mart/react';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";
import { io } from "socket.io-client";


export default function Chat({chatserver}: {chatserver: string}) {
  dayjs.extend(utc);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, getUser } = useAuth();
  const queryClient = useQueryClient();
  const socket = io(chatserver)
  const {colorMode} = useColorMode();
  let [searchParams] = useSearchParams();

  const [bookTitle,setBookTitle] = useState(searchParams.get("title"))
  const [bookAuthor,setBookAuthor] = useState(searchParams.get("author"))
  const chatBoxRef = useRef();
  const [isConnected,setIsConnected] = useState(socket.connected);
  const [room,setRoom] = useState<string>(bookTitle && bookAuthor ? bookTitle + bookAuthor : "coolchat");
  const [chatMessages,setChatMessages] = useState<any[]>([]);
  const [roomUsers,setRoomUsers] = useState([] as any[]);
  useEffect(()=>{
    if (!searchParams.get("title") || !searchParams.get("author")) {
      navigate("/")
      toast({
        description: "Chat Room does not exist",
        status: "error",
        duration: 9000,
        isClosable: true
      })
    }

    function onConnect() {
      setIsConnected(true)
      socket.emit("get-users",room)
    }
    function onDisconnect() {
      setIsConnected(false)
      socket.emit("get-users",room)
    }
    function onReceiveUsers(users: string[]) {
      setRoomUsers(prev=>[...new Set(users)])
    }
    function onReceiveMessage(message: {userName: string, text: string}) {
      setChatMessages(prev=>[...prev,message])
      setTimeout(()=>{
        (chatBoxRef as any).current.scroll();
        (chatBoxRef as any).current.scrollTop = (chatBoxRef as any).current.scrollHeight;
      },500)
    }

    socket.on("connect", onConnect)
    socket.emit("join-room",{room: room, user: user.Profile.username});
    socket.on("receive-users", (users)=>{
      console.log(users)
      onReceiveUsers(users)
    })
    socket.on("receive-message", (message)=>{
      onReceiveMessage(message)
    });
    socket.on("disconnect", onDisconnect)
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive-message', onReceiveMessage);
    };
  },[])

  const chatTextRef = useRef({} as HTMLInputElement);
  function submitChat() {
    const chatText = chatTextRef.current.value;
    socket.emit(
      "send-message", 
      {
        userName: user.Profile.username, 
        text: chatText,
        time: new Date()
      }, 
      room
      );
    chatTextRef.current.value = "";
  }

  function pickEmoji(e: {unified: string}) {
    let unifiedSplit = e.unified.split("-");
    let unifiedArray: any[] = []
    unifiedSplit.forEach((us)=>unifiedArray.push("0x" + us))
    const unifiedString = String.fromCodePoint(...unifiedArray);
    chatTextRef.current.value += unifiedString;
  }

  return (
    <>
      <Box className="main-content-smaller">
        <Skeleton isLoaded={true}>
          <Heading as="h1" size="lg" textAlign="center">
            {bookTitle}
          </Heading>
          <Heading as="h2" size="md" mb={2} textAlign="center">
            {bookAuthor}
          </Heading>
          <Box className="well">
            <Heading as="h2" size="md" mb={2}>Chat</Heading>
            <Box
              minH="500px"
              maxH="500px"
              overflow="auto"
              h="100%"
              border="1px solid"
              rounded="md"
              mb={2}
              ref={chatBoxRef as any}
            >
              <>
                <Flex 
                  justify="center"
                  bg="gray.200"
                  _dark={{
                    bg: "gray.800"
                  }}
                  position="sticky"
                  top="0"
                  left="0"
                  right="0"
                >
                  <Text size="sm">{isConnected ? "connected" : "disconnected"}</Text>
                </Flex>
                {chatMessages?.map((message,i)=>{
                  return (
                    <Flex key={i} gap={1} m={1}>
                      <Text 
                        fontWeight="bold" 
                        whiteSpace="nowrap"
                      >
                        {`@${message.userName}`}
                        <Text
                          as="span"
                          fontSize="xs"
                        >
                          {` (${dayjs(message.time).local().format('H:mm a')}):`}
                        </Text>
                      </Text>
                      <Text>
                        {message.text}
                      </Text>
                    </Flex>
                  )
                })}
              </>
            </Box>
            <Flex
              align="center" 
              justify="space-between"
              gap={1}
            >
              <InputGroup>
                <Input
                  type="text"
                  ref={chatTextRef as any}
                  onKeyDown={e=> e.key === "Enter" ? submitChat() : null}
                />
                <InputRightElement display={["none","none","inline-flex"]}>
                  <Popover>
                    <PopoverTrigger>
                      <Button variant="ghost" p={0}>
                        <BsEmojiSmile size={15}/>
                      </Button>
                    </PopoverTrigger>
                    <Portal>
                      <PopoverContent>
                        <Box 
                          as={Picker} 
                          set="twitter"
                          // data={openMojiData}
                          previewPosition="none"
                          theme={colorMode === 'dark' ? 'dark' : 'light'}
                          onEmojiSelect={(e: any)=>pickEmoji(e)} 
                        />
                      </PopoverContent>
                    </Portal>
                  </Popover>
                </InputRightElement>
              </InputGroup>
              <Button
                onClick={e=>submitChat()}
                colorScheme="purple"
              >
                Submit
              </Button>
            </Flex>

            <Box>
              {roomUsers ? (
                roomUsers.map((roomUser,i)=>{
                return (
                  <Box key={i}>
                    @{roomUser.user}
                  </Box>
                )
              })): null}
            </Box>

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

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {socket, socketId} from "./customSocket";


export default function Chat() {
  dayjs.extend(utc);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, getUser } = useAuth();
  const queryClient = useQueryClient();
  // const {socket} = useCustomSocket()
  const {colorMode} = useColorMode();
  let [searchParams] = useSearchParams();

  function disconnectSocket() {
    socket.disconnect()
  }
  function connectSocket() {
    socket
    .connect()
    .emit("join-room",{room: roomId, userName: user.Profile.username})
  }

  const [bookTitle,setBookTitle] = useState(searchParams.get("title"))
  const [bookAuthor,setBookAuthor] = useState(searchParams.get("author"))
  const [bookClub,setBookClub] = useState(searchParams.get("bookclub"))
  const chatBoxRef = useRef({} as HTMLInputElement);
  const [isConnected,setIsConnected] = useState(socket.connected);
  const [roomId,setRoomId] = useState<string>(bookTitle && bookAuthor ? (bookTitle + bookAuthor).replace(/\s+/g,'') : "coolchat");
  const [chatMessages,setChatMessages] = useState<any[]>([]);
  const [roomUsers,setRoomUsers] = useState([] as any[]);
  useEffect(()=>{
    if (!searchParams.get("bookclub")) {
      if (!searchParams.get("title")) {
        navigate("/")
        toast({
          description: "Chat Room does not exist",
          status: "error",
          duration: 9000,
          isClosable: true
        })
      }
      else {
        setBookTitle(searchParams.get("title"))
        setBookAuthor(searchParams.get("author"))
        setRoomId(bookTitle && bookAuthor ? (bookTitle + bookAuthor).replace(/\s+/g,'') : "coolchat")
      }
    }
    else if (searchParams.get("bookclub")) {
      setBookClub(searchParams.get("bookclub"))
      setRoomId(searchParams.get("bookclub")!)
    }
    else {
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
    }
    function onDisconnect() {
      setIsConnected(false)
      socket.emit("get-users",roomId)
    }
    function onReceiveUsers(users: string[]) {
      setRoomUsers(prev=>[...new Set(users)])
    }
    function onReceiveMessage(message: {userName: string, text: string}) {
      setChatMessages(prev=>[...prev,message])
      setTimeout(()=>{
        if (chatBoxRef.current) {
          chatBoxRef.current.scroll();
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      },500)
    }

    socket.on("connect", onConnect)
    socket.connect();
    socket.emit("join-room",{
      room: roomId, 
      userName: user.Profile.username,
      profilePhoto: user.Profile.profile_photo
    });
    socket.on("receive-users", (users)=>{
      onReceiveUsers(users)
    })
    socket.on("receive-message", (message)=>{
      onReceiveMessage(message)
    });
    socket.on("disconnect", onDisconnect)
    window.addEventListener("beforeunload", disconnectSocket)
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive-users', onReceiveUsers);
      socket.off('receive-message', onReceiveMessage);

      window.removeEventListener("beforeunload",disconnectSocket)
      disconnectSocket();
    };
  },[searchParams,socket])

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
      roomId
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
      <Box className="chat-content">
        <Skeleton isLoaded={true}>
          <Flex 
            flexWrap="wrap" 
            gap={3} w="99%" 
            align="start" 
            justify="space-between"
            className="well"
          >
            <Flex 
              flex="1 1 80%"
              height="85vh"
              direction="column"
            >
              {!bookClub ? (
                <>
                  <Heading as="h1" size="md" textAlign="center" mb={2}>
                  {bookTitle} - {bookAuthor}
                  </Heading>
                </>
              ) : (
                <Heading as="h1" size="lg" textAlign="center">
                  {bookClub} Book Club
                </Heading>
              )}
              <Box
                h="100%"
                overflow="auto"
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
                      <Flex key={i} gap={1} m={1} fontSize={["sm","md","md"]}>
                        <Text 
                          fontWeight="bold" 
                          whiteSpace="nowrap"
                        >
                          {`${message.userName}`}
                          <Text
                            as="span"
                            fontSize="xs"
                          >
                            {` (${dayjs(message.time).local().format('h:mm a')}):`}
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
                    maxLength={50}
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
                <IconButton
                  onClick={e=>submitChat()}
                  colorScheme="gray"
                  aria-label="submit"
                  icon={<FiSend/>}
                />
              </Flex>
            </Flex>
            <Flex
              flex="1 1 15%"
              height="85vh"
              direction="column"
            >
              <Heading as="h3" size="md" mb={2}>Users</Heading>
              <Flex 
                h="100%" 
                overflowY="auto"
                p={1}
                border="1px solid"
                rounded="md"
                mb={3}
                direction="column"
                gap={1}
              >
                {roomUsers ? (
                  roomUsers.map((roomUser,i)=>{
                  return (
                    <Flex 
                      key={i}
                      fontStyle={!isConnected ? "italic" : ""}
                      onClick={e=>navigate(`/profile/${roomUser.userName}`)}
                      cursor={"pointer"}
                      align="center"
                      gap={1}
                    >
                      <Avatar
                        size="xs"
                        src={roomUser.profilePhoto}
                        border="2px solid gray"
                      />
                      <Text>
                        {roomUser.userName}
                      </Text>
                    </Flex>
                  )
                })): null}
              </Flex>
              {isConnected ? (
              <Button 
                size="md"
                onClick={e=>disconnectSocket()}
              >
                Disconnect
              </Button>
              ) : (
              <Button 
                size="md"
                onClick={e=>connectSocket()}
              >
                Connect
              </Button>
              )}
            </Flex>
          </Flex>
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

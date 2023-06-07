import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChatUser } from "../types/types";
import { 
  Box,
  Heading,
  Flex,
  Text,
  Button,
  Checkbox,
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
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  useColorMode,
  useToast,
  useMediaQuery
} from "@chakra-ui/react";
import { useAuth } from '../hooks/useAuth';
import { BsEmojiSmile } from 'react-icons/bs';
import { FiSend } from "react-icons/fi";
import Picker from '@emoji-mart/react';
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {socket} from "./customSocket";
import Cookies from "js-cookie";
import axios from "axios";


export default function ChatRoom({server}: {server: string}) {
  dayjs.extend(utc);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const {colorMode} = useColorMode();
  let [searchParams] = useSearchParams();
  const [isLargerThan650] = useMediaQuery('(min-width: 650px)');

  function disconnectSocket() {
    socket.disconnect()
  }
  function connectSocket() {
    socket.connect()
    socket.emit("join-room",{
      roomId: roomId, 
      userName: user.Profile.username,
      profilePhoto: user.Profile.profile_photo,
      bookTitle: bookTitle,
      bookAuthor: bookAuthor,
      typeOfRoom: bookClub ? "bookClub" : "book"
    })
    socket.emit("get-users",roomId)
  }

  const [ip,setIp] = useState("");
  const [bookTitle,setBookTitle] = useState(searchParams.get("title"))
  const [bookAuthor,setBookAuthor] = useState(searchParams.get("author"))
  const [bookClub,setBookClub] = useState(searchParams.get("bookclub"))
  const chatBoxRef = useRef({} as HTMLInputElement);
  const [isConnected,setIsConnected] = useState(socket.connected);
  const [roomId,setRoomId] = useState<string>(bookTitle && bookAuthor ? (bookTitle + bookAuthor).replace(/\s+/g,'') : "coolchat");
  const [chatMessages,setChatMessages] = useState<any[]>([]);
  const [roomUsers,setRoomUsers] = useState([] as any[]);
  useEffect(()=>{
    async function getIp() {
      const resIp = await axios.get("https://ipapi.co/json")
      setIp(resIp.data.ip)
    }
    getIp()
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
    function onReceiveUsers(users: ChatUser[]) {
      users = users.map((user)=>{
        if (user.country) {
          return (
            {...user,Flag: (countryFlagIconsReact as any)[user.country]}
          )
        }
        else {
          return user
        }
      })
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
      roomId: roomId, 
      userName: user.Profile.username,
      profilePhoto: user.Profile.profile_photo,
      country: user.Profile.country,
      bookTitle: bookTitle,
      bookAuthor: bookAuthor,
      typeOfRoom: bookClub ? "bookClub" : "book"
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

  const spoilerRef = useRef({} as HTMLInputElement)
  const chatTextRef = useRef({} as HTMLInputElement);
  const [chatError,setChatError] = useState("")
  async function submitChat() {
    const chatText = chatTextRef.current.value;
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      await axios
      .post(server + "/api/chat",
      {
        chatText: chatText,
        uri: window.location.pathname + window.location.search,
        ip: ip
      },
      {
        headers: {
          'authorization': tokenCookie
        }
      }
      )
      .then((response)=>{
        socket.emit(
          "send-message", 
          {
            userName: user.Profile.username, 
            text: chatText,
            spoiler: spoilerRef.current.checked,
            time: new Date()
          }, 
          roomId
        );
        chatTextRef.current.value = "";
        setChatError("")
      })
      .catch(({response})=>{
        console.log(response)
        setChatError(response.data.message)
        throw new Error(response.data.message)
      })
    }
  }

  function pickEmoji(e: {unified: string}) {
    let unifiedSplit = e.unified.split("-");
    let unifiedArray: any[] = []
    unifiedSplit.forEach((us)=>unifiedArray.push("0x" + us))
    const unifiedString = String.fromCodePoint(...unifiedArray);
    chatTextRef.current.value += unifiedString;
  }

  const UsersBox = () => {
    return (
      <Flex 
        h="100%" 
        overflowY="auto"
        p={1}
        border="1px solid"
        rounded="md"
        mb={3}
        direction="column"
        maxH="85vh"
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
              m={1}
            >
              <Avatar
                size="xs"
                src={roomUser.profilePhoto}
                border="2px solid gray"
              />
              <Text>
                {roomUser.userName}
              </Text>
              {roomUser.Flag ? (
                <Box w="1.4rem">
                  <roomUser.Flag/>
                </Box>
              ):null}
            </Flex>
          )
        })): null}
      </Flex>
    )
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
                        <Flex 
                          fontWeight="bold" 
                          wrap="wrap"
                          align="center"
                          gap={1}
                        >
                          {message.userName === "admin" ? <Text color="purple">admin</Text>  : <Text>{message.userName}</Text>}
                          <Text
                            as="span"
                            fontSize="xs"
                          >
                            {` (${dayjs(message.time).local().format('h:mm a')}):`}
                          </Text>
                        </Flex>
                        {message.spoiler === true ? (
                          <Accordion 
                            defaultIndex={[1]}
                            allowToggle
                          >
                            <AccordionItem 
                              border={0}
                              p={0}
                              rounded="md"
                            >
                              <AccordionButton p={1}>
                                <Text 
                                  color="red" 
                                  fontWeight="bold" 
                                  fontSize="sm"
                                >
                                  Spoiler!
                                </Text>
                                <AccordionIcon/>
                              </AccordionButton>
                              <AccordionPanel>
                              <Text>
                                {message.text}
                              </Text>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        ) : (
                          <Text>
                            {message.text}
                          </Text>
                        )}
                      </Flex>
                    )
                  })}
                </>
              </Box>
              {chatError && (
                <Text color="red">
                  {chatError}
                </Text>
              )}
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
                <Checkbox
                  ref={spoilerRef}
                >
                  Spoiler
                </Checkbox>
              </Flex>
            </Flex>
            <Flex
              flex="1 1 15%"
              height={isLargerThan650 ? "85vh" : "auto"}
              direction="column"
            >
              <Heading as="h3" size="md" mb={1} mt={2}>Users</Heading>
              {isLargerThan650 ? (
                <UsersBox/>
              ) : (
                <Accordion
                  className="well-card"
                  p={0}
                  defaultIndex={[0]} 
                  mb={3}
                  allowMultiple
                >
                  <AccordionItem border={0}>
                    <Flex as={AccordionButton} justify="flex-end">
                      <AccordionIcon/>
                    </Flex>
                    <AccordionPanel>
                      <UsersBox/>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              )}

              {isConnected ? (
              <Button 
                size="md"
                onClick={e=>disconnectSocket()}
                mt="auto"
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
    </>
  );
};

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChatUser } from "../types/types";
import { 
  Box,
  Heading,
  Flex,
  Text,
  Center,
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
  Divider,
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
      typeOfRoom: typeOfRoom
    })
    socket.emit("get-users",roomId)
  }

  async function getChatHistory() {
    let tokenCookie: string | null = Cookies.get().token;
    await axios
      .get(server + "/api/chathistory?roomuri=" + window.location.pathname + encodeURIComponent(window.location.search),
      {
        headers: {
          authorization: tokenCookie
        }
      }
      )
      .then((response)=>{
        setChatMessages(response.data.message)
      })
      .catch((response)=>{
        console.log(response)
      })
  }

  const [ip,setIp] = useState("");
  const [bookTitle,setBookTitle] = useState(searchParams.get("title"))
  const [bookAuthor,setBookAuthor] = useState(searchParams.get("author"))
  const [bookClub,setBookClub] = useState(searchParams.get("bookclub"))
  const [generalType,setGeneralType] = useState(searchParams.get("generaltype"))
  const chatBoxRef = useRef({} as HTMLInputElement);
  const [isConnected,setIsConnected] = useState(socket.connected);
  const [roomId,setRoomId] = useState<string>(bookTitle && bookAuthor ? (bookTitle + bookAuthor).replace(/\s+/g,'') : "coolchat");
  const [chatMessages,setChatMessages] = useState<any[]>([]);
  const [roomUsers,setRoomUsers] = useState([] as any[]);
  const [typeOfRoom,setTypeOfRoom] = useState("");
  useEffect(()=>{
    async function getIp() {
      const resIp = await axios.get("https://ipapi.co/json")
      setIp(resIp.data.ip)
    }
    getIp()

    getChatHistory()
    
    // let typeOfRoomVar = searchParams.get("generaltype") ? "generaltype" : searchParams.get("bookclub") ? "bookclub" : "book";
    let typeOfRoomVar;
    let roomIdVar;
    if (!searchParams.get("bookclub") && !searchParams.get("generaltype")) {
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
        typeOfRoomVar = "book";
        setTypeOfRoom(typeOfRoomVar)

        setBookTitle(prev=>searchParams.get("title"))
        setBookAuthor(prev=>searchParams.get("author"))

        roomIdVar = bookTitle && bookAuthor ? (bookTitle + bookAuthor).replace(/\s+/g,'') : "coolchat";
        setRoomId(roomIdVar)
      }
    }
    else if (searchParams.get("bookclub")) {
      typeOfRoomVar = "bookClub";
      setTypeOfRoom(typeOfRoomVar);

      setBookClub(prev=>searchParams.get("bookclub"))

      roomIdVar = searchParams.get("bookclub")!;
      setRoomId(roomIdVar);
    }
    else if (searchParams.get("generaltype")) {
      typeOfRoomVar = "generalType";
      setTypeOfRoom(typeOfRoomVar);

      setGeneralType(prev=>searchParams.get("generaltype"))

      roomIdVar = searchParams.get("generaltype")!;
      setRoomId(roomIdVar);
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
    function onReceiveMessage(message: {userName: string, text: string, spoiler: boolean, time: string}) {
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
      roomId: roomIdVar, 
      userName: user.Profile.username,
      profilePhoto: user.Profile.profile_photo,
      country: user.Profile.country,
      bookTitle: bookTitle,
      bookAuthor: bookAuthor,
      typeOfRoom: typeOfRoomVar
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
        spoiler: spoilerRef.current.checked,
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
        m={2}
        rounded="md"
        direction="column"
        maxH="85vh"
        gap={1}
        bg="white"
        _dark={{
          bg: "blackAlpha.500"
        }}
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
      <Box 
        w="100%"
        h="100%"
        pb={2}
      >
        <Skeleton isLoaded={true}>
          <Flex 
            flexWrap="wrap" 
            gap={0} 
            align="start" 
            justify="space-between"
          >
            <Flex 
              flex="1 1 80%"
              height="91vh"
              direction="column"
              bg="rgb(237, 242, 247)"
              _dark={{
                bg: "blackAlpha.200"
              }}
            >
              {!isLargerThan650 ? (
                <Heading as="h1" size="md" textAlign="center" mb={2} pt={2}>
                  {bookTitle !== null ? (
                      `${bookTitle} - ${bookAuthor}`
                  ) : (
                    bookClub ? (
                        `${bookClub} Book Club`
                    ) : (
                      generalType !== null ? (
                          `${generalType}`
                      ) : (
                        null
                      )
                    )
                  )}
                  </Heading>
                ) : null}
              <Box
                h="100%"
                overflow="auto"
                mb={2}
                bg="white"
                _dark={{
                  bg: "blackAlpha.500"
                }}
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
                  <Box p={1}>
                    {chatMessages?.map((message,i)=>{
                      return (
                        <Flex 
                          key={i} 
                          gap={0} 
                          m={1} 
                          align="flex-start"
                          direction="column"
                          fontSize={["sm","md","md"]}
                          // rounded="md"
                          // _hover={{
                          //   ".respond-box": {
                          //     display: "block"
                          //   },
                          //   bg: "black",
                          //   color: "white"
                          // }}
                        >
                          <Text
                            // as="span"
                            fontSize="xs"
                            mb={-1}
                          >
                            {` ${dayjs(message.time).local().format('MMM DD, YYYY h:mm a')}`}
                          </Text>
                          <Flex
                            align="flex-start"
                            gap={1}
                          >
                            {message.userName === "admin" ? (
                             <Text 
                              color="purple"
                              fontWeight="bold"
                             >
                              admin:
                            </Text>
                            )  : (
                              <Text
                                fontWeight="bold"
                              >
                                {message.userName}:
                              </Text>
                            )}
                            {message.spoiler ? (
                              <Accordion 
                                defaultIndex={[1]}
                                allowToggle
                              >
                                <AccordionItem 
                                  border={0}
                                  p={0}
                                  rounded="md"
                                >
                                  <AccordionButton px={1} py={1}>
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

                            {/* <Box
                              display="none"
                              className="respond-box"
                            >
                              <Button
                                size="xs"
                              >
                                Respond
                              </Button>
                            </Box> */}

                          </Flex>
                        </Flex>
                      )
                    })}
                  </Box>
                </>
              </Box>
              <Flex
                align="center" 
                justify="space-between"
                gap={1}
                px={1}
              >
                <InputGroup>
                  <Input
                    type="text"
                    ref={chatTextRef as any}
                    onKeyDown={e=> e.key === "Enter" ? submitChat() : null}
                    maxLength={50}
                    bg="white"
                    _dark={{
                      bg: "blackAlpha.500"
                    }}
                    disabled={!isConnected}
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
                            previewPosition="none"
                            theme={colorMode === 'dark' ? 'dark' : 'light'}
                            onEmojiSelect={(e: any)=>pickEmoji(e)} 
                          />
                        </PopoverContent>
                      </Portal>
                    </Popover>
                  </InputRightElement>
                </InputGroup>
                {chatError && (
                  <Text color="red" minW="125px" textAlign="center">
                    {chatError}
                  </Text>
                )}
                <IconButton
                  onClick={e=>submitChat()}
                  colorScheme={isConnected ? "teal" : "black"}
                  aria-label="submit"
                  icon={<FiSend/>}
                  disabled={!isConnected}
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
              height={isLargerThan650 ? "91vh" : "auto"}
              direction="column"
              bg="rgb(237, 242, 247)"
              _dark={{
                bg: "blackAlpha.200"
              }}
            >
              {isLargerThan650 ? (
                <>
                  <Heading 
                    as="h1" 
                    size="md" 
                    textAlign="center" 
                    mt={1}
                  >
                    {bookTitle !== null ? (
                        `${bookTitle} - ${bookAuthor}`
                    ) : (
                      bookClub ? (
                          `${bookClub} Book Club`
                      ) : (
                        generalType !== null ? (
                            `${generalType}`
                        ) : (
                          null
                        )
                      )
                    )}
                  </Heading>
                  <UsersBox/>
                </>
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
                <Flex
                  align="center"
                >
                  {isConnected ? (
                    <Button 
                      w="100%"
                      onClick={e=>disconnectSocket()}
                      aria-label="disconnect"
                      mt="auto"
                      mx={2}
                      id="disconnectRef"
                    >
                      Disconnect
                    </Button>
                    ) : (
                    <Button 
                      w="100%"
                      onClick={e=>connectSocket()}
                      mt="auto"
                      mx={2}
                      id="connectRef"
                      colorScheme="green"
                    >
                      Connect
                    </Button>
                  )}
                </Flex>
            </Flex>
          </Flex>
        </Skeleton>
      </Box>
    </>
  );
};

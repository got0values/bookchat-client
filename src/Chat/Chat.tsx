import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ActiveRoom } from "../types/types";
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
  Image,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  IconButton,
  Stack,
  useColorMode,
  useToast
} from "@chakra-ui/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {socket} from "./customSocket";
import axios from "axios";


export default function Chat({gbooksapi}: {gbooksapi: string}) {
  dayjs.extend(utc);
  const navigate = useNavigate();
  const {colorMode} = useColorMode();

  function disconnectSocket() {
    socket.disconnect();
  }

  const [activeRooms,setActiveRooms] = useState<ActiveRoom[]>([]);
  const [generalNumberOfPeople,setGeneralNumberOfPeople] = useState(0)
  const [recommendationsNumberOfPeople,setRecommendationsNumberOfPeople] = useState(0)
  useEffect(()=>{
    socket.connect()
    socket.on("receive-active-rooms",(rooms)=>{
      if (rooms.length) {
        setGeneralNumberOfPeople(rooms.filter((room:ActiveRoom)=>room.roomId === "General").length)
        setRecommendationsNumberOfPeople(rooms.filter((room:ActiveRoom)=>room.roomId === "Recommendations").length)
        setActiveRooms(prev=>{
          const roomsWithNumberOfUsers = rooms.map((room: ActiveRoom,i: number,arr: ActiveRoom[])=>{
            const numberOfUsers = arr.filter((r)=>r.roomId === room.roomId && r.typeOfRoom !== "generalType").length
            return {
              ...room,
              numberOfUsers: numberOfUsers
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

  const searchChatRoomRef = useRef({} as HTMLInputElement);
  const [chatSearchIsLoading,setChatSearchIsLoading] = useState(false);
  const [chatRoomResults,setChatRoomResults] = useState<any[] | null>(null);
  async function searchChatRoom() {
    setChatSearchIsLoading(true)
    await axios
      .get("https://www.googleapis.com/books/v1/volumes?q=" + searchChatRoomRef.current.value + "&key=" + gbooksapi)
      .then((response)=>{
        setChatRoomResults(response.data.items)
        setChatSearchIsLoading(false)
      })
      .catch((error)=>{
        console.log(error)
      })
  }

  return (
    <>
      <Box className="main-content-smaller">
        <Skeleton isLoaded={true}>
          <Tabs 
            variant="enclosed"
            p={2}
          >
            <TabList
              borderBottom="none"
            >
              <Tab 
                _selected={{
                  bg: colorMode === "light" ? "white" : "#121212",
                  border: colorMode === "light" ? "1px solid #e7e7e7" : "1px solid #2e2e2e",
                  borderBottom: "none"
                }}
              >
                Search
              </Tab>
              <Tab 
                _selected={{
                  bg: colorMode === "light" ? "white" : "#121212",
                  border: colorMode === "light" ? "1px solid #e7e7e7" : "1px solid #2e2e2e",
                  borderBottom: "none"
                }}
              >
                Browse
              </Tab>
            </TabList>

            <TabPanels
              bg="white"
              rounded="md"
              border="1px solid #e7e7e7"
              _dark={{
                bg: "#121212",
                border: "1px solid #2e2e2e"
              }}
              // minH="80vh"
            >

              <TabPanel>

                <Flex
                  direction="column"
                  gap={2}
                >
                  <Flex gap={1}>
                    <Input 
                      type="text"
                      ref={searchChatRoomRef}
                      placeholder="Search for a book chat room"
                      onKeyDown={e=>e.key === 'Enter' ? searchChatRoom() : null}
                    />
                    <Button
                      onClick={e=>searchChatRoom()}
                    >
                      Search
                    </Button>
                  </Flex>
                  {chatRoomResults ? (
                    <Flex
                      className="well"
                      wrap="wrap"
                      justify="space-between"
                      gap={3}
                    >
                      {chatRoomResults?.map((result,i)=>{
                        return (
                          <Flex
                            direction="column"
                            gap={1}
                            maxW="150px"
                            flex="1 1 50%"
                            key={i}
                          >
                            <Image 
                              w="100%"
                              h="auto"
                              m={1}
                              className="book-image"
                              onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                              src={result.volumeInfo.imageLinks ? result.volumeInfo.imageLinks.smallThumbnail : null}
                            />
                            <Text
                              size="sm"
                              fontStyle="italic"
                              textOverflow="wrap"
                            >
                              {result.volumeInfo.title ? result.volumeInfo.title : null}
                            </Text>
                            <Text
                              size="sm"
                              textOverflow="wrap"
                            >
                              {result.volumeInfo.authors ? result.volumeInfo.authors[0] : null}
                            </Text>
                            <Button
                              size="xs"
                              onClick={e=>navigate(`/chat/room?title=${result.volumeInfo.title ? result.volumeInfo.title : ""}&author=${result.volumeInfo.authors ? result.volumeInfo.authors[0] : ""}`)}
                            >
                              Chat
                            </Button>
                          </Flex>
                        )
                      })}
                    </Flex>
                  ) : null}
                </Flex>

              </TabPanel>
              <TabPanel>

                <Box
                  className="well"
                >
                  <Heading size="md" mb={2}>General</Heading>
                  <Flex
                    direction="column"
                    gap={2}
                  >
                    <Flex 
                      className="well-card"
                      justify="space-between"
                      _hover={{
                        cursor: "pointer"
                      }}
                      onClick={e=>navigate("/chat/room?generaltype=General")}
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        w="100%"
                        wrap="wrap"
                      >
                        <Heading
                          as="h3"
                          size="sm"
                        >
                          General
                        </Heading>
                        <Text>
                          {generalNumberOfPeople}
                        </Text>
                      </Flex>
                    </Flex>
                    <Flex 
                      className="well-card"
                      justify="space-between"
                      _hover={{
                        cursor: "pointer"
                      }}
                      onClick={e=>navigate("/chat/room?generaltype=Recommendations")}
                    >
                      <Flex
                        justify="space-between"
                        align="center"
                        w="100%"
                        wrap="wrap"
                      >
                        <Heading
                          as="h3"
                          size="sm"
                        >
                          Recommendations
                        </Heading>
                        <Text>
                          {recommendationsNumberOfPeople}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>

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
                        room.typeOfRoom !== "generalType" ? (
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
                        ) : null
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

              </TabPanel>

            </TabPanels>

          </Tabs>
        </Skeleton>
      </Box>

    </>
  );
};

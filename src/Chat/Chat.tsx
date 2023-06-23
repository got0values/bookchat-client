import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ActiveRoom } from "../types/types";
import { 
  Box,
  Heading,
  Flex,
  Text,
  Button,
  Skeleton,
  Input,
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
  Image,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  useColorMode
} from "@chakra-ui/react";
import { BsArrowRight } from 'react-icons/bs';
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
                fontWeight="bold"
                _selected={{
                  borderBottom: "2px solid gray"
                }}
              >
                Search
              </Tab>
              <Tab 
                fontWeight="bold"
                _selected={{
                  borderBottom: "2px solid gray"
                }}
              >
                Browse
              </Tab>
            </TabList>

            <TabPanels>

              <TabPanel px={0}>
                <Flex
                  direction="column"
                  gap={2}
                >
                  <Flex gap={1}>
                    <Input 
                      type="text"
                      size="lg"
                      ref={searchChatRoomRef}
                      placeholder="Search for a book chat room"
                      onKeyDown={e=>e.key === 'Enter' ? searchChatRoom() : null}
                      bg="white" 
                      _dark={{
                        bg: "whiteAlpha.50"
                      }}
                      borderColor="black"
                    />
                    <Button
                      onClick={e=>searchChatRoom()}
                      size="lg"
                      borderColor="black"
                      variant="outline"
                    >
                      Search
                    </Button>
                  </Flex>
                  {chatRoomResults ? (
                    <TableContainer>
                      <Table size='sm' colorScheme="facebook">
                        <Tbody>
                          {chatRoomResults?.map((result,i)=>{
                            return (
                              <Tr key={i}>
                                <Td fontStyle="italic" px={0} maxW="100px" overflow="hidden" textOverflow="ellipsis">
                                  {result.volumeInfo?.title}
                                </Td>
                                <Td px={0} textAlign="center">
                                  {result.volumeInfo.publishedDate ? dayjs(result.volumeInfo.publishedDate).format("YYYY") : null}
                                </Td>
                                <Td px={0} maxW="100px" overflow="hidden" textOverflow="ellipsis">
                                  {result.volumeInfo.authors ? result.volumeInfo.authors[0] : ""}
                                </Td>
                                <Td px={0}>
                                  <Button
                                    size="xs"
                                    onClick={e=>{
                                      navigate(`/chat/room?title=${result.volumeInfo.title}&author=${result.volumeInfo.authors ? result.volumeInfo.authors[0] : ""}`)
                                    }}
                                    backgroundColor="black"
                                    color="white"
                                  >
                                    <BsArrowRight/>
                                  </Button>
                                </Td>
                              </Tr>
                            )
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ): null}
                </Flex>

              </TabPanel>
              <TabPanel px={0}>

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

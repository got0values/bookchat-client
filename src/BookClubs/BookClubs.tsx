import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Box,
  Tag,
  Heading,
  Text,
  Image,
  Fade,
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
  useDisclosure,
  Avatar,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  CheckboxGroup,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  useColorMode
} from "@chakra-ui/react";
import { IoIosAdd } from 'react-icons/io';
import Cookies from "js-cookie";
import axios from "axios";
import { BookClubsType } from "../types/types";
import {genres} from "./genres";


export default function BookClubs({server}: {server: string}) {
  const toast = useToast();
  const navigate = useNavigate();
  const {colorMode} = useColorMode();

  const { 
    isOpen: isOpenCreateBookClubModal, 
    onOpen: onOpenCreateBookClubModal, 
    onClose: onCloseCreateBookClubModal 
  } = useDisclosure()

  function createBookClubModalOpen() {
    onOpenCreateBookClubModal();
  }

  const createBookClubNameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const [createBookClubError,setCreateBookClubError] = useState<string>("");
  async function createBookClub() {
    const createBookClubName = createBookClubNameRef.current.value;
    let tokenCookie: string | null = Cookies.get().token;
    const subdomain = window.location.hostname.split(".")[0];
    if (createBookClubName.length) {
      await axios
      .post(server + "/api/createbookclub", 
      {
        bookClubName: createBookClubName,
        subdomain: subdomain
      },
      {headers: {
        'authorization': tokenCookie
      }}
      )
      .then((response)=>{
        if (response.data.success){
          toast({
            description: "Book club created!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
          if (response.data.club) {
            navigate(`/bookclubs/${response.data.club.id}`);
          }
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data) {
          setCreateBookClubError(response.data.message)
        }
      })
    }
    else {
      setCreateBookClubError("Please enter a book club name")
    }
  }

  function closeCreateBookClubModal() {
    setCreateBookClubError("");
    onCloseCreateBookClubModal();
  }  

  const [bookClubsOwned,setBookClubsOwned] = useState([])
  const [bookClubsJoined,setBookClubsJoined] = useState([])
  const [bookClubsFriends,setBookClubsFriends] = useState([])
  const [bookClubsPublic,setBookClubsPublic] = useState([])
  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookClubsKey'], 
    queryFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        const bookClubsData = axios
          .get(server + "/api/getbookclubs",
            {
              headers: {
                'authorization': tokenCookie
              }
            }
          )
          .then((response)=>{
            const {data} = response;
            setBookClubsOwned(data.bookClubsOwned)
            setBookClubsJoined(data.bookClubsJoined)
            setBookClubsFriends(data.bookClubsFriends)
            setBookClubsPublic(data.bookClubsPublic)
            return response.data;
          })
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.error)
          })
        return bookClubsData
      }
      else {
        throw new Error("TC101")
      }
    }
  });
  const allBookClubsFriends = data?.bookClubsFriends;
  const allBookClubsPublic = data?.bookClubsPublic;

  function filterBookClubsByGroup(checkedValues: string[]) {
    if (!checkedValues.length) {
      setBookClubsFriends(allBookClubsFriends);
      setBookClubsPublic(allBookClubsPublic);
    }
    else {
      setBookClubsFriends(prev=>{
        return (
          allBookClubsFriends.filter((bcf: BookClubsType)=>{
            if (JSON.parse(bcf.groups).length) {
              return !checkedValues.some((cV)=>JSON.parse(bcf.groups).indexOf(cV) == -1)
            }
            else {
              return true;
            }
          })
        )
      })
      setBookClubsPublic(prev=>{
        return (
          allBookClubsPublic.filter((bcp: BookClubsType)=>{
            if(JSON.parse(bcp.groups).length) { //if not all genres
              return !checkedValues.some((cV)=>JSON.parse(bcp.groups).indexOf(cV) == -1)
            }
            else {
              return true;
            }
          })
        )
      })
    }
  }
  
  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={!isLoading}
      >
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
              My Book Clubs
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

              <Flex flexWrap="wrap">
                <Stack flex="1 1 30%" minW="200px">
                  <Box className="well">
                    <Flex align="center" flexWrap="wrap" justify="space-between" mb={2}>
                      <Heading as="h3" size="md">
                        My Book Clubs
                      </Heading>
                      <Button
                        variant="ghost"
                        onClick={createBookClubModalOpen}
                      >
                        <IoIosAdd size={25} /> New
                      </Button>
                    </Flex>
                    <Box>
                      {bookClubsOwned ? (
                        (bookClubsOwned as BookClubsType[]).map((bookClub, i)=>{
                          return (
                            <Box 
                              className="well-card"
                              mx={0}
                              onClick={e=>navigate(`/bookclubs/${bookClub.id}`)}
                              _hover={{
                                cursor: "pointer"
                              }}
                              key={i}
                            >
                              <Heading as="h4" size="sm" noOfLines={1}>
                                {bookClub.name}
                              </Heading>
                              <Text>
                                  {bookClub.about}
                              </Text>
                            </Box>
                          )
                        })
                      ) : null}
                    </Box>
                  </Box>
                </Stack>
                <Stack flex="1 1 65%" maxW="100%">
                  <Box className="well">
                    <Flex align="center" justify="space-between" gap={2} mb={2}>
                      <Heading as="h3" size="md">
                        Joined
                      </Heading>
                    </Flex>

                    <Box>
                      {bookClubsJoined && bookClubsJoined.length ? (
                        (bookClubsJoined as BookClubsType[]).map((bookClub, i)=>{
                          return (
                            <Flex 
                              className="well-card"
                              direction="column"
                              justify="space-between"
                              minH="110px"
                              mx={0}
                              _hover={{
                                bg: "gray.200",
                                cursor: "pointer"
                              }}
                              overflowX="auto"
                              onClick={e=>navigate(`/bookclubs/${bookClub.id}`)}
                              key={i}
                            >
                              <Flex
                                align="start" 
                                justify="space-between" 
                                wrap="wrap"
                                rowGap={2}
                              >
                                <Flex direction="column" gap={1}>
                                  <Heading as="h4" size="sm" noOfLines={1}>
                                    {bookClub.name}
                                  </Heading>
                                  {bookClub.BookClubBook[0] ? (
                                  <Flex gap={2}>
                                    <Box>
                                      <Image 
                                        src={bookClub.BookClubBook[0].image}
                                        alt={bookClub.BookClubBook[0].title}
                                        maxH="50px"
                                      />
                                    </Box>
                                    <Box>
                                      <Text fontStyle="italic">{bookClub.BookClubBook[0].title}</Text>
                                      <Text>{bookClub.BookClubBook[0].author}</Text>
                                    </Box>
                                  </Flex>
                                  ) : null}
                                </Flex>
                                <Flex align="center" gap={1} marginLeft="auto">
                                  <Avatar
                                    size="xs"
                                    cursor="pointer"
                                    src={`${bookClub.Profile.profile_photo}?x=${new Date().getTime()}`}
                                    border="2px solid gray"
                                    title={`${bookClub.Profile.username}`}
                                  />
                                  <Text fontWeight="bold">
                                    {bookClub.Profile.username}
                                  </Text>
                                </Flex>
                              </Flex>
                              <Text>
                                  {bookClub.about}
                              </Text>
                            </Flex>
                          )
                        })
                      ) : (
                        <Text>You are not a member of any book clubs at the moment.</Text>
                      )}
                    </Box>
                  </Box>
                </Stack>
              </Flex>

            </TabPanel>
            <TabPanel>

              <Flex flexWrap="wrap">
                <Stack flex="1 1 30%" minW="200px">
                  <Box className="well">
                    <Heading as="h3" size="md" mb={2}>
                      Filter
                    </Heading>
                    <Accordion
                      className="well-card"
                      p={0}
                      defaultIndex={[1]} 
                      allowMultiple
                    >
                      <AccordionItem
                        border={0}
                      >
                        <Flex as={AccordionButton} justify="flex-end">
                          <AccordionIcon/>
                        </Flex>
                        <AccordionPanel>
                          <Flex 
                              flexWrap="wrap"
                            >
                              <CheckboxGroup 
                                onChange={e=>filterBookClubsByGroup(e as string[])}
                              >
                                <Flex
                                  direction="column"
                                  wrap="wrap"
                                  gap={1}
                                >
                                  {genres.map((genre,i)=>{
                                    return (
                                      <Checkbox 
                                        value={genre.value}
                                        key={i}
                                      >
                                        <Text fontSize="xs">{genre.name}</Text>
                                      </Checkbox>
                                        )
                                  })}
                                </Flex>
                              </CheckboxGroup>
                            </Flex>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>

                  </Box>
                </Stack>
                <Stack flex="1 1 65%" maxW="100%">
                  <Box className="well">
                    <Flex align="center" justify="space-between" gap={2} mb={2}>
                      <Heading as="h3" size="md">
                        Friends
                      </Heading>
                    </Flex>
                    <Box>
                      {bookClubsFriends && bookClubsFriends.length ? (
                        (bookClubsFriends as BookClubsType[]).map((bookClub,i)=>{
                          return (
                            <Fade in={true} key={i}>
                              <Flex 
                                className="well-card"
                                direction="column"
                                justify="space-between"
                                minH="125px"
                                mx={0}
                                _hover={{
                                  bg: "gray.200",
                                  cursor: "pointer"
                                }}
                                overflowX="auto"
                                onClick={e=>navigate(`/bookclubs/${bookClub.id}`)}
                              >
                                <Flex 
                                  align="start" 
                                  justify="space-between" 
                                  wrap="wrap"
                                  rowGap={2}
                                >
                                  <Flex direction="column" gap={1}>
                                    <Heading as="h4" size="sm" noOfLines={1}>
                                      {bookClub.name}
                                    </Heading>
                                    {bookClub.BookClubBook[0] ? (
                                    <Flex gap={2}>
                                      <Box>
                                        <Image 
                                          src={bookClub.BookClubBook[0].image}
                                          alt={bookClub.BookClubBook[0].title}
                                          maxH="50px"
                                        />
                                      </Box>
                                      <Box>
                                        <Text fontStyle="italic">{bookClub.BookClubBook[0].title}</Text>
                                        <Text>{bookClub.BookClubBook[0].author}</Text>
                                      </Box>
                                    </Flex>
                                    ) : null}
                                  </Flex>
                                  <Flex align="center" gap={1} marginLeft="auto">
                                    <Avatar
                                      size="xs"
                                      cursor="pointer"
                                      src={`${bookClub.Profile.profile_photo}?x=${new Date().getTime()}`}
                                      border="2px solid gray"
                                      title={`${bookClub.Profile.username}`}
                                    />
                                      <Text fontWeight="bold">
                                        {bookClub.Profile.username}
                                      </Text>
                                  </Flex>
                                </Flex>
                                <Flex align="center" justify="space-between" flexWrap="wrap">
                                  <Text>
                                    {bookClub.about}
                                  </Text>
                                  <Flex align="center" flexWrap="wrap" gap={1}>
                                    {JSON.parse(bookClub.groups).length ? (
                                      JSON.parse(bookClub.groups).map((group: string, i: number, array: any[])=>{
                                        const cScheme = genres.filter((genre)=>genre.value === group)[0].color;
                                        const genreName = genres.filter((genre)=>genre.value === group)[0].name;
                                        if (i < 3) {
                                          return (
                                            <Tag 
                                              colorScheme={cScheme}
                                              size="sm"
                                              fontWeight="bold"
                                              key={i}
                                            >
                                              {genreName}
                                            </Tag>
                                          )
                                        }
                                        else if (i === array.length - 1) {
                                          return (
                                            <Tag
                                              size="sm"
                                              fontWeight="bold"
                                              key={i}
                                            >
                                              {`+${(array.length - 3).toString()} more`}
                                            </Tag>
                                          )
                                        }
                                      })
                                    ) : (
                                      <Tag
                                        colorScheme="yellow"
                                        size="sm"
                                        fontWeight="bold"
                                      >
                                        All genres
                                      </Tag>
                                    )}
                                  </Flex>
                                </Flex>
                              </Flex>
                            </Fade>
                          )
                        })
                      ) : null}
                    </Box>
                  </Box>

                  <Box className="well">
                  <Flex align="center" justify="space-between" gap={2} mb={2}>
                    <Heading as="h3" size="md">
                      Public
                    </Heading>
                  </Flex>

                  <Box>
                    {bookClubsPublic && bookClubsPublic.length ? (
                      (bookClubsPublic as BookClubsType[]).map((bookClub, i)=>{
                        return (
                          <Fade in={true} key={i}>
                            <Flex 
                              className="well-card"
                              direction="column"
                              justify="space-between"
                              mx={0}
                              _hover={{
                                bg: "gray.200",
                                cursor: "pointer"
                              }}
                              overflowX="auto"
                              onClick={e=>navigate(`/bookclubs/${bookClub.id}`)}
                              minH="125px"
                              key={i}
                            >
                              <Flex
                                align="start" 
                                justify="space-between" 
                                wrap="wrap"
                                rowGap={2}
                              >
                                <Flex direction="column" gap={1}>
                                  <Heading as="h4" size="sm" noOfLines={1}>
                                    {bookClub.name}
                                  </Heading>
                                  {bookClub.BookClubBook[0] ? (
                                  <Flex gap={2}>
                                    <Box>
                                      <Image 
                                        src={bookClub.BookClubBook[0].image}
                                        alt={bookClub.BookClubBook[0].title}
                                        maxH="50px"
                                      />
                                    </Box>
                                    <Box>
                                      <Text fontStyle="italic">{bookClub.BookClubBook[0].title}</Text>
                                      <Text>{bookClub.BookClubBook[0].author}</Text>
                                    </Box>
                                  </Flex>
                                  ) : null}
                                </Flex>
                                <Flex align="center" gap={1} marginLeft="auto">
                                  <Avatar 
                                    size="xs"
                                    cursor="pointer"
                                    src={`${bookClub.Profile.profile_photo}?x=${new Date().getTime()}`}
                                    border="2px solid gray"
                                    title={`${bookClub.Profile.username}`}
                                  />
                                  <Text fontWeight="bold">
                                    {bookClub.Profile.username}
                                  </Text>
                                </Flex>
                              </Flex>
                              <Flex align="center" justify="space-between" flexWrap="wrap">
                                <Text>
                                  {bookClub.about}
                                </Text>
                                <Flex align="center" flexWrap="wrap" gap={1}>
                                  {JSON.parse(bookClub.groups).length ? (
                                    JSON.parse(bookClub.groups).map((group: string, i: number, array: any[])=>{
                                      const cScheme = genres.filter((genre)=>genre.value === group)[0].color;
                                      const genreName = genres.filter((genre)=>genre.value === group)[0].name;
                                      if (i < 3) {
                                        return (
                                          <Tag 
                                            colorScheme={cScheme}
                                            size="sm"
                                            fontWeight="bold"
                                            key={i}
                                          >
                                            {genreName}
                                          </Tag>
                                        )
                                      }
                                      else if (i === array.length - 1) {
                                        return (
                                          <Tag
                                            size="sm"
                                            fontWeight="bold"
                                            key={i}
                                          >
                                            {`+${(array.length - 3).toString()} more`}
                                          </Tag>
                                        )
                                      }
                                    })
                                  ) : (
                                    <Tag
                                      colorScheme="yellow"
                                      size="sm"
                                      fontWeight="bold"
                                    >
                                      All genres
                                    </Tag>
                                  )}
                                </Flex>
                              </Flex>
                            </Flex>
                          </Fade>
                        )
                      })
                    ) : (
                      <Text>There are no public book clubs at this time.</Text>
                    )}
                  </Box>
                </Box>
                </Stack>
              </Flex>

            </TabPanel>

          </TabPanels>

        </Tabs>

        <Modal isOpen={isOpenCreateBookClubModal} onClose={closeCreateBookClubModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Heading as="h3" size="lg">
                What is your book club name?
              </Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
              type="text"
              ref={createBookClubNameRef}
              maxLength={100}
              required
              />
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Text color="red">
                  {createBookClubError}
                </Text>
                <Button 
                  variant='ghost' 
                  mr={3}
                  size="lg"
                  onClick={createBookClub}
                >
                  Create
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Skeleton>
    </Box>
  );
};

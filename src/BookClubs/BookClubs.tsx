import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
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
  Radio,
  RadioGroup,
  Divider,
  HTMLChakraComponents
} from "@chakra-ui/react";
import { IoIosAdd } from 'react-icons/io';
import { FaBookReader } from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';
import Cookies from "js-cookie";
import axios from "axios";
import { BookClubsType } from "../types/types";
import {genres} from "./genres";


export default function BookClubs({server}: {server: string}) {
  const toast = useToast();
  const navigate = useNavigate();

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

  function filterBookClubsByGroup(e: React.HTMLInputTypeAttribute) {
    setBookClubsFriends(allBookClubsFriends);
    setBookClubsFriends(prev=>prev.filter((bcf: BookClubsType)=>bcf.groups.includes(e)))
    setBookClubsPublic(allBookClubsPublic)
    setBookClubsPublic(prev=>prev.filter((bcp: BookClubsType)=>bcp.groups.includes(e)))
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
                        onClick={e=>navigate(`/bookclubs/${bookClub.id}`)}
                        _hover={{
                          cursor: "pointer"
                        }}
                        key={i}
                      >
                        <Heading as="h4" size="sm">
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
          <Stack flex="1 1 65%">
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
                      <Box 
                        className="well-card"
                        _hover={{
                          bg: "gray.200",
                          cursor: "pointer"
                        }}
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
                            <Heading as="h4" size="sm">
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
                          <Flex align="center" gap={1}>
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
                      </Box>
                    )
                  })
                ) : (
                  <Text>You are not a member of any book clubs at the moment.</Text>
                )}
              </Box>
            </Box>
          </Stack>
        </Flex>
        <Flex flexWrap="wrap">
          <Stack flex="1 1 30%" minW="200px">
            <Box className="well">
              <Heading as="h3" size="md">
                Filter
              </Heading>
              <Flex 
                flexWrap="wrap"
              >
                <RadioGroup 
                  onChange={e=>filterBookClubsByGroup(e)}
                >
                  <Flex
                    direction="column"
                    wrap="wrap"
                    p={2}
                    gap={1}
                  >
                    <Radio 
                      value=''
                    >
                      <Text fontSize="xs">All</Text>
                    </Radio>
                    {genres.map((genre,i)=>{
                      return (
                        <Radio 
                          value={genre.value}
                          key={i}
                        >
                          <Text fontSize="xs">{genre.name}</Text>
                        </Radio>
                          )
                    })}
                  </Flex>
                </RadioGroup>
              </Flex>
            </Box>
          </Stack>
          <Stack flex="1 1 65%">
            <Box className="well">
              <Flex align="center" justify="space-between" gap={2} mb={2}>
                <Heading as="h3" size="md">
                  Friends
                </Heading>
              </Flex>
              <Box>
                {bookClubsFriends && bookClubsFriends.length? (
                  (bookClubsFriends as BookClubsType[]).map((bookClub,i)=>{
                    return (
                      <Fade in={true} key={i}>
                        <Box 
                          className="well-card"
                          _hover={{
                            bg: "gray.200",
                            cursor: "pointer"
                          }}
                          onClick={e=>navigate(`/bookclubs/${bookClub.id}`)}
                        >
                          <Flex 
                            align="start" 
                            justify="space-between" 
                            wrap="wrap"
                            rowGap={2}
                          >
                            <Flex direction="column" gap={1}>
                              <Heading as="h4" size="sm">
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
                            <Flex align="center" gap={1}>
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
                            <Flex align="center" flexWrap="wrap">
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
                        </Box>
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
                      <Box 
                        className="well-card"
                        _hover={{
                          bg: "gray.200",
                          cursor: "pointer"
                        }}
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
                            <Heading as="h4" size="sm">
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
                          <Flex align="center" gap={1}>
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
                      </Box>
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

import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Box,
  Heading,
  Text,
  Spinner,
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
  HTMLChakraComponents
} from "@chakra-ui/react";
import { IoIosAdd } from 'react-icons/io';
import { FaBookReader } from 'react-icons/fa';
import Cookies from "js-cookie";
import axios from "axios";
import { BookClubsType } from "../types/types";


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

  async function getBookClubs() {
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
          console.log(response.data)
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

  const [friendsBookClubsValue,setFriendsBookClubsValue] = useState("all");
  const [publicBookClubsValue,setPublicBookClubsValue] = useState("all");

  const { isLoading, isError, data, error } = useQuery({ queryKey: ['bookClubsKey'], queryFn: getBookClubs });
  const bookClubsOwned = data?.bookClubsOwned;
  const bookClubsJoined = data?.bookClubsJoined;
  const bookClubsPublic = data?.bookClubsPublic;
  const bookClubsFriends = data?.bookClubsFriends;
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
          <Stack flex="1 1 65%">
            <Box className="well">
              <Flex align="center" flexWrap="wrap" justify="space-between" mb={2}>
                <Flex align="center" justify="space-between" gap={2}>
                  <FaBookReader size={25} />
                  <Heading as="h3" size="md">
                    My Book Clubs
                  </Heading>
                </Flex>
                <Button
                  variant="ghost"
                  leftIcon={<IoIosAdd size={25} />}
                  onClick={createBookClubModalOpen}
                >
                  Create a book club
                </Button>
              </Flex>

              <Box>
                {bookClubsOwned ? (
                  (bookClubsOwned as BookClubsType[]).map((bookClub, i)=>{
                    return (
                      <Box 
                        p={5} 
                        bg="gray.100" 
                        m={2} 
                        rounded="md"
                        _dark={{
                          bg: "gray.600"
                        }}
                        key={i}
                      >
                        <Link to={`/bookclubs/${bookClub.id}`}>
                          <Heading as="h4" size="sm">
                            {bookClub.name}
                          </Heading>
                        </Link>
                        <Text>
                            {bookClub.about}
                        </Text>
                      </Box>
                    )
                  })
                ) : null}
              </Box>
            </Box>

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
                        p={5} 
                        bg="gray.100" 
                        m={2} 
                        rounded="md"
                        _dark={{
                          bg: "gray.600"
                        }}
                        _hover={{
                          bg: "gray.200"
                        }}
                        key={i}
                      >
                        <Flex align="center" justify="space-between" wrap="wrap">
                          <Link to={`/bookclubs/${bookClub.id}`}>
                            <Heading as="h4" size="sm">
                              {bookClub.name}
                            </Heading>
                          </Link>
                          <Flex align="center" gap={1}>
                            <Avatar
                              onClick={e=>navigate(`/profile/${bookClub.Profile.username}`)} 
                              size="xs"
                              cursor="pointer"
                              src={`${bookClub.Profile.profile_photo}?x=${new Date().getTime()}`}
                              border="2px solid gray"
                            />
                            <Link to={`/profile/${bookClub.Profile.username}`}>
                              @{bookClub.Profile.username}
                            </Link>
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

            <Box className="well">
              <Flex align="center" justify="space-between" gap={2} mb={2}>
                <Heading as="h3" size="md">
                  Friend's
                </Heading>
              </Flex>
              <Box>
              <Flex justify="center">
                <RadioGroup onChange={e=>setFriendsBookClubsValue(prev=>e)} value={friendsBookClubsValue}>
                  <Stack direction='row'>
                    <Radio value='all'>All</Radio>
                    <Radio value='1-4'>1st-4th</Radio>
                    <Radio value='5-8'>5th-8th</Radio>
                    <Radio value='9-12'>9th-12th</Radio>
                    <Radio value='adult'>Adult</Radio>
                  </Stack>
                </RadioGroup>
              </Flex>
                {bookClubsFriends && bookClubsFriends.length? (
                  (bookClubsFriends as BookClubsType[]).map((bookClub,i)=>{
                    return (
                      <Box 
                        p={5} 
                        bg="gray.100"
                        m={2} 
                        rounded="md"
                        _dark={{
                          bg: "gray.600"
                        }}
                        _hover={{
                          bg: "gray.200"
                        }}
                        key={i}
                      >
                        <Flex align="center" justify="space-between" wrap="wrap">
                          <Link to={`/bookclubs/${bookClub.id}`}>
                            <Heading as="h4" size="sm">
                              {bookClub.name}
                            </Heading>
                          </Link>
                          <Flex align="center" gap={1}>
                            <Avatar
                              onClick={e=>navigate(`/profile/${bookClub.Profile.username}`)} 
                              size="xs"
                              cursor="pointer"
                              src={`${bookClub.Profile.profile_photo}?x=${new Date().getTime()}`}
                              border="2px solid gray"
                            />
                            <Link to={`/profile/${bookClub.Profile.username}`}>
                              @{bookClub.Profile.username}
                            </Link>
                          </Flex>
                        </Flex>
                        <Text>
                          {bookClub.about}
                        </Text>
                      </Box>
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
                <Flex justify="center">
                  <RadioGroup onChange={e=>setPublicBookClubsValue(prev=>e)} value={publicBookClubsValue}>
                    <Stack direction='row'>
                      <Radio value='all'>All</Radio>
                      <Radio value='1-4'>1st-4th</Radio>
                      <Radio value='5-8'>5th-8th</Radio>
                      <Radio value='9-12'>9th-12th</Radio>
                      <Radio value='adult'>Adult</Radio>
                    </Stack>
                  </RadioGroup>
                </Flex>
                {bookClubsPublic && bookClubsPublic.length ? (
                  (bookClubsPublic as BookClubsType[]).map((bookClub, i)=>{
                    return (
                      <Box 
                        p={5} 
                        bg="gray.100"
                        m={2} 
                        rounded="md"
                        _dark={{
                          bg: "gray.600"
                        }}
                        _hover={{
                          bg: "gray.200"
                        }}
                        key={i}
                      >
                        <Flex align="center" justify="space-between" wrap="wrap">
                          <Link to={`/bookclubs/${bookClub.id}`}>
                            <Heading as="h4" size="sm">
                              {bookClub.name}
                            </Heading>
                          </Link>
                          <Flex align="center" gap={1}>
                            <Avatar
                              onClick={e=>navigate(`/profile/${bookClub.Profile.username}`)} 
                              size="xs"
                              cursor="pointer"
                              src={`${bookClub.Profile.profile_photo}?x=${new Date().getTime()}`}
                              border="2px solid gray"
                            />
                            <Link to={`/profile/${bookClub.Profile.username}`}>
                              @{bookClub.Profile.username}
                            </Link>
                          </Flex>
                        </Flex>
                        <Text>
                          {bookClub.about}
                        </Text>
                      </Box>
                    )
                  })
                ) : (
                  <Text>There are no public book clubs at this time.</Text>
                )}
              </Box>
            </Box>
          </Stack>

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

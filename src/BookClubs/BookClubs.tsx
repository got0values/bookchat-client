import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Box,
  Heading,
  Text,
  Avatar,
  AvatarGroup,
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
  useDisclosure
} from "@chakra-ui/react";
import { IoIosAdd } from 'react-icons/io';
import { MdGroups } from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";
import { BookClubsType } from "../types/types";


export default function BookClubs({server}: {server: string}) {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading,setIsLoading] = useState<boolean>(true);
  const [bookClubsError,setBookClubsError] = useState<string | null>(null);
  const [bookClubs,setBookClubs] = useState<BookClubsType[] | null>(null);

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
    setIsLoading(true)
    if (tokenCookie) {
      axios
      .get(server + "/api/getbookclubs",
        {
          headers: {
            'authorization': tokenCookie
          }
        }
      )
      .then((response)=>{
        if (response.data.success) {
          setBookClubs(response.data.bookClubs)
        }
        setIsLoading(false);
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data?.error) {
          setBookClubsError(response.data.error)
        }
      })
    }
    else {
      setBookClubsError("An error has occured")
    }
  }

  useEffect(()=>{
    getBookClubs();
    return()=>{
      setIsLoading(false)
      setBookClubs(null);
    }
  },[])

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
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={!isLoading}
      >
        {bookClubsError ? bookClubsError : (
          <>
            <Flex flexWrap="wrap" w="100%" align="start" justify="space-between">

              <Stack flex="1 1 30%">
                <Box className="well">

                </Box>
              </Stack>

              <Stack flex="1 1 65%">
                <Box className="well">
                  <Flex align="center" flexWrap="wrap" justify="space-between" mb={2}>
                    <Flex align="center" justify="space-between" gap={2}>
                      <MdGroups size={30} />
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
                    {bookClubs ? (
                      bookClubs.map((bookClub, i)=>{
                        return (
                          <Link to={`/bookclubs/${bookClub.id}`} key={i}>
                            <Box p={5} bg="gray.600" m={2} rounded="md">
                              <Heading as="h4" size="sm">
                                {bookClub.name}
                              </Heading>
                            </Box>
                          </Link>
                        )
                      })
                    ) : null}
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
          </>
        )}
        

      </Skeleton>
    </Box>
  );
};

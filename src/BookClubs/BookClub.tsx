import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookClubGeneralCommentsType, BookClubMember } from "../types/types";
import { BookClubsType } from '../types/types';
import { 
  Box,
  Heading,
  Text,
  Avatar,
  AvatarGroup,
  Button,
  Stack,
  HStack,
  Flex,
  Skeleton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Input
} from "@chakra-ui/react";
import { BookClubGeneralComments } from "../shared/BookClubGeneralComments";
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";


export default function BookClub({server}: {server: string}) {
  const toast = useToast();
  const navigate = useNavigate();
  const { paramsBookClubId } = useParams();
  const { user } = useAuth();
  const [bookClubError,setBookClubError] = useState<string | null>(null);
  const [bookClub,setBookClub] = useState<BookClubsType | null>(null);
  const [isBookClubCreator,setIsBookClubCreator] = useState<boolean>(false);
  //non-member: 0, requesting: 1, member: 2
  const [memberStatus,setMemberStatus] = useState<number>(0);
  const [isLoading,setIsLoading] = useState<boolean>(true);

  function getBookClub() {
    let tokenCookie: string | null = Cookies.get().token;
    setIsLoading(true);
    if (tokenCookie) {
      axios
      .get(server + "/api/getbookclub?bookclubid=" + paramsBookClubId,
        {
          headers: {
            authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        console.log(response)
        if (response.data.success) {
          const responseBookClub = response.data.message
          setBookClub(responseBookClub)
          if (responseBookClub.creator === user.Profile.id) {
            setIsBookClubCreator(true);
          }
          else {
            setIsBookClubCreator(false);
          }
          if (responseBookClub.BookClubMembers.filter((member: BookClubMember)=>member.Profile.id === user.Profile?.id).length) {
            setMemberStatus(responseBookClub.BookClubMembers.filter((member: BookClubMember)=>member.Profile.id === user.Profile?.id)[0].status)
          }
          else {
            setMemberStatus(0)
          }
          setIsLoading(false);
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data?.message) {
          setBookClubError(response.data?.message)
        }
      })
      setIsLoading(false);
    }
    else {
      setBookClubError("An error has occured")
    }
  }

  useEffect(()=>{
    getBookClub()
    
    return ()=>{
      setBookClub(null)
    }
  },[])

  const { 
    isOpen: isOpenEditModal, 
    onOpen: onOpenEditModal, 
    onClose: onClosEditModal 
  } = useDisclosure()

  function openEditModal() {
    console.log(bookClub)
    onOpenEditModal()
  }

  function closeEditModal() {
    setUpdateError("")
    onClosEditModal()
  }

  const [updateError,setUpdateError] = useState<string>("");
  const idRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const nameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const aboutRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  async function updateBookClub(e: React.FormEvent) {
    e.preventDefault();
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      axios
      .put(server + "/api/updatebookclub",
        {
          bookClubId: parseInt(idRef.current.value),
          bookClubName: nameRef.current.value,
          bookClubAbout: aboutRef.current.value
        },
        {
          headers: {
            authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        console.log(response)
        if (response.data.success) {
          getBookClub();
          onClosEditModal();
        }
        else {
          setUpdateError(response.data.message)
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data?.message) {
          setUpdateError(response.data?.message)
        }
      })
    }
    else {
      setUpdateError("An error has occured")
    }
  }

  function joinBookClub(e: React.FormEvent) {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      axios
      .post(server + "/api/joinbookclub",
        {
          bookClubId: parseInt((e.target as HTMLButtonElement).value)
        },
        {
          headers: {
            authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        if (response.data.success) {
          getBookClub();
        }
      })
      .catch(({response})=>{
        console.log(response)
      })
    }
  }

  function unJoinBookClub(e: React.FormEvent) {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      axios
      .delete(server + "/api/unjoinbookclub",
        {
          headers: {
            authorization: tokenCookie
          },
          data: {
            bookClubId: parseInt((e.target as HTMLButtonElement).value)
          }
        }
      )
      .then((response)=>{
        if (response.data.success) {
          getBookClub();
        }
      })
      .catch(({response})=>{
        console.log(response)
      })
    }
  }
  
  return (
    <>
      <Box className="main-content">
        <Skeleton 
          isLoaded={!isLoading}
        >
          {bookClubError ? (
            <Heading as="h2" size="2xl" >bookClubError</Heading>
            ) : (
            bookClub ? (
              <Flex flexWrap="wrap" w="100%" align="start" justify="space-between">
                <Stack flex="1 1 30%" top="0">
                  <Flex className="well" direction="column" align="center" gap={3}>
                    <Heading as="h4" size="md">{bookClub.name}</Heading>
                    <Stack gap={2}>
                      <Text>{bookClub.about}</Text>
                    </Stack>
                    {isBookClubCreator ? (
                      <Flex>
                        <Button
                          onClick={openEditModal}
                        >
                          Edit
                        </Button>
                      </Flex>
                    ): null}
                  </Flex>
                  <Box className="well">
                    <Flex align="center" justify="space-between">
                      <Heading as="h4" size="sm">Members</Heading>
                      {memberStatus > 0 ? (
                        memberStatus === 1 ? (
                          <Button 
                            size="xs"
                            value={bookClub.id}
                            onClick={e=>unJoinBookClub(e)}
                          >
                            Cancel Request
                          </Button>
                        ) : memberStatus === 2 ? (
                          <Button 
                            size="xs"
                            value={bookClub.id}
                            onClick={e=>unJoinBookClub(e)}
                          >
                            Unjoin
                          </Button>
                        ) : null
                      ) : (
                      <Button 
                        size="xs"
                        value={bookClub.id}
                        onClick={e=>joinBookClub(e)}
                      >
                        Join
                      </Button>
                      )}
                    </Flex>
                    <Box>
                      {bookClub.BookClubMembers.length ? bookClub.BookClubMembers.map((member,i)=>{
                        return (
                          member.status === 2 ? (
                            <Text key={i}>
                              {member.Profile.username}
                            </Text>
                          ) : null
                        )
                      }) : null}
                    </Box>
                  </Box>
                </Stack>

                <Stack flex="1 1 65%" maxW="100%">
                  {memberStatus === 2 ? (
                    <>
                      <Box className="well">
                        <Heading as="h4" size="sm">Currently Reading</Heading>
                      </Box>

                      <Box className="well">
                        <Heading as="h4" size="sm">Next Meeting</Heading>
                      </Box>

                      <Box className="well">
                        <Heading as="h4" size="sm" mb={2}>General Discussion</Heading>
                        <BookClubGeneralComments 
                          server={server}
                          bookClubId={paramsBookClubId}
                          subdomain={window.location.host.split(".")[0]}
                          uri={window.location.pathname}
                        />
                      </Box>
                    </>
                  ) : (
                    <Box className="well" textAlign="center">
                      <Heading as="h2" size="md">
                        Please join to see book club content
                      </Heading>
                    </Box>
                  )}
                  
                </Stack>

              </Flex>
            ) : null
          )}
        </Skeleton>
      </Box>
      
      <Modal isOpen={isOpenEditModal} onClose={closeEditModal} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>
            Edit Book Club
          </ModalHeader>
          <ModalCloseButton />
            <Flex as="form" direction="column" w="100%" onSubmit={e=>updateBookClub(e)}>
              <ModalBody>
                <Input
                  type="hidden"
                  value={bookClub?.id}
                  ref={idRef}
                />
                <Box mb={2}>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input
                    type="text"
                    id="name"
                    ref={nameRef}
                    defaultValue={bookClub?.name}
                    required
                  />
                  <FormErrorMessage>Name is required</FormErrorMessage>
                </Box>
                <FormLabel htmlFor="about">About</FormLabel>
                <Textarea
                  ref={aboutRef}
                  id="about"
                  defaultValue={bookClub?.about}
                />
              </ModalBody>
              <ModalFooter flexDirection="column">
                <Text color="red">
                  {updateError}
                </Text>
                <Flex align="center" justify="flex-end">
                  <Button 
                    type="submit"
                    mr={3}
                    size="md"
                  >
                    Update
                  </Button>
                </Flex>
              </ModalFooter>
            </Flex>
        </ModalContent>
      </Modal>
    </>
  );
};

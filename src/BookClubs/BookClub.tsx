import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookClubMember, BookClubsType } from "../types/types";
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
  Switch,
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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { HiOutlinePencil } from 'react-icons/hi';
import { BookClubGeneralComments } from "../shared/BookClubGeneralComments";
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";


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
  dayjs.extend(utc)

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
    onOpenEditModal()
  }

  function closeEditModal() {
    setUpdateError("")
    onClosEditModal()
  }

  const [switchVisibility,setSwitchVisibility] = useState(false);
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
          bookClubAbout: aboutRef.current.value,
          bookClubVisibility: switchVisibility === true ? 1 : 0
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
          closeEditModal();
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

  const { 
    isOpen: isOpenMeetingModal, 
    onOpen: onOpenMeetingModal, 
    onClose: onClosMeetingModal 
  } = useDisclosure()

  function openMeetingModal() {
    onOpenMeetingModal()
  }

  function closeMeetingModal() {
    setUpdateError("")
    onClosMeetingModal()
  }

  const meetingLocationRef = useRef({} as ReactQuill);
  const meetingStartRef = useRef({} as HTMLInputElement);
  const meetingEndRef = useRef({} as HTMLInputElement);
  function updateBookClubMeeting(e: React.FormEvent) {
    e.preventDefault();
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      axios
      .put(server + "/api/updatebookclubmeeting",
        {
          bookClubId: bookClub?.id,
          bookClubMeetingLocation: meetingLocationRef.current.value,
          bookClubMeetingStart: dayjs(meetingStartRef.current.value).utc(),
          bookClubMeetingEnd: dayjs(meetingEndRef.current.value).utc()
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
          closeMeetingModal();
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
                    <Text>{bookClub.about}</Text>
                    <Text fontStyle="italic">
                      {bookClub.visibility === 0 ? "private (friends only)" : "public"}
                    </Text>
                    {isBookClubCreator ? (
                      <Flex>
                        <Button
                          onClick={openEditModal}
                          leftIcon={<HiOutlinePencil/>}
                        >
                          Edit
                        </Button>
                      </Flex>
                    ): null}
                  </Flex>
                  <Box className="well">
                    <Flex align="center" justify="space-between">
                      <Heading as="h4" size="sm">Members</Heading>
                      {isBookClubCreator ? null : (
                        memberStatus > 0 ? (
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
                        )
                      )}
                    </Flex>
                    <Box>
                      {bookClub.BookClubMembers.length ? bookClub.BookClubMembers.map((member,i)=>{
                        return (
                          member.status === 2 ? (
                            <Flex key={i} align="center" justify="space-between">
                              <Text>
                                {member.Profile.username}
                              </Text>
                              {isBookClubCreator ? (
                                <Button size="xs" variant="ghost">Remove</Button>
                              ) : null}
                            </Flex>
                          ) : null
                        )
                      }) : null}
                    </Box>
                  </Box>
                </Stack>

                <Stack flex="1 1 65%" maxW="100%">
                  {memberStatus === 2 || isBookClubCreator ? (
                    <>
                      <Box className="well">
                        <Heading as="h4" size="sm">Currently Reading</Heading>
                      </Box>

                      <Flex className="well" direction="column" gap={2}>
                        <Flex align="center" justify="space-between">
                          <Heading as="h4" size="sm">Next Meeting</Heading>
                          {isBookClubCreator ? (
                            <Button 
                              size="sm"
                              leftIcon={<HiOutlinePencil/>}
                              variant="ghost"
                              onClick={openMeetingModal}
                            >
                              Edit
                            </Button>
                          ) : null}
                        </Flex>
                        <Stack>
                          <Box>
                          {bookClub.next_meeting_location ? ( 
                            <Box 
                              dangerouslySetInnerHTML={{__html: bookClub?.next_meeting_location}}
                              p={2}
                              bg="gray.100"
                              rounded="md"
                              sx={{
                                '*': {
                                  all: "revert"
                                }
                              }}
                            >
                            </Box>
                          ) : null}
                          </Box>
                          <Flex gap={2} fontWeight="bold" justify="center">
                            <Text>{bookClub.next_meeting_start ? dayjs(bookClub.next_meeting_start).local().format('MMM DD, hh:mm a') : null}</Text>
                            <Text>-</Text>
                            <Text>{bookClub.next_meeting_end ? dayjs(bookClub.next_meeting_end).local().format('MMM DD, hh:mm a'): null}</Text>
                          </Flex>
                        </Stack>
                        
                      </Flex>

                      <Box className="well">
                        <Heading as="h4" size="sm" mb={2}>General Discussion</Heading>
                        <BookClubGeneralComments 
                          server={server}
                          bookClubId={paramsBookClubId}
                          subdomain={window.location.host.split(".")[0]}
                          uri={window.location.pathname}
                          isBookClubCreator={isBookClubCreator}
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
                <Flex direction="column" align="center" justify="center" mt={2}>
                  <Text>{switchVisibility === true ? "public" : "private (friends only)"}</Text>
                  <Switch 
                    isChecked={switchVisibility}
                    onChange={e=>setSwitchVisibility(prev=>e.target.checked)}
                    defaultChecked={bookClub ? (bookClub.visibility === 0 ? false : true) : false}
                  />
                </Flex>
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

      <Modal isOpen={isOpenMeetingModal} onClose={closeMeetingModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>
            Edit Book Club Meeting
          </ModalHeader>
          <ModalCloseButton />
            <Flex as="form" direction="column" w="100%" onSubmit={e=>updateBookClubMeeting(e)}>
              <ModalBody>
                <Stack gap={2}>
                  <Box>
                    <FormLabel htmlFor="location">Location</FormLabel>
                    <ReactQuill 
                      id="location" 
                      theme="snow"
                      ref={meetingLocationRef}
                      value={bookClub?.next_meeting_location}
                    />
                  </Box>
                  <Flex gap={1} justify="space-between" flexWrap="wrap">
                    <Flex direction="column">
                      <FormLabel htmlFor="from">From</FormLabel>
                      <Input
                        id="from"
                        type="datetime-local"
                        defaultValue={bookClub?.next_meeting_start ? dayjs(bookClub?.next_meeting_start).format('YYYY-MM-DD hh:mm') :  ""}
                        ref={meetingStartRef}
                      />
                    </Flex>
                    <Flex direction="column">
                      <FormLabel htmlFor="to">To</FormLabel>
                      <Input
                        id="to"
                        type="datetime-local"
                        defaultValue={bookClub?.next_meeting_end ? dayjs(bookClub?.next_meeting_end).format('YYYY-MM-DD hh:mm') :  ""}
                        ref={meetingEndRef}
                      />
                    </Flex>
                  </Flex>
                </Stack>
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

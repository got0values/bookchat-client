import React, { useState, useEffect, useCallback, useRef, ReactHTMLElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookClubMember, BookClubsType, BookClubBookType } from "../types/types";
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
  Link,
  Image,
  Center,
  Switch,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  useDisclosure,
  useToast,
  Input
} from "@chakra-ui/react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { HiOutlinePencil } from 'react-icons/hi';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { AiOutlinePlus } from 'react-icons/ai';
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

  const [currentBook,setCurrentBook] = useState<BookClubBookType>();
  const [pollBookOneReceived,setPollBookOneReceived] = useState<BookClubBookType | null>(null)
  const [pollBookTwoReceived,setPollBookTwoReceived] = useState<BookClubBookType | null>(null)
  const [pollBookThreeReceived,setPollBookThreeReceived] = useState<BookClubBookType | null>(null)
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

          setCurrentBook(responseBookClub.BookClubBook.reverse()[0])

          if(responseBookClub.BookClubBookPoll) {
            if (responseBookClub.BookClubBookPoll.book_one) {
              setPollBookOneReceived(JSON.parse(responseBookClub.BookClubBookPoll.book_one))
            }
            if (responseBookClub.BookClubBookPoll.book_two) {
              setPollBookTwoReceived(JSON.parse(responseBookClub.BookClubBookPoll.book_two))
            }
            if (responseBookClub.BookClubBookPoll.book_three) {
              setPollBookThreeReceived(JSON.parse(responseBookClub.BookClubBookPoll.book_three))
            }
          }
          
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
    onClose: onCloseMeetingModal 
  } = useDisclosure()

  function openMeetingModal() {
    onOpenMeetingModal()
  }

  function closeMeetingModal() {
    setUpdateError("")
    onCloseMeetingModal()
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

  const { 
    isOpen: isOpenCurrentBookModal, 
    onOpen: onOpenCurrentBookModal, 
    onClose: onCloseCurrentBookModal 
  } = useDisclosure()

  function openNewCurrentBookModal() {
    onOpenCurrentBookModal()
  }

  const [bookClubBook,setBookClubBook] = useState<number | null>(null)
  function openEditCurrentBookModal(bookClubBookId: number) {
    setBookClubBook(bookClubBookId)
    onOpenCurrentBookModal();
  }

  function closeCurrentBookModal() {
    setUpdateError("")
    setBookClubBook(null)
    onCloseCurrentBookModal()
  }

  const searchBookRef = useRef({} as HTMLInputElement);
  const [bookResults,setBookResults] = useState<any[] | null>(null);
  const [bookResultsLoading,setBookResultsLoading] = useState(false)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
      .get("https://openlibrary.org/search.json?q=" + searchBookRef.current.value + "&jscmd=details")
      .then((response)=>{
        console.log(response.data.docs)
        setBookResults(response.data.docs)
        setBookResultsLoading(false)
      })
      .catch((error)=>{
        console.log(error)
      })
  }

  async function selectBook(e: React.FormEvent) {
    const bookData = JSON.parse((e.target as HTMLDivElement).dataset.book!);
    setBookResultsLoading(true)
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      if (bookClubBook !== null) { //Edit book club
        await axios
        .post(server + "/api/updatebookclubbook",
          {
            bookClubId: parseInt(paramsBookClubId!),
            bookClubBookId: bookClubBook,
            bookImage: bookData.isbn ? `https://covers.openlibrary.org/b/isbn/${bookData.isbn[0]}-M.jpg?default=false` : "",
            bookTitle: bookData.title ? bookData.title : "",
            bookAuthor: bookData.author_name ? bookData.author_name[0] : ""
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          getBookClub()
          setBookResultsLoading(false)
          closeCurrentBookModal()
          toast({
            description: "Book club book updated",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          setUpdateError(response.data.message)
        })
      }
      else if (bookClubBook === null) { //New book club
        await axios
        .post(server + "/api/setbookclubbook",
          {
            bookClubId: parseInt(paramsBookClubId!),
            bookImage: bookData.isbn ? `https://covers.openlibrary.org/b/isbn/${bookData.isbn[0]}-M.jpg?default=false` : "",
            bookTitle: bookData.title ? bookData.title : "",
            bookAuthor: bookData.author_name ? bookData.author_name[0] : ""
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          getBookClub()
          setBookResultsLoading(false)
          closeCurrentBookModal()
          toast({
            description: "New book club book created",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          setUpdateError(response.data.message)
        })
      }
    }
    else {
      setUpdateError("Something went wrong")
    }
  }


  const { 
    isOpen: isOpenPollBookModal, 
    onOpen: onOpenPollBookModal, 
    onClose: onClosePollBookModal 
  } = useDisclosure()

  function openPollBookModal() {
    onOpenPollBookModal()
  }

  function closePollBookModal() {
    setPollBookOne(null)
    setPollBookTwo(null)
    setPollBookThree(null)
    onClosePollBookModal()
  }

  const [pollBookOne,setPollBookOne] = useState<BookClubBookType | null>(null)
  const [pollBookTwo,setPollBookTwo] = useState<BookClubBookType | null>(null)
  const [pollBookThree,setPollBookThree] = useState<BookClubBookType | null>(null)
  async function createPollBooks() {
    setBookResultsLoading(true)
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      await axios
        .post(server + "/api/setpollbooks",
          {
            bookClubId: parseInt(paramsBookClubId!),
            bookOne: pollBookOne ? pollBookOne : "",
            bookTwo: pollBookTwo ? pollBookTwo : "",
            bookThree: pollBookThree ? pollBookThree : ""
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          getBookClub()
          closePollBookModal()
          toast({
            description: "New book club book created",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          toast({
            description: response.data.message,
            status: "error",
            duration: 9000,
            isClosable: true
          })
        })
      setBookResultsLoading(false)
    }
    else {
      setUpdateError("Something went wrong")
      toast({
        description: "Something went wrong",
        status: "error",
        duration: 9000,
        isClosable: true
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
            <Heading as="h2" size="2xl" >{bookClubError}</Heading>
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
                      <Flex className="well" direction="column" gap={2}>
                        <Flex align="center" justify="space-between">
                          <Heading as="h4" size="sm">Currently Reading</Heading>
                          {isBookClubCreator ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<AiOutlinePlus size={15} />}
                            onClick={e=>openNewCurrentBookModal()}
                          >
                            New
                          </Button>
                          ) : null}
                        </Flex>
                        {currentBook ? (
                        <>
                          <Center 
                            flexDirection="column" 
                            gap={1}
                            p={2}
                            bg="gray.100"
                            rounded="md"
                            _dark={{
                              bg: "gray.600"
                            }}
                          >
                            {bookClub?.BookClubBook?.length ? (
                              <>
                                <Box
                                  maxWidth="150px"
                                >
                                  <Image
                                    maxW="100%" 
                                    w="100%"
                                    h="auto"
                                    pt={2} 
                                    mb={1}
                                    className="book-image"
                                    onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                    src={currentBook?.image}
                                  />
                                </Box>
                                <Heading as="h3" size="sm">
                                  {currentBook?.title}
                                </Heading>
                                <Text>
                                  {currentBook?.author}
                                </Text>
                                {isBookClubCreator ? (
                                  <Button 
                                    variant="ghost" 
                                    size="xs"
                                    onClick={e=>openEditCurrentBookModal(currentBook?.id!)}
                                  >
                                    Edit
                                  </Button>
                                ) : null}
                                <Button m={2}>
                                  Discussion
                                </Button>
                              </>
                            ) : null}
                          </Center>
                          <Center>
                            <Link href="#">View past books</Link>
                          </Center>
                        </>
                        ) : null}
                      </Flex>

                      <Flex className="well" direction="column" gap={2}>
                        <Flex align="center" justify="space-between">
                          <Heading as="h4" size="sm">Next Meeting</Heading>
                          {isBookClubCreator ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<HiOutlinePencil size={15} />}
                              onClick={openMeetingModal}
                            >
                              Edit
                            </Button>
                          ) : null}
                        </Flex>
                        <Stack>
                          {bookClub.next_meeting_location || bookClub.next_meeting_start || bookClub.next_meeting_end ? (
                          <>
                            <Box>
                            {bookClub.next_meeting_location ? ( 
                              <Box 
                                dangerouslySetInnerHTML={{__html: bookClub?.next_meeting_location}}
                                p={2}
                                bg="gray.100"
                                rounded="md"
                                _dark={{
                                  bg: "gray.600"
                                }}
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
                            <Center>
                              <Button>
                                RSVP
                              </Button>
                            </Center>
                          </>
                          ) : null}
                        </Stack>
                      </Flex>

                      <Flex className="well" direction="column" gap={2}>
                        <Flex align="center" justify="space-between">
                          <Heading as="h4" size="sm">Next Book Poll</Heading>
                          {isBookClubCreator ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<HiOutlinePencil size={15} />}
                              onClick={openPollBookModal}
                            >
                              Edit
                            </Button>
                          ) : null}
                        </Flex>
                        {bookClub?.BookClubBookPoll ? (
                          <Stack>
                            <Flex justify="space-around" w="100%" flexWrap="nowrap" gap={2}>
                              {pollBookOneReceived ? (
                                <Box flex="0 1 150px">
                                  <Box>
                                    <Image
                                      maxW="100%" 
                                      w="100%"
                                      h="auto"
                                      pt={2} 
                                      mb={1}
                                      className="book-image"
                                      onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                      src={pollBookOneReceived.image}
                                    />
                                  </Box>
                                  <Text fontWeight="bold">
                                    {pollBookOneReceived.title}
                                  </Text>
                                  <Text>
                                    {pollBookOneReceived.author}
                                  </Text>
                                  <Button
                                    size="xs"
                                    // onClick={e=>setPollBookOne(null)}
                                  >
                                    Vote
                                  </Button>
                                </Box>
                              ) : null}
                              
                              {pollBookTwoReceived ? (
                                <Box flex="0 1 150px">
                                  <Box>
                                    <Image
                                      maxW="100%" 
                                      w="100%"
                                      h="auto"
                                      pt={2} 
                                      mb={1}
                                      className="book-image"
                                      onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                      src={pollBookTwoReceived.image}
                                    />
                                  </Box>
                                  <Text fontWeight="bold">
                                    {pollBookTwoReceived.title}
                                  </Text>
                                  <Text>
                                    {pollBookTwoReceived.author}
                                  </Text>
                                  <Button
                                    size="xs"
                                    // onClick={e=>setPollBookTwo(null)}
                                  >
                                    Vote
                                  </Button>
                                </Box>
                              ) : null}
                              
                              {pollBookThreeReceived ? (
                                <Box flex="0 1 150px">
                                  <Box>
                                    <Image
                                      maxW="100%" 
                                      w="100%"
                                      h="auto"
                                      pt={2} 
                                      mb={1}
                                      className="book-image"
                                      onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                      src={pollBookThreeReceived.image}
                                    />
                                  </Box>
                                  <Text fontWeight="bold">
                                    {pollBookThreeReceived.title}
                                  </Text>
                                  <Text>
                                    {pollBookThreeReceived.author}
                                  </Text>
                                  <Button
                                    size="xs"
                                    // onClick={e=>setPollBookThree(null)}
                                  >
                                    Vote
                                  </Button>
                                </Box>
                              ) : null}
                              
                            </Flex>
                          </Stack>
                        ) : null}
                        <Stack>
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

      <Modal 
        isOpen={isOpenCurrentBookModal} 
        onClose={closeCurrentBookModal} 
        size="xl" 
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>
            New Book Club Book
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
              <Stack gap={2} position="relative">
                <Flex gap={1} position="sticky" top={0}>
                  <Input
                    type="text"
                    ref={searchBookRef}
                    bg="white"
                    color="black"
                    onKeyDown={e=>e.key === "Enter" ? searchBook() : null}
                  />
                  <Button
                    onClick={searchBook}
                  >
                    Search
                  </Button>
                </Flex>
                {bookResultsLoading ? (
                  <Center>
                    <Spinner size="xl"/>
                  </Center>
                ) : (
                  <Flex gap={1} align="center" justify="space-between" flexWrap="wrap">
                    {bookResults ? bookResults.map((book,i)=>{
                      return (
                        <Flex
                          m={3}
                          p={2}
                          maxW="165px"
                          direction="column"
                          align="center"
                          cursor="pointer"
                          data-book={JSON.stringify(book)}
                          onClick={e=>selectBook(e)}
                          rounded="md"
                          _hover={{
                            bg: "gray.100"
                          }}
                          _dark={{
                            '&:hover': {
                              bg: "gray.600"
                            }
                          }}
                          key={i}
                        >
                          <Box
                            pointerEvents="none"
                          >
                            <Image
                              maxW="100%" 
                              w="100%"
                              h="auto"
                              pt={2} 
                              mb={1}
                              className="book-image"
                              onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                              src={book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg?default=false` : "https://via.placeholder.com/165x215"}
                            />
                            <Heading
                              as="h4"
                              size="sm"
                            >
                              {book.title}
                            </Heading>
                            <Text>
                              {book.author_name ? book.author_name[0] : null}
                            </Text>
                          </Box>
                        </Flex>
                      )
                    }) : null}
                  </Flex>
                )}
              </Stack>
            </ModalBody>
            <ModalFooter flexDirection="column">
              <Text color="red">
                {updateError}
              </Text>
            </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={isOpenPollBookModal} 
        onClose={closePollBookModal} 
        size="xl" 
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            Next Book Poll
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="150px" h="auto" maxH="80vh" overflow="auto">
              <Stack gap={2} position="relative">
                <Flex gap={1} position="sticky" top={0}>
                  <Input
                    type="text"
                    ref={searchBookRef}
                    bg="white"
                    color="black"
                    onKeyDown={e=>e.key === "Enter" ? searchBook() : null}
                  />
                  <Button
                    onClick={searchBook}
                  >
                    Search
                  </Button>
                </Flex>
                {bookResultsLoading ? (
                  <Center>
                    <Spinner size="xl"/>
                  </Center>
                ) : (
                  <Flex gap={1} align="center" justify="space-between" flexWrap="wrap">
                    {bookResults ? bookResults.map((book,i)=>{
                      return (
                        <Flex
                          m={3}
                          p={2}
                          maxW="165px"
                          direction="column"
                          align="center"
                          cursor="pointer"
                          // data-book={JSON.stringify(book)}
                          onClick={e=>(
                            pollBookOne === null ? (
                              setPollBookOne({
                                image: book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg?default=false` : "",
                                title: book.title ? book.title : "",
                                author: book.author_name ? book.author_name[0] : ""
                              })
                                ) : (
                                  pollBookTwo === null ? (
                                    setPollBookTwo({
                                      image: book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg?default=false` : "",
                                      title: book.title ? book.title : "",
                                      author: book.author_name ? book.author_name[0] : ""
                                    })
                                      ) : pollBookThree === null ? (
                                        setPollBookThree({
                                          image: book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg?default=false` : "",
                                          title: book.title ? book.title : "",
                                          author: book.author_name ? book.author_name[0] : ""
                                        })
                                        ) : null)
                          )}
                          rounded="md"
                          _hover={{
                            bg: "gray.100"
                          }}
                          _dark={{
                            '&:hover': {
                              bg: "gray.600"
                            }
                          }}
                          key={i}
                        >
                          <Box
                            pointerEvents="none"
                          >
                            <Image
                              maxW="100%" 
                              w="100%"
                              h="auto"
                              pt={2} 
                              mb={1}
                              className="book-image"
                              onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                              src={book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0]}-M.jpg?default=false` : "https://via.placeholder.com/165x215"}
                            />
                            <Heading
                              as="h4"
                              size="sm"
                            >
                              {book.title}
                            </Heading>
                            <Text>
                              {book.author_name ? book.author_name[0] : null}
                            </Text>
                          </Box>
                        </Flex>
                      )
                    }) : null}
                  </Flex>
                )}
              </Stack>
            </ModalBody>
            <ModalFooter flexDirection="column">
              <Flex justify="space-between" w="100%" flexWrap="nowrap" gap={2}>
                <Box flex="0 1 125px">
                  {pollBookOne !== null ? (
                    <>
                    <Box>
                      <Image
                        maxW="100%" 
                        w="100%"
                        h="auto"
                        pt={2} 
                        mb={1}
                        className="book-image"
                        onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                        src={pollBookOne.image}
                      />
                    </Box>
                    <Text fontWeight="bold">
                      {pollBookOne.title}
                    </Text>
                    <Text>
                      {pollBookOne.author}
                    </Text>
                    <Button
                      size="xs"
                      onClick={e=>setPollBookOne(null)}
                    >
                      Clear
                    </Button>
                  </>
                  ) : null}
                </Box>
                <Box flex="0 1 125px">
                  {pollBookTwo !== null ? (
                    <>
                      <Box>
                        <Image
                          maxW="100%" 
                          w="100%"
                          h="auto"
                          pt={2} 
                          mb={1}
                          className="book-image"
                          onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                          src={pollBookTwo.image}
                        />
                      </Box>
                      <Text fontWeight="bold">
                        {pollBookTwo.title}
                      </Text>
                      <Text>
                        {pollBookTwo.author}
                      </Text>
                      <Button
                        size="xs"
                        onClick={e=>setPollBookTwo(null)}
                      >
                        Clear
                      </Button>
                    </>
                  ) : null}
                </Box>
                <Box flex="0 1 125px">
                  {pollBookThree !== null ? (
                    <>
                      <Box>
                        <Image
                          maxW="100%" 
                          w="100%"
                          h="auto"
                          pt={2} 
                          mb={1}
                          className="book-image"
                          onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                          src={pollBookThree.image}
                        />
                      </Box>
                      <Text fontWeight="bold">
                        {pollBookThree.title}
                      </Text>
                      <Text>
                        {pollBookThree.author}
                      </Text>
                      <Button
                        size="xs"
                        onClick={e=>setPollBookThree(null)}
                      >
                        Clear
                      </Button>
                    </>
                  ) : null}
                </Box>
              </Flex>
              <Button
                onClick={createPollBooks}
                mt={3}
              >
                Save
              </Button>
            </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

import React, { useState, useEffect, useCallback, useRef, ReactHTMLElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookClubMember, BookClubsType, BookClubBookType, BookClubRsvpType, BookClubBookPollVoteType } from "../types/types";
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
  Divider,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  Portal,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { HiOutlinePencil } from 'react-icons/hi';
import { BsCardText } from 'react-icons/bs';
import { AiOutlinePlus } from 'react-icons/ai';
import { TbBooks } from 'react-icons/tb';
import { BookClubGeneralComments } from "../shared/BookClubGeneralComments";
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";


export default function BookClub({server}: {server: string}) {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient()
  const { paramsBookClubId } = useParams();
  const { user } = useAuth();
  dayjs.extend(utc)

  async function getBookClub() {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      const bookClub = await axios
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
            let responseBookClub = response.data.message
            const currentBook1 = responseBookClub.BookClubBook.reverse()[0]

            let pollBookOneRcvd;
            let pollVotesBookOne;
            let pollBookTwoRcvd;
            let pollVotesBookTwo;
            let pollBookThreeRcvd;
            let pollVotesBookThree;
            if(responseBookClub.BookClubBookPoll) {
              if (responseBookClub.BookClubBookPoll.book_one) {
                pollBookOneRcvd = JSON.parse(responseBookClub.BookClubBookPoll.book_one)
                pollVotesBookOne = responseBookClub.BookClubBookPoll.BookClubBookPollVote.filter((vote: BookClubBookPollVoteType)=>vote.book===1).length
              }
              if (responseBookClub.BookClubBookPoll.book_two) {
                pollBookTwoRcvd = JSON.parse(responseBookClub.BookClubBookPoll.book_two)
                pollVotesBookTwo = responseBookClub.BookClubBookPoll.BookClubBookPollVote.filter((vote: BookClubBookPollVoteType)=>vote.book===2).length
              }
              if (responseBookClub.BookClubBookPoll.book_three) {
                pollBookThreeRcvd = JSON.parse(responseBookClub.BookClubBookPoll.book_three)
                pollVotesBookThree = responseBookClub.BookClubBookPoll.BookClubBookPollVote.filter((vote: BookClubBookPollVoteType)=>vote.book===3).length
              }
            }
            
            let isBookClubCreator = false;
            if (responseBookClub.creator === user.Profile.id) {
              isBookClubCreator = true;
            }
            else {
              isBookClubCreator = false;
            }

            //non-member: 0, requesting: 1, member: 2
            let memberStatus = 0;
            if (responseBookClub.BookClubMembers.filter((member: BookClubMember)=>member.Profile.id === user.Profile?.id).length) {
              memberStatus = responseBookClub.BookClubMembers.filter((member: BookClubMember)=>member.Profile.id === user.Profile?.id)[0].status
            }
            else {
              memberStatus = 0;
            }

            let rsvpStatus = 0;
            if (responseBookClub.BookClubMeetingRsvp.filter((rsvp: BookClubRsvpType)=>rsvp.profile_id === user.Profile?.id).length) {
              rsvpStatus = 1;
            }
            else {
              rsvpStatus = 0;
            }

            return {
              bookClub:  responseBookClub,
              currentBook: currentBook1,
              pollBookOneReceived: pollBookOneRcvd,
              pollBookTwoReceived: pollBookTwoRcvd,
              pollBookThreeReceived: pollBookThreeRcvd,
              isBookClubCreator: isBookClubCreator,
              memberStatus: memberStatus,
              rsvpStatus: rsvpStatus,
              pollVotesBookOne,
              pollVotesBookTwo,
              pollVotesBookThree
            }
          }
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      return bookClub;
    }
    else {
      throw new Error("An error has occured")
    }
  }

  const { 
    isOpen: isOpenEditModal, 
    onOpen: onOpenEditModal, 
    onClose: onClosEditModal 
  } = useDisclosure()

  function openEditModal() {
    onOpenEditModal()
  }

  function closeEditModal() {
    updateBookClubMutation.reset();
    onClosEditModal()
  }

  const [switchVisibility,setSwitchVisibility] = useState(false);
  // const [updateError,throw new Error] = useState<string>("");
  const idRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const nameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const aboutRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const updateBookClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
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
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      }
      else {
        throw new Error("An error has occured")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "Book club updated",
        status: "success",
        duration: 9000,
        isClosable: true
      })
      closeEditModal()
    }
  })
  function updateBookClub(e: React.FormEvent) {
    updateBookClubMutation.mutate(e);
  }

  const joinBookClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
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
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data?.message)
        })
      }
    },
    onSuccess: () => {
      queryClient.resetQueries({queryKey: ['bookClubKey']})
    }
  })
  function joinBookClub(e: React.FormEvent) {
    joinBookClubMutation.mutate(e)
  }

  const unJoinBookClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      await axios
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
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data?.message)
        })
    }},
    onSuccess: () => {
      queryClient.resetQueries({queryKey: ['bookClubKey']})
    }
  })
  function unJoinBookClub(e: React.FormEvent) {
    unJoinBookClubMutation.mutate(e);
  }

  const removeMemberMutation = useMutation({
    mutationFn: async (memberProfileId: number) => {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      await axios
        .delete(server + "/api/removemember",
          {
            headers: {
              authorization: tokenCookie
            },
            data: {
              bookClubId: parseInt(paramsBookClubId!),
              memberProfileId
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data?.message)
        })
    }},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
    }
  })
  function removeMember(memberProfileId: number) {
    removeMemberMutation.mutate(memberProfileId);
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
    setBookClubBook(null)
    onCloseCurrentBookModal()
    selectBookMutation.reset()
  }

  const searchBookRef = useRef({} as HTMLInputElement);
  const [bookResults,setBookResults] = useState<any[] | null>(null);
  const [bookResultsLoading,setBookResultsLoading] = useState(false)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
      .get("https://www.googleapis.com/books/v1/volumes?q=" + searchBookRef.current.value)
      .then((response)=>{
        console.log(response)
        setBookResults(response.data.items)
        setBookResultsLoading(false)
      })
      .catch((error)=>{
        console.log(error)
      })
  }

  const selectBookMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
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
                bookImage: bookData.volumeInfo.imageLinks ? bookData.volumeInfo.imageLinks.smallThumbnail : "",
                bookTitle: bookData.volumeInfo.title,
                bookAuthor: bookData.volumeInfo.authors ? bookData.volumeInfo.authors[0] : "",
                bookDescription: bookData.volumeInfo.description ? bookData.volumeInfo.description : "",
                bookLink: bookData.volumeInfo.previewLink ? bookData.volumeInfo.previewLink : ""
              },
              {
                headers: {
                  authorization: tokenCookie
                }
              }
            )
            .then((response)=>{
              getBookClub()
            })
            .then((response)=>{
              setBookResultsLoading(false)
              closeCurrentBookModal()
              queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
              queryClient.resetQueries({queryKey: ['bookClubKey']})
              getBookClub();
              toast({
                description: "Book club book updated",
                status: "success",
                duration: 9000,
                isClosable: true
              })
            })
            .catch(({response})=>{
              console.log(response)
              throw new Error(response.data.message)
            })
        }
        else if (bookClubBook === null) { //New book club
          await axios
          .post(server + "/api/setbookclubbook",
            {
              bookClubId: parseInt(paramsBookClubId!),
              bookImage: bookData.volumeInfo.imageLinks ? bookData.volumeInfo.imageLinks.smallThumbnail : "",
              bookTitle: bookData.volumeInfo.title,
              bookAuthor: bookData.volumeInfo.authors ? bookData.volumeInfo.authors[0] : "",
              bookDescription: bookData.volumeInfo.description ? bookData.volumeInfo.description : "",
              bookLink: bookData.volumeInfo.previewLink ? bookData.volumeInfo.previewLink : ""
            },
            {
              headers: {
                authorization: tokenCookie
              }
            }
          )
          .then((response)=>{
            setBookResultsLoading(false)
            closeCurrentBookModal()
            queryClient.resetQueries({queryKey: ['bookClubKey']})
            toast({
              description: "New book club book created",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          })
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.message)
          })
        }
      }
      else {
        throw new Error("Something went wrong")
      }
    }
  })
  function selectBook(e: React.FormEvent) {
    selectBookMutation.mutate(e);
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
    onCloseMeetingModal()
    updateBookClubMeetingMutation.reset();
    clearRsvpsCallbackMutation.reset();
  }

  const meetingLocationRef = useRef({} as ReactQuill);
  const meetingStartRef = useRef({} as HTMLInputElement);
  const meetingEndRef = useRef({} as HTMLInputElement);
  const updateBookClubMeetingMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
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
          .catch(({response})=>{
            console.log(response)
            if (response.data?.message) {
              throw new Error(response.data?.message)
            }
          })
      }
      else {
        throw new Error("An error has occured")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "Book club meeting updated",
        status: "success",
        duration: 9000,
        isClosable: true
      })
      closeMeetingModal()
    }
  })
  function updateBookClubMeeting(e: React.FormEvent) {
    updateBookClubMeetingMutation.mutate(e)
  }

  const rsvpCallbackMutation = useMutation({
    mutationFn: async () => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .post(server + "/api/rsvpbookclub",
            {
              bookClubId: parseInt(paramsBookClubId!)
            },
            {
              headers: {
                authorization: tokenCookie
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.message)
          })
      }
      else {
        throw new Error("Something went wrong")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "Successfully RSVP'd",
        status: "success",
        duration: 9000,
        isClosable: true
      })
    }
  })
  function rsvpCallback() {
    rsvpCallbackMutation.mutate();
  }

  const unRsvpCallbackMutation = useMutation({
    mutationFn: async () => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .delete(server + "/api/unrsvpbookclub",
            {
              headers: {
                authorization: tokenCookie
              },
              data: {
                bookClubId: parseInt(paramsBookClubId!)
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.message)
          })
      }
      else {
        throw new Error("Something went wrong")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "Successfully Un-RSVP'd",
        status: "success",
        duration: 9000,
        isClosable: true
      })
    }
  })
  function unRsvpCallback() {
    unRsvpCallbackMutation.mutate();
  }

  const clearRsvpsCallbackMutation = useMutation({
    mutationFn: async () => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .delete(server + "/api/clearbookclubrsvps",
            {
              headers: {
                authorization: tokenCookie
              },
              data: {
                bookClubId: parseInt(paramsBookClubId!)
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.message)
          })
      }
      else {
        throw new Error("Something went wrong")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "RSVP's successfully cleared",
        status: "success",
        duration: 9000,
        isClosable: true
      })
    }
  })
  function clearRsvpsCallback() {
    clearRsvpsCallbackMutation.mutate();
  }

  const { 
    isOpen: isOpenPollBookModal, 
    onOpen: onOpenPollBookModal, 
    onClose: onClosePollBookModal 
  } = useDisclosure()

  function openPollBookModal() {
    if (pollBookOneReceived) {
      setPollBookOne(pollBookOneReceived)
    }
    if (pollBookTwoReceived) {
      setPollBookTwo(pollBookTwoReceived)
    }
    if (pollBookThreeReceived) {
      setPollBookThree(pollBookThreeReceived)
    }
    onOpenPollBookModal()
  }

  function closePollBookModal() {
    setPollBookOne(null)
    setPollBookTwo(null)
    setPollBookThree(null)
    createPollBooksMutation.reset();
    clearPollVotesMutation.reset();
    onClosePollBookModal()
  }

  const pollIdRef = useRef<HTMLInputElement>({} as HTMLInputElement)
  const pollVoteMutation = useMutation({
    mutationFn: async (bookNumber: number) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .post(server + "/api/bookclubpollvote",
            {
              pollId: parseInt(pollIdRef.current.value),
              book: bookNumber
            },
            {
              headers: {
                authorization: tokenCookie
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            toast({
              description: response.data?.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          })
      }
      else {
        throw new Error("Something went wrong")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "Successfully voted",
        status: "success",
        duration: 9000,
        isClosable: true
      })
    }
  })
  function pollVote(bookNumber: number) {
    pollVoteMutation.mutate(bookNumber);
  }

  const unPollVoteMutation = useMutation({
    mutationFn: async (bookNumber: number) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .delete(server + "/api/bookclubpollunvote",
            {
              headers: {
                authorization: tokenCookie
              },
              data: {
                pollId: parseInt(pollIdRef.current.value),
                book: bookNumber
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            toast({
              description: response.data?.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          })
      }
      else {
        throw new Error("Something went wrong")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "Successfully un-voted",
        status: "success",
        duration: 9000,
        isClosable: true
      })
    }
  })
  function unPollVote(bookNumber: number) {
    unPollVoteMutation.mutate(bookNumber);
  }

  const [pollBookOne,setPollBookOne] = useState<BookClubBookType | null>(null)
  const [pollBookTwo,setPollBookTwo] = useState<BookClubBookType | null>(null)
  const [pollBookThree,setPollBookThree] = useState<BookClubBookType | null>(null)
  const createPollBooksMutation = useMutation({
    mutationFn: async () => {
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
        toast({
          description: "Something went wrong",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        throw new Error("Something went wrong")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "Book club poll updated",
        status: "success",
        duration: 9000,
        isClosable: true
      })
      closePollBookModal()
    }
  })
  function createPollBooks() {
    createPollBooksMutation.mutate();
  }

  const clearPollVotesMutation = useMutation({
    mutationFn: async () => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .delete(server + "/api/clearbookclubpollvotes",
            {
              headers: {
                authorization: tokenCookie
              },
              data: {
                pollId: parseInt(pollIdRef.current.value)
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            toast({
              description: response.data?.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          })
      }
      else {
        throw new Error("Something went wrong")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      toast({
        description: "Successfully reset poll votes",
        status: "success",
        duration: 9000,
        isClosable: true
      })
    }
  })
  function clearPollVotes() {
    clearPollVotesMutation.mutate();
  }

  const bookClubQuery = useQuery({ 
    queryKey: ['bookClubKey'], 
    queryFn: getBookClub
  });
  const bookClubData = bookClubQuery.data;
  const bookClub: BookClubsType = bookClubData?.bookClub;
  const currentBook = bookClubData?.currentBook;
  const pollBookOneReceived = bookClubData?.pollBookOneReceived;
  const pollBookTwoReceived = bookClubData?.pollBookTwoReceived;
  const pollBookThreeReceived = bookClubData?.pollBookThreeReceived;
  const isBookClubCreator = bookClubData?.isBookClubCreator;
  const memberStatus: number | undefined = bookClubData?.memberStatus;
  const rsvpStatus: number | undefined = bookClubData?.rsvpStatus;
  const pollVotesBookOne: number | undefined = bookClubData?.pollVotesBookOne;
  const pollVotesBookTwo: number | undefined = bookClubData?.pollVotesBookTwo;
  const pollVotesBookThree: number | undefined = bookClubData?.pollVotesBookThree;
  if (bookClubQuery.isLoading) {
    return (
      <Flex align="center" justify="center" minH="80vh">
        <Spinner size="xl"/>
      </Flex>
    )
  }
  if (bookClubQuery.isError) {
    return <Flex align="center" justify="center" minH="80vh">
      <Heading as="h1" size="xl">Error: {(bookClubQuery.error as Error).message}</Heading>
    </Flex>
  }
  
  return (
    <>
      <Box className="main-content">
        <Skeleton 
          isLoaded={!bookClubQuery.isLoading}
        >
          {bookClub ? (
            <Flex flexWrap="wrap" w="100%" align="start" justify="space-between">
              <Stack flex="1 1 30%" top="0">
                <Flex className="well" direction="column" align="center" gap={2}>
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
                <Flex className="well" direction="column" gap={2}>
                  <Flex align="center" justify="space-between">
                    <Heading as="h4" size="md">Members</Heading>
                    {isBookClubCreator ? null : (
                      memberStatus && memberStatus > 0 ? (
                        !unJoinBookClubMutation.error ? (
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
                            colorScheme="red"
                          >
                            {(unJoinBookClubMutation.error as Error).message}
                          </Button>
                        )
                      ) : (
                      !joinBookClubMutation.error ? (
                      <Button 
                        size="xs"
                        value={bookClub.id}
                        onClick={e=>joinBookClub(e)}
                      >
                        Join
                      </Button>
                        ) : (
                          <Button 
                            size="xs"
                            colorScheme="red"
                          >
                            {(joinBookClubMutation.error as Error).message}
                          </Button>
                        )
                      )
                    )}
                  </Flex>
                  <Box>
                    {bookClub.BookClubMembers.length ? bookClub.BookClubMembers.map((member,i)=>{
                      return (
                        member.status === 2 ? (
                          <Flex 
                            key={i} 
                            align="center" 
                            justify="space-between"
                          >
                            <Link 
                              href={`/profile/${member.Profile.username}`}
                              _hover={{
                                textDecoration: "none",
                                color: "teal"
                              }}
                            >
                              @{member.Profile.username}
                            </Link>
                            {isBookClubCreator ? (
                              <Button 
                                size="xs" 
                                variant="ghost"
                                color="red"
                                onClick={e=>removeMember(member.Profile.id)}
                              >
                                Remove
                              </Button>
                            ) : null}
                          </Flex>
                        ) : null
                      )
                    }) : null}
                  </Box>
                </Flex>
              </Stack>

              <Stack flex="1 1 65%" maxW="100%">
                {memberStatus === 2 || isBookClubCreator ? (
                  <>
                    <Flex className="well" direction="column" gap={2}>
                      <Flex align="center" justify="space-between">
                        <Heading as="h4" size="md">Currently Reading</Heading>
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
                        <Box
                          bg="gray.100"
                          p={2}
                          rounded="md"
                          _dark={{
                            bg: "gray.600"
                          }}
                        >
                          <Flex  
                            gap={5}
                            flexWrap="wrap"
                          >
                            <Box
                              flex="1 1 200px"
                              maxW="175px"
                            >
                              <Image
                                maxW="100%" 
                                w="100%"
                                h="auto"
                                m={1}
                                className="book-image"
                                onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                src={currentBook?.image}
                              />
                            </Box>
                            <Flex direction="column" align="center" justify="center" flex="1 1" minW="250px">
                              <Heading as="h3" size="md">
                                {currentBook?.title}
                              </Heading>
                              <Text>
                                {currentBook?.author}
                              </Text>
                              <Box maxH="225px" overflow="auto">
                                {currentBook?.description ? currentBook.description : null}
                              </Box>
                            </Flex>
                          </Flex>
                          <Flex justify="center">
                            <Divider borderColor="gray.400" my={3} w="95%" />
                          </Flex>
                          <Center flexDirection="column">
                            <Button 
                              colorScheme="teal"
                              leftIcon={<BsCardText size={20} />}
                            >
                              Discussion
                            </Button>
                            {isBookClubCreator ? (
                              <Button 
                                variant="ghost"
                                onClick={e=>openEditCurrentBookModal(currentBook?.id!)}
                                leftIcon={<HiOutlinePencil size={15} />}
                              >
                                Edit
                              </Button>
                            ) : null}
                          </Center>
                        </Box>
                        {bookClub?.BookClubBook?.length && bookClub?.BookClubBook?.length > 1 ? (
                          <Center>
                            <Popover isLazy>
                              <PopoverTrigger>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  m={1}
                                  leftIcon={<TbBooks size={20} />}
                                >
                                  View past books
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverHeader>Past Books</PopoverHeader>
                                <PopoverBody>
                                  {bookClub.BookClubBook.map((bcb,i)=>{
                                    if (i !== 0) {
                                      return (
                                        <Box key={i}>
                                          {i > 1 ? <Divider/> : null}
                                          <Flex align="center" columnGap={2} flexWrap="wrap">
                                            <Text whiteSpace="nowrap">
                                              {dayjs(bcb.created_on).format("MMM DD, YYYY")}
                                            </Text>
                                            {" - "}
                                            <Text whiteSpace="nowrap" fontWeight="bold">
                                              {bcb.title}
                                            </Text>
                                            <Text whiteSpace="nowrap">
                                              {bcb.author}
                                            </Text>
                                          </Flex>
                                        </Box>
                                      )
                                    }
                                  })}
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                          </Center>
                        ) : null}
                      </>
                      ) : null}
                    </Flex>

                    <Flex className="well" direction="column" gap={2}>
                      <Flex align="center" justify="space-between">
                        <Heading as="h4" size="md">Next Meeting</Heading>
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
                          {bookClub.next_meeting_location || bookClub.next_meeting_start || bookClub.next_meeting_end ? (
                            <Box
                              bg="gray.100"
                              rounded="md"
                              _dark={{
                                bg: "gray.600"
                              }}
                            >
                              {bookClub.next_meeting_location ? ( 
                                <Box 
                                  p={2}
                                >
                                  <ReactQuill 
                                    theme="snow"
                                    modules={{
                                      toolbar: ''
                                    }}
                                    readOnly={true}
                                    defaultValue={bookClub.next_meeting_location}
                                    style={{border: 'none'}}
                                  />
                                </Box>
                              ) : null}
                              <Flex 
                                gap={2} 
                                fontWeight="bold" 
                                justify="center"
                                p={2}
                              >
                                <Text>{bookClub.next_meeting_start ? dayjs(bookClub.next_meeting_start).local().format('MMM DD, hh:mm a') : null}</Text>
                                <Text>-</Text>
                                <Text>{bookClub.next_meeting_end ? dayjs(bookClub.next_meeting_end).local().format('MMM DD, hh:mm a'): null}</Text>
                              </Flex>
                            </Box>
                          ) : null}
                          <Center flexDirection="column">
                            <>
                              {rsvpCallbackMutation.error && (
                                  <Text color="red">{(rsvpCallbackMutation.error as Error).message}</Text>
                                )
                              }
                              {unRsvpCallbackMutation.error && (
                                  <Text color="red">{(unRsvpCallbackMutation.error as Error).message}</Text>
                                )
                              }
                              {!rsvpStatus ? (
                                <Button
                                  colorScheme="teal"
                                  disabled={rsvpCallbackMutation.isLoading}
                                  onClick={rsvpCallback}
                                >
                                  RSVP
                                </Button>
                              ) : (
                                <Button
                                  colorScheme="red"
                                  disabled={rsvpCallbackMutation.isLoading}
                                  onClick={unRsvpCallback}
                                >
                                  Un-RSVP
                                </Button>
                              )}
                            </>
                          </Center>
                        </>
                        ) : null}
                      </Stack>
                    </Flex>

                    <Flex className="well" direction="column" gap={2}>
                      <Flex align="center" justify="space-between">
                        <Heading as="h4" size="md">Next Book Poll</Heading>
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
                          <Input 
                            type="hidden" 
                            ref={pollIdRef}
                            value={bookClub?.BookClubBookPoll.id}
                          />
                          <Flex justify="space-around" w="100%" flexWrap="nowrap" gap={2}>
                            {pollBookOneReceived ? (
                              <Flex
                                flexDirection="column" 
                                flex="0 1 175px"
                                bg="gray.200"
                                p={2}
                                rounded="md"
                                _dark={{
                                  bg: 'gray.600'
                                }}
                              >
                                <Box>
                                  <Heading as="h5" size="sm" textAlign="center">1</Heading>
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
                                <Popover isLazy>
                                  <PopoverTrigger>
                                    <Button size="xs" variant="ghost" m={1}>Description</Button>
                                  </PopoverTrigger>
                                  <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader>{pollBookOneReceived.title}</PopoverHeader>
                                    <PopoverBody>{pollBookOneReceived.description ? pollBookOneReceived.description : null}</PopoverBody>
                                  </PopoverContent>
                                </Popover>

                                {bookClub.BookClubBookPoll?.BookClubBookPollVote
                                .filter((pollVote)=>pollVote.profile_id === user.Profile.id).length ? (

                                  bookClub.BookClubBookPoll?.BookClubBookPollVote
                                  .filter((pollVote)=>pollVote.book === 1 && pollVote.profile_id === user.Profile.id).length ? (
                                    <Button
                                      size="xs"
                                      colorScheme="red"
                                      marginTop="auto"
                                      onClick={e=>unPollVote(1)}
                                    >
                                      Un-Vote
                                    </Button>
                                  ) : (
                                    null
                                  )
                                ) : (
                                  <Button
                                    size="xs"
                                    colorScheme="teal"
                                    marginTop="auto"
                                    onClick={e=>pollVote(1)}
                                  >
                                    Vote
                                  </Button>
                                )}
                                <Text textAlign="center" pt={2} mt="auto">Votes: {pollVotesBookOne}</Text>
                              </Flex>
                            ) : null}
                            
                            {pollBookTwoReceived ? (
                              <Flex
                                flexDirection="column" 
                                flex="0 1 175px"
                                bg="gray.200"
                                p={2}
                                rounded="md"
                                _dark={{
                                  bg: 'gray.600'
                                }}
                              >
                                <Box>
                                  <Heading as="h5" size="sm" textAlign="center">2</Heading>
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
                                <Popover isLazy>
                                  <PopoverTrigger>
                                    <Button size="xs" variant="ghost" m={1}>Description</Button>
                                  </PopoverTrigger>
                                  <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader>{pollBookTwoReceived.title}</PopoverHeader>
                                    <PopoverBody>{pollBookTwoReceived.description ? pollBookTwoReceived.description : null}</PopoverBody>
                                  </PopoverContent>
                                </Popover>
                                {bookClub.BookClubBookPoll?.BookClubBookPollVote
                                .filter((pollVote)=>pollVote.profile_id === user.Profile.id).length ? (
                                  
                                  bookClub.BookClubBookPoll?.BookClubBookPollVote
                                  .filter((pollVote)=>pollVote.book === 2 && pollVote.profile_id === user.Profile.id).length ? (
                                    <Button
                                      size="xs"
                                      colorScheme="red"
                                      marginTop="auto"
                                      onClick={e=>unPollVote(2)}
                                    >
                                      Un-Vote
                                    </Button>
                                  ) : (
                                    null
                                  )
                                ) : (
                                  <Button
                                    size="xs"
                                    colorScheme="teal"
                                    marginTop="auto"
                                    onClick={e=>pollVote(2)}
                                  >
                                    Vote
                                  </Button>
                                )}
                                <Text textAlign="center" pt={2} mt="auto">Votes: {pollVotesBookTwo}</Text>
                              </Flex>
                            ) : null}
                            
                            {pollBookThreeReceived ? (
                              <Flex
                                flexDirection="column" 
                                flex="0 1 175px"
                                bg="gray.200"
                                p={2}
                                rounded="md"
                                _dark={{
                                  bg: 'gray.600'
                                }}
                              >
                                <Box>
                                  <Heading as="h5" size="sm" textAlign="center">3</Heading>
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
                                <Popover isLazy>
                                  <PopoverTrigger>
                                    <Button size="xs" variant="ghost" m={1}>Description</Button>
                                  </PopoverTrigger>
                                  <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverHeader>{pollBookThreeReceived.title}</PopoverHeader>
                                    <PopoverBody>{pollBookThreeReceived.description ? pollBookThreeReceived.description : null}</PopoverBody>
                                  </PopoverContent>
                                </Popover>
                                {bookClub.BookClubBookPoll?.BookClubBookPollVote
                                .filter((pollVote)=>pollVote.profile_id === user.Profile.id).length ? (
                                  
                                  bookClub.BookClubBookPoll?.BookClubBookPollVote
                                  .filter((pollVote)=>pollVote.book === 3 && pollVote.profile_id === user.Profile.id).length ? (
                                    <Button
                                      size="xs"
                                      colorScheme="red"
                                      marginTop="auto"
                                      onClick={e=>unPollVote(3)}
                                    >
                                      Un-Vote
                                    </Button>
                                  ) : (
                                    null
                                  )
                                ) : (
                                  <Button
                                    size="xs"
                                    colorScheme="teal"
                                    marginTop="auto"
                                    onClick={e=>pollVote(3)}
                                  >
                                    Vote
                                  </Button>
                                )}
                                <Text textAlign="center" pt={2} mt="auto">Votes: {pollVotesBookThree}</Text>
                              </Flex>
                            ) : null}
                            
                          </Flex>
                        </Stack>
                      ) : null}
                      <Stack>
                      </Stack>
                    </Flex>

                    <Box className="well">
                      <Heading as="h4" size="md" mb={2}>General Discussion</Heading>
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
          ) : null}
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
                <>
                  {updateBookClubMutation.error && (
                      <Text color="red">{(updateBookClubMutation.error as Error).message}</Text>
                    )
                  }
                  <Flex align="center" justify="flex-end">
                    <Button 
                      type="submit"
                      mr={3}
                      size="md"
                    >
                      Update
                    </Button>
                  </Flex>
                </>
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
                    <FormLabel htmlFor="location">Location/About</FormLabel>
                    <ReactQuill 
                      id="location" 
                      theme="snow"
                      modules={{
                        toolbar: [
                          [{ 'header': []}],
                          ['bold', 'italic', 'underline'],
                          [{'list': 'ordered'}, {'list': 'bullet'}],
                          ['link'],
                          [{'align': []}],
                          ['clean']
                        ]
                      }}
                      formats={[
                        'header','bold', 'italic', 'underline','list', 'bullet', 'align','link'
                      ]}
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
                <>
                  {updateBookClubMeetingMutation.error && (
                      <Text color="red">{(updateBookClubMeetingMutation.error as Error).message}</Text>
                    )
                  }
                  {clearRsvpsCallbackMutation.error && (
                      <Text color="red">{(clearRsvpsCallbackMutation.error as Error).message}</Text>
                    )
                  }
                  <Flex align="center" justify="flex-end" gap={2}>
                    <Button 
                      type="submit"
                      size="md"
                    >
                      Update
                    </Button>
                    <Button 
                      type="button"
                      size="md"
                      colorScheme="red"
                      onClick={clearRsvpsCallback}
                    >
                      Clear RSVP's
                    </Button>
                  </Flex>
                </>
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
                <Flex gap={1} position="sticky" top={0} zIndex={200}>
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
                          rounded="md"
                          bg="gray.100"
                          _dark={{
                            bg: "gray.600"
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
                              src={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215"}
                              alt="book image"
                            />
                            <Heading
                              as="h4"
                              size="sm"
                            >
                              {book.volumeInfo.title}
                            </Heading>
                            <Text>
                              {book.volumeInfo.authors ? book.volumeInfo.authors[0] : null}
                            </Text>
                          </Box>
                          <Flex align="center" justify="space-between">
                            <Popover isLazy>
                              <PopoverTrigger>
                                <Button size="xs" m={2}>Description</Button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody>{book.volumeInfo.description}</PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <Button 
                              size="xs"
                              data-book={JSON.stringify(book)}
                              onClick={e=>selectBook(e)}
                              colorScheme="green"
                            >
                              Set
                            </Button>
                          </Flex>
                        </Flex>
                      )
                    }) : null}
                  </Flex>
                )}
              </Stack>
            </ModalBody>
            <ModalFooter flexDirection="column">
            <> 
              {selectBookMutation.error && (
                  <Text color="red">{(selectBookMutation.error as Error).message}</Text>
                )
              }
            </>
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
                <Flex gap={1} position="sticky" top={0} zIndex={200}>
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
                          rounded="md"
                          bg="gray.100"
                          _dark={{
                            bg: "gray.600"
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
                              src={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215"}
                            />
                            <Heading
                              as="h4"
                              size="sm"
                            >
                              {book.volumeInfo.title}
                            </Heading>
                            <Text>
                              {book.volumeInfo.authors ? book.volumeInfo.authors[0] : null}
                            </Text>
                          </Box>
                          <Flex align="center" justify="space-between">
                            <Popover isLazy>
                              <PopoverTrigger>
                                <Button size="xs" m={2}>Description</Button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody>{book.volumeInfo.description}</PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <Button 
                              size="xs"
                              colorScheme="green"
                              onClick={e=>(
                                pollBookOne === null ? (
                                  setPollBookOne({
                                    image: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215",
                                    title: book.volumeInfo.title,
                                    author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : "",
                                    description: book.volumeInfo.description ? book.volumeInfo.description : "",
                                    link: book.volumeInfo.previewLink ? book.volumeInfo.previewLink : ""
                                  })
                                    ) : (
                                      pollBookTwo === null ? (
                                        setPollBookTwo({
                                          image: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215",
                                          title: book.volumeInfo.title,
                                          author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : "",
                                          description: book.volumeInfo.description ? book.volumeInfo.description : "",
                                          link: book.volumeInfo.previewLink ? book.volumeInfo.previewLink : ""
                                        })
                                          ) : pollBookThree === null ? (
                                            setPollBookThree({
                                              image: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215",
                                              title: book.volumeInfo.title,
                                              author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : "",
                                              description: book.volumeInfo.description ? book.volumeInfo.description : "",
                                              link: book.volumeInfo.previewLink ? book.volumeInfo.previewLink : ""
                                            })
                                            ) : null)
                              )}
                            >
                              Set
                            </Button>
                          </Flex>
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
                      <Heading as="h5" size="sm" textAlign="center">1</Heading>
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
                        <Heading as="h5" size="sm" textAlign="center">2</Heading>
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
                        <Heading as="h5" size="sm" textAlign="center">3</Heading>
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
              <Divider mt={3} />
              <>
                {clearPollVotesMutation.error && (
                  <Text color="red">{(clearPollVotesMutation.error as Error).message}</Text>
                )}
              </>
              <Flex align="center" justify="flex-end" gap={2} mt={3}>
                <Button
                  onClick={createPollBooks}
                >
                  Save
                </Button>
                <Button 
                  type="button"
                  size="md"
                  colorScheme="red"
                  onClick={clearPollVotes}
                >
                  Reset Votes
                </Button>
              </Flex>
            </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

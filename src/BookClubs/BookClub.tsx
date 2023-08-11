import React, { useState, useRef, ReactHTMLElement } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookClubMember, BookClubsType, BookClubBookType, BookClubRsvpType, BookClubBookPollVoteType, SelectedBook } from "../types/types";
import { 
  Box,
  Tag,
  Heading,
  Text,
  Checkbox,
  Button,
  Stack,
  Flex,
  Skeleton,
  Image,
  Center,
  Switch,
  Divider,
  FormLabel,
  FormErrorMessage,
  Textarea,
  Popover,
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
  Icon,
  useDisclosure,
  useToast,
  Input,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink
} from "@chakra-ui/react";
import GooglePreviewLink from "../shared/GooglePreviewLink";
import BooksSearch from "../shared/BooksSearch";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ICalendarLink from "react-icalendar-link";
import {FcGoogle} from 'react-icons/fc';
import { HiOutlinePencil } from 'react-icons/hi';
import { BsCardText, BsApple } from 'react-icons/bs';
import { AiOutlinePlus } from 'react-icons/ai';
import { TbBooks } from 'react-icons/tb';
import { MdChevronRight } from 'react-icons/md';
import { BookClubGeneralComments } from "../shared/BookClubGeneralComments";
import { ImInfo } from 'react-icons/im';
import { FaShoppingCart, FaStore } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import BookImage from "../shared/BookImage";
import Cookies from "js-cookie";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {genres} from "./genres";
import googleWatermark from "/src/assets/google_watermark.gif";

export default function BookClub({server,gbooksapi}: {server: string,gbooksapi: string}) {
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
          if (response.data.success) {
            let responseBookClub = response.data.message
            let isCreatorsFriend = response.data.isCreatorsFriend
            const currentBook1 = responseBookClub.BookClubBook ? responseBookClub.BookClubBook.reverse()[0] : null

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
              bookClub: responseBookClub,
              groups: responseBookClub.groups,
              isCreatorsFriend: isCreatorsFriend,
              currentBook: currentBook1 ? currentBook1 : null,
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
          else {
            throw new Error("Error: BCFE200")
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
    setTimeout(()=>{
      const groupChecks = document.querySelectorAll(".group-check > input[type='checkbox']")
      groupChecks.forEach((gc)=>{
        if ((gc as HTMLInputElement).checked) {
          bookClubAgeGroups.push((gc as HTMLInputElement).value)
        }
      })
    },100)
    onOpenEditModal()
  }

  function closeEditModal() {
    updateBookClubMutation.reset();
    deleteBookClubMutation.reset();
    setBookClubAgeGroups([])
    onClosEditModal()
  }

  const [switchVisibility,setSwitchVisibility] = useState(false);
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
            bookClubGroups: bookClubAgeGroups,
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
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      queryClient.setQueryData(["bookClubKey"],data)
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

  const [bookClubAgeGroups,setBookClubAgeGroups] = useState([] as string[]);
  function handleGroupCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = bookClubAgeGroups.includes(e.target.value)
    if (!isChecked) {
      bookClubAgeGroups.push(e.target.value)
    }
    else if (bookClubAgeGroups) {
      // let index = bookClubAgeGroups.indexOf(e.target.value)
      // bookClubAgeGroups.splice(index,1)
      bookClubAgeGroups.forEach((group,index)=>{
        if (group === e.target.value) {
          bookClubAgeGroups.splice(index,1)
        }
      })
    }
    setBookClubAgeGroups(prev=>bookClubAgeGroups)
  }

  const deleteBookClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (confirm("Are you sure you would like to delete this book club. This be undone.")) {
        let tokenCookie: string | null = Cookies.get().token;
        if (tokenCookie) {
          axios
          .delete(server + "/api/deletebookclub",
            {
              headers: {
                authorization: tokenCookie
              },
              data: {
                bookClubId: parseInt(idRef.current.value)
              }
            }
          )
          .then((response)=>{
            queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
            queryClient.resetQueries({queryKey: ['bookClubKey']})
            getBookClub();
            toast({
              description: "Successfully delete book club",
              status: "success",
              duration: 9000,
              isClosable: true
            })
            closeEditModal()
            navigate("/bookclubs")
          })
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
      }
      else {
        return;
      }
    }
  })
  function deleteBookClub(e: React.FormEvent) {
    deleteBookClubMutation.mutate(e);
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
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      queryClient.setQueryData(["bookClubKey"],data)
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
        return getBookClub();
    }},
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      queryClient.setQueryData(["bookClubKey"],data)
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
        return getBookClub();
    }},
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      queryClient.setQueryData(["bookClubKey"],data)
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
    setBookClubBook(bookClubBookId ? bookClubBookId : null)
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
      .get("https://openlibrary.org/search.json?q=" + searchBookRef.current.value)
      .then((response)=>{
        if (response.data.docs) {
          if (response.data.docs.length > 5) {
            const slicedResponse = response.data.docs.slice(0,5);
            setBookResults(slicedResponse)
          }
          else {
            setBookResults(response.data.docs)
          }
        }
        else {
          setBookResults(null)
        }
        setBookResultsLoading(false)
      })
      .catch((error)=>{
        console.log(error)
      })
  }

  const selectBookMutation = useMutation({
    mutationFn: async (book: SelectedBook) => {
      setBookResultsLoading(true)
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        if (bookClubBook !== null) { //Edit book club
          await axios
            .post(server + "/api/updatebookclubbook",
              {
                bookClubId: parseInt(paramsBookClubId!),
                bookClubBookId: bookClubBook,
                googleBooksId: book.google_books_id,
                bookImage: book.image,
                bookTitle: book.title,
                bookAuthor: book.author,
                bookDescription: book.description ? book.description : "",
                pageCount: book.page_count
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
        else if (bookClubBook === null) { //New book club
          await axios
          .post(server + "/api/setbookclubbook",
            {
              bookClubId: parseInt(paramsBookClubId!),
              googleBooksId: book.google_books_id,
              bookImage: book.image,
              bookTitle: book.title,
              bookAuthor: book.author,
              bookDescription: book.description ? book.description : "",
              pageCount: book.page_count
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
      }
      else {
        throw new Error("Something went wrong")
      }
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      queryClient.setQueryData(["bookClubKey"],data)
      setBookResultsLoading(false)
      closeCurrentBookModal()
      toast({
        description: bookClub === null ? "New book club book created" : "Book club book updated",
        status: "success",
        duration: 9000,
        isClosable: true
      })
    }
  })
  function selectBook(book: SelectedBook) {
    selectBookMutation.mutate(book);
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
      return getBookClub();
    },
    onSuccess: (data,varables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      getBookClub();
      // queryClient.setQueryData(["bookClubKey"],data)
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
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      // getBookClub();
      queryClient.setQueryData(["bookClubKey"],data)
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
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      // getBookClub();
      queryClient.setQueryData(["bookClubKey"],data)
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
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      // getBookClub();
      queryClient.setQueryData(["bookClubKey"],data)
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
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      // getBookClub();
      queryClient.setQueryData(["bookClubKey"],data)
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
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      // getBookClub();
      queryClient.setQueryData(["bookClubKey"],data)
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
      return getBookClub();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      // getBookClub();
      queryClient.setQueryData(["bookClubKey"],data)
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
      return getBookClub();
    },
    onSuccess: (data,variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookClubKey'] })
      queryClient.resetQueries({queryKey: ['bookClubKey']})
      // getBookClub();
      queryClient.setQueryData(["bookClubKey"],data)
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
  const isCreatorsFriend = bookClubData?.isCreatorsFriend;
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
  const bookClubGroups: string[] = bookClubData?.groups ? JSON.parse(bookClubData.groups) : [];
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
        <Breadcrumb 
          spacing='8px' 
          separator={<MdChevronRight color='gray.500' />}
          m=".5rem"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href='/bookclubs'>Book Clubs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href='#'>Book Club</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Skeleton 
          isLoaded={!bookClubQuery.isLoading}
        >
          <Heading as="h1" className="visually-hidden">Book Club</Heading>
          {bookClub ? (
            <Flex flexWrap="wrap" w="100%" align="start" justify="space-between" gap={1}>
              <Stack flex="1 1 30%" top="0" gap={1}>
                <Flex className="well" direction="column" align="center" gap={2}>
                  <Flex
                    align="center"
                    justify="space-between"
                    w="100%"
                  >
                    <Heading as="h2" size="md">{bookClub.name}</Heading>
                    {isBookClubCreator ? (
                      <Button
                        onClick={openEditModal}
                        leftIcon={<HiOutlinePencil/>}
                        variant="ghost"
                        size="sm"
                      >
                        Edit
                      </Button>
                    ): null}
                  </Flex>
                  <Text>{bookClub.about}</Text>
                  <Flex align="center" justify="center" flexWrap="wrap" gap={1}>
                    {bookClubGroups && bookClubGroups.length ? (
                      bookClubGroups.sort().map((group,i)=>{
                        const cScheme = genres.filter((genre)=>genre.value === group)[0].color;
                        const genreName = genres.filter((genre)=>genre.value === group)[0].name;
                        return (
                          <Flex align="center" key={i}>
                            <Tag 
                              colorScheme={cScheme}
                              size="sm"
                              fontWeight="bold"
                            >
                              {genreName}
                            </Tag>
                          </Flex>
                        )
                      })
                    ) : (
                      <Tag
                        colorScheme="yellow"
                        size="sm"
                        fontWeight="bold"
                      >
                        All groups
                      </Tag>
                    )}
                  </Flex>
                  <Text fontStyle="italic">
                    {bookClub.visibility === 0 ? "private (friends only)" : "public"}
                  </Text>
                </Flex>
                {bookClub.visibility === 0 && !isCreatorsFriend ? (
                  null
                ) : (
                  <Flex className="well" direction="column" gap={2}>
                    <Flex align="center" justify="space-between">
                      <Heading as="h2" size="md">
                        Members ({
                          bookClub.BookClubMembers
                          .filter((bcm)=>bcm.status === 2)
                          .length + 1
                        })
                      </Heading>
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
                    <Box
                      maxHeight="25vh"
                      overflowX="auto"
                    >
                      <Box
                        as={Link}
                        to={`/profile/${bookClub.Profile.username}`}
                        _hover={{
                          textDecoration: "none",
                          color: "teal"
                        }}
                      >
                        {bookClub.Profile.username}
                        <Text as="span" fontSize="sm" fontStyle="italic">
                          {" "}admin
                        </Text>
                      </Box>
                      {bookClub.BookClubMembers.length ? bookClub.BookClubMembers.map((member,i)=>{
                        return (
                          member.status === 2 ? (
                            <Flex 
                              key={i} 
                              align="center" 
                              justify="space-between"
                            >
                              <Box
                                as={Link} 
                                to={`/profile/${member.Profile.username}`}
                                _hover={{
                                  textDecoration: "none",
                                  color: "teal"
                                }}
                              >
                                {member.Profile.username}
                              </Box>
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
                )}
              </Stack>

              <Stack flex="1 1 65%" maxW="100%" gap={1}>
                {memberStatus === 2 || isBookClubCreator ? (
                  <>
                    <Flex className="well" direction="column" gap={2}>
                      <Flex align="center" justify="space-between">
                        <Heading as="h2" size="md">Currently Reading</Heading>
                        <Flex>
                          {isBookClubCreator ? (
                            <>
                              {currentBook ? (
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  onClick={e=>openEditCurrentBookModal(currentBook ? currentBook?.id! : null)}
                                  leftIcon={<HiOutlinePencil size={15} />}
                                >
                                  Edit
                                </Button>
                              ) : null}
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<AiOutlinePlus size={15} />}
                                onClick={e=>openNewCurrentBookModal()}
                              >
                                New
                              </Button>
                            </>
                          ) : null}
                        </Flex>
                      </Flex>
                      {currentBook ? (
                      <>
                        <Box
                          className="well-card"
                        >
                          <Flex  
                            gap={4}
                            justify="center"
                          >
                            <Box
                              maxW="100px"
                            >
                              <Image
                                maxW="100%" 
                                w="100%"
                                h="auto"
                                m={1}
                                className="book-image"
                                onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                src={currentBook?.image}
                                boxShadow="1px 1px 1px 1px darkgrey"
                                alt={currentBook?.title}
                              />
                            </Box>
                            <Flex direction="column">
                              <Heading as="h2" size="md" noOfLines={1}>
                                {currentBook?.title}
                              </Heading>
                              <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                                {currentBook?.author}
                              </Text>
                              {/* <Box maxH="225px" overflow="auto">
                                {currentBook?.description ? currentBook.description : null}
                              </Box> */}
                              <Text fontStyle="italic">
                                {currentBook.published_date !== null ? 
                                  (
                                    dayjs(currentBook.published_date).format("YYYY")
                                  ) : null
                                }
                              </Text>
                              {currentBook.page_count ? (
                                <Text noOfLines={1}>
                                  {currentBook.page_count} pages
                                </Text>
                              ): null}
                              <Button 
                                as={Link}
                                to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(currentBook.title + " " + currentBook.author)}`}
                                target="blank"
                                fontWeight="bold"
                                minW="unset"
                                maxW="min-content"
                                width="auto"
                                // p={2}
                                borderColor="black"
                                size="xs"
                                variant="outline"
                                leftIcon={<FaStore size={20} />}
                              >
                                View info in shop
                              </Button>
                            </Flex>
                          </Flex>
                          <Flex justify="center">
                            <Divider borderColor="gray.400" my={3} w="95%" />
                          </Flex>
                          <Center flexDirection="column" gap={1}>
                            <Button 
                              backgroundColor="black"
                              color="white"
                              leftIcon={<BsCardText size={20} />}
                              as={Link}
                              size="sm"
                              to={`${currentBook?.id}`}
                            >
                              Discussion
                            </Button>
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
                                <PopoverBody
                                  _dark={{
                                    bg: "black"
                                  }}
                                >
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
                        <Flex align="center" gap={2}>
                          <Heading as="h2" size="md">Next Chat Meeting</Heading>
                          <Tooltip
                            label="The meeting link will appear at start time"
                            aria-label="meeting tooltip"
                            hasArrow
                          >
                            <Box>
                              <ImInfo size={20}/>
                            </Box>
                          </Tooltip>
                        </Flex>
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
                        {bookClub.next_meeting_start || bookClub.next_meeting_end ? (
                          <Box
                            className="well-card"
                          >
                          {bookClub.next_meeting_start || bookClub.next_meeting_end ? (
                          <> 
                            <Flex 
                              gap={2} 
                              fontWeight="bold" 
                              justify="center"
                              mb={2}
                              // p={2}
                            >
                              <Text>{bookClub.next_meeting_start ? dayjs(bookClub.next_meeting_start).local().format('MMM DD, h:mm a') : null}</Text>
                              <Text>-</Text>
                              <Text>{bookClub.next_meeting_end ? dayjs(bookClub.next_meeting_end).local().format('MMM DD, h:mm a'): null}</Text>
                            </Flex>
                            {dayjs(new Date()) < dayjs(bookClub.next_meeting_end) && dayjs(new Date()) > dayjs(bookClub.next_meeting_start) ? (
                            <Center>
                              <Button
                                mb={2}
                                backgroundColor="black"
                                color="white"
                                as={Link}
                                to={`/chat/room?bookclub=${bookClub.name}`}
                              >
                                Join
                              </Button>
                            </Center>
                            ) : null}
                          </>
                          ) : null}
                            <Flex align="center" justify="space-between">
                              <Flex 
                                alignItems="center" 
                                flexWrap="wrap" 
                                gap={1} 
                                justifyContent="center" 
                                ms={2}
                              >
                                <Button
                                  variant="outline"
                                  borderColor="black"
                                  size="sm"
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  aria-label="add to google calendar"
                                  as={Link}
                                  target="_blank" 
                                  to={`https://calendar.google.com/calendar/render?action=TEMPLATE&ctz=US/Eastern&location=Online&dates=${new Date(bookClub.next_meeting_start).toISOString().replace(/[\W_]+/g,"")}/${new Date(bookClub.next_meeting_end).toISOString().replace(/[\W_]+/g,"")}&text=${bookClub.name}&trp=false`}
                                >
                                  <Icon as={FcGoogle}/> GCal
                                </Button>
                                <Button
                                  variant="outline"
                                  borderColor="black"
                                  size="sm"
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  aria-label="add to icalendar"
                                  as={ICalendarLink}
                                  event={{
                                    title: bookClub.name + " Book Club Meeting",
                                    description: "",
                                    startTime: dayjs(new Date(bookClub.next_meeting_start)).toISOString(),
                                    endTime: dayjs(new Date(bookClub.next_meeting_end)).toISOString(),
                                    location: "Online",
                                    attendees: []
                                  }}
                                >
                                  <Icon as={BsApple} mb={1}/>ICal
                                </Button>
                              </Flex>
                              <Flex align="center">
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
                                      backgroundColor="black"
                                      color="white"
                                      size="sm"
                                      m={1}
                                      disabled={rsvpCallbackMutation.isLoading}
                                      onClick={rsvpCallback}
                                    >
                                      RSVP
                                    </Button>
                                  ) : (
                                    <Button
                                      colorScheme="red"
                                      variant="outline"
                                      size="sm"
                                      disabled={rsvpCallbackMutation.isLoading}
                                      onClick={unRsvpCallback}
                                    >
                                      Un-RSVP
                                    </Button>
                                  )}
                                  {bookClub?.BookClubMeetingRsvp.length ? (
                                    <Popover isLazy>
                                      <PopoverTrigger>
                                        <Button size="xs" opacity="65%" variant="ghost" m={1}>View RSVP List</Button>
                                      </PopoverTrigger>
                                      <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverHeader>RSVP List</PopoverHeader>
                                        <PopoverBody
                                          _dark={{
                                            bg: "black"
                                          }}
                                        >
                                          {bookClub?.BookClubMeetingRsvp.map((rsvp,i)=>{
                                            return (
                                              <Text key={i}>
                                                <Link
                                                  to={`/profile/${rsvp.Profile.username}`}
                                                >
                                                  {rsvp.Profile.username}
                                                </Link>
                                              </Text>
                                            )
                                          })}
                                        </PopoverBody>
                                      </PopoverContent>
                                    </Popover>
                                  ) : null}
                                </>
                              </Flex>
                            </Flex>
                          </Box>
                        ) : (
                          <Text fontStyle="italic">
                            No meetings scheduled yet
                          </Text>
                        )}
                      </Stack>
                    </Flex>

                    <Flex className="well" direction="column" gap={2}>
                      <Flex align="center" justify="space-between">
                        <Heading as="h2" size="md">Next Book Poll</Heading>
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
                          <Flex justify="space-around" w="100%" flexWrap="nowrap" gap={0}>
                            {pollBookOneReceived ? (
                              <Flex
                                flexDirection="column" 
                                flex="0 1 175px"
                                className="well-card"
                                p={1}
                              >
                                <Box>
                                  <Heading as="h3" size="sm" textAlign="center">1</Heading>
                                  <Image
                                    maxW="100%" 
                                    w="100%"
                                    h="auto"
                                    pt={2} 
                                    mb={1}
                                    className="book-image"
                                    onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                    src={pollBookOneReceived.image}
                                    boxShadow="1px 1px 1px 1px darkgrey"
                                    alt={pollBookOneReceived.title}
                                  />
                                </Box>
                                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                  {pollBookOneReceived.title}
                                </Text>
                                <Text fontSize="sm" noOfLines={1}>
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
                                    <PopoverBody
                                      _dark={{
                                        bg: "black"
                                      }}
                                    >{pollBookOneReceived.description ? pollBookOneReceived.description : null}</PopoverBody>
                                  </PopoverContent>
                                </Popover>

                                {bookClub.BookClubBookPoll?.BookClubBookPollVote
                                .filter((pollVote)=>pollVote.profile_id === user.Profile.id).length ? (

                                  bookClub.BookClubBookPoll?.BookClubBookPollVote
                                  .filter((pollVote)=>pollVote.book === 1 && pollVote.profile_id === user.Profile.id).length ? (
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      borderColor="black"
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
                                    backgroundColor="black"
                                    color="white"
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
                                className="well-card"
                                p={1}
                              >
                                <Box>
                                  <Heading as="h3" size="sm" textAlign="center">2</Heading>
                                  <Image
                                    maxW="100%" 
                                    w="100%"
                                    h="auto"
                                    pt={2} 
                                    mb={1}
                                    className="book-image"
                                    onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                    src={pollBookTwoReceived.image}
                                    boxShadow="1px 1px 1px 1px darkgrey"
                                    alt={pollBookTwoReceived.title}
                                  />
                                </Box>
                                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                  {pollBookTwoReceived.title}
                                </Text>
                                <Text fontSize="sm" noOfLines={1}>
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
                                    <PopoverBody
                                      _dark={{
                                        bg: "black"
                                      }}
                                    >{pollBookTwoReceived.description ? pollBookTwoReceived.description : null}</PopoverBody>
                                  </PopoverContent>
                                </Popover>
                                {bookClub.BookClubBookPoll?.BookClubBookPollVote
                                .filter((pollVote)=>pollVote.profile_id === user.Profile.id).length ? (
                                  
                                  bookClub.BookClubBookPoll?.BookClubBookPollVote
                                  .filter((pollVote)=>pollVote.book === 2 && pollVote.profile_id === user.Profile.id).length ? (
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      borderColor="black"
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
                                    backgroundColor="black"
                                    color="white"
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
                                className="well-card"
                                p={1}
                              >
                                <Box>
                                  <Heading as="h3" size="sm" textAlign="center">3</Heading>
                                  <Image
                                    maxW="100%" 
                                    w="100%"
                                    h="auto"
                                    pt={2} 
                                    mb={1}
                                    className="book-image"
                                    onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                    src={pollBookThreeReceived.image}
                                    boxShadow="1px 1px 1px 1px darkgrey"
                                    alt={pollBookThreeReceived.title}
                                  />
                                </Box>
                                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                  {pollBookThreeReceived.title}
                                </Text>
                                <Text fontSize="sm" noOfLines={1}>
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
                                    <PopoverBody
                                      _dark={{
                                        bg: "black"
                                      }}
                                    >{pollBookThreeReceived.description ? pollBookThreeReceived.description : null}</PopoverBody>
                                  </PopoverContent>
                                </Popover>
                                {bookClub.BookClubBookPoll?.BookClubBookPollVote
                                .filter((pollVote)=>pollVote.profile_id === user.Profile.id).length ? (
                                  
                                  bookClub.BookClubBookPoll?.BookClubBookPollVote
                                  .filter((pollVote)=>pollVote.book === 3 && pollVote.profile_id === user.Profile.id).length ? (
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      borderColor="black"
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
                                    backgroundColor="black"
                                    color="white"
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
                      <Heading as="h2" size="md" mb={2}>General Discussion</Heading>
                      <BookClubGeneralComments 
                        server={server}
                        bookClubId={paramsBookClubId!}
                        bookClubBookId={null}
                        subdomain={window.location.host.split(".")[0]}
                        uri={window.location.pathname}
                        isBookClubCreator={isBookClubCreator!}
                        type="bookClub"
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
      
      <Modal isOpen={isOpenEditModal} onClose={closeEditModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
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
                  <FormLabel htmlFor="name" mb={0}>Name</FormLabel>
                  <Input
                    type="text"
                    id="name"
                    ref={nameRef}
                    defaultValue={bookClub?.name}
                    borderColor="black"
                    required
                  />
                  <FormErrorMessage>Name is required</FormErrorMessage>
                </Box>
                <FormLabel htmlFor="about" mb={0}>About</FormLabel>
                <Textarea
                  ref={aboutRef}
                  id="about"
                  defaultValue={bookClub?.about}
                  borderColor="black"
                />
                <Stack 
                  spacing={3} 
                  justify="center"
                  direction='row' 
                  flexWrap="wrap" 
                  rowGap={2}
                  my={3}
                >
                  {genres.map((genre,i)=>{
                    return (
                      <Checkbox
                        value={genre.value}
                        onChange={e=>handleGroupCheckbox(e)}
                        defaultChecked={bookClubGroups.includes(genre.value)}
                        className="group-check"
                        key={i}
                      >
                        {genre.name}
                      </Checkbox>
                    )
                  })}
                </Stack>
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
                  {deleteBookClubMutation.error && (
                      <Text color="red">{(deleteBookClubMutation.error as Error).message}</Text>
                    )
                  }
                  <Flex align="center" justify="space-between" w="100%">
                    <Button 
                      type="button"
                      mr={3}
                      size="md"
                      colorScheme="red"
                      onClick={e=>deleteBookClub(e)}
                    >
                      Delete
                    </Button>
                    <Button 
                      type="submit"
                      size="md"
                      backgroundColor="black"
                      color="white"
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
        <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Edit Book Club Meeting
          </ModalHeader>
          <ModalCloseButton />
            <Flex as="form" direction="column" w="100%" onSubmit={e=>updateBookClubMeeting(e)}>
              <ModalBody>
                <Flex gap={1} justify="space-between" flexWrap="wrap">
                  <Flex direction="column">
                    <FormLabel htmlFor="from">From</FormLabel>
                    <Input
                      id="from"
                      type="datetime-local"
                      defaultValue={bookClub?.next_meeting_start ? dayjs(bookClub?.next_meeting_start).format('YYYY-MM-DD h:mm') :  ""}
                      ref={meetingStartRef}
                    />
                  </Flex>
                  <Flex direction="column">
                    <FormLabel htmlFor="to">To</FormLabel>
                    <Input
                      id="to"
                      type="datetime-local"
                      defaultValue={bookClub?.next_meeting_end ? dayjs(bookClub?.next_meeting_end).format('YYYY-MM-DD h:mm') :  ""}
                      ref={meetingEndRef}
                    />
                  </Flex>
                </Flex>
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
                  <Flex align="center" justify="space-between" w="100%">
                    <Button 
                      type="button"
                      size="md"
                      variant="outline"
                      colorScheme="red"
                      onClick={clearRsvpsCallback}
                    >
                      Clear RSVP's
                    </Button>
                    <Button 
                      type="submit"
                      backgroundColor="black"
                      color="white"
                      size="md"
                      colorScheme="purple"
                    >
                      Update
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
        isCentered
      >
        <ModalOverlay />
        <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            New Book Club Book
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
              <BooksSearch selectText="Select" selectCallback={selectBook as any} gBooksApi={gbooksapi}/>
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
        // size="xl" 
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="100vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Next Book Poll
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="250px" h="auto" maxH="95vh" overflow="auto">
              <Stack gap={2} position="relative">
                <Flex gap={1} position="sticky" top={0} zIndex={200}>
                  <Input
                    type="text"
                    size="lg"
                    ref={searchBookRef}
                    bg="white"
                    color="black"
                    onKeyDown={e=>e.key === "Enter" ? searchBook() : null}
                  />
                  <Button
                    onClick={searchBook}
                    size="lg"
                    borderColor="black"
                    variant="outline"
                  >
                    Search
                  </Button>
                </Flex>
                {bookResultsLoading ? (
                  <Center>
                    <Spinner size="xl"/>
                  </Center>
                ) : (
                  <Flex
                    gap={1} 
                    direction="column"
                  >
                    {bookResults ? bookResults.map((book,i)=>{
                      return (
                        <React.Fragment key={i}>
                          <Flex
                            gap={2}
                          >
                            <Box flex="1 1 auto" maxW="50px">
                              {book.cover_i || book.lccn ? (
                                <Image
                                  maxW="100%" 
                                  w="100%"
                                  h="auto"
                                  className="book-image"
                                  onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                  src={book.cover_i ? (
                                    `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg?default=false`
                                  ) : (
                                    book.lccn ? (
                                      `https://covers.openlibrary.org/b/lccn/${book.lccn[0]}-M.jpg?default=false`
                                    ) : (
                                      "https://via.placeholder.com/165x215"
                                    )
                                  )}
                                  alt="book image"
                                  boxShadow="1px 1px 1px 1px darkgrey"
                                  _hover={{
                                    cursor: "pointer"
                                  }}
                                  id={`book-cover-${i}`}
                                />
                              ): (
                                <BookImage 
                                  isbn={book.isbn?.length ? book.isbn[book.isbn.length - 1] : null}
                                  id={`book-cover-${i}`}
                                />
                              )}
                            </Box>
                              <Box flex="1 1 auto">
                              <Heading
                                as="h4"
                                size="sm"
                                noOfLines={1}
                              >
                                {book.title}
                              </Heading>
                              <Text fontSize="sm" noOfLines={1}>
                                {book.author_name ? book.author_name[0] : null}
                              </Text>
                              <Text fontSize="sm" fontStyle="italic">
                                {book.publish_date ? dayjs(book.publish_date[0]).format('YYYY') : null}
                              </Text>
                              <Flex align="center" gap={2}>
                                {/* <GooglePreviewLink book={book}/> */}
                                <Button 
                                  size="xs"
                                  backgroundColor="black"
                                  color="white"
                                  onClick={e=>(
                                    pollBookOne === null ? (
                                      setPollBookOne({
                                        title: book.title,
                                        author: book.author_name ? book.author_name[0] : "",
                                        image: document.getElementById(`book-cover-${i}`)!.getAttribute("src")!,
                                        description: "",
                                        link: ""
                                      })
                                        ) : (
                                          pollBookTwo === null ? (
                                            setPollBookTwo({
                                              title: book.title,
                                              author: book.author_name ? book.author_name[0] : "",
                                              image: document.getElementById(`book-cover-${i}`)!.getAttribute("src")!,
                                              description: "",
                                              link: ""
                                            })
                                              ) : pollBookThree === null ? (
                                                setPollBookThree({
                                                  title: book.title,
                                                  author: book.author_name ? book.author_name[0] : "",
                                                  image: document.getElementById(`book-cover-${i}`)!.getAttribute("src")!,
                                                  description: "",
                                                  link: ""
                                                })
                                                ) : null)
                                  )}
                                >
                                  Select
                                </Button>
                              </Flex>
                            </Box>
                          </Flex>
                          {i !== bookResults.length - 1 ? (
                            <Divider/>
                          ): null}
                        </React.Fragment>
                      )
                    }) : null}
                  </Flex>
                )}
              </Stack>
            </ModalBody>
            <ModalFooter flexDirection="column" borderTop="1px solid gray">
              <Flex justify="space-between" w="100%" flexWrap="nowrap" gap={2}>
                <Box flex="0 1 125px">
                  {pollBookOne !== null ? (
                  <>
                    <Box maxW="75px">
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
                        boxShadow="1px 1px 1px 1px darkgrey"
                        alt={pollBookOne.title}
                      />
                    </Box>
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                      {pollBookOne.title}
                    </Text>
                    <Text fontSize="sm">
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
                      <Box maxW="75px">
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
                          boxShadow="1px 1px 1px 1px darkgrey"
                          alt={pollBookTwo.title}
                        />
                      </Box>
                      <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                        {pollBookTwo.title}
                      </Text>
                      <Text fontSize="sm">
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
                      <Box maxW="75px">
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
                          boxShadow="1px 1px 1px 1px darkgrey"
                          alt={pollBookThree.title}
                        />
                      </Box>
                      <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                        {pollBookThree.title}
                      </Text>
                      <Text fontSize="sm">
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
              <Flex align="center" justify="space-between" w="100%" mt={3}>
                <Button 
                  type="button"
                  size="md"
                  colorScheme="yellow"
                  onClick={clearPollVotes}
                >
                  Reset Votes
                </Button>
                <Button
                  onClick={createPollBooks}
                  backgroundColor="black"
                  color="white"
                >
                  Save
                </Button>
              </Flex>
            </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

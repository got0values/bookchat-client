import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams, redirect } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { BookshelfBook, BookshelfType, BookSuggestionType, SelectedBook, SuggestionPollBookType } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Avatar,
  Image,
  Spinner,
  Button,
  Input,
  Flex,
  Skeleton,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  CloseButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import GooglePreviewLink from "../shared/GooglePreviewLink";
import BookImage from "../shared/BookImage";
import BooksSearch from "../shared/BooksSearch";
import RequestSuggestion from "../shared/RequestSuggestion";
import CurrentWeekSuggestionCount from "./CurrentWeekSuggestionCount";
import { CheckedAnimation } from "../shared/Animations";
import { SuggestionCountBadge } from "../shared/SuggestionCount";
import { BsArrowRight } from 'react-icons/bs';
import { MdChevronRight } from 'react-icons/md';
import { BsStarFill } from "react-icons/bs";
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { FaStore } from 'react-icons/fa';
import StarRating from "../shared/StarRating";
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";
import googleWatermark from "/src/assets/google_watermark.gif";
import { useAuth } from "../hooks/useAuth";


export default function BookSuggestionBookshelf({server,gbooksapi}: {server: string, gbooksapi: string}) {
  const toast = useToast();
  const navigate = useNavigate();
  dayjs.extend(utc);
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const {user,getUser} = useAuth();

  const [bookshelfProfileName,setBookshelfProfileName] = useState(searchParams.get("profile"))
  const [nextBookshelf,setNextBookshelf] = useState<BookshelfType | null>(null);
  const [currentBookshelf,setCurrentBookshelf] = useState<BookshelfType | null>(null);
  const [previousSuggestions,setPreviousSuggestions] = useState<BookSuggestionType[] | null>(null);
  const [startPoll,setStartPoll] = useState(false);
  const [pollBookOne,setPollBookOne] = useState<SuggestionPollBookType | null>(null)
  const [pollBookTwo,setPollBookTwo] = useState<SuggestionPollBookType | null>(null)
  const [pollBookThree,setPollBookThree] = useState<SuggestionPollBookType | null>(null)
  const [take,setTake] = useState(10);
  const [endLoadMore,setEndLoadMore] = useState(false);
  const [loadMoreIsLoading,setLoadMoreIsLoading] = useState(false);
  const [bookSuggestionBookshelf,setBookSuggestionBookshelf] = useState<BookshelfType>();
  const [finishedSuggesting,setFinishedSuggesting] = useState(false);
  async function getBookSuggestionBookshelf() {
    if (!searchParams.get("profile")) {
      throw new Error("No Profile")
    }
    else {
      setBookshelfProfileName(prev=>searchParams.get("profile"))
    }
    let tokenCookie: string | null = Cookies.get().token;
    setLoadMoreIsLoading(true)
    const bookSuggestionBookshelfGet = axios
      .get(server + "/api/getbooksuggestionbookshelf",
        {
          headers: {
            'authorization': tokenCookie
          },
          params: {
            profilename: bookshelfProfileName,
            take: take
          }
        }
      )
      .then((response)=>{
        const {data} = response;
        const currentbookshelf = data.message;
        setCurrentBookshelf(currentbookshelf);
        const nextbookshelfdata = data.nextbookshelf;
        const previoussuggestionsdata = data.previoussuggestions;
        if (nextbookshelfdata) {
          setNextBookshelf(nextbookshelfdata)
        }
        if (previoussuggestionsdata) {
          setPreviousSuggestions(previoussuggestionsdata)
        }
        if (currentbookshelf?.BookshelfBook.length < take) {
          setEndLoadMore(true);
        }
        setBookSuggestionBookshelf({
          ...currentbookshelf,
          Flag: currentbookshelf?.Profile.country ? (countryFlagIconsReact as any)[currentbookshelf.Profile.country] : <Box></Box>
        });
        setStartPoll(data.message.start_poll === 1 ? true : false);
        setPollBookOne(data.message.BookSuggestionPollBookOne.length ? data.message.BookSuggestionPollBookOne[0] : null)
        setPollBookTwo(data.message.BookSuggestionPollBookTwo.length ? data.message.BookSuggestionPollBookTwo[0] : null)
        setPollBookThree(data.message.BookSuggestionPollBookThree.length ? data.message.BookSuggestionPollBookThree[0] : null)
        return currentbookshelf;
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.error)
      })
    setLoadMoreIsLoading(false)
    return bookSuggestionBookshelfGet
  }

  useEffect(()=>{
    getBookSuggestionBookshelf()
  },[take])

  const { 
    isOpen: isOpenSearchModal, 
    onOpen: onOpenSearchModal, 
    onClose: onCloseSearchModal 
  } = useDisclosure()

  function closeSearchModal() {
    onCloseSearchModal();
  }

  const searchInputRef = useRef({} as HTMLInputElement);
  const [selectedBook,setSelectedBook] = useState<any | null>(null);
  function selectBook(book: SelectedBook) {
    setSelectedBook(book);
    onCloseSearchModal();
  }
  const notesRef = useRef({} as HTMLTextAreaElement);
  async function suggestBook(e: React.FormEvent) {
    const google_books_id = selectedBook.google_books_id;
    const image = selectedBook.image;
    const title = selectedBook.title;
    const author = selectedBook.author;
    const description = selectedBook.description;
    const isbn = selectedBook.isbn;
    const page_count = selectedBook.page_count;
    const published_date = selectedBook.published_date;
    const notes = notesRef.current.value;

    let tokenCookie = Cookies.get().token;
    if (tokenCookie) {
      await axios
        .post(server + "/api/setbooksuggestion", 
        {
          suggestee: bookSuggestionBookshelf?.Profile.id,
          google_books_id: google_books_id,
          image: image,
          title: title,
          author: author,
          description: description,
          published_date: published_date,
          isbn: isbn,
          page_count: page_count ? parseInt(page_count) : null,
          notes: notes

        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=> {
          getUser();
          toast({
            description: "Book suggested!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
          searchInputRef.current.value = "";
          if (nextBookshelf) {
            setFinishedSuggesting(true)
            navigate(`/booksuggestions/bookshelf?profile=${nextBookshelf.Profile.username}`)
            setTimeout(()=>{
              window.location.reload()
            },1500)
          }
          else {
            navigate(`/booksuggestions`);
            toast({
              description: "No bookshelves left for suggestions. Please check back later",
              status: "info",
              duration: 9000,
              isClosable: true
            })
          }
          setSelectedBook(null);
          closeSearchModal();
        })
        .catch(({response})=>{
          console.log(response.data)
          toast({
            description: "An error has occurred",
            status: "error",
            duration: 9000,
            isClosable: true
          })
        })
    }
  }

  const castVoteMutation = useMutation({
    mutationFn: async ({pollBookNumber, pollBookId}: {pollBookNumber: number, pollBookId: number})=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (currentBookshelf && (pollBookOne || pollBookTwo || pollBookThree)) {
        await axios
        .post(server + "/api/castbooksuggestionvote", 
          {
            pollBookNumber: pollBookNumber,
            pollBookId: pollBookId,
            bookshelf: currentBookshelf.id
          },
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          if (response.data.success) {
            toast({
              description: "Vote cast!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          }
          else {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
          }
          if (nextBookshelf) {
            setFinishedSuggesting(true)
            navigate(`/booksuggestions/bookshelf?profile=${nextBookshelf.Profile.username}`)
            setTimeout(()=>{
              window.location.reload()
            },1500)
          }
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
        return getBookSuggestionBookshelf();
      }
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookSuggestionBookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookSuggestionBookshelfKey']})
      queryClient.setQueryData(["bookSuggestionBookshelfKey"],data)
    }
  })
  async function castVote({pollBookNumber, pollBookId}: {pollBookNumber: number, pollBookId: number}) {
    castVoteMutation.mutate({pollBookNumber,pollBookId});
  }

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookSuggestionBookshelfKey'], 
    queryFn: getBookSuggestionBookshelf
  });

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="80vh">
        <Spinner size="xl"/>
      </Flex>
    )
  }
  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }

  return (
    <Box className="main-content-smaller">
      <Skeleton
        isLoaded={!isLoading}
      >
        {finishedSuggesting ? (
          <CheckedAnimation/>
        ): (
        <>
          <Flex
            className="non-well"
            direction="column"
            // pb={2}
          >
            <Flex
              align="center"
              justify="space-between"
              className="non-well"
            >
              <Breadcrumb 
                spacing='8px' 
                separator={<MdChevronRight color='gray.500' />}
              >
                <BreadcrumbItem>
                  <BreadcrumbLink href='/booksuggestions'>Book Suggestions</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink href='#'>Bookshelf</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
              {nextBookshelf ? (
                <Button
                  as="a"
                  href={`/booksuggestions/bookshelf?profile=${nextBookshelf.Profile.username}`}
                  variant="ghost"
                  fontSize="md"
                  display="flex"
                  gap={2}
                  p={0}
                  _hover={{
                    bg: "transparent"
                  }}
                  // onClick={e=>redirect(`/booksuggestions/bookshelf?profile=${nextBookshelf.Profile.username}`)}
                >
                  Skip <BsArrowRight size={20} />
                </Button>
              ): null}
            </Flex>
            <Box
              rounded="md"
              // border="1px solid black"
              p={2}
            >
              <Flex
                align="center"
                justify="space-between"
              >
                <Flex
                  align="center"
                  gap={2}
                >
                  <Avatar 
                    as={Link}
                    to={`/profile/${bookSuggestionBookshelf?.Profile?.username}`}
                    src={bookSuggestionBookshelf?.Profile?.profile_photo} 
                    name={bookSuggestionBookshelf?.Profile?.username} 
                  />
                  <Text 
                    as={Link}
                    to={`/profile/${bookSuggestionBookshelf?.Profile?.username}`}
                    fontWeight="bold" 
                    fontSize="xl"
                  >
                    {bookSuggestionBookshelf?.Profile?.username} 
                  </Text>
                  {/* <Box w="1.4rem">
                    {bookSuggestionBookshelf.Flag ? <bookSuggestionBookshelf.Flag/> : null}
                  </Box> */}

                  <SuggestionCountBadge suggestionCount={bookSuggestionBookshelf?.Profile?._count.BookSuggestion_BookSuggestion_suggestorToProfile}/>

                  {bookSuggestionBookshelf?.Profile.id !== user.Profile.id && user.Profile.Bookshelf?.allow_suggestions ? (
                    <Menu>
                      <MenuButton 
                        as={Button}
                        size="sm"
                        // variant="ghost"
                        rounded="full"
                        height="20px"
                        title="menu"
                        px={2}
                      >
                        <BiDotsHorizontalRounded size={15} />
                      </MenuButton>
                      <MenuList>
                        {bookSuggestionBookshelf?.Profile.id !== user.Profile.id && user.Profile.Bookshelf?.allow_suggestions ? (
                          <RequestSuggestion server={server} requestee={bookSuggestionBookshelf?.Profile.id ? bookSuggestionBookshelf?.Profile.id : null} />
                        ): null}
                      </MenuList>
                    </Menu>
                  ): null}
                </Flex>
              </Flex>
              {bookSuggestionBookshelf?.suggestions_notes ? (
                <Text fontStyle="italic">
                  "{bookSuggestionBookshelf?.suggestions_notes}"
                </Text>
              ): null}
            </Box>
          </Flex>

          <Divider borderColor="blackAlpha.700" mb={2} />

          {startPoll && (pollBookOne || pollBookTwo || pollBookThree) ? (
            <>
              <Box 
                className="non-well"
                mb={2}
              >
                <Heading as="h3" size="sm" mb={1} color="blackAlpha.800">Vote:</Heading>
                  <Flex justify="space-around" w="100%" flexWrap="nowrap" gap={2}>
                    {pollBookOne !== null ? (
                    <Box 
                      flex="0 1 125px"
                      rounded="md"
                      border="1px solid"
                      borderColor="gray.400"
                      p={1}
                    >
                      <Box 
                        mx="auto"
                        maxW="90px"
                      >
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
                      <Flex align="center" gap={1}>
                        <Popover isLazy>
                          <PopoverTrigger>
                            <Box
                              _hover={{
                                cursor: "pointer"
                              }}
                            >
                              <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                {pollBookOne.title}
                              </Text>
                            </Box>
                          </PopoverTrigger>
                          <PopoverContent w="auto">
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader me={5}>{pollBookOne.title}</PopoverHeader>
                          </PopoverContent>
                        </Popover>
                        <Button
                          as={Link}
                          to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(pollBookOne.title + " " + pollBookOne.author)}`}
                          target="blank"
                          size="xs"
                          variant="ghost"
                          aria-label="View in Bookshop"
                          title="View in Bookshop"
                          p={0}
                        >
                          <FaStore size={17} />
                        </Button>
                      </Flex>
                      <Text fontSize="sm">
                        {pollBookOne.author}
                      </Text>
                      <Flex justify="center">
                        <Button
                          size="sm"
                          backgroundColor="black"
                          color="white"
                          onClick={e=>castVote({pollBookNumber: 1, pollBookId: pollBookOne.id})}
                          isLoading={castVoteMutation.isLoading}
                          isDisabled={castVoteMutation.isLoading}
                        >
                          Vote
                        </Button>
                      </Flex>
                    </Box>
                    ) : null}
                    {pollBookTwo !== null ? (
                    <Box 
                      flex="0 1 125px"
                      rounded="md"
                      border="1px solid"
                      borderColor="gray.400"
                      p={1}
                    >
                      <Box
                        mx="auto"
                        maxW="90px"
                      >
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
                      <Flex align="center" gap={1}>
                        <Popover isLazy>
                          <PopoverTrigger>
                            <Box
                              _hover={{
                                cursor: "pointer"
                              }}
                            >
                              <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                {pollBookTwo.title}
                              </Text>
                            </Box>
                          </PopoverTrigger>
                          <PopoverContent w="auto">
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader me={5}>{pollBookTwo.title}</PopoverHeader>
                          </PopoverContent>
                        </Popover>
                        <Button
                          as={Link}
                          to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(pollBookTwo.title + " " + pollBookTwo.author)}`}
                          target="blank"
                          size="xs"
                          variant="ghost"
                          aria-label="View in Bookshop"
                          title="View in Bookshop"
                          p={0}
                        >
                          <FaStore size={17} />
                        </Button>
                      </Flex>
                      <Text fontSize="sm">
                        {pollBookTwo.author}
                      </Text>
                      <Flex justify="center">
                        <Button
                          size="sm"
                          backgroundColor="black"
                          color="white"
                          onClick={e=>castVote({pollBookNumber: 2, pollBookId: pollBookTwo.id})}
                          isLoading={castVoteMutation.isLoading}
                          isDisabled={castVoteMutation.isLoading}
                        >
                          Vote
                        </Button>
                      </Flex>
                    </Box>
                    ) : null}
                    {pollBookThree !== null ? (
                    <Box 
                      flex="0 1 125px"
                      rounded="md"
                      border="1px solid"
                      borderColor="gray.400"
                      p={1}
                    >
                      <Box 
                        mx="auto"
                        maxW="90px"
                      >
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
                      <Flex align="center" gap={1}>
                        <Popover isLazy>
                          <PopoverTrigger>
                            <Box
                              _hover={{
                                cursor: "pointer"
                              }}
                            >
                              <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                                {pollBookThree.title}
                              </Text>
                            </Box>
                          </PopoverTrigger>
                          <PopoverContent w="auto">
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader me={5}>{pollBookThree.title}</PopoverHeader>
                          </PopoverContent>
                        </Popover>
                        <Button
                          as={Link}
                          to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(pollBookThree.title + " " + pollBookThree.author)}`}
                          target="blank"
                          size="xs"
                          variant="ghost"
                          aria-label="View in Bookshop"
                          title="View in Bookshop"
                          p={0}
                        >
                          <FaStore size={17} />
                        </Button>
                      </Flex>
                      <Text fontSize="sm">
                        {pollBookThree.author}
                      </Text>
                      <Flex justify="center">
                        <Button
                          size="sm"
                          backgroundColor="black"
                          color="white"
                          onClick={e=>castVote({pollBookNumber: 3, pollBookId: pollBookThree.id})}
                          isLoading={castVoteMutation.isLoading}
                          isDisabled={castVoteMutation.isLoading}
                        >
                          Vote
                        </Button>
                      </Flex>
                    </Box>
                    ) : null}
                  </Flex>
              </Box>
              <Text 
                textAlign="center"
                fontWeight="bold"
                my={5}
              >
                or
              </Text>
            </>
          ): null}

          {bookSuggestionBookshelf?.allow_suggestions !== 1 ? (
            <Flex align="center" justify="center" minH="70vh">
              <Heading as="h1" size="xl">Currently not allowing suggestions</Heading>
            </Flex>
          ) : (
            <>
              <Flex
                align="center"
                justify="space-between"
                className="non-well"
                gap={1}
                direction="column"
              >
                {bookSuggestionBookshelf?.Profile.id === user.Profile.id ? (
                  <Text>
                    This is your bookshelf.
                  </Text>
                ): (
                  <Input
                    type="search"
                    bg="white"
                    borderWidth={3}
                    borderColor="teal"
                    size="lg"
                    placeholder="Suggest a book"
                    mb={2}
                    width="100%"
                    _dark={{
                      bg: "gray.800"
                    }}
                    sx={{
                      cursor: 'none',
                      '&:hover': {
                        cursor: 'pointer'
                      },
                      animationIterationCount: "15",
                      '@keyframes borderFade': {
                        '0%': {
                          borderColor: "teal"
                        },
                        '50%': {
                          borderColor: "gray.400"
                        },
                        '100%': {
                          borderColor: "teal"
                        }
                      },
                      animationName: "borderFade",
                      animationDuration: "1s"
                    }}
                    readOnly={true}
                    onClick={e=>onOpenSearchModal()}
                  />
                )}

                {selectedBook ? (
                  <Box
                    className="well"
                    mx="0!important"
                    position="relative"
                    w="100%"
                    maxW="500px"
                  >
                    <CloseButton
                      onClick={e=>setSelectedBook(null)}
                      position="absolute"
                      top={1}
                      right={1}
                    />
                    <Flex>
                      <Image
                        src={selectedBook.image}
                        height="100%"
                        maxH="90px"
                        boxShadow="1px 1px 1px 1px darkgrey"
                        alt={selectedBook.title}
                      />
                      <Box mx={2} w="100%">
                        <Heading 
                          as="h5" 
                          size="md"
                          me={3}
                          noOfLines={1}
                        >
                          {selectedBook.title}
                        </Heading>
                        <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                          {selectedBook.author}
                        </Text>
                        <Text fontStyle="italic">
                          {selectedBook.published_date !== null ? 
                            (
                              dayjs(selectedBook.published_date).format("YYYY")
                            ) : null
                          }
                        </Text>
                        {selectedBook.page_count ? (
                          <Text fontSize="sm">
                            {selectedBook.page_count} pages
                          </Text>
                        ): null}
                        {/* <Popover isLazy>
                          <PopoverTrigger>
                            <Box
                              _hover={{
                                cursor: "pointer"
                              }}
                            >
                              <Text noOfLines={1}>
                                {selectedBook.description ? selectedBook.description: null}
                              </Text>
                            </Box>
                          </PopoverTrigger>
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverBody 
                            _dark={{
                              bg: "black"
                            }}
                              fontSize="sm"
                            >
                              {selectedBook.description ? selectedBook.description: null}
                            </PopoverBody>
                          </PopoverContent>
                        </Popover> */}
                      </Box>
                    </Flex>
                    <Box
                      mt={2}
                    >
                      <Textarea
                        placeholder="Notes (optional)"
                        ref={notesRef}
                        maxLength={500}
                      />
                    </Box>
                    <Flex
                      justify="flex-end"
                      mt={2}
                    >
                      <Button
                        backgroundColor="black"
                        color="white"
                        onClick={e=>suggestBook(e)}
                      >
                        Suggest
                      </Button>
                    </Flex>
                  </Box>
                ): null}

                <CurrentWeekSuggestionCount/>

              </Flex>
              <Divider borderColor="blackAlpha.700" mb={2} />
              <Box 
                className="non-well"
              >
                <Heading as="h3" size="sm" mb={1} color="blackAlpha.800">Latest suggestion:</Heading>
                <Flex
                  // align="center"
                  wrap="wrap"
                  gap={2}
                  maxH="25vh"
                  overflow="auto"
                  p={.5}
                >
                  {previousSuggestions !== null && previousSuggestions.length ? (
                    <Box
                      // maxW="200px"
                      border="1px solid"
                      borderColor="gray.400"
                      p={2}
                      rounded="md"
                      flex="1 0"
                      minW="250px"
                      backgroundColor="gray.50"
                    >
                      <Flex
                        // align="center"
                        gap={2}
                        width="100%"
                      >
                        <Image
                          src={previousSuggestions[previousSuggestions.length - 1].image}
                          height="100%"
                          maxH="60px"
                          boxShadow="1px 1px 1px 1px darkgrey"
                        />
                        <Box>
                          {/* <Text 
                            fontSize="sm"
                            opacity="80%"
                            mb={-1}
                          >
                            {dayjs(previousSuggestions[previousSuggestions.length - 1].created_on).local().format("MM/DD/YY")}
                          </Text> */}
                          <Text
                            fontSize="md"
                            fontWeight="bold"
                            // fontStyle="italic"
                            noOfLines={1}
                            mb={-1}
                          >
                            {previousSuggestions[previousSuggestions.length - 1].title}
                          </Text>
                          <Text
                            fontSize="md"
                            noOfLines={1}
                            mb={-1}
                          >
                            {previousSuggestions[previousSuggestions.length - 1].author}
                          </Text>
                          {previousSuggestions[previousSuggestions.length - 1].rating !== null ? (
                            <Flex align="baseline" gap={1}>
                              <BsStarFill fill="gold" size={13} />
                              <Text
                                fontSize="sm"
                                noOfLines={1}
                              >
                                {previousSuggestions[previousSuggestions.length - 1].rating}
                              </Text>
                            </Flex>
                          ): null}
                        </Box>
                      </Flex>
                    </Box>
                  ): (
                    <Text
                      fontStyle="italic"
                    >
                      None yet.
                    </Text>
                  )}
                </Flex>
              </Box>
              <Divider borderColor="blackAlpha.700" my={3} />
              <Box className="well">
                <Heading as="h3" size="md">
                  Bookshelf
                </Heading>
                <Box>
                  {bookSuggestionBookshelf?.BookshelfBook?.length ? (
                    bookSuggestionBookshelf.BookshelfBook.map((book: BookshelfBook,i: number)=>{
                      return (
                        <Box 
                          className="well-card"
                          key={i}
                        >
                          <Flex>
                            {book.image === "https://via.placeholder.com/165x215" ? (
                              <BookImage isbn={book.isbn} id={`book-image-${Math.random()}`} maxHeight="125px"/>
                            ) : (
                              <Image
                                src={book.image ? book.image : "https://via.placeholder.com/165x215"}
                                onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                height="100%"
                                maxH="125px"
                                boxShadow="1px 1px 1px 1px darkgrey"
                                alt={book.title}
                              />
                            )}
                            <Box mx={2} w="100%">
                              <Heading 
                                as="h5" 
                                size="md"
                                me={3}
                                noOfLines={1}
                              >
                                {book.title}
                              </Heading>
                              <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                                {book.author}
                              </Text>
                              <Text fontStyle="italic">
                                {book.published_date ? dayjs(book.published_date).format("YYYY"): null}
                              </Text>
                              {book.page_count ? (
                                <Text fontSize="sm">
                                  {book.page_count} pages
                                </Text>
                              ): null}
                              {/* <Popover isLazy>
                                <PopoverTrigger>
                                  <Box
                                    _hover={{
                                      cursor: "pointer"
                                    }}
                                  >
                                    <Text noOfLines={1}>
                                      {book.description}
                                    </Text>
                                  </Box>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverBody 
                                  _dark={{
                                    bg: "black"
                                  }}
                                    fontSize="sm"
                                  >
                                    {book.description}
                                  </PopoverBody>
                                </PopoverContent>
                              </Popover> */}
                              <Flex
                                align="center"
                                wrap="wrap"
                                gap={1}
                                rowGap={0}
                              >
                                <Text fontWeight="bold">
                                  {bookSuggestionBookshelf?.Profile?.username}'s rating:
                                </Text>
                                <StarRating
                                  ratingCallback={null} 
                                  starRatingId={book.id}
                                  defaultRating={book.rating}
                                />
                              </Flex>
                              {book.review ? (
                                <Text fontStyle="italic">
                                  "{book.review}"
                                </Text>
                              ): null}
                            </Box>
                          </Flex>
                        </Box>
                      )
                    })
                  ): (
                    <Text fontStyle="italic">
                      Empty
                    </Text>
                  )}
                  <Box>
                    {!endLoadMore ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          colorScheme="blue"
                          onClick={e=>{
                            setTake(prev=>prev+10)
                          }}
                          isLoading={loadMoreIsLoading}
                        >
                          Load more...
                        </Button>
                      </>
                    ): null}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </>
        )}
      </Skeleton>

      <Modal 
        isOpen={isOpenSearchModal} 
        onClose={closeSearchModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Choose a suggestion
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
              <BooksSearch selectText="select" selectCallback={selectBook as any} gBooksApi={gbooksapi}/>
            </ModalBody>
            <ModalFooter flexDirection="column">
            </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  )
}
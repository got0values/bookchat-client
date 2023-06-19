import React, { useState, useRef } from "react";
import { useNavigate, Link, useSearchParams, redirect } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookshelfBook, BookshelfType, BookSuggestionType } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Avatar,
  Image,
  Center,
  Spinner,
  Stack,
  Button,
  Input,
  Flex,
  Skeleton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure
} from "@chakra-ui/react";
import { BsArrowRight } from 'react-icons/bs';
import StarRating from "../shared/StarRating";
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export default function BookSuggestionBookshelf({server,gbooksapi}: {server: string, gbooksapi: string}) {
  const toast = useToast();
  const navigate = useNavigate();
  dayjs.extend(utc);
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [bookshelfProfileName,setBookshelfProfileName] = useState(searchParams.get("profile"))
  const [nextBookshelf,setNextBookshelf] = useState<BookshelfType | null>(null);
  const [previousSuggestions,setPreviousSuggestions] = useState<BookSuggestionType[] | null>(null);
  async function getBookSuggestionBookshelf() {
    if (!searchParams.get("profile")) {
      throw new Error("No Profile")
    }
    else {
      setBookshelfProfileName(prev=>searchParams.get("profile"))
    }
    let tokenCookie: string | null = Cookies.get().token;
    const bookSuggestionBookshelfGet = axios
      .get(server + "/api/getbooksuggestionbookshelf",
        {
          headers: {
            'authorization': tokenCookie
          },
          params: {
            profilename: bookshelfProfileName
          }
        }
      )
      .then((response)=>{
        const {data} = response;
        const currentbookshelf = data.message;
        const nextbookshelfdata = data.nextbookshelf;
        const previoussuggestionsdata = data.previoussuggestions;
        // console.log(data)
        if (nextbookshelfdata) {
          setNextBookshelf(nextbookshelfdata)
        }
        if (previoussuggestionsdata) {
          setPreviousSuggestions(previoussuggestionsdata)
        }
        return currentbookshelf;
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.error)
      })
    return bookSuggestionBookshelfGet
  }

  const { 
    isOpen: isOpenSearchModal, 
    onOpen: onOpenSearchModal, 
    onClose: onCloseSearchModal 
  } = useDisclosure()

  function closeSearchModal() {
    setBookResults(null)
    onCloseSearchModal();
  }

  const searchInputRef = useRef({} as HTMLInputElement);
  const [bookResults,setBookResults] = useState<any[] | null>(null);
  const [bookResultsLoading,setBookResultsLoading] = useState(false)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
      .get("https://www.googleapis.com/books/v1/volumes?q=" + searchInputRef.current.value + "&key=" + gbooksapi)
      .then((response)=>{
        setBookResults(response.data.items)
        setBookResultsLoading(false)
        onOpenSearchModal();
      })
      .catch((error)=>{
        console.log(error)
      })
  }

  async function selectBook(e: React.FormEvent) {
    const selectedBook = JSON.parse((e.target as HTMLDivElement).dataset.book!);
    const image = selectedBook.volumeInfo.imageLinks ? selectedBook.volumeInfo.imageLinks.smallThumbnail : "";
    const title = selectedBook.volumeInfo.title;
    const author = selectedBook.volumeInfo.authors ? selectedBook.volumeInfo.authors[0] : "";
    const description = selectedBook.volumeInfo.description ? selectedBook.volumeInfo.description : "";
    const isbn = selectedBook.volumeInfo.industryIdentifiers ? selectedBook.volumeInfo.industryIdentifiers[0].identifier : "";
    let tokenCookie = Cookies.get().token;
    if (tokenCookie) {
      await axios
        .post(server + "/api/setbooksuggestion", 
        {
          suggestee: bookSuggestionBookshelf.Profile.id,
          image: image,
          title: title,
          author: author,
          description: description,
          isbn: isbn
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=> {
          toast({
            description: "Book suggested!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
          searchInputRef.current.value = "";
          if (nextBookshelf) {
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

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookSuggestionBookshelfKey'], 
    queryFn: getBookSuggestionBookshelf
  });

  let bookSuggestionBookshelf: any = data ? data : null;
  bookSuggestionBookshelf = {
    ...bookSuggestionBookshelf,
    Flag: bookSuggestionBookshelf?.Profile.country ? (countryFlagIconsReact as any)[bookSuggestionBookshelf.Profile.country] : <Box></Box>
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
        <Flex
          className="non-well"
          direction="column"
          // pb={2}
        >
          <Flex
            align="center"
            justify="space-between"
          >
            <Flex
              as={Link}
              to={`/profile/${bookSuggestionBookshelf?.Profile?.username}`}
              align="center"
              gap={2}
            >
              <Avatar 
                src={bookSuggestionBookshelf?.Profile?.profile_photo} 
                name={bookSuggestionBookshelf?.Profile?.username} 
              />
              <Text fontWeight="bold" fontSize="xl">
                {bookSuggestionBookshelf?.Profile?.username} 
              </Text>
              {/* <Box w="1.4rem">
                {bookSuggestionBookshelf.Flag ? <bookSuggestionBookshelf.Flag/> : null}
              </Box> */}
            </Flex>
            {nextBookshelf ? (
              <a href={`/booksuggestions/bookshelf?profile=${nextBookshelf.Profile.username}`}>
                <Button
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
                  Next <BsArrowRight size={20} />
                </Button>
              </a>
            ): null}
          </Flex>
          <Box>
            <Text>
              {bookSuggestionBookshelf.suggestions_notes}
            </Text>
          </Box>
        </Flex>
        {previousSuggestions && previousSuggestions.length ? (
          <Box px={2}>
            <Heading as="h3" size="sm" mb={1}>Your previous suggestions:</Heading>
            <Flex
              // align="center"
              wrap="wrap"
              gap={2}
            >
              {previousSuggestions.length ? (
                previousSuggestions.map((suggestion,i)=>{
                  return (
                    <Flex
                      // align="center"
                      gap={1}
                      maxW="200px"
                      key={i}
                    >
                      <Image
                        src={suggestion.image}
                        height="100%"
                        maxH="35px"
                        boxShadow="1px 1px 1px 1px darkgrey"
                      />
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          noOfLines={1}
                          mb={-1}
                        >
                          {suggestion.title}
                        </Text>
                        <Text
                          fontSize="sm"
                          noOfLines={1}
                        >
                          {suggestion.author}
                        </Text>
                      </Box>
                    </Flex>
                  )
                })
              ): (
                null
              )}
            </Flex>
          </Box>
        ): (
          null
        )}
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
            >
              <Input
                type="search"
                bg="white"
                borderColor="black"
                placeholder="Search for a suggestion"
                _dark={{
                  bg: "gray.800"
                }}
                onKeyUp={e=>e.key === 'Enter' ? searchBook() : null}
                ref={searchInputRef}
              />
              <Button
                borderColor="black"
                variant="outline"
                onClick={e=>searchBook()}
              >
                Search
              </Button>
            </Flex>
            <Stack>
              {bookSuggestionBookshelf?.BookshelfBook?.length ? (
                bookSuggestionBookshelf.BookshelfBook.map((book: BookshelfBook,i: number)=>{
                  return (
                    <Flex 
                      className="well"
                      key={i}
                    >
                      <Image
                        src={book.image}
                        height="100%"
                        maxH="125px"
                        boxShadow="1px 1px 1px 1px darkgrey"
                      />
                      <Box mx={2} w="100%">
                        <Heading 
                          as="h5" 
                          size="md"
                          me={3}
                          noOfLines={1}
                        >
                          {book.title}
                        </Heading>
                        <Text fontSize="lg" fontWeight="bold">
                          {book.author}
                        </Text>
                        <Popover isLazy>
                          <PopoverTrigger>
                            <Box
                              _hover={{
                                cursor: "pointer"
                              }}
                            >
                              <Text noOfLines={2}>
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
                        </Popover>
                        <Text fontStyle="italic">
                          {book.isbn}
                        </Text>
                        <Flex
                          align="center"
                          wrap="wrap"
                          gap={1}
                        >
                          <Text fontWeight="bold">
                            {bookSuggestionBookshelf.Profile?.username}'s rating:
                          </Text>
                          <StarRating
                            ratingCallback={null} 
                            starRatingId={book.id}
                            defaultRating={book.rating}
                          />
                        </Flex>
                      </Box>
                    </Flex>
                  )
                })
              ): null}
            </Stack>
          </>
        )}
      </Skeleton>

      <Modal 
        isOpen={isOpenSearchModal} 
        onClose={closeSearchModal}
        isCentered
        size="xl"
      >
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>
            Choose a suggestion
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
              <Stack gap={2} position="relative">
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
                          maxW="125px"
                          direction="column"
                          align="center"
                          rounded="md"
                          bg="white"
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
            </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  )
}
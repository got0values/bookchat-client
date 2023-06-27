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
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import GooglePreviewLink from "../shared/GooglePreviewLink";
import GoogleBooksSearch from "../shared/GoogleBooksSearch";
import { BsArrowRight } from 'react-icons/bs';
import { MdChevronRight } from 'react-icons/md';
import StarRating from "../shared/StarRating";
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";
import googleWatermark from "/src/assets/google_watermark.gif";


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
    onCloseSearchModal();
  }

  const searchInputRef = useRef({} as HTMLInputElement);
  const [selectedBook,setSelectedBook] = useState<any | null>(null);
  function selectBook(e: React.FormEvent) {
    setSelectedBook(JSON.parse((e.target as HTMLDivElement).dataset.book!));
    onCloseSearchModal();
  }
  const notesRef = useRef({} as HTMLTextAreaElement);
  async function suggestBook(e: React.FormEvent) {
    const image = selectedBook.volumeInfo.imageLinks ? selectedBook.volumeInfo.imageLinks.smallThumbnail : "";
    const title = selectedBook.volumeInfo.title;
    const author = selectedBook.volumeInfo.authors ? selectedBook.volumeInfo.authors[0] : "";
    const description = selectedBook.volumeInfo.description ? selectedBook.volumeInfo.description : "";
    const isbn = selectedBook.volumeInfo.industryIdentifiers ? selectedBook.volumeInfo.industryIdentifiers[0].identifier : "";
    const page_count = selectedBook.volumeInfo.pageCount ? selectedBook.volumeInfo.pageCount : "";
    const published_date = selectedBook.volumeInfo.publishedDate ? selectedBook.volumeInfo.publishedDate : "";
    const notes = notesRef.current.value;

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
          published_date: published_date,
          isbn: isbn,
          page_count: page_count,
          notes: notes

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
          <Box
            rounded="md"
            border="1px solid black"
            p={2}
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
            </Flex>
            {bookSuggestionBookshelf.suggestions_notes ? (
              <Text fontStyle="italic">
                "{bookSuggestionBookshelf.suggestions_notes}"
              </Text>
            ): null}
          </Box>
        </Flex>
        {previousSuggestions && previousSuggestions.length ? (
          <Box 
            rounded="md"
            border="1px solid black"
            p={2}
            className="non-well"
          >
            <Heading as="h3" size="sm" mb={1}>Your previous suggestions:</Heading>
            <Flex
              // align="center"
              wrap="wrap"
              gap={2}
              maxH="25vh"
              overflow="auto"
            >
              {previousSuggestions.length ? (
                previousSuggestions.map((suggestion,i)=>{
                  return (
                    <Box
                      maxW="200px"
                      key={i}
                    >
                      <Flex
                        // align="center"
                        gap={1}
                      >
                        <Image
                          src={suggestion.image}
                          height="100%"
                          maxH="50px"
                          boxShadow="1px 1px 1px 1px darkgrey"
                        />
                        <Box>
                          <Text 
                            fontSize="sm"
                            opacity="80%"
                            mb={-1}
                          >
                            {dayjs(suggestion.created_on).local().format("MM/DD/YY")}
                          </Text>
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
                    </Box>
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
              direction="column"
            >
              <Input
                type="search"
                bg="white"
                borderColor="black"
                size="lg"
                placeholder="Suggest a book"
                _dark={{
                  bg: "gray.800"
                }}
                sx={{
                  cursor: 'none',
                  '&:hover': {
                    cursor: 'pointer'
                  }
                }}
                readOnly={true}
                onClick={e=>onOpenSearchModal()}
              />

              {selectedBook ? (
                <Box
                  className="well"
                  mx="0!important"
                  position="relative"
                >
                  <CloseButton
                    onClick={e=>setSelectedBook(null)}
                    position="absolute"
                    top={1}
                    right={1}
                  />
                  <Flex>
                    <Image
                      src={selectedBook.volumeInfo.imageLinks?.smallThumbnail}
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
                        {selectedBook.volumeInfo.title}
                      </Heading>
                      <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                        {selectedBook.volumeInfo.authors ? selectedBook.volumeInfo.authors[0] : null}
                      </Text>
                      {selectedBook.volumeInfo.pageCount ? (
                        <Text fontSize="sm">
                          {selectedBook.volumeInfo.pageCount} pages
                        </Text>
                      ): null}
                      <Text fontStyle="italic">
                        {selectedBook.volumeInfo.publishedDate !== null ? 
                          (
                            dayjs(selectedBook.volumeInfo.publishedDate).format("YYYY")
                          ) : null
                        }
                      </Text>
                      <Popover isLazy>
                        <PopoverTrigger>
                          <Box
                            _hover={{
                              cursor: "pointer"
                            }}
                          >
                            <Text noOfLines={1}>
                              {selectedBook.volumeInfo.description ? selectedBook.volumeInfo.description: null}
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
                            {selectedBook.volumeInfo.description ? selectedBook.volumeInfo.description: null}
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
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
                        <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                          {book.author}
                        </Text>
                        {book.page_count ? (
                          <Text fontSize="sm">
                            {book.page_count} pages
                          </Text>
                        ): null}
                        <Text fontStyle="italic">
                          {book.published_date ? dayjs(book.published_date).format("YYYY"): null}
                        </Text>
                        <Popover isLazy>
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
                        </Popover>
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
      >
        <ModalOverlay />
        <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Choose a suggestion
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
              <GoogleBooksSearch selectText="select" selectCallback={selectBook} gBooksApi={gbooksapi}/>
            </ModalBody>
            <ModalFooter flexDirection="column">
            </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  )
}
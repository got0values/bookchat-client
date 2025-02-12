import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookSuggestionPollVoteType, BookSuggestionPollVoteWinnerType, BookSuggestionType } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Avatar,
  Button,
  Image,
  Stack,
  Flex,
  Skeleton,
  Divider,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast
} from "@chakra-ui/react";
import StarRating from "../shared/StarRating";
import { AiFillStar } from "react-icons/ai";
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { BsArchiveFill } from "react-icons/bs";
import { ImBooks } from 'react-icons/im';
import { FaShoppingCart, FaStore } from 'react-icons/fa';
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export function BookSuggestionsForMe({server}: {server: string;}) {
  dayjs.extend(utc);
  const queryClient = useQueryClient();
  const toast = useToast();

  async function getBookSuggestionsForMe() {
    let tokenCookie: string | null = Cookies.get().token;
    const bookSuggestToList = axios
      .get(server + "/api/getbooksuggestionsforme?archived=0",
        {
          headers: {
            'authorization': tokenCookie
          }
        }
      )
      .then((response)=>{
        const {data} = response;
        return data.message;
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.error)
      })
    return bookSuggestToList;
  }

  const ratingCallbackMutation = useMutation({
    mutationFn: async ([rating,starRatingId]:[rating: number,starRatingId: number]) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/ratesuggestion",
          {
            rating: rating,
            id: starRatingId
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
      return getBookSuggestionsForMe()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookSuggestionsForMeKey'] })
      queryClient.resetQueries({queryKey: ['bookSuggestionsForMeKey']})
      queryClient.setQueryData(["bookSuggestionsForMeKey"],data)
    }
  })
  function ratingCallback([rating,starRatingId]: [rating:number,starRatingId:number]) {
    ratingCallbackMutation.mutate([rating,starRatingId])
  }

  const archiveCallbackMutation = useMutation({
    mutationFn: async (id: number) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/booksuggestionarchive",
          {
            id: id,
            toArchive: 1
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
      return getBookSuggestionsForMe()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookSuggestionsForMeKey'] })
      queryClient.resetQueries({queryKey: ['bookSuggestionsForMeKey']})
      queryClient.setQueryData(["bookSuggestionsForMeKey"],data)
    }
  })
  function archiveCallback(id: number) {
    archiveCallbackMutation.mutate(id)
  }

  const archiveWinnerCallbackMutation = useMutation({
    mutationFn: async (id: number) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/booksuggestionwinnerarchive",
          {
            id: id,
            toArchive: 1
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
      return getBookSuggestionsForMe()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookSuggestionsForMeKey'] })
      queryClient.resetQueries({queryKey: ['bookSuggestionsForMeKey']})
      queryClient.setQueryData(["bookSuggestionsForMeKey"],data)
    }
  })
  function archiveWinnerCallback(id: number) {
    archiveWinnerCallbackMutation.mutate(id)
  }

  async function addToBookshelf(bookToAdd: any) {
    let tokenCookie: string | null = Cookies.get().token;
    await axios
      .post(server + "/api/addbookshelfbook", 
        {
          book: bookToAdd,
          categories: [],
          notes: ""
        },
        {headers: {
          'authorization': tokenCookie
        }}
      ).then((response)=>{
        toast({
          description: "Added to bookshelf",
          status: "success",
          duration: 9000,
          isClosable: true
        })
      })
      .catch(({response})=>{
        console.log(response)
        toast({
          description: "An error has occurred",
          status: "error",
          duration: 9000,
          isClosable: true
        })
      })
  }

  const choosePollWinnerMutation = useMutation({
    mutationFn: async ({pollBookNumber,bookId}:{pollBookNumber: number, bookId: number}) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .post(server + "/api/choosepollwinner",
          {
            pollBookNumber: pollBookNumber,
            bookId: bookId
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then(()=>{
          toast({
            description: "Poll winner chosen",
            status: "success",
            duration: 9000,
            isClosable: true
          })
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
      return getBookSuggestionsForMe()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookSuggestionsForMeKey'] })
      queryClient.resetQueries({queryKey: ['bookSuggestionsForMeKey']})
      queryClient.setQueryData(["bookSuggestionsForMeKey"],data)
    }
  })
  function choosePollWinner({pollBookNumber,bookId}:{pollBookNumber: number, bookId: number}) {
    choosePollWinnerMutation.mutate({pollBookNumber, bookId})
  }

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookSuggestionsForMeKey'], 
    queryFn: getBookSuggestionsForMe
  });

  let bookSuggestions:any = data ? data : null;
  let bookSuggestionsForMe = bookSuggestions?.bookSuggestionsForMe;
  let bookshelf = bookSuggestions?.bookshelf;
  let pollWinners = bookSuggestions?.pollVoteWinners;

  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }

  return (
    <Skeleton
      isLoaded={!isLoading}
    >
      {bookshelf && bookshelf.start_poll && (bookshelf.BookSuggestionPollBookOne.length || bookshelf.BookSuggestionPollBookTwo.length || bookshelf.BookSuggestionPollBookThree.length) ? (
        <Box>
          <Flex justify="space-around" w="100%" flexWrap="nowrap" gap={2} mb={3}>
            {bookshelf.BookSuggestionPollBookOne.length ? (
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
                    onError={(e)=>(e.target as HTMLImageElement).src = "https://placehold.co/165x215"}
                    src={bookshelf.BookSuggestionPollBookOne[0].image}
                    boxShadow="1px 1px 1px 1px darkgrey"
                    alt={bookshelf.BookSuggestionPollBookOne[0].title}
                  />
                </Box>
                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {bookshelf.BookSuggestionPollBookOne[0].title}
                </Text>
                <Text fontSize="sm">
                  {bookshelf.BookSuggestionPollBookOne[0].author}
                </Text>
                <Flex justify="center" gap={1} wrap="nowrap">
                  <Text fontSize="sm">
                    Vote count: 
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {bookshelf.BookSuggestionPollVote.length ? (
                      bookshelf.BookSuggestionPollVote.filter((vote: BookSuggestionPollVoteType)=>{
                        if (vote.poll_book_number === 1 && vote.poll_book_id === bookshelf.BookSuggestionPollBookOne[0].id) {
                          return true;
                        }
                        else {
                          return false;
                        }
                      }).length
                    ): 0}
                  </Text>
                </Flex>
                <Flex mt={1} justify="center">
                  <Button
                    size="xs"
                    backgroundColor="black"
                    color="white"
                    onClick={e=>choosePollWinner({pollBookNumber: 1, bookId: bookshelf.BookSuggestionPollBookOne[0].id})}
                  >
                    Choose
                  </Button>
                </Flex>
              </Box>
            ): null}
            {bookshelf.BookSuggestionPollBookTwo.length ? (
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
                    onError={(e)=>(e.target as HTMLImageElement).src = "https://placehold.co/165x215"}
                    src={bookshelf.BookSuggestionPollBookTwo[0].image}
                    boxShadow="1px 1px 1px 1px darkgrey"
                    alt={bookshelf.BookSuggestionPollBookTwo[0].title}
                  />
                </Box>
                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {bookshelf.BookSuggestionPollBookTwo[0].title}
                </Text>
                <Text fontSize="sm">
                  {bookshelf.BookSuggestionPollBookTwo[0].author}
                </Text>
                <Flex justify="center" gap={1} wrap="nowrap">
                  <Text fontSize="sm">
                    Vote count: 
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {bookshelf.BookSuggestionPollVote.length ? (
                      bookshelf.BookSuggestionPollVote.filter((vote: BookSuggestionPollVoteType)=>{
                        if (vote.poll_book_number === 2 && vote.poll_book_id === bookshelf.BookSuggestionPollBookTwo[0].id) {
                          return true;
                        }
                        else {
                          return false;
                        }
                      }).length
                    ): 0}
                  </Text>
                </Flex>
                <Flex mt={1} justify="center">
                  <Button
                    size="xs"
                    backgroundColor="black"
                    color="white"
                    onClick={e=>choosePollWinner({pollBookNumber: 2, bookId: bookshelf.BookSuggestionPollBookTwo[0].id})}
                  >
                    Choose
                  </Button>
                </Flex>
              </Box>
            ): null}
            {bookshelf.BookSuggestionPollBookThree.length ? (
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
                    onError={(e)=>(e.target as HTMLImageElement).src = "https://placehold.co/165x215"}
                    src={bookshelf.BookSuggestionPollBookThree[0].image}
                    boxShadow="1px 1px 1px 1px darkgrey"
                    alt={bookshelf.BookSuggestionPollBookThree[0].title}
                  />
                </Box>
                <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                  {bookshelf.BookSuggestionPollBookThree[0].title}
                </Text>
                <Text fontSize="sm">
                  {bookshelf.BookSuggestionPollBookThree[0].author}
                </Text>
                <Flex justify="center" gap={1} wrap="nowrap">
                  <Text fontSize="sm">
                    Vote count: 
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {bookshelf.BookSuggestionPollVote.length ? (
                      bookshelf.BookSuggestionPollVote.filter((vote: BookSuggestionPollVoteType)=>{
                        if (vote.poll_book_number === 3 && vote.poll_book_id === bookshelf.BookSuggestionPollBookThree[0].id) {
                          return true;
                        }
                        else {
                          return false;
                        }
                      }).length
                    ): 0}
                  </Text>
                </Flex>
                <Flex mt={1} justify="center">
                  <Button
                    size="xs"
                    backgroundColor="black"
                    color="white"
                    onClick={e=>choosePollWinner({pollBookNumber: 3, bookId: bookshelf.BookSuggestionPollBookThree[0].id})}
                  >
                    Choose
                  </Button>
                </Flex>
              </Box>
            ): null}
          </Flex>
          <Text textAlign="center" fontStyle="italic" fontSize="sm">
            * Choosing a winner to ends the poll
          </Text>
          <Divider mt={2} mb={3} />
        </Box>
      ): null}
      <Box className="well">
        <Heading as="h2" size="md">
          Poll Winners
        </Heading>
        {pollWinners?.length ? (
          pollWinners.map((winner: BookSuggestionPollVoteWinnerType, i: number)=>{
            return (
              <Box 
                className="well-card"
                p={3}
                key={i}
              >
                <Flex justify="space-between">
                  <Text fontStyle="italic">
                    {dayjs(winner.created_on).format('MMM DD, YYYY')}
                  </Text>
                  <Box>
                    <Menu>
                      <MenuButton 
                        as={Button}
                        size="md"
                        variant="ghost"
                        rounded="full"
                        height="25px"
                        title="menu"
                      >
                        <BiDotsHorizontalRounded/>
                      </MenuButton>
                      <MenuList>
                        <MenuItem 
                          onClick={e=>archiveWinnerCallback(winner.id)}
                          fontWeight="bold"
                          icon={<BsArchiveFill size={20} />}
                        >
                          Archive
                        </MenuItem>
                        <MenuItem
                          onClick={e=>addToBookshelf({
                            image: winner.image,
                            title: winner.title,
                            author: winner.author,
                            description: winner.description,
                            isbn:  "",
                            page_count: null,
                            published_date: "",
                          })}
                          fontWeight="bold"
                          icon={<ImBooks size={20} />}
                        >
                          Add to Bookshelf
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Box>
                </Flex>
                <Flex
                  gap={1}
                >
                  <Image
                    src={winner.image}
                    height="100%"
                    maxH="85px"
                    boxShadow="1px 1px 1px 1px darkgrey"
                    alt={winner.title}
                  />
                  <Flex direction="column" justify="space-between" w="100%">
                    <Box lineHeight={1.4}>
                      <Heading
                        as="h2"
                        noOfLines={1}
                        size="md"
                      >
                        {winner.title}
                      </Heading>
                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        noOfLines={1}
                      >
                        {winner.author}
                      </Text>
                    </Box>
                    <Flex align="center" justify="space-between" wrap="wrap">
                      <Button
                        as="a"
                        href={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(winner.title + " " + winner.author)}`}
                        target="blank"
                        size="xs"
                        variant="ghost"
                        backgroundColor="white"
                        color="black"
                        aria-label="find in bookshop.org"
                        title="shop"
                        p={0}
                      >
                        <FaStore size={15} />
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            )
          }).reverse()
        ): (
          <Text fontStyle="italic">None</Text>
        )}
      </Box>
      <Box className="well">
        <Heading as="h2" size="md">
          Suggestions
        </Heading>
        {bookSuggestionsForMe?.length ? (
          bookSuggestionsForMe.map((suggestion: BookSuggestionType, i: number)=>{
            return (
              <Stack 
                className="well-card"
                spacing={4}
                key={i}
              >
                <Flex
                  align="center"
                  gap={2}
                >
                  <Link to={`/profile/${suggestion.Profile_BookSuggestion_suggestorToProfile.username}`}>
                    <Avatar 
                      src={suggestion.Profile_BookSuggestion_suggestorToProfile.profile_photo}
                      name={suggestion.Profile_BookSuggestion_suggestorToProfile.username}
                    />
                  </Link>
                  <Box w="100%">
                    <Flex align="center" justify="space-between">
                      <Flex align="center" gap={1}>
                        <Text fontWeight="bold">
                          {suggestion.Profile_BookSuggestion_suggestorToProfile.username}
                        </Text>
                        {suggestion.suggestorRating ? (
                          <Flex align="center" gap={0}>
                            <Icon
                              as={AiFillStar}
                              size={25}
                              color="gold"
                            />
                            <Text fontStyle="italic" fontSize="sm">
                              {suggestion.suggestorRating.toFixed(1)}
                            </Text>
                          </Flex>
                        ): null}
                      </Flex>
                      <Box>
                        <Menu>
                          <MenuButton 
                            as={Button}
                            size="md"
                            variant="ghost"
                            rounded="full"
                            height="25px"
                            title="menu"
                          >
                            <BiDotsHorizontalRounded/>
                          </MenuButton>
                          <MenuList>
                            <MenuItem 
                              // data-book={JSON.stringify(reading)}
                              onClick={e=>archiveCallback(suggestion.id)}
                              fontWeight="bold"
                              icon={<BsArchiveFill size={20} />}
                            >
                              Archive
                            </MenuItem>
                            <MenuItem
                              onClick={e=>addToBookshelf({
                                image: suggestion.image,
                                title: suggestion.title,
                                author: suggestion.author,
                                description: suggestion.description,
                                isbn: suggestion.isbn ? suggestion.isbn : "",
                                page_count: suggestion.page_count ? parseInt(suggestion.page_count as any) : null,
                                published_date: suggestion.published_date ? suggestion.published_date : "",
                              })}
                              fontWeight="bold"
                              icon={<ImBooks size={20} />}
                            >
                              Add to Bookshelf
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Box>
                    </Flex>
                    <Text fontStyle="italic" opacity="75%">
                      {dayjs(suggestion.created_on).local().format('MMM DD, YYYY')}
                    </Text>
                  </Box>
                  {/* <Box w="1.4rem">
                    {bookshelf.Flag ? <bookshelf.Flag/> : null}
                  </Box> */}
                </Flex>
                {suggestion.notes ? (
                  <Text fontStyle="italic">
                    "{suggestion.notes}"
                  </Text>
                ) : null}
                <Divider />
                <Flex
                  gap={1}
                >
                  <Image
                    src={suggestion.image}
                    height="100%"
                    maxH="125px"
                    boxShadow="1px 1px 1px 1px darkgrey"
                    alt={suggestion.title}
                  />
                  <Flex direction="column" justify="space-between" w="100%">
                    <Box lineHeight={1.4}>
                      <Heading
                        as="h2"
                        noOfLines={1}
                        size="md"
                      >
                        {suggestion.title}
                      </Heading>
                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        noOfLines={1}
                      >
                        {suggestion.author}
                      </Text>
                      {suggestion.published_date ? (
                        <Text
                          fontStyle="italic"
                        >
                          {dayjs(suggestion.published_date).format("YYYY")}
                        </Text>
                      ): null}
                      {suggestion.page_count ? (
                        <Text noOfLines={1}>
                          {suggestion.page_count} pages
                        </Text>
                      ): null}
                      <Button
                        as="a"
                        href={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(suggestion.title + " " + suggestion.author)}`}
                        target="blank"
                        size="xs"
                        variant="ghost"
                        backgroundColor="white"
                        color="black"
                        aria-label="find in bookshop.org"
                        title="shop"
                        p={0}
                      >
                        <FaStore size={15} />
                      </Button>
                    </Box>
                    <Flex
                      align="center"
                      gap={1}
                    >
                      <Text
                        fontWeight="bold"
                      >
                        Rate Suggestion: 
                      </Text>
                      {/* <Text>
                        Coming soon!
                      </Text> */}
                      <StarRating
                        ratingCallback={ratingCallback} 
                        starRatingId={suggestion.id}
                        defaultRating={suggestion.rating ? suggestion.rating : 0}
                      />
                    </Flex>
                  </Flex>
                </Flex>
              </Stack>
            )
          }).reverse()
        ): (
          <Text fontStyle="italic">None</Text>
        )}
      </Box>
      

    </Skeleton>
  )
}
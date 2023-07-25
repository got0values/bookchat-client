import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookshelfType, BookSuggestionType } from "../types/types";
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
import { BsArchive } from "react-icons/bs";
import { ImBooks } from 'react-icons/im';
import { FaShoppingCart } from 'react-icons/fa';
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export function BookSuggestionsArchive({server}: {server: string;}) {
  dayjs.extend(utc);
  const queryClient = useQueryClient();
  const toast = useToast();

  async function getBookSuggestionsArchive() {
    let tokenCookie: string | null = Cookies.get().token;
    const bookSuggestionsArchive = axios
      .get(server + "/api/getbooksuggestionsforme?archived=1",
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
    return bookSuggestionsArchive;
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
      return getBookSuggestionsArchive()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookSuggestionsArchiveKey'] })
      queryClient.resetQueries({queryKey: ['bookSuggestionsArchiveKey']})
      queryClient.setQueryData(["bookSuggestionsArchiveKey"],data)
    }
  })
  function ratingCallback([rating,starRatingId]: [rating:number,starRatingId:number]) {
    ratingCallbackMutation.mutate([rating,starRatingId])
  }

  const unArchiveCallbackMutation = useMutation({
    mutationFn: async (id: number) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/booksuggestionarchive",
          {
            id: id,
            toArchive: 0
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
      return getBookSuggestionsArchive()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookSuggestionsArchiveKey'] })
      queryClient.resetQueries({queryKey: ['bookSuggestionsArchiveKey']})
      queryClient.setQueryData(["bookSuggestionsArchiveKey"],data)
    }
  })
  function unArchiveCallback(id: number) {
    unArchiveCallbackMutation.mutate(id)
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

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookSuggestionsArchiveKey'], 
    queryFn: getBookSuggestionsArchive
  });

  let bookSuggestionsArchive: any = data ? data : null;

  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }

  return (
    <Skeleton
      isLoaded={!isLoading}
    >
      {bookSuggestionsArchive?.length ? (
        bookSuggestionsArchive.map((suggestion: BookSuggestionType, i: number)=>{
          return (
            <Stack 
              className="well"
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
                      {/* <StarRating
                        ratingCallback={null} 
                        starRatingId={suggestion.id}
                        defaultRating={suggestion.suggestorRating ? suggestion.suggestorRating : 0}
                      /> */}
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
                            onClick={e=>unArchiveCallback(suggestion.id)}
                            fontWeight="bold"
                            icon={<BsArchive size={20} />}
                          >
                            Un-Archive
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
                <Flex justify="space-between" direction="column">
                  <Box>
                    <Text
                      noOfLines={1}
                      fontWeight="bold"
                    >
                      {suggestion.title}
                    </Text>
                    <Text
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
                    <Popover isLazy>
                      <PopoverTrigger>
                        <Text
                          noOfLines={1}
                          _hover={{
                            cursor: "pointer"
                          }}
                        >
                          {suggestion.description}
                        </Text>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverBody
                          _dark={{
                            bg: "black"
                          }}
                        >
                          {suggestion.description}
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    {suggestion.page_count ? (
                      <Text>
                        {suggestion.page_count} pages
                      </Text>
                    ): null}
                  </Box>
                  <Flex align="center" justify="space-between" wrap="wrap">
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
                    <Button
                      as="a"
                      href={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(suggestion.title + " " + suggestion.author + " " + suggestion.isbn)}`}
                      target="blank"
                      size="xs"
                      variant="outline"
                      backgroundColor="white"
                      color="black"
                      leftIcon={<FaShoppingCart size={15} />}
                    >
                      Shop
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Stack>
          )
        }).reverse()
      ): (
        <Box></Box>
      )}

    </Skeleton>
  )
}
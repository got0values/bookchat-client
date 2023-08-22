import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookshelfType, User } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Avatar,
  Button,
  Flex,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Skeleton,
} from "@chakra-ui/react";
import { SuggestionCountBadge } from "../shared/SuggestionCount";
import { BsArrowRight } from 'react-icons/bs';
import { ImInfo } from 'react-icons/im';
import { FaPlay } from 'react-icons/fa'
import StarRating from "../shared/StarRating";
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export function BookSuggestionToList({server}: {server: string;}) {
  const navigate = useNavigate();
  dayjs.extend(utc);

  const [suggestionRating,setSuggestionRating] = useState(0);
  const [firstBookshelf,setFirstBookshelf] = useState<User | null>(null)
  async function getBookSuggestToList() {
    let tokenCookie: string | null = Cookies.get().token;
    const bookSuggestToList = axios
      .get(server + "/api/getbooksuggesttolist",
        {
          headers: {
            'authorization': tokenCookie
          }
        }
      )
      .then((response)=>{
        const {data} = response;
        setFirstBookshelf(data.message.firstBookshelf)
        setSuggestionRating(data.message.rating === null ? 0 : response.data.message.rating)
        return data.message.bookshelfList;
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.error)
      })
    return bookSuggestToList;
  }

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookSuggestToListKey'], 
    queryFn: getBookSuggestToList
  });

  let bookSuggestToList: any = data ? data : null;
  bookSuggestToList = bookSuggestToList?.map((bookshelf: BookshelfType)=>{
    return {
      ...bookshelf,
      Flag: bookshelf.Profile.country ? (countryFlagIconsReact as any)[bookshelf.Profile.country] : <Box></Box>
    }
  })

  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }

  return (
    <Skeleton
      isLoaded={!isLoading}
    >
      <Flex
        align="center"
        justify="center"
        gap={1}
        mb={-1}
        className="non-well"
        wrap="wrap"
      >
        <StarRating
          ratingCallback={null} 
          starRatingId={0}
          defaultRating={suggestionRating}
        />
        <Text 
          fontWeight={600} 
          fontSize="sm"
          opacity="80%"
          me={1}
          color={suggestionRating === 0 ? "red" : "inherit"}
        >
          {suggestionRating.toFixed(1)}
        </Text>
        <Popover isLazy>
          <PopoverTrigger>
            <Flex 
              align="center" 
              justify="center" 
              me={2}
              _hover={{
                cursor: "pointer"
              }}
            >
              <ImInfo size={20} color="gray" />
            </Flex>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody 
              fontSize="sm"
              _dark={{
                bg: "black"
              }}
            >
              Your rating is based on other user's ratings on your book suggestions for them.
            </PopoverBody>
          </PopoverContent>
        </Popover>
        {firstBookshelf ? (
          <Flex
            align="center"
            justify="center"
            wrap="wrap"
            gap={2}
            // mb={3}
          >
            <Button
              as="a"
              href={`/booksuggestions/bookshelf?profile=${firstBookshelf.Profile.username}`}
              // variant="outline"
              colorScheme="teal"
              size="xs"
              aria-label="random bookshelf"
              // borderColor="purple"
              // p={2}
            >
              <FaPlay size={15}/>
            </Button>
          </Flex>
        ): null}
      </Flex>
      <Text
        fontWeight="bold"
        textAlign="center"
        p={2}
      >
        These users need your help finding their next read
      </Text>
      {bookSuggestToList?.length ? (
        bookSuggestToList.map((bookshelf: BookshelfType, i: number)=>{
          return (
            <Box
              className="well"
              key={i}
            >
              <Flex 
                align="center"
                justify="space-between"
              >
                <Flex
                  align="center"
                  gap={2}
                  wrap="wrap"
                >
                  <Avatar 
                    as={Link}
                    to={`/profile/${bookshelf.Profile.username}`}
                    src={bookshelf.Profile.profile_photo} 
                    size="sm"
                    name={bookshelf.Profile.username}
                  />
                  <Flex align="center" gap={1}>
                    <Text 
                      fontWeight="bold"
                      as={Link}
                      to={`/profile/${bookshelf.Profile.username}`}
                    >
                      {bookshelf.Profile.username}
                    </Text>
                    {/* <Box w="1.4rem">
                      {bookshelf.Flag ? <bookshelf.Flag/> : null}
                    </Box> */}
                    <SuggestionCountBadge suggestionCount={bookshelf.Profile._count.BookSuggestion_BookSuggestion_suggestorToProfile}/>
                  </Flex>
                </Flex>
                <Flex
                  align="center"
                  gap={2}
                >
                  <Box>
                    <Text as="span" fontWeight="bold">Books on shelf:</Text> {(bookshelf as any)._count.BookshelfBook}
                  </Box>
                  <Button
                    as={Link}
                    to={`/booksuggestions/bookshelf?profile=${bookshelf.Profile.username}`}
                    variant="ghost"
                    p={0}
                  >
                    <BsArrowRight size={20} />
                  </Button>
                </Flex>
              </Flex>
              <Box>
                <Popover isLazy>
                  <PopoverTrigger>
                    <Box
                      _hover={{
                        cursor: "pointer"
                      }}
                    >
                      {bookshelf.suggestions_notes ? (
                        <Text fontStyle="italic" noOfLines={2}>
                          "{bookshelf.suggestions_notes}"
                        </Text>
                      ): null}
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverBody 
                      fontSize="sm"
                      _dark={{
                        bg: "black"
                      }}
                    >
                      {bookshelf.suggestions_notes}
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>
            </Box>
          )
        })
      ): (
        <Box>
          <Text fontStyle="italic">
            Please check back tomorrow!
          </Text>
        </Box>
      )}

    </Skeleton>
  )
}
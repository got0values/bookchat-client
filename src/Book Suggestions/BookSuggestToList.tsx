import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookshelfType } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Avatar,
  Button,
  Flex,
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
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export function BookSuggestionToList({server}: {server: string;}) {
  const navigate = useNavigate();
  dayjs.extend(utc);

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
        return data.message;
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
      <Heading className="visually-hidden">Book Suggestions</Heading>
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
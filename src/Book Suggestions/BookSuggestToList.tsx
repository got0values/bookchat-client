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
  Skeleton,
  useToast,
} from "@chakra-ui/react";
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
                  as={Link}
                  to={`/profile/${bookshelf.Profile.username}`}
                  align="center"
                  gap={2}
                >
                  <Avatar 
                    src={bookshelf.Profile.profile_photo} 
                    size="sm"
                    name={bookshelf.Profile.username}
                  />
                  <Text fontWeight="bold">
                    {bookshelf.Profile.username}
                  </Text>
                  {/* <Box w="1.4rem">
                    {bookshelf.Flag ? <bookshelf.Flag/> : null}
                  </Box> */}
                </Flex>
                <Flex
                  align="center"
                  gap={2}
                >
                  <Box>
                    <Text as="span" fontWeight="bold">Books:</Text> {(bookshelf as any)._count.BookshelfBook}
                  </Box>
                  <Button
                    // size="lg"
                    variant="ghost"
                    p={0}
                    onClick={e=>navigate(`/booksuggestions/bookshelf?profile=${bookshelf.Profile.username}`)}
                  >
                    <BsArrowRight size={20} />
                  </Button>
                </Flex>
              </Flex>
              <Text>
                {bookshelf.suggestions_notes}
              </Text>
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
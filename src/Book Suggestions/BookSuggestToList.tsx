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
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Divider,
  Skeleton,
} from "@chakra-ui/react";
import { SuggestionCountBadge } from "../shared/SuggestionCount";
import { FaPlay, FaArrowCircleRight } from 'react-icons/fa'
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export function BookSuggestionToList({server}: {server: string;}) {
  dayjs.extend(utc);

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
            size="sm"
            aria-label="random bookshelf"
            display="flex"
            gap={2}
            // borderColor="purple"
            // p={2}
            mb={1}
          >
            Random <FaPlay size={15}/>
          </Button>
        </Flex>
      ): null}
      {bookSuggestToList?.length ? (
        bookSuggestToList.map((bookshelf: BookshelfType, i: number)=>{
          return (
            <React.Fragment key={i}>
              <Box
                // className="well"
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
                      // name={bookshelf.Profile.username}
                    />
                    <Flex align="center" gap={1}>
                      <Text 
                        fontWeight="bold"
                        fontSize="sm"
                        as={Link}
                        to={`/profile/${bookshelf.Profile.username}`}
                      >
                        @{bookshelf.Profile.username}
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
                    <Box fontSize="sm">
                      <Text as="span" fontWeight="bold">Shelf:</Text> {(bookshelf as any)._count.BookshelfBook}
                    </Box>
                    <Button
                      as={Link}
                      to={`/booksuggestions/bookshelf?profile=${bookshelf.Profile.username}`}
                      variant="ghost"
                      p={0}
                    >
                      <FaArrowCircleRight size={20} color="teal" />
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
              {i !== bookSuggestToList.length - 1 ? (
                <Divider borderColor="blackAlpha.600" my={2} />
              ): null}
            </React.Fragment>
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
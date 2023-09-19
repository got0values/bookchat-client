import React, { useRef } from "react";
import { Link } from "react-router-dom";
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
  Spinner,
  Alert,
  AlertDescription,
  CloseButton,
  Progress,
  useDisclosure
} from "@chakra-ui/react";
import { SuggestionCountBadge } from "../shared/SuggestionCount";
import { ImInfo } from 'react-icons/im';
import { FaPlay, FaArrowCircleRight } from 'react-icons/fa'
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import { useAuth } from "../hooks/useAuth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export function BookSuggestionToList({server}: {server: string;}) {
  dayjs.extend(utc);
  const queryClient = useQueryClient();
  const { user, getUser } = useAuth();

  const take = useRef(20);
  const endLoadMore = useRef(false);
  async function getBookSuggestToList() {
    getUser()
    let tokenCookie: string | null = Cookies.get().token;
    const bookSuggestToList = axios
      .get(`${server}/api/getbooksuggesttolist`,
        {
          headers: {
            'authorization': tokenCookie
          },
          params: {
            take: take.current
          }
        }
      )
      .then((response)=>{
        const {data} = response;
        endLoadMore.current = data.message.endLoadMore
        return data.message.bookshelfList;
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.error)
      })
    return bookSuggestToList;
  }

  const {
    isOpen: alertIsVisible,
    onClose,
    onOpen,
  } = useDisclosure({ defaultIsOpen: true })

  const loadMoreMutation = useMutation({
    mutationFn: async ()=>{
      take.current = take.current + 20;
      // return getBookSuggestToList();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ["bookSuggestToListKey"] })
      // queryClient.resetQueries({queryKey: ["bookSuggestToListKey"]})
      // queryClient.setQueryData(["bookSuggestToListKey"],data)
    }
  })
  function loadMore() {
    loadMoreMutation.mutate()
  }

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookSuggestToListKey'], 
    queryFn: getBookSuggestToList
  });

  let bookSuggestToList: any = data ? data : null;

  // bookSuggestToList = bookSuggestToList?.map((bookshelf: BookshelfType)=>{
  //   return {
  //     ...bookshelf,
  //     Flag: bookshelf.Profile.country ? (countryFlagIconsReact as any)[bookshelf.Profile.country] : <Box></Box>
  //   }
  // })

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="90vh">
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
    <>
      {alertIsVisible ? (
        <Alert 
          status='success'
          rounded="md"
          mb={3}
          position="relative"
        >
          <Box>
            <AlertDescription 
              pe={7} 
              display="flex" 
              alignItems="center" 
              gap={2} 
              fontSize=".97rem"
              lineHeight={1}
            >
              <Box as={ImInfo} size={15} minWidth="15px" /> 
              {user?.first_name}, these are bookshelves of people who can use your help discovering more books to read.
            </AlertDescription>
          </Box>
          <CloseButton
            alignSelf='flex-start'
            position='absolute'
            right={1}
            top={0}
            onClick={onClose}
          />
        </Alert>
      ): null}

      {bookSuggestToList?.length ? (
        <>
          {bookSuggestToList.map((bookshelf: BookshelfType, i: number)=>{
            return (
              <React.Fragment key={i}>
                <Box
                  // className="well"
                >
                  <Flex 
                    align="flex-start"
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
                      justify="space-between"
                      gap={2}
                      width="125px"
                    >
                      <Box>
                        <Box fontSize="sm">
                          <Text as="span" fontWeight="bold">Shelf:</Text> {(bookshelf as any)._count.BookshelfBook}
                        </Box>
                        {bookshelf.start_poll ? (
                          <Text 
                            fontSize="sm"
                            fontWeight="bold"
                            color="green"
                          >
                            Poll
                          </Text>
                        ): null}
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
          })}
          {endLoadMore.current === false ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                colorScheme="blue"
                w="100%"
                onClick={e=>loadMore()}
                isLoading={loadMoreMutation.isLoading}
              >
                Load more...
              </Button>
            </>
          ): null}
        </>
      ): (
        <Box>
          <Text fontStyle="italic">
            Please check back tomorrow!
          </Text>
        </Box>
      )}
    </>
  )
}
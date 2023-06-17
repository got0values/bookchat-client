import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookshelfBook, BookshelfType, StarRatingType } from "../types/types";
import { 
  Box,
  Tag,
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
  CloseButton,
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
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  FormLabel,
  Switch,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  CheckboxGroup,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel
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
        console.log(data.message)
        return data.message;
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.error)
      })
    return bookSuggestionBookshelfGet
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

  if (!bookSuggestionBookshelf?.allow_suggestions) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Not allowed</Heading>
    </Flex>
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
          align="center"
          justify="space-between"
          className="non-well"
          pb={2}
        >
          <Flex
            as={Link}
            to={`/profile/${bookSuggestionBookshelf.Profile.username}`}
            align="center"
            gap={2}
          >
            <Avatar 
              src={bookSuggestionBookshelf?.Profile.profile_photo} 
              // size="sm"
              name={bookSuggestionBookshelf.Profile.username} 
            />
            <Text fontWeight="bold" fontSize="xl">
              {bookSuggestionBookshelf.Profile.username} 
            </Text>
            <Box w="1.4rem">
              {bookSuggestionBookshelf.Flag ? <bookSuggestionBookshelf.Flag/> : null}
            </Box>
          </Flex>
          <Button
            variant="ghost"
            fontSize="md"
            display="flex"
            gap={2}
            // onClick={e=>navigate(`/booksuggestions/bookshelf?profile=${bookshelf.Profile.username}`)}
          >
            Skip <BsArrowRight size={20} />
          </Button>
        </Flex>
        <Flex
          align="center"
          justify="space-between"
          className="non-well"
          // mb={5}
          gap={1}
        >
          <Input
            type="search"
            bg="white"
            _dark={{
              bg: "gray.800"
            }}
          />
          <Button
            fontSize="sm"
          >
            Find <br/>Suggestion
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
                    <Text>
                      {book.isbn}
                    </Text>
                    <StarRating
                      ratingCallback={null} 
                      starRatingId={book.id}
                      defaultRating={book.rating}
                    />
                  </Box>
                </Flex>
              )
            })
          ): null}
        </Stack>
      </Skeleton>
    </Box>
  )
}
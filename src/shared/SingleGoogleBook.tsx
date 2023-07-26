import { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { 
  Box,
  Heading,
  Flex,
  Text,
  Image,
  HStack,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Badge,
  Input,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from "@chakra-ui/react";
import { DashboardProps, CurrentlyReading, SelectedBook, User } from '../types/types';
import { SuggestionCountBadge } from "./SuggestionCount";
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { BsReplyFill } from 'react-icons/bs';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { MdOutlineChat } from 'react-icons/md';
import { FaShoppingCart, FaPlay } from 'react-icons/fa';
import Comments from "./CurrentlyReadingComments";
import { useAuth } from '../hooks/useAuth';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";
import { UseMutationResult } from "@tanstack/react-query";

interface SingleGoogleBookType {
  readingOriginal: CurrentlyReading;
  server: string;
  getDashboard: ()=>void;
  suggestionCount: number; 
  updateCurrentlyReadingThoughts: (arg0: any)=>void; 
  updateCurrentlyReadingThoughtsMutation: UseMutationResult<any,unknown,number,unknown>; 
  editCurrentlyReadingThoughts: (arg0: any)=>void; 
  cancelEditCurrentlyReadingThoughts: (arg0: any)=>void; 
  deleteReading: (arg0: number)=>void;
  editPagesRead: (arg0: any)=>void;
  updatePagesRead: (arg0: any)=>void; 
  cancelEditPagesRead: (arg0: any)=>void;
  openCommentModal: (arg0: any)=>void;
  likeUnlikeCurrentlyReading: (arg0: any)=>void;
}

export default function SingleGoogleBook(
  {
    readingOriginal, 
    server,
    getDashboard,
    suggestionCount, 
    updateCurrentlyReadingThoughts, 
    updateCurrentlyReadingThoughtsMutation, 
    editCurrentlyReadingThoughts, 
    cancelEditCurrentlyReadingThoughts, 
    deleteReading,
    editPagesRead,
    updatePagesRead, 
    cancelEditPagesRead,
    openCommentModal,
    likeUnlikeCurrentlyReading
  } : SingleGoogleBookType
  ) {

  dayjs.extend(utc);
  const {user} = useAuth();
  const GBOOKSAPI = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  const [reading,setReading] = useState<CurrentlyReading|null>(null)
  useEffect(()=>{
    if (readingOriginal.google_books_id) {
      console.log(readingOriginal)
      async function getBookData() {
        await axios
        .get("https://www.googleapis.com/books/v1/volumes/" + readingOriginal.google_books_id + "?key=" + GBOOKSAPI)
        .then((response)=>{
          if (response.data) {
            const responseData = response.data;
            setReading(()=>{
              const reading3 = readingOriginal
              reading3.author = responseData.volumeInfo.authors ? responseData.volumeInfo.authors[0] : null;
              reading3.title = responseData.volumeInfo.title;
              reading3.isbn = responseData.volumeInfo.publishedDate ? dayjs(responseData.volumeInfo.publishedDate).format('YYYY') : "";
              reading3.description = responseData.volumeInfo.description;
              // reading3.image = responseData.volumeInfo.imageLinks.smallThumbnail;
              reading3.image = `http://books.google.com/books/content?id=${readingOriginal.google_books_id}&printsec=frontcover&img=1&zoom=5`;
              return reading3;
            })
          }
        })
        .catch((error)=>{
          console.log(error)
        })
      }
      getBookData();
    }
  },[])

  return (
    <Box
      my={3}
      // mx=".5rem"
      className="well"
      // key={reading.id}
    >
      <Suspense
        fallback={<Box>...</Box>}
      />
      {reading ? (
        <>
          <Flex
            align="flex-start"
            justify="space-between"
            mb={3}
          >
            <HStack>
              <Link to={`/profile/${reading.Profile.username}`}>
                <Avatar
                  size="md"
                  cursor="pointer"
                  src={`${reading.Profile.profile_photo}`}
                  border="2px solid gray"
                  name={`${reading.Profile.username}`}
                  position="relative"
                >
                  {reading.Profile.PagesRead?.map((p)=>p.pages_read).reduce((partialSum:number, a:number) => partialSum + a as number, 0) > 0 ? (
                    <Badge
                      position="absolute"
                      left={-1}
                      bottom={-1.5}
                      bg="lightblue"
                      color="black"
                      p="2px"
                      fontSize="10px"
                      lineHeight={1}
                      title="Pages read this week"
                    >
                      {reading.Profile.PagesRead?.map((p)=>p.pages_read).reduce((partialSum:number, a:number) => partialSum + a as number, 0)}
                    </Badge>
                  ) : null}
                </Avatar>
              </Link>
              <Flex direction="column">
                <Flex align="center" gap={1}>
                  <Text fontWeight="bold">
                    {reading.Profile.username}
                  </Text>
                    <SuggestionCountBadge suggestionCount={suggestionCount}/>
                </Flex>
                <Text fontStyle="italic">
                  {dayjs(reading.created_on).local().format('MMM DD, h:mm a')}
                </Text>
              </Flex>
            </HStack>
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
                    data-book={JSON.stringify(reading)}
                    onClick={e=>openCommentModal(e)}
                    fontWeight="bold"
                    icon={<BsReplyFill size={20} />}
                  >
                    Comment
                  </MenuItem>
                  <MenuItem 
                    as={Link}
                    to={`/chat/room?title=${reading.title}&author=${reading.author}`}
                    fontWeight="bold"
                    icon={<MdOutlineChat size={20} />}
                  >
                    Chat Room
                  </MenuItem>
                  <MenuItem 
                    as={Link}
                    to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(reading.title + " " + reading.author + " " + reading.isbn)}`}
                    target="blank"
                    fontWeight="bold"
                    icon={<FaShoppingCart size={20} />}
                  >
                    Shop
                  </MenuItem>
                  {reading.Profile.id === user?.Profile.id ? (
                    <MenuItem
                      color="tomato"
                      onClick={e=>deleteReading(reading.id)}
                      fontWeight="bold"
                      icon={<BiTrash size={20} />}
                    >
                      Delete
                    </MenuItem>
                  ): null}
                </MenuList>
              </Menu>
            </Box>
          </Flex>
          <Divider />
          <Text 
            my={2}
            rounded="md"
            p={1}
            _hover={{
              cursor: reading.Profile.id === user?.Profile.id ? "pointer" : "default",
              backgroundColor: reading.Profile.id === user?.Profile.id ? "gray" : "unset"
            }}
            id={`currently-reading-text-${reading.id}`}
            onClick={e=> reading.Profile.id === user?.Profile.id ? editCurrentlyReadingThoughts(reading.id) : null}
          >
            {reading.thoughts ? reading.thoughts : null}
          </Text>
          <Flex 
            align="center" 
            gap={1}
            display="none"
            id={`currently-reading-input-div-${reading.id}`}
          >
            <Input
              my={2}
              type="text"
              defaultValue={reading.thoughts ? reading.thoughts : ""}
              id={`currently-reading-input-${reading.id}`}
            />
            <Button
              backgroundColor="black"
              color="white"
              onClick={e=>updateCurrentlyReadingThoughts(reading.id)}
              disabled={updateCurrentlyReadingThoughtsMutation.isLoading}
            >
              Update
            </Button>
            <Button
              onClick={e=>cancelEditCurrentlyReadingThoughts(reading.id)}
            >
              Cancel
            </Button>
          </Flex>
          <Flex>
            <Image 
              src={reading.image}
              maxH="100px"
              boxShadow="1px 1px 1px 1px darkgrey"
              alt={`${reading.title} image`}
            />
            <Box mx={2} w="100%">
              <Box>
                <Heading as="h2" size="md" me={3} noOfLines={1}>
                  {reading.title}
                </Heading>
                <Text fontSize="lg" noOfLines={1}>
                  {reading.author}
                </Text>
                <Popover isLazy>
                  <PopoverTrigger>
                    <Box 
                      _hover={{
                        cursor: "pointer"
                      }}
                    >
                      <Text fontSize="lg" noOfLines={1}>
                        {reading.description ? reading.description: null}
                      </Text>
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
                      {reading.description}
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                <Text fontSize="lg">
                  {reading.published_date !== null ? 
                    (
                      dayjs(reading.published_date).format("YYYY")
                    ) : null
                  }
                </Text>
              </Box>
              <Flex justify="space-between" wrap="wrap">
                <Box minHeight="5px" minWidth="100px">
                  <Text 
                    padding={0}
                    rounded="md"
                    _hover={{
                      cursor: reading.Profile.id === user?.Profile.id ? "pointer" : "default",
                      backgroundColor: reading.Profile.id === user?.Profile.id ? "gray" : "unset",
                    }}
                    h="100%"
                    w="100%"
                    id={`pages-read-text-${reading.id}`}
                    onClick={e=>reading.Profile.id === user?.Profile.id ? editPagesRead(reading.id) : null}
                  >
                    {reading.pages_read ? `Pages read: ${reading.pages_read}` : null}
                  </Text>
                  <Flex 
                    align="center" 
                    gap={1}
                    id={`pages-read-input-div-${reading.id}`}
                    display="none"
                    wrap="wrap"
                    padding={0}
                  >
                    Pages read:
                    <NumberInput
                      maxWidth="75px"
                      size="sm"
                      min={0}
                      defaultValue={reading.pages_read}
                    >
                      <NumberInputField id={`pages-read-input-${reading.id}`} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Button
                      size="sm"
                      backgroundColor="black"
                      color="white"
                      onClick={e=>updatePagesRead(reading.id)}
                    >
                      Update
                    </Button>
                    <Button
                      size="sm"
                      onClick={e=>cancelEditPagesRead(reading.id)}
                    >
                      Cancel
                    </Button>
                  </Flex>
                </Box>
                <Flex align="center" gap={0}>
                  <Button 
                    px={0}
                    pb={0.5}
                    size="xs"
                    variant="ghost"
                    data-currentlyreading={reading.id}
                    onClick={e=>likeUnlikeCurrentlyReading(e)}
                    title="like post"
                  >
                    {reading.CurrentlyReadingLike?.filter((like)=>like.profile===user?.Profile?.id).length ? <AiFillHeart color="red" pointerEvents="none" size={20} /> : <AiOutlineHeart pointerEvents="none" size={20} />}
                  </Button>
                  {reading.CurrentlyReadingLike?.length ? (
                    <Popover isLazy size="sm">
                      <PopoverTrigger>
                        <Text
                          cursor="pointer"
                        >
                          {reading.CurrentlyReadingLike?.length ? reading.CurrentlyReadingLike.length.toString() : "0"}
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
                          {reading.CurrentlyReadingLike?.length ? (
                            reading.CurrentlyReadingLike?.map((like,i)=>{
                              return (
                                <Box mb={1} key={i}>
                                  <Link 
                                    to={`/profile/${like.Profile.username}`}
                                  >
                                    {like.Profile.username}
                                  </Link>
                                </Box>
                              )
                            })
                          ) : null}
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <Text
                      cursor="pointer"
                    >
                      {reading.CurrentlyReadingLike?.length ? reading.CurrentlyReadingLike.length.toString() : "0"}
                    </Text>
                  )}
                </Flex>
              </Flex>
            </Box>
          </Flex>
          {reading!.CurrentlyReadingComment && reading!.CurrentlyReadingComment.length ? (
          <>
          <Divider my={3} w="50%" mx="auto" borderColor="gray" />
            <Comments 
              comments={reading.CurrentlyReadingComment} 
              getDashboard={getDashboard} 
              location="dashboard"
              server={server} 
            />
          </>
            ): null}
        </>
      ): <></>}
    </Box>
  )
}
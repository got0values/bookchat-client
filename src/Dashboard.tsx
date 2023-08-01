import React, { useState, useRef, useEffect, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardProps, CurrentlyReading, SelectedBook, User } from './types/types';
import { 
  Box,
  Heading,
  Flex,
  Spinner,
  CloseButton,
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
  Skeleton,
  Badge,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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
  NumberDecrementStepper,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { editPagesRead, cancelEditPagesRead } from "./shared/editCancelPagesRead";
import { editCurrentlyReadingThoughts, cancelEditCurrentlyReadingThoughts } from "./shared/editCancelCurrentlyReadingThoughts";
import BooksSearch from "./shared/BooksSearch";
import SocialShareButtons from "./shared/SocialShareButtons";
import { SuggestionCountBadge } from "./shared/SuggestionCount";
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { BsReplyFill, BsArrowRightShort } from 'react-icons/bs';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { MdOutlineChat } from 'react-icons/md';
import { FaShoppingCart, FaPlay } from 'react-icons/fa';
import { LiaCopySolid } from 'react-icons/lia';
import Comments from "./shared/CurrentlyReadingComments";
import { 
  FacebookShareButton, 
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon
} from "react-share";
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";
import packageJson from '../package.json';


export default function Dashboard({server,gbooksapi}: DashboardProps) {
  dayjs.extend(utc);
  const toast = useToast();
  const { user, getUser } = useAuth();
  const queryClient = useQueryClient();

  useEffect(()=>{
    setTimeout(()=>{
      const clientAppVersion = packageJson.version;
      axios
        .get('/meta.json')
        .then((response)=>{
          const metaVersion = response.data.version;
          console.log(`ClientVersion: ${clientAppVersion}`);
          console.log(`MetaVersion: ${metaVersion}`);
          if (clientAppVersion !== metaVersion) {
            console.log("Not current version, please hard reload")
            caches.keys().then((keyList) => {
              return Promise.all(
                keyList.map((key) => {
                  return caches.delete(key);
                })
              );
            });
            // window.location.reload();
          }
        })
    },1000)
  },[])

  const [items,setItems] = useState(10);
  const [followingSorted,setFollowingSorted] = useState([] as any)
  const [randomSorted,setRandomSorted] = useState([] as any)
  const [firstBookshelf,setFirstBookshelf] = useState<User | null>(null)
  async function getDashboard() {
    const tokenCookie = Cookies.get().token
    if (tokenCookie) {
      const dash = await axios
        .get(server + "/api/dashboard?items=" + items,
        {
          headers: {
            Authorization: tokenCookie
          }
        }
        )
        .then((response)=>{
          getUser();
          setItems(prev=>prev + 10)
          setFollowingSorted(response.data.message.followingCurrentlyReadingSorted)
          setRandomSorted(response.data.message.randomCurrentlyReadingSorted)
          setFirstBookshelf(response.data.message.firstBookshelf)
          return response.data.message
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      return dash;
    }
    else {
      throw new Error("An error occurred")
    }
  }

  //lazy loading
  const [isFetching,setIsFetching] = useState(false)
  function handleScroll() {
    if (Math.ceil(window.innerHeight + document.documentElement.scrollTop) !== document.documentElement.offsetHeight || isFetching) {
      return;
    }
    setIsFetching(true);
  }
  useEffect(()=>{
    window.addEventListener("scroll",handleScroll)
  },[])
  useEffect(()=>{
    if (!isFetching) return;
    getMoreDashboard()
  },[isFetching])
  function getMoreDashboard() {
    getDashboard();
    setIsFetching(false)
  }

  const deleteReadingMutation = useMutation({
    mutationFn: async (readingId: number)=>{
      const tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .delete(server + "/api/currentlyreading",
            {
              headers: {
                Authorization: tokenCookie
              },
              data: {
                readingId
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.message)
          })
          return getDashboard();
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ["dashboardKey"] })
      queryClient.resetQueries({queryKey: ["dashboardKey"]})
      queryClient.setQueryData(["dashboardKey"],data)
    }
  })
  function deleteReading(readingId: number) {
    deleteReadingMutation.mutate(readingId)
  }

  const { 
    isOpen: isOpenCommentModal, 
    onOpen: onOpenCommentModal, 
    onClose: onCloseCommentModal 
  } = useDisclosure()

  const [commentBookData,setCommentBookData] = useState({} as any)
  function openCommentModal(e: any) {
    setCommentBookData(JSON.parse(e.target.dataset.book))
    onOpenCommentModal()
  }

  function closeCommentModal(){
    (commentRef.current as any).value = "";
    setCommentBookData(null)
    onCloseCommentModal()
  }

  const commentRef = useRef({} as HTMLTextAreaElement);
  const commentCurrentlyReadingButton = useRef({} as HTMLButtonElement)
  const commentCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: React.MouseEvent<HTMLButtonElement>)=>{
      const tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .post(server + "/api/commentcurrentlyreading",
            {
              profileId: parseInt((e.target as any).dataset.profileid),
              currentlyReadingId: parseInt((e.target as any).dataset.currentlyreadingid),
              uri: window.location.pathname,
              comment: (commentRef.current as any).value
            },
            {
              headers: {
                Authorization: tokenCookie
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.message)
          })
          return getDashboard();
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      getUser();
      queryClient.invalidateQueries({ queryKey: ["dashboardKey"] })
      queryClient.resetQueries({queryKey: ["dashboardKey"]})
      queryClient.setQueryData(["dashboardKey"],data)
      closeCommentModal()
    }
  })
  function commentCurrentlyReading(e: any) {
    commentCurrentlyReadingMutation.mutate(e as any)
  }

  const { 
    isOpen: isOpenReadingModal, 
    onOpen: onOpenReadingModal, 
    onClose: onCloseReadingModal 
  } = useDisclosure()

  function closeReadingModal() {
    onCloseReadingModal();
  }

  const whatImReadingRef = useRef({} as HTMLInputElement);
  const [selectedBook,setSelectedBook] = useState<any | null>(null);
  function selectBook(book: SelectedBook) {
    setSelectedBook(book)
    whatImReadingRef.current.value = "";
    closeReadingModal();
  }

  const thoughtsRef = useRef({} as HTMLInputElement);
  const pagesReadRef = useRef({} as HTMLInputElement);
  const postCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: React.FormEvent)=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .post(server + "/api/currentlyreading",
        {
          google_books_id: (e.target as HTMLDivElement).dataset.googlebooksid,
          image: (e.target as HTMLDivElement).dataset.image,
          title: (e.target as HTMLDivElement).dataset.title,
          author: (e.target as HTMLDivElement).dataset.author,
          description: (e.target as HTMLDivElement).dataset.description,
          isbn: (e.target as HTMLDivElement).dataset.isbn,
          page_count: parseInt((e.target as HTMLDivElement).dataset.pagecount as string),
          published_date: (e.target as HTMLDivElement).dataset.publisheddate,
          thoughts: thoughtsRef.current.value,
          pages_read: parseInt(pagesReadRef.current.value)
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .then((response)=>{
          setSelectedBook(null)
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      }
      else {
        throw new Error("Please login again")
      }
      return getDashboard();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['dashboardKey'] })
      queryClient.resetQueries({queryKey: ['dashboardKey']})
      queryClient.setQueryData(["dashboardKey"],data)
    }
  })
  function postCurrentlyReading(e: React.FormEvent) {
    postCurrentlyReadingMutation.mutate(e);
  }

  const likeUnlikeCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: React.FormEvent)=>{
      let tokenCookie: string | null = Cookies.get().token;
      let currentlyReading = parseInt((e.target as HTMLDivElement).dataset.currentlyreading!);
      if (tokenCookie) {
        await axios
        .post(server + "/api/likeunlikecurrentlyreading",
        {
          currentlyReading
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      }
      else {
        throw new Error("Please login again")
      }
      return getDashboard();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['dashboardKey'] })
      queryClient.resetQueries({queryKey: ['dashboardKey']})
      queryClient.setQueryData(["dashboardKey"],data)
    }
  })
  function likeUnlikeCurrentlyReading(e: React.FormEvent) {
    likeUnlikeCurrentlyReadingMutation.mutate(e);
  }

  const updateCurrentlyReadingThoughtsMutation = useMutation({
    mutationFn: async (bookId: number)=>{
      const currentlyReadingText = document.getElementById(`currently-reading-text-${bookId}`);
      const currentlyReadingInputDiv = document.getElementById(`currently-reading-input-div-${bookId}`);
      const currentlyReadingInput = document.getElementById(`currently-reading-input-${bookId}`);
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/updatecurrentlyreadingthoughts",
        {
          currentlyReadingId: bookId,
          thoughts: (currentlyReadingInput as HTMLInputElement)!.value
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .then((response)=>{
          currentlyReadingText!.style.display = "block";
          currentlyReadingInputDiv!.style.display = "none";
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      }
      else {
        throw new Error("Please login again")
      }
      return getDashboard();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ["dashboardKey"] })
      queryClient.resetQueries({queryKey: ["dashboardKey"]})
      queryClient.setQueryData(["dashboardKey"],data)
    }
  })
  function updateCurrentlyReadingThoughts(bookId: number) {
    updateCurrentlyReadingThoughtsMutation.mutate(bookId)
  }

  const updatePagesReadMutation = useMutation({
    mutationFn: async (bookId: number)=>{
      const pagesReadText = document.getElementById(`pages-read-text-${bookId}`);
      const pagesReadInputDiv = document.getElementById(`pages-read-input-div-${bookId}`);
      const pagesReadInput = document.getElementById(`pages-read-input-${bookId}`);
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/updatepagesread",
        {
          currentlyReadingId: bookId,
          pages_read: parseInt((pagesReadInput as HTMLInputElement)!.value)
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .then((response)=>{
          pagesReadText!.style.display = "block";
          pagesReadInputDiv!.style.display = "none";
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      }
      else {
        throw new Error("Please login again")
      }
      return getDashboard();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ["dashboardKey"] })
      queryClient.resetQueries({queryKey: ["dashboardKey"]})
      queryClient.setQueryData(["dashboardKey"],data)
    }
  })
  function updatePagesRead(bookId: number) {
    updatePagesReadMutation.mutate(bookId)
  }
  
  const dashboard = useQuery({
    queryKey: ["dashboardKey"],
    queryFn: getDashboard
  })

  if (dashboard.isLoading) {
    return (
      <Flex align="center" justify="center" minH="80vh">
        <Spinner size="xl"/>
      </Flex>
    )
  }
  if (dashboard.isError) {
    return (
      <div>
        Error!
      </div>
    )
  }

  const CurrentlyReadingFeed = ({reading}:{reading:CurrentlyReading}) => {
    let suggestionCount = reading.Profile._count?.BookSuggestion_BookSuggestion_suggestorToProfile;
    return (
      reading.hidden ? (
        null
      ) : (
        <Box
          my={3}
          // mx=".5rem"
          className="well"
          // key={reading.id}
        >
          <Suspense
            fallback={<Box>...</Box>}
          />
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
                  {reading.Profile.PagesRead?.map((p)=>p.pages_read).reduce((partialSum, a) => partialSum + a as number, 0) > 0 ? (
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
                      {reading.Profile.PagesRead?.map((p)=>p.pages_read).reduce((partialSum, a) => partialSum + a as number, 0)}
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
              maxH="90px"
              boxShadow="1px 1px 1px 1px darkgrey"
              alt={`${reading.title} image`}
            />
            <Box mx={2} w="100%">
              <Box lineHeight={1.4}>
                <Heading as="h2" size="md" me={3} noOfLines={1}>
                  {reading.title}
                </Heading>
                <Text fontSize="lg" fontWeight="bold" noOfLines={1}>
                  {reading.author}
                </Text>
                {/* <Popover isLazy>
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
                </Popover> */}
                <Text fontStyle="italic">
                  {reading.published_date !== null ? 
                    (
                      dayjs(reading.published_date).format("YYYY")
                    ) : null
                  }
                </Text>
                {reading.page_count ? (
                  <Text noOfLines={1}>
                    {reading.page_count} pages
                  </Text>
                ): null}
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
              </Flex>
            </Box>
          </Flex>
          <Divider mt={2} mb={1} />
          <Flex
            align="center"
            justify="space-between"
            w="100%"
          >
            {reading.Profile.id === user?.Profile.id ? (
              <SocialShareButtons reading={reading} username={reading.Profile.username} />
            ) : null}
            <Flex
              align="center"
              gap={1}
              ms="auto"
            >
              <Button
                size="sm"
                variant="ghost"
                data-book={JSON.stringify(reading)}
                onClick={e=>openCommentModal(e)}
              >
                <Box as={BsReplyFill} size={20} pb={1} /> Comment
              </Button>
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
                      <Button
                        size="sm"
                        minW="20px"
                        variant="ghost"
                        p={0}
                      >
                        {reading.CurrentlyReadingLike?.length ? reading.CurrentlyReadingLike.length.toString() : "0"}
                      </Button>
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
                    minW="20px"
                    textAlign="center"
                    fontWeight={600}
                  >
                    {reading.CurrentlyReadingLike?.length ? reading.CurrentlyReadingLike.length.toString() : "0"}
                  </Text>
                )}
              </Flex>
            </Flex>
          </Flex>
          {reading.CurrentlyReadingComment && reading.CurrentlyReadingComment.length ? (
            <>
            <Divider mt={1} />
              <Comments 
                comments={reading.CurrentlyReadingComment} 
                getDashboard={getDashboard} 
                location="dashboard"
                server={server} 
              />
            </>
          ): null}
        </Box>
      )
    )
  }

  return (
    <>
      <Box className="main-content-smaller" pb={5}>
        <Heading as="h1" className="visually-hidden">Bookshelf</Heading>
        <Box 
          m={0}
          // p={1}
        >
          <Flex
            justify="center"
            align="center"
            className="non-well"
          >
            {firstBookshelf && user.Profile._count?.BookSuggestion_BookSuggestion_suggestorToProfile < 1 ? (
              <Button
                as="a"
                href={`/booksuggestions/bookshelf?profile=${firstBookshelf.Profile.username}`}
                variant="outline"
                colorScheme="black"
                size="sm"
                p={1}
              >
                <FaPlay size={15}/>
                <Text ms={1} fontSize=".8rem">
                  Start suggesting books
                </Text>
              </Button>
            ): null}
          </Flex>
          <Flex gap={2} className="non-well">
            <Input 
              placeholder="What are you currently reading?" 
              size="lg"
              onClick={e=>onOpenReadingModal()}
              sx={{
                cursor: 'none',
                '&:hover': {
                  cursor: 'pointer'
                }
              }}
              readOnly={true}
            />
          </Flex>
          {selectedBook ? (
            <Box
              my={2}
              p={4}
              // bg="white"
              // _dark={{
              //   bg: 'blackAlpha.600'
              // }}
              className="well"
              position="relative"
            >
              <CloseButton
                position="absolute"
                top="0"
                right="0"
                onClick={e=>setSelectedBook(null)}
              />
              <Input
                type="text"
                mt={3}
                mb={3}
                placeholder="Thoughts?"
                maxLength={300}
                ref={thoughtsRef}
              />
              <Flex>
                <Image 
                  src={selectedBook.image}
                  maxH="90px"
                  boxShadow="1px 1px 1px 1px darkgrey"
                  alt={selectedBook.title}
                />
                <Box 
                  mx={2}
                  w="100%"
                >
                  <Box lineHeight={1.4}>
                    <Heading as="h2" size="md" me={3}>
                      {selectedBook.title}
                    </Heading>
                    <Text fontWeight="bold" fontSize="lg">
                      {selectedBook.author}
                    </Text>
                    {/* <Popover isLazy>
                      <PopoverTrigger>
                        <Box
                          _hover={{
                            cursor: "pointer"
                          }}
                        >
                          <Text fontSize="lg" noOfLines={1}>
                            {selectedBook.description}
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
                        >
                          {selectedBook.description ? selectedBook.description: null}
                        </PopoverBody>
                      </PopoverContent>
                    </Popover> */}
                    <Text fontStyle="italic">
                      {selectedBook.published_date !== null ? 
                        (
                          dayjs(selectedBook.published_date).format("YYYY")
                        ) : null
                      }
                    </Text>
                    {selectedBook.page_count ? (
                      <Text noOfLines={1}>
                        {selectedBook.page_count} pages
                      </Text>
                    ): null}
                  </Box>
                  <Flex justify="space-between">
                    <Flex align="center" gap={1}>
                      Pages read:
                      <NumberInput
                        maxWidth="75px"
                        size="sm"
                        min={0}
                      >
                        <NumberInputField ref={pagesReadRef} />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Flex>
                    <Button 
                      // size="sm"
                      backgroundColor="black"
                      color="white"
                      data-googlebooksid={selectedBook.google_books_id}
                      data-image={selectedBook.image}
                      data-title={selectedBook.title}
                      data-author={selectedBook.author}
                      data-description={selectedBook.description}
                      data-isbn={selectedBook.isbn}
                      data-pagecount={selectedBook.page_count}
                      data-publisheddate={selectedBook.published_date}
                      onClick={e=>postCurrentlyReading(e)}
                    >
                      Post
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            </Box>
          ) : null}
        </Box>

          <Box
            mb={5}
            className="non-well"
          >
            <Heading 
              size="md"
            >
              Following
            </Heading>
            {followingSorted?.length ? (
              <Box
                maxH="60vh"
                overflowY="auto"
              >
                {followingSorted?.length && (
                  followingSorted.map((reading: CurrentlyReading,i: number)=>{
                    return (
                      <React.Fragment key={reading.id}>
                        <CurrentlyReadingFeed reading={reading} />
                      </React.Fragment>
                    )
                  })
                )}
              </Box>
            ): (
              <Box fontSize="1rem">
                <Box fontStyle="italic">
                  You are not following any users at the moment.
                </Box>
              </Box>
            )}
          </Box>

          <Box className="non-well">
            <Heading 
              size="md"
            >
              Public
            </Heading>
            {randomSorted?.length ? (
              <Box>
                {randomSorted.length && (
                  randomSorted.map((reading: CurrentlyReading,i:number)=>{
                    return (
                      <React.Fragment key={reading.id}>
                        <CurrentlyReadingFeed reading={reading}/>
                      </React.Fragment>
                    )
                  })
                )}
                {isFetching && (
                  <Flex justify="center">
                    <Spinner size="xl"/>
                  </Flex>
                )}
              </Box>
            ): (
              <>
                
              </>
            )}
          </Box>
      </Box>

      <Modal 
        isOpen={isOpenCommentModal} 
        onClose={closeCommentModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Comment
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody h="auto" maxH="75vh" overflow="auto">
              <Input
                type="text"
                borderColor="black"
                ref={commentRef as any}
                onKeyUp={e=>e.key === 'Enter' ? commentCurrentlyReadingButton.current.click() : null}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                backgroundColor="black"
                color="white"
                data-profileid={commentBookData?.Profile?.id}
                data-currentlyreadingid={commentBookData?.id}
                ref={commentCurrentlyReadingButton}
                onClick={e=>commentCurrentlyReading(e)}
              >
                Submit
              </Button>
            </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal 
        isOpen={isOpenReadingModal} 
        onClose={closeReadingModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Choose a book
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
              <BooksSearch selectText="Set" selectCallback={selectBook as any}/>
            </ModalBody>
            <ModalFooter flexDirection="column">
            </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  );
};

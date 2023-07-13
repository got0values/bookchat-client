import React, { useState, useRef, useEffect, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardProps, CurrentlyReading, SelectedBook } from './types/types';
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
  useDisclosure
} from "@chakra-ui/react";
import { editPagesRead, cancelEditPagesRead } from "./shared/editCancelPagesRead";
import { editCurrentlyReadingThoughts, cancelEditCurrentlyReadingThoughts } from "./shared/editCancelCurrentlyReadingThoughts";
import GooglePreviewLink from "./shared/GooglePreviewLink";
import GoogleBooksSearch from "./shared/GoogleBooksSearch";
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { BsReplyFill } from 'react-icons/bs';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { MdOutlineChat } from 'react-icons/md';
import { FaShoppingCart } from 'react-icons/fa';
import Comments from "./shared/CurrentlyReadingComments";
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";
import googleWatermark from "/src/assets/google_watermark.gif";
import packageJson from '../package.json';


export default function Dashboard({server,gbooksapi}: DashboardProps) {
  dayjs.extend(utc);
  const navigate = useNavigate();
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

  const [items,setItems] = useState(5);
  const [followingSorted,setFollowingSorted] = useState([] as any)
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
          setItems(items + 5)
          setFollowingSorted(response.data.message.followingCurrentlyReadingSorted)
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
  const postCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: React.FormEvent)=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .post(server + "/api/currentlyreading",
        {
          image: (e.target as HTMLDivElement).dataset.image,
          title: (e.target as HTMLDivElement).dataset.title,
          author: (e.target as HTMLDivElement).dataset.author,
          description: (e.target as HTMLDivElement).dataset.description,
          isbn: (e.target as HTMLDivElement).dataset.isbn,
          page_count: parseInt((e.target as HTMLDivElement).dataset.pagecount as string),
          published_date: (e.target as HTMLDivElement).dataset.publisheddate,
          thoughts: thoughtsRef.current.value
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

  return (
    <>
      <Box className="main-content-smaller" pb={5}>
        <Box 
          m={0}
          // p={1}
        >
          <Flex gap={2} className="non-well">
            <Input 
              placeholder="Share what you're reading" 
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
                  maxH="100px"
                  boxShadow="1px 1px 1px 1px darkgrey"
                />
                <Box 
                  mx={2}
                  w="100%"
                >
                  <Box>
                    <Heading as="h5" size="md" me={3}>
                      {selectedBook.title}
                    </Heading>
                    <Text fontSize="lg">
                      {selectedBook.author}
                    </Text>
                    <Popover isLazy>
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
                    </Popover>
                    <Text fontSize="lg">
                      {selectedBook.published_date !== null && selectedBook.published_date !== "" ? 
                        (
                          dayjs(selectedBook.published_date).format("YYYY")
                        ) : null
                      }
                    </Text>
                  </Box>
                  <Flex justify="flex-end">
                    <Button 
                      // size="sm"
                      backgroundColor="black"
                      color="white"
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

        {followingSorted.map((reading: CurrentlyReading,i: number)=>{
            return (
              reading.hidden ? (
                null
              ) : (
                <Box
                  my={3}
                  // mx=".5rem"
                  className="well"
                  key={i}
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
                          title={`@${reading.Profile.username}`}
                        />
                      </Link>
                      <Flex direction="column">
                        <Text fontWeight="bold">
                          {reading.Profile.username}
                        </Text>
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
                    />
                    <Box mx={2} w="100%">
                      <Box>
                        <Heading as="h5" size="md" me={3} noOfLines={1}>
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
                      <Flex justify="space-between">
                        <Box>
                          <Text 
                            padding={0}
                            rounded="md"
                            _hover={{
                              cursor: reading.Profile.id === user?.Profile.id ? "pointer" : "default",
                              backgroundColor: reading.Profile.id === user?.Profile.id ? "gray" : "unset",
                            }}
                            id={`pages-read-text-${reading.id}`}
                            onClick={e=>reading.Profile.id === user?.Profile.id ? editPagesRead(reading.id) : null}
                          >
                            Pages read: {reading.pages_read ? reading.pages_read : 0}
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
                  {reading.CurrentlyReadingComment && reading.CurrentlyReadingComment.length ? (
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
                </Box>
              )
            )
          })
        }
        {isFetching && (
          <Flex justify="center">
            <Spinner size="xl"/>
          </Flex>
        )}
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
              <GoogleBooksSearch selectText="set" selectCallback={selectBook as any} gBooksApi={gbooksapi}/>
            </ModalBody>
            <ModalFooter flexDirection="column">
            </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  );
};

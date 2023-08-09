import React, { useState, useRef, useEffect, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardProps, CurrentlyReading, SelectedBook, User, BookSuggestionType } from './types/types';
import { 
  Box,
  Heading,
  Flex,
  Spinner,
  CloseButton,
  Fade,
  Text,
  Image,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Tag,
  TagLabel,
  HStack,
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
  Tooltip,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { editPagesRead, cancelEditPagesRead } from "./shared/editCancelPagesRead";
import { editCurrentlyReadingThoughts, cancelEditCurrentlyReadingThoughts } from "./shared/editCancelCurrentlyReadingThoughts";
import BooksSearch from "./shared/BooksSearch";
import StarRating from "./shared/StarRating";
import SocialShareButtons from "./shared/SocialShareButtons";
import FeaturedBooks from "./shared/FeaturedBooks";
import { SuggestionCountBadge } from "./shared/SuggestionCount";
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { BsReplyFill, BsArrowRightShort } from 'react-icons/bs';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { MdOutlineChat } from 'react-icons/md';
import { FaShoppingCart, FaPlay } from 'react-icons/fa';
import { ImInfo } from 'react-icons/im';
import { FaStore } from 'react-icons/fa';
import Comments from "./shared/CurrentlyReadingComments";
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
  const [suggestionRating,setSuggestionRating] = useState(0);
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
          setSuggestionRating(response.data.message.rating === null ? 0 : response.data.message.rating)
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
  const [publicTabChosen,setPublicTabChosen] = useState(true)
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
    if (!isFetching || !publicTabChosen) return;
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
          subjects: (e.target as HTMLDivElement).dataset.subjects as string,
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

  const CurrentlyReadingInput = () => {
    
    return (
      <>
        <Flex gap={2} className="non-well">
          <Input 
            placeholder="What are you currently reading?" 
            size="lg"
            borderColor="black"
            onClick={e=>onOpenReadingModal()}
            sx={{
              cursor: 'none',
              '&:hover': {
                cursor: 'pointer'
              }
            }}
            _dark={{
              borderColor: "darkgrey"
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
                maxH="120px"
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
                  {selectedBook.subjects ? (
                    <Popover isLazy>
                      <PopoverTrigger>
                        <HStack 
                          spacing={1} 
                          noOfLines={1}
                          maxW="275px"
                          _hover={{
                            cursor: "pointer"
                          }}
                        >
                          {selectedBook.subjects.map((subject:string,i:number)=>{
                            return (
                              <Tag
                                key={i}
                                // variant="solid"
                                colorScheme="purple"
                                size="sm"
                                // borderRadius="full"
                              >
                                <TagLabel>{subject}</TagLabel>
                              </Tag>
                            )
                          })}
                        </HStack>
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
                          {selectedBook.subjects.map((subject:string,i:number)=>{
                            return (
                              <Text key={i}>
                                {subject}
                              </Text>
                            )}
                          )}
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  ):null}
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
                    data-subjects={JSON.stringify(selectedBook.subjects)}
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
      </>
    )
  }

  const CurrentlyReadingFeed = ({reading}:{reading:CurrentlyReading}) => {
    const followMutation = useMutation({
      mutationFn: async (profileId:number)=>{
        const tokenCookie = Cookies.get().token;
        await axios
          .post(server + "/api/profileaction",
            {
              action: "follow",
              profileId: profileId
            },
            {headers: {
              Authorization: tokenCookie
            }}
          )
          .catch(({response})=>{
            console.log(response)
          })
        return getDashboard()
      },
      onSuccess: (data)=>{
        queryClient.invalidateQueries({ queryKey: ['dashboardKey'] })
        queryClient.resetQueries({queryKey: ['dashboardKey']})
        queryClient.setQueryData(["dashboardKey"],data)
      },
      onError: ()=>{
        return;
      }
    })
    function follow(profileId: number) {
      followMutation.mutate(profileId);
    }

    const cancelFollowMutation = useMutation({
      mutationFn: async (profileId:number)=>{
        const tokenCookie = Cookies.get().token;
        await axios
          .post(server + "/api/profileaction",
            {
              action: "cancelrequest",
              profileId: profileId
            },
            {headers: {
              Authorization: tokenCookie
            }}
          )
          .catch(({response})=>{
            console.log(response)
          })
        return getDashboard()
      },
      onSuccess: (data)=>{
        queryClient.invalidateQueries({ queryKey: ['dashboardKey'] })
        queryClient.resetQueries({queryKey: ['dashboardKey']})
        queryClient.setQueryData(["dashboardKey"],data)
      },
      onError: ()=>{
        return;
      }
    })
    function cancelFollow(profileId: number) {
      cancelFollowMutation.mutate(profileId);
    }
    
    let suggestionCount = reading.Profile._count?.BookSuggestion_BookSuggestion_suggestorToProfile;
    let followingProfiles = user.Profile.Following_Following_self_profile_idToProfile?.map((followingProfile)=>{
      if (followingProfile.status === "following") {
        return followingProfile.following_profile_id
      }
    });
    let requestingProfiles = user.Profile.Following_Following_self_profile_idToProfile?.map((followingProfile)=>{
      if (followingProfile.status === "requesting") {
        return followingProfile.following_profile_id
      }
    });
    let followingStatus = followingProfiles?.includes(reading.Profile.id) ? (
      "following" 
    ) : (
      requestingProfiles?.includes(reading.Profile.id) ? (
        "requesting"
      ) : (
        user.Profile.id === reading.Profile.id ? (
          "self"
        ) : (
          null
        )
      )
    )
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
            <HStack w="100%">
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
              <Flex direction="column" w="100%">
                <Flex
                  align="center"
                  justify="space-between"
                >
                  <Flex align="center" gap={1}>
                    <Text 
                      as={Link} 
                      to={`/profile/${reading.Profile.username}`}
                      fontWeight="bold"
                    >
                      {reading.Profile.username}
                    </Text>
                    <SuggestionCountBadge suggestionCount={suggestionCount}/>
                    {reading.Profile.Bookshelf?.allow_suggestions ? (
                      <Button
                        as={Link}
                        to={`/booksuggestions/bookshelf?profile=${reading.Profile.username}`}
                        size="xs"
                        fontSize="xs"
                        lineHeight={1}
                        h="auto"
                        variant="outline"
                        p={1}
                      >
                        bookshelf
                      </Button>
                    ): (
                      null
                    )}
                    {
                    followingStatus === "following" ? (
                      null 
                    ) : (
                      followingStatus === "requesting") ? (
                        <Button
                          variant="ghost"
                          size="xs"
                          fontSize="xs"
                          lineHeight={1}
                          h="auto"
                          p={0}
                          color="red.600"
                          _dark={{
                            color: "red.200"
                          }}
                          onClick={()=>cancelFollow(reading.Profile.id)}
                          isLoading={cancelFollowMutation.isLoading}
                        >
                          cancel request
                        </Button>
                      ) : (
                        followingStatus === "self") ? (
                          null 
                        ) : (
                          <Button
                            variant="ghost"
                            size="xs"
                            fontSize="xs"
                            lineHeight={1}
                            h="auto"
                            p={1}
                            color="blue.600"
                            _dark={{
                              color: "blue.200"
                            }}
                            onClick={()=>follow(reading.Profile.id)}
                            isLoading={followMutation.isLoading}
                          >
                            follow
                          </Button>
                        )
                    }
                  </Flex>
                  {reading.Profile.id === user?.Profile.id ? (
                    <Button
                      color="tomato"
                      size="xs"
                      variant="ghost"
                      onClick={e=>deleteReading(reading.id)}
                      fontWeight="bold"
                      title="delete"
                    >
                      <BiTrash size={18} />
                    </Button>
                  ): null}
                </Flex>
                <Text fontStyle="italic">
                  {dayjs(reading.created_on).local().format('MMM DD, h:mm a')}
                </Text>
              </Flex>
            </HStack>
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
              src={reading.image ? reading.image : "https://via.placeholder.com/165x215"}
              onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
              maxH="150px"
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
                {reading.subjects && JSON.parse(reading.subjects)?.length ? (
                  <Popover isLazy>
                    <PopoverTrigger>
                      <HStack 
                        spacing={1} 
                        noOfLines={1}
                        maxW="275px"
                        _hover={{
                          cursor: "pointer"
                        }}
                      >
                        {JSON.parse(reading.subjects).map((subject:string,i:number)=>{
                          return (
                            <Tag
                              key={i}
                              // variant="solid"
                              colorScheme="purple"
                              size="sm"
                              // borderRadius="full"
                            >
                              <TagLabel>{subject}</TagLabel>
                            </Tag>
                          )
                        })}
                      </HStack>
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
                        {JSON.parse(reading.subjects).map((subject:string,i:number)=>{
                          return (
                            <Text key={i}>
                              {subject}
                            </Text>
                          )}
                        )}
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                ):null}
              </Box>
              <Flex justify="space-between" wrap="wrap">
                <Box minHeight="5px" minWidth="150px">
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
              <Flex align="center" gap={2}>
                <Button
                  as={Link}
                  to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(reading.title + " " + reading.author)}`}
                  target="blank"
                  size="xs"
                  variant="ghost"
                  aria-label="View in Bookshop"
                  title="View in Bookshop"
                  p={0}
                >
                  <FaStore size={20} />
                </Button>
                <Button
                  as={Link}
                  to={`/chat/room?title=${reading.title}&author=${reading.author}`}
                  size="xs"
                  variant="ghost"
                  aria-label="Book chat room"
                  title="Book chat room"
                  p={0}
                >
                  <MdOutlineChat size={20} />
                </Button>
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
      <Box className="main-content-smaller" pb={20}>
        <Heading as="h1" className="visually-hidden">Dashboard</Heading>
        <Flex 
          m={0}
          direction="column"
          gap={1}
        >
          <Flex
            align="center"
            justify="center"
            gap={1}
            mb={-1}
            className="non-well"
            wrap="wrap"
          >
            <Text 
              fontWeight={600} 
              fontSize="sm"
              opacity="80%"
              me={1}
            >
              Your book suggestions rating: 
            </Text>
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
            <Tooltip
              label="Your rating is based on other user's ratings on your book suggestions to them."
            >
              <Flex align="center" justify="center" me={2}>
                <ImInfo size={20} color="gray" />
              </Flex>
            </Tooltip>
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
                  colorScheme="green"
                  size="xs"
                  // borderColor="purple"
                  p={2}
                >
                  <FaPlay size={15}/>
                  <Text ms={1}>
                    Start Suggesting
                  </Text>
                </Button>
              </Flex>
            ): null}
          </Flex>
          <Divider mt={1} />
          <CurrentlyReadingInput/>
          <Tabs
            variant="enclosed"
            px={2}
            isLazy
          >
            <TabList
              borderBottom="none"
            >
              <Tab
                fontWeight="bold"
                _selected={{
                  borderBottom: "2px solid gray"
                }}
                onClick={e=>setPublicTabChosen(true)}
              >
                Public
              </Tab>
              <Tab
                fontWeight="bold"
                _selected={{
                  borderBottom: "2px solid gray"
                }}
                onClick={e=>setPublicTabChosen(false)}
              >
                Following
              </Tab>
              <Tab
                fontWeight="bold"
                _selected={{
                  borderBottom: "2px solid gray"
                }}
                onClick={e=>setPublicTabChosen(false)}
              >
                Featured Books
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <Flex
                  direction="column"
                  gap={1}
                >
                  {randomSorted?.length ? (
                    <>
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
                    </>
                  ): (
                    <>
                    </>
                  )}
                </Flex>
              </TabPanel>
              <TabPanel px={0}>
                <Flex
                  direction="column"
                  gap={1}
                >
                  {followingSorted?.length ? (
                    <Box>
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
                </Flex>
              </TabPanel>
              <TabPanel px={0}>
                <FeaturedBooks/>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
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
              <BooksSearch selectText="Set" selectCallback={selectBook as any} gBooksApi={gbooksapi}/>
            </ModalBody>
            <ModalFooter flexDirection="column">
            </ModalFooter>
        </ModalContent>
      </Modal>

    </>
  );
};

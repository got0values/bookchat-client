import { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { SearchData, OtherNotificationsType } from './types/types';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopNavProps, UserNotificationsType } from './types/types';
import { useAuth } from './hooks/useAuth';
import {
  Box,
  Flex,
  Avatar,
  AvatarBadge,
  HStack,
  Image,
  Portal,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Heading,
  useDisclosure,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverHeader,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Badge,
  Text,
  Icon,
  useColorMode,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tooltip,
  useToast,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { SkipNavLink, SkipNavContent } from '@chakra-ui/skip-nav';
import addToTbr from './shared/addToTbr';
import { MdLogout, MdOutlineContactSupport, MdOutlineChat } from 'react-icons/md';
import { BsFillMoonFill, BsFillSunFill, BsFillChatFill, BsPostcardHeartFill } from 'react-icons/bs';
import { FiSettings } from 'react-icons/fi';
import { RxDotFilled } from 'react-icons/rx';
import { AiOutlineBell, AiFillHome } from 'react-icons/ai';
import { FaSearch, FaBookReader, FaStore } from 'react-icons/fa';
import { ImBooks, ImStatsDots } from 'react-icons/im';
import { GrDocumentText } from 'react-icons/gr';
import logoIcon from './assets/BookChatNoirNewBlack.png';
import logoIconWhite from './assets/BookChatNoirNewWhite.png';
import Cookies from "js-cookie";
import axios from "axios";
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { SuggestionCountBadge } from './shared/SuggestionCount';

interface LinkItemProps {
  name: string;
  linkTo: string;
  icon?: ReactJSXElement;
  tooltip: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', linkTo: "/", icon: <AiFillHome size="25"/>, tooltip: "Home"},
  { name: 'Bookshelf', linkTo: "/bookshelf", icon: <ImBooks size="25"/>, tooltip: "Bookshelf" },
  { name: 'Book Suggestions', linkTo: "/booksuggestions", icon: <BsPostcardHeartFill size="25" />, tooltip: "Book Suggestions" },
  { name: 'Book Clubs', linkTo: "/bookclubs", icon: <FaBookReader size="25"/>, tooltip: "Book Clubs" },
  { name: 'Chat Rooms', linkTo: "/chat", icon: <BsFillChatFill size="25" />, tooltip: "Chat Rooms" },
  { name: 'Stats', linkTo: "/stats", icon: <ImStatsDots size="25" />, tooltip: "Stats" },
];

export default function TopNav({server,onLogout,gbooksapi}: TopNavProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user,getUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const activeLinkBg = useColorModeValue("gray.200","whiteAlpha.200");
  const activeLinkColor = useColorModeValue("black","white");
  dayjs.extend(utc);

  // const [pagesRead,setPagesRead] = useState(0);
  // useEffect(()=>{
  //   const pagesReadArray = user.Profile.PagesRead.map((pr)=>pr.pages_read);
  //   setPagesRead(pagesReadArray.reduce((partialSum,a)=>partialSum + a,0))
  // },[])
  useLayoutEffect(()=>{
    setTimeout(()=>{
      const toastManagers = document.querySelectorAll("ul[id^='chakra-toast-manager']");
      toastManagers.forEach((tm)=>{
        tm.removeAttribute("role");
        const divElement = document.createElement("div");
        divElement.setAttribute("role","alert")
        tm.parentNode?.insertBefore(divElement,tm);
        divElement.appendChild(tm);
        return;
      })
    },1000)
  },[])

  async function getNotifications() {
    // resetNotifications();
    let userNotifications: UserNotificationsType = {
      followRequests: [],
      bookClubRequests: [],
      suggestionRequests: [],
      comments: [],
      replies: [],
      likes: [],
      commentOnOtherUsersPostYouCommentedOn: []
    }
    let totalNotifications = 0;
    try {
      const tokenCookie = Cookies.get().token;
      if (tokenCookie && tokenCookie !== undefined) {
        const otherNotifications = await axios
          .get(server + "/api/notifications",
            {
              headers: {
                Authorization: tokenCookie
              }
            }
          )
          .then((response)=>{
            return response.data.message;
          })
          .catch((response)=>{
            console.log(response)
          })
          let commentData = otherNotifications?.filter((on: OtherNotificationsType)=>on.type === 1);
          commentData = commentData.map((comment: any)=>{
            return (
              {
                ...comment,
                from_data: JSON.parse(comment.from_data),
                subject: JSON.parse(comment.subject)
              }
            )
          })
          let commentOnOtherUsersPostYouCommentedOnData = otherNotifications?.filter((on: OtherNotificationsType)=>on.type === 5);
          commentOnOtherUsersPostYouCommentedOnData = commentOnOtherUsersPostYouCommentedOnData.map((comment: any)=>{
            return (
              {
                ...comment,
                from_data: JSON.parse(comment.from_data),
                subject: JSON.parse(comment.subject)
              }
            )
          })
          let replyData = otherNotifications?.filter((on: OtherNotificationsType)=>on.type === 2);
          replyData = replyData.map((reply: any)=>{
            return (
              {
                ...reply,
                from_data: JSON.parse(reply.from_data),
                subject: JSON.parse(reply.subject)
              }
            )
          })
          let likeData = otherNotifications?.filter((on: OtherNotificationsType)=>on.type === 3);
          likeData = likeData.map((like: any)=>{
            return (
              {
                ...like,
                from_data: JSON.parse(like.from_data),
                subject: JSON.parse(like.subject)
              }
            )
          })
          let suggestionRequestData = otherNotifications?.filter((on: OtherNotificationsType)=>on.type === 4);
          suggestionRequestData = suggestionRequestData.map((sR: any)=>{
            return (
              {
                ...sR,
                from_data: JSON.parse(sR.from_data),
                subject: JSON.parse(sR.subject)
              }
            )
          })
          userNotifications = {
            ...userNotifications, 
            comments: [...userNotifications.comments as any[], ...commentData],
            commentOnOtherUsersPostYouCommentedOn: [...userNotifications.commentOnOtherUsersPostYouCommentedOn as any[], ...commentOnOtherUsersPostYouCommentedOnData],
            replies: [...userNotifications.replies as any[], ...replyData],
            likes: [...userNotifications.likes as any[], ...likeData],
            suggestionRequests: [...userNotifications.suggestionRequests as any[], ...suggestionRequestData]
          }

        //check if any follow requests
        if (user?.Profile.Following_Following_following_profile_idToProfile?.length) {
          let followers = user.Profile.Following_Following_following_profile_idToProfile;
          for (let i = 0; i < followers.length; i++) {
            if(followers[i].status === "requesting") {
              userNotifications = {
                ...userNotifications, 
                followRequests: [...userNotifications.followRequests as any[], followers[i]] 
              }
            }
          }
        }
        if (user?.Profile.BookClubMembers_BookClubMembers_book_club_creatorToProfile?.length) {
          let bookClubMembers = user.Profile.BookClubMembers_BookClubMembers_book_club_creatorToProfile;
          for (let i = 0; i < bookClubMembers.length; i++) {
            if(bookClubMembers[i].status === 1) {
              userNotifications = {
                ...userNotifications, 
                bookClubRequests: [...userNotifications.bookClubRequests as any[], bookClubMembers[i]] 
              }
            }
          }
        }
        totalNotifications = userNotifications.followRequests.length + userNotifications.bookClubRequests.length + userNotifications.comments.length + userNotifications.commentOnOtherUsersPostYouCommentedOn.length + userNotifications.replies.length + userNotifications.likes.length + userNotifications.suggestionRequests.length;
        return {
          userNotifications,
          totalNotifications
        };
      }
      else {
        navigate("/login")
      }
    } catch(error) {
      toast({
        description: "An error has occurred",
        status: "error",
        duration: 9000,
        isClosable: true
      })
      throw new Error((error as Error).message)
    }
  }

  const [profilePhoto,setProfilePhoto] = useState<string | null>(null);
  useLayoutEffect(()=>{
    setProfilePhoto(`${user?.Profile.profile_photo}?x=${new Date().getTime()}`);
  },[user?.Profile])

  //User edit modals
  const { 
    isOpen: isOpenNotificationsModal, 
    onOpen: onOpenNotificationsModal, 
    onClose: onCloseNotificationsModal 
  } = useDisclosure()

  const acceptFollowRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const tokenCookie = Cookies.get().token;
      await axios
      .post(server + "/api/acceptfollowrequest",
      {followId: requestId},
      {headers: {
        'authorization': tokenCookie
      }})
      .then((response)=>{
        if (response.data.success) {
          getUser()
        }
      })
      .catch(({response})=>{
        toast({
          description: "An error has occurred",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        throw new Error(response.data?.message)
      })
      await getUser();
      setTimeout(()=>{
        getNotifications()
      },100)
      return getNotifications();
    },
    onSuccess: (data)=>{
      queryClient.removeQueries({
        queryKey: ["notificationKey"],
        exact: true
      })
      queryClient.invalidateQueries({ queryKey: ['notificationKey'] })
      queryClient.resetQueries({queryKey: ['notificationKey']})
      queryClient.setQueryData(["notificationKey"],data)
    }
  })
  function acceptFollowRequest(requestId: number) {
    acceptFollowRequestMutation.mutate(requestId);
  }

  const rejectFollowRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const tokenCookie = Cookies.get().token;
      await axios
      .delete(server + "/api/rejectfollowrequest",
      {
        headers: {
          'authorization': tokenCookie
        },
        data: {
          followId: requestId
        }
      })
      .then((response)=>{
        if (response.data.success) {
          getUser()
        }
      })
      .catch(({response})=>{
        console.log(response)
        toast({
          description: "An error has occurred",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        throw new Error(response.data?.message)
      })
      await getUser();
      setTimeout(()=>{
        getNotifications()
      },100)
      return getNotifications();
    },
    onSuccess: (data)=>{
      queryClient.removeQueries({
        queryKey: ["notificationKey"],
        exact: true
      })
      queryClient.invalidateQueries({ queryKey: ['notificationKey'] })
      queryClient.resetQueries({queryKey: ['notificationKey']})
      queryClient.setQueryData(["notificationKey"],data)
    }
  })
  function rejectFollowRequest(requestId: number) {
    rejectFollowRequestMutation.mutate(requestId);
  }

  const acceptBookClubRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const tokenCookie = Cookies.get().token;
      await axios
      .put(server + "/api/acceptbookclubrequest",
      {
        memberRequestId: requestId
      },
      {headers: {
        'authorization': tokenCookie
      }})
      .then((response)=>{
        if (response.data.success) {
          getUser()
        }
      })
      .catch(({response})=>{
        console.log(response)
        toast({
          description: "An error has occurred",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        throw new Error(response.data?.message)
      })
      return getNotifications();
    },
    onSuccess: (data)=>{
      queryClient.removeQueries({
        queryKey: ["notificationKey"],
        exact: true
      })
      queryClient.invalidateQueries({ queryKey: ['notificationKey'] })
      queryClient.resetQueries({queryKey: ['notificationKey']})
      queryClient.setQueryData(["notificationKey"],data)
    }
  })
  function acceptBookClubRequest(requestId: number) {
    acceptBookClubRequestMutation.mutate(requestId);
  }

  const rejectBookClubRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const tokenCookie = Cookies.get().token;
      await axios
        .delete(server + "/api/rejectbookclubrequest",
        {headers: {
          'authorization': tokenCookie,
        },
        data: {
          memberRequestId: requestId
          }
        })
        .then((response)=>{
          if (response.data.success) {
            getUser()
          }
        })
        .catch(({response})=>{
          console.log(response)
          toast({
            description: "An error has occurred",
            status: "error",
            duration: 9000,
            isClosable: true
          })
          throw new Error(response.data?.message)
        })
      return getNotifications();
    },
    onSuccess: (data)=>{
      queryClient.removeQueries({
        queryKey: ["notificationKey"],
        exact: true
      })
      queryClient.invalidateQueries({ queryKey: ['notificationKey'] })
      queryClient.resetQueries({queryKey: ['notificationKey']})
      queryClient.setQueryData(["notificationKey"],data)
    }
  })
  function rejectBookClubRequest(requestId: number) {
    rejectBookClubRequestMutation.mutate(requestId);
  }

  const readNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const tokenCookie = Cookies.get().token;
      await axios
        .put(server + "/api/readnotification",
        {
          notificationId
        },
        {headers: {
            'authorization': tokenCookie,
          }
        })
        .then((response)=>{
          if (response.data.success) {
            getUser()
          }
        })
        .catch(({response})=>{
          console.log(response)
          toast({
            description: "An error has occurred",
            status: "error",
            duration: 9000,
            isClosable: true
          })
          throw new Error(response.data?.message)
        })
      return getNotifications();
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['notificationKey'] })
      queryClient.resetQueries({queryKey: ['notificationKey']})
      queryClient.setQueryData(["notificationKey"],data)
    }
  })
  function readNotification(commentId: number) {
    readNotificationMutation.mutate(commentId);
  }

  const { 
    isOpen: isOpenSearchModal, 
    onOpen: onOpenSearchModal, 
    onClose: onCloseSearchModal 
  } = useDisclosure()

  function closeSearchModal() {
    setSearchData({} as SearchData)
    onCloseSearchModal()
  }

  const { 
    isOpen: isOpenConfirmModal, 
    onOpen: onOpenConfirmModal, 
    onClose: onCloseConfirmModal 
  } = useDisclosure()

  useEffect(()=>{
    async function getConfirmed() {
      let tokenCookie: string | null = Cookies.get().token;
      await axios
        .get(server + "/api/checkconfirmed",
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          const confirmed = response.data.message.confirmed;
          if (!confirmed) {
            onOpenConfirmModal()
          }
          else {
            onCloseConfirmModal()
          }
        })
        .catch((response)=>{
          console.log(response)
        })
    }
    getConfirmed()
  },[])

  async function resendConfirmEmail() {
    let tokenCookie: string | null = Cookies.get().token;
    await axios
      .post(server + "/api/resendconfirmemail",
        {},
        {
          headers: {
            authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        if (response.data.success) {
          toast({
            description: "Email sent",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        }
        else {
          toast({
            description: "An error occured",
            status: "error",
            duration: 9000,
            isClosable: true
          })
        }
      })
      .catch(({response})=>{
        console.log(response)
        toast({
          description: "An error occured",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        throw new Error(response.data?.message)
      })
  }

  const [searchData,setSearchData] = useState({} as SearchData);
  const navSearchMutation = useMutation({
    mutationFn: async (navSearchValue: string) => {
      const tokenCookie = Cookies.get().token;
      await axios
        .get(`${server}/api/search?searchterm=${navSearchValue}`,
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          setSearchData(response.data.message)
          onOpenSearchModal();
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.message)
        })
      // await axios
      //   .get("https://openlibrary.org/search.json?q=" + navSearchValue)
      //   .then((response)=>{
      //     setSearchData(prev=>{
      //       return {...prev,books: response.data.docs.slice(0,10) }
      //     })
      //   })
      //   .catch((error)=>{
      //     console.log(error)
      //   })

      await axios
        .get("https://www.googleapis.com/books/v1/volumes?q=" + navSearchValue + "&key=" + gbooksapi)
        .then((response)=>{
          setSearchData(prev=>{
            return {...prev,books: response.data.items?.slice(0,9) }
          })
        })
        .catch((error)=>{
          console.log(error)
        })
    }
  })
  function navSearch(navSearchValue: string) {
    navSearchMutation.mutate(navSearchValue);
  }

  const notificationQuery = useQuery({ queryKey: ['notificationKey'], queryFn: getNotifications });
  const notificationData = notificationQuery.data;
  const userNotifications = notificationData?.userNotifications;
  const totalNotifications: number = notificationData?.totalNotifications as number;

  return (
    <>
      <SkipNavLink zIndex="100">Skip to Content</SkipNavLink>
      <Box 
        as="nav" 
        bg="white" 
        overflow="hidden"
        px={[1,4]} 
        // boxShadow="1px 1px 6px lightgrey"
        boxShadow={["-1px -1px 2px 1px black","1px 1px 2px 1px black"]}
        _dark={{
          boxShadow: "0 0 0",
          bg: "blackAlpha.700"
        }}
        position={["fixed", "static"]}
        bottom="0"
        left="0"
        right="0"
        zIndex="100"
      >
        <Flex py={2} flexWrap="nowrap" alignItems={'center'} justifyContent={'space-between'}>
          <HStack spacing={8} alignItems={'center'}>
            <Box 
              position="relative" 
              minW="max-content"
              display={{ base: 'none', md: 'flex' }}
            >
              <Link to="/">
                <Image 
                  src={colorMode === "light" ? logoIcon : logoIconWhite}
                  h="40px"
                  border="1px solid transparent"
                  borderRadius="4px"
                  p={1}
                  _hover={{
                    bg: "gray.400"
                  }}
                  alt="book chat noir logo"
                />
                {user && user.role === "admin" ? (
                <Badge
                  colorScheme="green"
                  position="absolute"
                  rounded="lg"
                  bottom="0"
                  right="0"
                  backgroundColor="green"
                  color="white"
                >
                  ADMIN
                </Badge>
                ) : null}
              </Link>
            </Box>
            <Box 
              marginInlineStart="2!important" 
              position="relative"
              display={["none","block"]}
            >
              <Input 
                type="search"
                rounded="2xl"
                width="100%"
                placeholder="Search"
                bg="gray.100"
                _dark={{
                  bg: "whiteAlpha.50"
                }}
                // borderColor="black"
                onKeyDown={e=>e.key === 'Enter' ? navSearch((e.target as any).value) : null}
              />
              <Box
                pointerEvents="none"
                as={FaSearch}
                position="absolute"
                top={3}
                right={3}
              />
            </Box>
          </HStack>
          <HStack
            as={'div'}
            // spacing={[.25,3]}
            // pr={["0","150px"]}
            display="flex"
            me={["0px","0px","100px"]}
          >
            {LinkItems.map((linkItem, index) => (
              <Box
                as={NavLink} 
                key={index} 
                to={linkItem.linkTo}
                p={2}
                rounded="md"
                fontSize="lg"
                fontWeight="600"
                whiteSpace="nowrap"
                _hover={{
                  bg: activeLinkBg,
                  color: activeLinkColor
                }}
                sx={{
                  bg: window.location.pathname === linkItem.linkTo ? activeLinkBg : "",
                  color: window.location.pathname === linkItem.linkTo ? activeLinkColor : ""
                }}
                title={linkItem.tooltip}
              >
                <Tooltip hasArrow label={linkItem.tooltip}>
                  <Flex align="center" justify="center">
                    {linkItem.icon ? (
                      linkItem.icon
                    ): linkItem.name}
                  </Flex>
                </Tooltip>
              </Box>
            ))}
          </HStack>
          <Flex alignItems={'center'} justify="space-between" gap={3} lineHeight={1.4}>
            <Box
              display={["none","block"]}
            >
              <Text
                fontWeight="bold"
                fontSize="md"
                // lineHeight={1.2}
              >
              {`${user?.first_name} ${user?.last_name}`}
              </Text>
              <Text
                fontSize="sm"
                // lineHeight={1.2}
              >
                {`@${user?.Profile.username}`}
              </Text>
            </Box>
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
                p="4px"
                _hover={{
                  p: "2px",
                  border: "2px solid lightblue"
                }}
                _active={{
                  p: "2px",
                  border: "2px solid lightblue"
                }}
                mb={-1}
              >
                <Avatar
                  // size={'sm'}
                  height={10}
                  width={10}
                  src={profilePhoto ? profilePhoto : ""}
                  name={user?.Profile.username}
                  position="relative"
                >
                  <>
                    {totalNotifications ? (
                    <AvatarBadge 
                      borderColor="papayawhip" 
                      borderBottomLeftRadius="1px"
                      borderBottomRightRadius="1px"
                      borderWidth="1.5px"
                      bg="tomato" 
                      boxSize="1.25em"
                      _before={{
                        content: `"${totalNotifications > 0 ? totalNotifications : ''}"`,
                        fontWeight: "800",
                        fontSize: "13",
                        fontFamily: "Inter",
                        padding: "1px"
                      }}
                    />
                    ) : null}
                  </>
                </Avatar>
              </MenuButton>
              <Portal>
                <MenuList position="relative" zIndex={100}>
                  <Link to={`/profile/${user.Profile.username}`}>
                    <MenuItem
                      fontSize="lg"
                      fontWeight="600"
                    >
                      Profile
                    </MenuItem>
                  </Link>
                  <MenuDivider/>
                  <MenuItem
                    aria-label="notifications"
                    onClick={onOpenNotificationsModal}
                    icon={<AiOutlineBell size={20}/>}
                    fontSize="lg"
                    fontWeight="600"
                  >
                      Notifications
                      {totalNotifications > 0 ? (
                        <Icon as={RxDotFilled} boxSize="1.5em" color="red" verticalAlign="middle" />
                      ) : null}
                  </MenuItem>
                  <MenuDivider/>
                  <MenuItem
                    aria-label="toggle color mode"
                    onClick={toggleColorMode}
                    icon={colorMode === "light" ? <BsFillMoonFill size={20}/> : <BsFillSunFill size={20}/>}
                    fontSize="lg"
                    fontWeight="600"
                  >
                    {colorMode === "light" ? "Dark" : "Light"} Mode
                  </MenuItem>
                  <Link to="/settings">
                    <MenuItem
                      aria-label="settings"
                      icon={<FiSettings size={20}/>}
                      fontSize="lg"
                      fontWeight="600"
                    >
                      Settings
                    </MenuItem>
                  </Link>
                  <Link to="/documentation">
                    <MenuItem
                      aria-label="documentation"
                      icon={<GrDocumentText size={20}/>}
                      fontSize="lg"
                      fontWeight="600"
                    >
                      Documentation
                    </MenuItem>
                  </Link>
                  <Link to="/supportrequest">
                    <MenuItem
                      aria-label="support/request"
                      icon={<MdOutlineContactSupport size={20}/>}
                      fontSize="lg"
                      fontWeight="600"
                    >
                      Support/Request
                    </MenuItem>
                  </Link>
                  <MenuItem
                    aria-label="logout"
                    onClick={e=>onLogout()}
                    icon={<MdLogout size={25}/>} 
                    fontSize="lg"
                    fontWeight="600"
                  >
                    Log out
                  </MenuItem>
                  <MenuDivider display={["block","none"]}/>
                  <Box 
                    marginInlineStart="2!important" 
                    position="relative"
                    display={["block","none"]}
                  >
                    <Input 
                      type="search"
                      rounded="2xl"
                      width="100%"
                      placeholder="Search"
                      bg="gray.100"
                      _dark={{
                        bg: "whiteAlpha.50"
                      }}
                      // borderColor="black"
                      onKeyDown={e=>e.key === 'Enter' ? navSearch((e.target as any).value) : null}
                    />
                    <Box
                      pointerEvents="none"
                      as={FaSearch}
                      position="absolute"
                      top={3}
                      right={3}
                    />
                  </Box>
                </MenuList>
              </Portal>
            </Menu>
          </Flex>
        </Flex>

        <Modal isOpen={isOpenNotificationsModal} onClose={onCloseNotificationsModal} size="xl">
          <ModalOverlay />
          <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
            <ModalHeader fontSize="2xl">Notifications</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex flexDirection="column" gap={5} justify="space-between">
                {userNotifications?.followRequests?.map((followRequest,i)=>{
                  return (
                    <Flex 
                      align="center" 
                      gap={1} 
                      justify="space-between" 
                      flexWrap="wrap"
                      width="100%"
                      key={i}
                    >
                      <Flex align="center" gap={1}>
                        <Avatar src={followRequest.Profile_Following_self_profile_idToProfile.profile_photo} size="sm" name={followRequest.Profile_Following_self_profile_idToProfile.username}/>
                        <Text>
                          <Text
                            as={Link} 
                            to={`/profile/${followRequest.Profile_Following_self_profile_idToProfile.username}`}
                            onClick={onCloseNotificationsModal}
                          >
                            <Text 
                              as="span"
                              fontWeight="bold"
                            >
                            @{followRequest.Profile_Following_self_profile_idToProfile.username}
                            </Text> 
                          </Text>
                          {" "} would like to follow you
                        </Text>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          onClick={e=>acceptFollowRequest(followRequest.id)}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={e=>rejectFollowRequest(followRequest.id!)}
                        >
                          Reject
                        </Button>
                      </Flex>
                    </Flex>
                  )
                })}

                {userNotifications?.bookClubRequests?.map((bookClubRequest,i)=>{
                  return (
                    <Flex 
                      align="center" 
                      gap={1} 
                      justify="space-between" 
                      flexWrap="wrap"
                      width="100%"
                      key={i}
                    >
                      <Flex align="center" gap={1}>
                        <Avatar src={bookClubRequest.Profile.profile_photo} size="sm" name={bookClubRequest.Profile.username}/>
                        <Text>
                          <Text
                            as={Link} 
                            to={`/profile/${bookClubRequest.Profile.username}`}
                            onClick={onCloseNotificationsModal}
                          >
                            <Text 
                              as="span"
                              fontWeight="bold"
                            >
                            @{bookClubRequest.Profile.username}
                            </Text> 
                          </Text>
                            {" "} would like to join {" "}
                            <Text 
                              as={Link} 
                              to={`/bookclubs/${bookClubRequest.BookClubs.id}`}
                              onClick={onCloseNotificationsModal}
                            >
                              {bookClubRequest.BookClubs.name}
                            </Text>
                        </Text>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          onClick={e=>acceptBookClubRequest(bookClubRequest?.id)}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={e=>rejectBookClubRequest(bookClubRequest.id)}
                        >
                          Reject
                        </Button>
                      </Flex>
                    </Flex>
                  )
                })}

                {userNotifications?.comments?.map((comment,i)=>{
                  return (
                    <Flex 
                      align="center" 
                      gap={1} 
                      justify="space-between" 
                      flexWrap="wrap"
                      width="100%"
                      key={i}
                    >
                      <Flex align="center" gap={1}>
                        <Avatar src={comment.from_data?.profile_photo} size="sm" name={comment.from_data?.username}/>
                        <Text>
                          <Text
                            as={Link} 
                            to={`/profile/${comment.from_data?.username}`}
                            onClick={onCloseNotificationsModal}
                          >
                            <Text 
                              as="span"
                              fontWeight="bold"
                            >
                            @{comment.from_data?.username}
                            </Text> 
                          </Text>
                            {" "} commented on your {" "}
                            <Text 
                              as={Link} 
                              to={comment.subject?.uri}
                              onClick={onCloseNotificationsModal}
                              fontWeight="bold"
                            >
                              post
                            </Text>
                        </Text>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          onClick={e=>readNotification(comment.id)}
                          isLoading={readNotificationMutation.isLoading}
                        >
                          OK
                        </Button>
                      </Flex>
                    </Flex>
                  )
                })}

                {userNotifications?.commentOnOtherUsersPostYouCommentedOn?.map((comment,i)=>{
                  return (
                    <Flex 
                      align="center" 
                      gap={1} 
                      justify="space-between" 
                      flexWrap="wrap"
                      width="100%"
                      key={i}
                    >
                      <Flex align="center" gap={1}>
                        <Avatar src={comment.from_data?.profile_photo} size="sm" name={comment.from_data?.username}/>
                        <Text>
                          <Text
                            as={Link} 
                            to={`/profile/${comment.from_data?.username}`}
                            onClick={onCloseNotificationsModal}
                          >
                            <Text 
                              as="span"
                              fontWeight="bold"
                            >
                            @{comment.from_data?.username}
                            </Text> 
                          </Text>
                            {" "} commented on a {" "}
                            <Text 
                              as={Link} 
                              to={comment.subject?.uri}
                              onClick={onCloseNotificationsModal}
                              fontWeight="bold"
                            >
                              post thread
                            </Text>
                            {" "} you're a part of
                        </Text>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          onClick={e=>readNotification(comment.id)}
                          isLoading={readNotificationMutation.isLoading}
                        >
                          OK
                        </Button>
                      </Flex>
                    </Flex>
                  )
                })}

                {userNotifications?.replies?.map((reply,i)=>{
                  return (
                    <Flex 
                      align="center" 
                      gap={1} 
                      justify="space-between" 
                      flexWrap="wrap"
                      width="100%"
                      key={i}
                    >
                      <Flex align="center" gap={1}>
                        <Avatar src={reply.from_data?.profile_photo} size="sm" name={reply.from_data?.username}/>
                        <Text>
                          <Text
                            as={Link} 
                            to={`/profile/${reply.from_data?.username}`}
                            onClick={onCloseNotificationsModal}
                          >
                            <Text 
                              as="span"
                              fontWeight="bold"
                            >
                            @{reply.from_data?.username}
                            </Text> 
                          </Text>
                            {" "} replied to your {" "}
                            <Text 
                              as={Link} 
                              to={reply.subject?.uri}
                              onClick={onCloseNotificationsModal}
                              fontWeight="bold"
                            >
                              comment
                            </Text>
                        </Text>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          onClick={e=>readNotification(reply.id)}
                          isLoading={readNotificationMutation.isLoading}
                        >
                          OK
                        </Button>
                      </Flex>
                    </Flex>
                  )
                })}

                {userNotifications?.likes?.map((like,i)=>{
                  return (
                    <Flex 
                      align="center" 
                      gap={1} 
                      justify="space-between" 
                      flexWrap="wrap"
                      width="100%"
                      key={i}
                    >
                      <Flex align="flex-start" gap={1}>
                        <Avatar src={like.from_data?.profile_photo} size="sm" name={like.from_data?.username}/>
                        <Box>
                          <Box>
                            <Text>
                              <Text
                                as={Link} 
                                to={`/profile/${like.from_data?.username}`}
                                onClick={onCloseNotificationsModal}
                              >
                                <Text 
                                  as="span"
                                  fontWeight="bold"
                                >
                                @{like.from_data?.username}
                                </Text> 
                              </Text>
                                {" "} liked your post: {" "}
                            </Text>
                          </Box>
                          <Flex align="center" gap={1} fontSize="sm">
                            <Text 
                              fontWeight="bold"
                              as="span"
                            >
                              {like.subject?.title}
                            </Text>
                            by
                            <Text 
                              fontWeight="bold"
                              as="span"
                            >
                              {like.subject?.author}
                            </Text>
                          </Flex>
                        </Box>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          onClick={e=>readNotification(like.id)}
                          isLoading={readNotificationMutation.isLoading}
                        >
                          OK
                        </Button>
                      </Flex>
                    </Flex>
                  )
                })}

                {userNotifications?.suggestionRequests?.map((sR,i)=>{
                  return (
                    <Flex 
                      align="center" 
                      gap={1} 
                      justify="space-between" 
                      flexWrap="wrap"
                      width="100%"
                      key={i}
                    >
                      <Flex align="flex-start" gap={1}>
                        <Avatar src={sR.from_data?.profile_photo} size="sm" name={sR.from_data?.username}/>
                        <Box>
                          <Box>
                            <Text>
                              <Text
                                as={Link} 
                                to={`/profile/${sR.from_data?.username}`}
                                onClick={onCloseNotificationsModal}
                              >
                                <Text 
                                  as="span"
                                  fontWeight="bold"
                                >
                                @{sR.from_data?.username}
                                </Text> 
                              </Text>
                                {" "} requested a book suggestion from you {" "}
                            </Text>
                          </Box>
                          <Text 
                            as={Link} 
                            // fontWeight="bold"
                            color="blue"
                            to={`/booksuggestions/bookshelf?profile=${sR.from_data?.username}`}
                          >
                            Visit @{sR.from_data?.username}'s bookshelf
                          </Text>
                        </Box>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          onClick={e=>readNotification(sR.id)}
                          isLoading={readNotificationMutation.isLoading}
                        >
                          OK
                        </Button>
                      </Flex>
                    </Flex>
                  )
                })}

              </Flex>
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' onClick={onCloseNotificationsModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isOpenSearchModal} onClose={closeSearchModal}>
          <ModalOverlay/>
          <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            <Heading as="h2" size="lg">Search Results</Heading>
          </ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <Box my={2}>
            <Heading as="h3" size="md">Users</Heading>
              {searchData && searchData.profiles?.length > 0 ? (
                searchData?.profiles.map((profile, i)=>{
                  return (
                    <Box
                      key={i}
                      my={1}
                    >
                      <Link 
                        to={`/profile/${profile.username}`}
                        onClick={closeSearchModal}
                      >
                        <HStack spacing={1}>
                          <Avatar 
                            size="xs"
                            name={profile.username}
                          />
                          <Text>
                            @{profile.username}
                          </Text>
                          {/* <Text>
                            {profile.User.first_name + " " + profile.User.last_name}
                          </Text> */}
                        </HStack>
                      </Link>
                    </Box>
                  )
                })
              ) : (
                <i>No users based on the search term</i>
              )}
            </Box>
            <Box my={2}>
              <Heading as="h3" size="md">Book Clubs</Heading>
              {searchData && searchData.bookClubs?.length > 0 ? (
                searchData.bookClubs.map((bookClub,i)=>{
                  return (
                    <Box
                      key={i}
                      my={1}
                    >
                      <Link 
                        to={`/bookclubs/${bookClub.id}`}
                        onClick={closeSearchModal}
                      >
                        <Text>{bookClub.name}</Text>
                      </Link>
                    </Box>
                  )
                })
              ) : (
                <i>No book clubs based on the search term</i>
              )}
            </Box>

            <Box my={2}>
              <Heading as="h3" size="md">Books</Heading>
              <Flex
                gap={2}
                wrap="wrap"
              >
                {searchData && searchData.books?.length > 0 ? (
                  <>
                    {searchData.books.map(book=>{
                      return (
                        <Box
                          flex="1 1 125px"
                          maxWidth="125px"
                        >
                          <Image
                            // maxHeight="100px"
                            className="book-image"
                            onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                            src={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215"}
                            boxShadow="1px 1px 1px 1px darkgrey"
                            mb={1}
                          />
                          <Box lineHeight={1.2}>
                            <Popover isLazy>
                              <PopoverTrigger>
                                <Text 
                                  noOfLines={2}
                                  fontWeight="bold"
                                  _hover={{
                                    cursor: 'pointer'
                                  }}
                                >
                                  {book.volumeInfo.title}
                                </Text>
                              </PopoverTrigger>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverHeader>{book.volumeInfo.title}</PopoverHeader>
                                <PopoverBody>{book.volumeInfo.description}</PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <Text fontSize="sm" noOfLines={1}>
                              {book.volumeInfo.authors ? book.volumeInfo.authors[0] : null}
                            </Text>
                            <Text fontSize="sm" fontStyle="italic">
                              {book.volumeInfo.publishedDate ? dayjs(book.volumeInfo.publishedDate).format('YYYY') : null}
                            </Text>
                            <Flex align="center" gap={1}>
                              <Button 
                                as="a"
                                href={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(book.volumeInfo.title + " " + (book.volumeInfo.authors ? book.volumeInfo.authors[0] : null))}`}
                                target="blank"
                                size="xs"
                                variant="ghost"
                                p={0}
                              >
                                <FaStore size={17} />
                              </Button>
                              <Button
                                size="xs"
                                as={Link}
                                to={`/chat/room?title=${book.volumeInfo.title}&author=${book.volumeInfo.authors ? book.volumeInfo.authors[0] : ""}`}
                                onClick={e=>closeSearchModal()}
                                variant="ghost"
                                p={0}
                              >
                                <MdOutlineChat size={17} />
                              </Button>
                              <Button
                                size="xs"
                                onClick={e=>addToTbr({
                                  image: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215",
                                  title: book.volumeInfo.title,
                                  author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : null,
                                  description: book.volumeInfo.description,
                                  isbn: book.volumeInfo.industryIdentifiers?.length ? book.volumeInfo.industryIdentifiers[0].identifier : "",
                                  page_count: book.volumeInfo.pageCount ? book.volumeInfo.pageCount : null,
                                  published_date: book.volumeInfo.publishedDate ? dayjs(book.volumeInfo.publishedDate).format('YYYY') : "",
                                },toast,queryClient)}
                                variant="outline"
                                backgroundColor="white"
                                color="black"
                              >
                                TBR
                              </Button>
                            </Flex>
                          </Box>
                        </Box>
                      )
                    })}
                  </>
                ) : (
                  null
                )}
              </Flex>
            </Box>

          </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={isOpenConfirmModal} onClose={onCloseConfirmModal} isCentered>
          <ModalOverlay/>
          <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
            <ModalHeader>
              <Heading as="h2" size="md">Confirm Your Account</Heading>
            </ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
              Please check your email to confirm your account
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={e=>resendConfirmEmail()}
                colorScheme="yellow"
                me={2}
              >
                Resend Email
              </Button>
              <Button
                onClick={e=>onCloseConfirmModal()}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Box>

      <Box as="main" id="main">
        <SkipNavContent/>
        <Outlet />
      </Box>
    </>
  );
}
import { ReactNode, useState, useLayoutEffect, useRef } from 'react';
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
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  InputGroup,
  InputRightElement,
  Heading,
  useDisclosure,
  useColorModeValue,
  Stack,
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
  useToast,
  Link as ChakraLink,
  AvatarGroup,
} from '@chakra-ui/react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdClose, MdLogout } from 'react-icons/md';
import { BsFillMoonFill, BsFillSunFill } from 'react-icons/bs';
import { FiSettings, FiMail } from 'react-icons/fi';
import { RxDotFilled } from 'react-icons/rx';
import { AiOutlineBell, AiFillHome } from 'react-icons/ai';
import { BiMessageDetail } from 'react-icons/bi';
import { FaSearch } from 'react-icons/fa';
import logoIcon from './assets/community-book-club-logo-logo-only.png';
import logoIconWhite from './assets/community-book-club-logo-logo-only-white.png';
import Cookies from "js-cookie";
import axios from "axios";
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace';

interface LinkItemProps {
  name: string;
  linkTo: string;
  icon?: ReactJSXElement;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', linkTo: "/", icon: <AiFillHome size="20"/>},
  { name: 'Book Clubs', linkTo: "/bookclubs" },
  { name: 'Reading Clubs', linkTo: "/readingclubs" }
];

const useTopNav = ({server,onLogout}: TopNavProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, getUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function getNotifications() {
    // resetNotifications();
    let userNotifications: UserNotificationsType = {
      followRequests: [],
      bookClubRequests: [],
      comments: []
    }
    let totalNotifications = 0;
    try {
      const tokenCookie = Cookies.get().token;
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
        userNotifications = {
          ...userNotifications, 
          comments: [...userNotifications.comments as any[], ...commentData] 
        }

      //check if any follow requests
      if (user.Profile.Following_Following_following_profile_idToProfile?.length) {
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
      if (user.Profile.BookClubMembers_BookClubMembers_book_club_creatorToProfile?.length) {
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
      totalNotifications = userNotifications.followRequests.length + userNotifications.bookClubRequests.length + userNotifications.comments.length;
      return {
        userNotifications,
        totalNotifications
      };
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
    setProfilePhoto(`${user.Profile.profile_photo}?x=${new Date().getTime()}`);
  },[user.Profile])

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
      return getNotifications();
    },
    onSuccess: (data)=>{
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
      queryClient.invalidateQueries({ queryKey: ['notificationKey'] })
      queryClient.resetQueries({queryKey: ['notificationKey']})
      queryClient.setQueryData(["notificationKey"],data)
    }
  })
  function rejectBookClubRequest(requestId: number) {
    rejectBookClubRequestMutation.mutate(requestId);
  }

  const readCommentNotificationMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const tokenCookie = Cookies.get().token;
      await axios
        .put(server + "/api/readcommentnotification",
        {
          commentId
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
  function readCommentNotification(commentId: number) {
    readCommentNotificationMutation.mutate(commentId);
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

  const navSearchRef = useRef({} as HTMLInputElement);
  const [searchData,setSearchData] = useState({} as SearchData);
  const navSearchMutation = useMutation({
    mutationFn: async () => {
      console.log(navSearchRef.current.value)
      const tokenCookie = Cookies.get().token;
      await axios
        .get(`${server}/api/search?searchterm=${navSearchRef.current.value}`,
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
    }
  })
  function navSearch() {
    navSearchMutation.mutate();
  }

  return { isOpen, onOpen, onClose, colorMode, navigate, user, onOpenNotificationsModal, profilePhoto, toggleColorMode, isOpenNotificationsModal, onCloseNotificationsModal, acceptFollowRequest, rejectFollowRequest, acceptBookClubRequest, rejectBookClubRequest, getNotifications, navSearchRef, navSearch, isOpenSearchModal, closeSearchModal, searchData, readCommentNotification };
}

export default function TopNav({server,onLogout}: TopNavProps) {
  const { isOpen, onOpen, onClose, colorMode, navigate, user, onOpenNotificationsModal, profilePhoto, toggleColorMode, isOpenNotificationsModal, onCloseNotificationsModal, acceptFollowRequest, rejectFollowRequest, acceptBookClubRequest, rejectBookClubRequest, getNotifications, navSearchRef, navSearch, isOpenSearchModal, closeSearchModal, searchData, readCommentNotification } = useTopNav({server,onLogout});

  const notificationQuery = useQuery({ queryKey: ['notificationKey'], queryFn: getNotifications });
  const notificationData = notificationQuery.data;
  const userNotifications = notificationData?.userNotifications;
  console.log(userNotifications)
  const totalNotifications: number = notificationData?.totalNotifications as number;

  return (
    <>
      <Box as="nav" bg={useColorModeValue('white', 'gray.900')} overflow="hidden" px={4} boxShadow="1px 1px 6px lightgray" _dark={{boxShadow: "0 0 0"}}>
        <Flex py={2} flexWrap="nowrap" alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <MdClose /> : <GiHamburgerMenu />}
            p="10px"
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Box 
              position="relative" 
              minW="max-content"
              display={{ base: 'none', md: 'flex' }}
            >
              <Link to="/">
                <Image 
                  src={colorMode === "light" ? logoIcon : logoIconWhite}
                  h="45px"
                  onClick={e=>navigate("/")}
                  border="1px solid transparent"
                  borderRadius="4px"
                  p={1}
                  _hover={{
                    bg: "gray.400"
                  }}
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
            <InputGroup marginInlineStart="2!important">
              <Input 
                type="text"
                rounded="2xl"
                width="100%"
                placeholder="Search"
                bg="gray.100"
                _dark={{
                  bg: "gray.600"
                }}
                ref={navSearchRef}
                onKeyUp={e=>e.key === 'Enter' ? navSearch() : null}
              />
              <InputRightElement
                pointerEvents="none"
                children={<FaSearch/>}
              />
            </InputGroup>
          </HStack>
          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}>
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
                  bg: useColorModeValue("gray.200","gray.500"),
                  color: useColorModeValue("black","white")
                }}
                // style={({isActive}: {isActive: boolean})=>({
                //   backgroundColor: isActive ? "#E2E8F0" : ""
                // })}
                sx={{
                  bg: window.location.pathname === linkItem.linkTo ? useColorModeValue("gray.200","gray.500") : "",
                  color: window.location.pathname === linkItem.linkTo ? useColorModeValue("black","white") : ""
                }}
              >
                <Flex align="center" gap={2}>
                  {linkItem.icon ? (
                    linkItem.icon
                  ): linkItem.name}
                </Flex>
              </Box>
            ))}
          </HStack>
          <Flex alignItems={'center'} justify="space-between" gap={3}>
            {user.Library ? (
              <Heading 
                as="h6" 
                size="xs"
                // maxW="25%"
                textTransform="uppercase"
                whiteSpace="break-spaces"
                display={["none","none","block"]}
              >
                {user.Library.name}
              </Heading>
            ) : null}
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
              >
                <Avatar
                  size={'sm'}
                  src={profilePhoto ? profilePhoto : ""}
                >
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
                </Avatar>
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={e=>navigate(`/profile/${user.Profile.username}`)}
                  fontSize="lg"
                  fontWeight="600"
                >
                  {`${user.first_name} ${user.last_name}`}
                </MenuItem>
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
                  aria-label="messages"
                  icon={<BiMessageDetail size={20}/>}
                  fontSize="lg"
                  fontWeight="600"
                >
                    Messages
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
                <MenuItem
                  aria-label="settings"
                  onClick={e=>navigate("/settings")}
                  icon={<FiSettings size={20}/>}
                  fontSize="lg"
                  fontWeight="600"
                >
                  Settings
                </MenuItem>
                <MenuItem
                  aria-label="logout"
                  onClick={e=>onLogout()}
                  icon={<MdLogout size={25}/>} 
                  fontSize="lg"
                  fontWeight="600"
                >
                  Log out
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {LinkItems.map((linkItem,index) => (
                <Box
                  as={NavLink} 
                  key={index} 
                  to={linkItem.linkTo}
                  onClick={onClose}
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    color: 'blue',
                    bg: 'gray.200'
                  }}
                  _dark={{
                    bg: 'gray.700'
                  }}
                >
                  {linkItem.name}
                </Box>
              ))}
            </Stack>
          </Box>
        ) : null}

        <Modal isOpen={isOpenNotificationsModal} onClose={onCloseNotificationsModal} size="xl">
          <ModalOverlay />
          <ModalContent>
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
                        <Avatar src={followRequest.Profile_Following_self_profile_idToProfile.profile_photo} size="sm"/>
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
                  console.log(bookClubRequest)
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
                        <Avatar src={bookClubRequest.Profile.profile_photo} size="sm"/>
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
                        <Avatar src={comment.from_data?.profile_photo} size="sm"/>
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
                          onClick={e=>readCommentNotification(comment.id)}
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
          <ModalContent>
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
                        <HStack>
                          <Avatar 
                            size="xs"
                          />
                          <Text>
                            @{profile.username}
                          </Text>
                          <Text>
                            {profile.User.first_name + " " + profile.User.last_name}
                          </Text>
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
          </ModalBody>
          </ModalContent>
        </Modal>

      </Box>

      <Box as="main" id="main">
        <Outlet />
      </Box>
    </>
  );
}
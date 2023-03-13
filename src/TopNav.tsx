import { ReactNode, useState, useLayoutEffect, useEffect, SetStateAction } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { TopNavProps, UserNotificationsType, Requester, Following_Following_following_profile_idToProfile } from './types/types';
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
  Heading,
  useDisclosure,
  useColorModeValue,
  Stack,
  Badge,
  Text,
  Icon,
  useColorMode,
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
import { AiOutlineBell } from 'react-icons/ai';
import logoIcon from './assets/community-book-club-logo-logo-only.png';
import logoIconWhite from './assets/community-book-club-logo-logo-only-white.png';
import Cookies from "js-cookie";
import axios from "axios";

interface LinkItemProps {
  name: string;
  linkTo: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Book Clubs', linkTo: "/bookclubs" },
  { name: 'Reading Clubs', linkTo: "/" },
  { name: 'Members', linkTo: "/members" }
];

const useTopNav = ({server,onLogout}: TopNavProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, getUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [userNotifications,setUserNotifications] = useState<UserNotificationsType>({
    followRequests: [],
    bookClubRequests: []
  })
  const [totalRequests,setTotalRequests] = useState<number>(0);

  function getNotifications() {
    //check if any follow requests
    if (user.Profile.Following_Following_following_profile_idToProfile?.length) {
      let followers = user.Profile.Following_Following_following_profile_idToProfile;
      for (let i = 0; i < followers.length; i++) {
        if(followers[i].status === "requesting") {
          let followerData = {...followers[i].Profile_Following_self_profile_idToProfile};
          Object.assign(followerData, {"followId": followers[i].id})
          setUserNotifications((prev)=>({...prev, followRequests: [...prev.followRequests as any[], followerData] }))
        }
      }
    }
    if (user.Profile.BookClubMembers_BookClubMembers_book_club_creatorToProfile?.length) {
      let bookClubMembers = user.Profile.BookClubMembers_BookClubMembers_book_club_creatorToProfile;
      for (let i = 0; i < bookClubMembers.length; i++) {
        if(bookClubMembers[i].status === 1) {
          let bookClubMemberData = {...bookClubMembers[i].Profile};
          Object.assign(bookClubMemberData, {"memberRequestId": bookClubMembers[i].id})
          Object.assign(bookClubMemberData, {"memberRequestBookClub": bookClubMembers[i].BookClubs})
          setUserNotifications((prev)=>({...prev, bookClubRequests: [...prev.bookClubRequests as any[], bookClubMemberData] }))
        }
      }
    }
    setTotalRequests(userNotifications.followRequests.length + userNotifications.bookClubRequests.length)
  }

  useLayoutEffect(()=>{
    getNotifications()
    return(()=>{
      setUserNotifications({
        followRequests: [],
        bookClubRequests: []
      })
    })
  },[user])

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

  async function acceptFollowRequest(requestId: number) {
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
    })
  }

  async function rejectFollowRequest(requestId: number) {
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
    })
  }

  return { isOpen, onOpen, onClose, colorMode, navigate, user, userNotifications, onOpenNotificationsModal, profilePhoto, toggleColorMode, isOpenNotificationsModal, onCloseNotificationsModal, acceptFollowRequest, rejectFollowRequest, totalRequests };
}

export default function TopNav({server,onLogout}: TopNavProps) {
  const { isOpen, onOpen, onClose, colorMode, navigate, user, userNotifications, onOpenNotificationsModal, profilePhoto, toggleColorMode, isOpenNotificationsModal, onCloseNotificationsModal, acceptFollowRequest, rejectFollowRequest, totalRequests } = useTopNav({server,onLogout});

  return (
    <>
      <Box as="nav" bg={useColorModeValue('white', 'gray.900')} overflow="hidden" px={4} boxShadow="1px 1px 6px lightgray" _dark={{boxShadow: "0 0 0"}}>
        <Flex py={2} flexWrap="wrap" alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <MdClose /> : <GiHamburgerMenu />}
            p="10px"
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Box position="relative" minW="max-content">
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
                {user && user.role === "admin" && user.Library.version === "free" ? (
                <Badge
                  colorScheme="green"
                  position="absolute"
                  rounded="lg"
                  bottom="0"
                  right="0"
                  backgroundColor="green"
                  color="white"
                >
                  FREE
                </Badge>
                ) : null}
              </Link>
            </Box>
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
                  _hover={{
                    bg: useColorModeValue("gray.200","gray.500"),
                    color: useColorModeValue("black","white")
                  }}
                >
                  {linkItem.name}
                </Box>
              ))}
            </HStack>
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
                  {totalRequests ? (
                  <AvatarBadge 
                    borderColor="papayawhip" 
                    borderBottomLeftRadius="1px"
                    borderBottomRightRadius="1px"
                    borderWidth="1.5px"
                    bg="tomato" 
                    boxSize="1.25em"
                    _before={{
                      content: `"${totalRequests > 0 ? totalRequests : ''}"`,
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
                      {totalRequests > 0 ? (
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
                        <Avatar src={followRequest.profile_photo} size="sm"/>
                        <Text>
                          <Text
                            as={Link} 
                            to={`/profile/${followRequest.username}`}
                            onClick={onCloseNotificationsModal}
                          >
                            <Text 
                              as="span"
                              fontWeight="bold"
                            >
                            @{followRequest.username}
                            </Text> 
                          </Text>
                          {" "} would like to follow you
                        </Text>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          onClick={e=>acceptFollowRequest(followRequest.followId!)}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={e=>rejectFollowRequest(followRequest.followId!)}
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
                        <Avatar src={bookClubRequest.profile_photo} size="sm"/>
                        <Text>
                          <Text
                            as={Link} 
                            to={`/profile/${bookClubRequest.username}`}
                            onClick={onCloseNotificationsModal}
                          >
                            <Text 
                              as="span"
                              fontWeight="bold"
                            >
                            @{bookClubRequest.username}
                            </Text> 
                          </Text>
                          {" "} would like to join {bookClubRequest.memberRequestBookClub.name}
                        </Text>
                      </Flex>
                      <Flex m={1} gap={1} justify="flex-end">
                        <Button 
                          size="sm"
                          // onClick={e=>acceptFollowRequest(bookClubRequest?.memberRequestId!)}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          // onClick={e=>rejectFollowRequest(bookClubRequest.memberRequestId!)}
                        >
                          Reject
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

      </Box>

      <Box as="main" id="main">
        <Outlet />
      </Box>
    </>
  );
}
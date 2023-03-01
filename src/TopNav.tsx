import { ReactNode, useState, useLayoutEffect, useEffect, SetStateAction } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { TopNavProps, UserMessagesType, Follower, Following_Following_following_profile_idToProfile } from './types/types';
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
  AvatarGroup,
} from '@chakra-ui/react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdClose, MdLogout } from 'react-icons/md';
import { BsFillMoonFill, BsFillSunFill } from 'react-icons/bs';
import { FiSettings, FiMail } from 'react-icons/fi';
import { RxDotFilled } from 'react-icons/rx';
import logoIcon from './assets/community-book-club-logo-logo-only.png';
import logoIconWhite from './assets/community-book-club-logo-logo-only-white.png';
import Cookies from "js-cookie";
import axios from "axios";

interface LinkItemProps {
  name: string;
  linkTo: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Book Clubs', linkTo: "/" },
  { name: 'Reading Clubs', linkTo: "/" },
  { name: 'Favorites', linkTo: "/" },
];



export default function TopNav({server,onLogout}: TopNavProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, getUser } = useAuth();
  const navigate = useNavigate();
  const [userMessages,setUserMessages] = useState<UserMessagesType>({
    followRequests: [],
  })

  function getMessages() {
    //check if any follow requests
    if (user.Profile.Following_Following_following_profile_idToProfile?.length) {
      user.Profile.Following_Following_following_profile_idToProfile.forEach((follower)=>{
        if (follower.status === "requesting") {
          let followerData = {...follower.Profile_Following_self_profile_idToProfile};
          //TODO Fix this so spred goes in
          Object.assign(followerData, {"followId": follower.id})
          setUserMessages({...userMessages, followRequests: [...userMessages.followRequests as any[], followerData] })
        }
      })
    }
  }

  useLayoutEffect(()=>{
    getMessages()
  },[])

  const [profilePhoto,setProfilePhoto] = useState<string | null>(null);
  useLayoutEffect(()=>{
    setProfilePhoto(`${user.Profile.profile_photo}?x=${new Date().getTime()}`);
  },[user.Profile])


  //User edit modals
  const { 
    isOpen: isOpenMessagesModal, 
    onOpen: onOpenMessagesModal, 
    onClose: onCloseMessagesModal 
  } = useDisclosure()

  const [messagesError,setMessagesError] = useState("")
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
        getMessages();
      }
    })
    .catch(({response})=>{
      console.log(response)
      setMessagesError("An error has occured")
    })
  }

  return (
    <>
      <Box bg={useColorModeValue('white', 'gray.900')} overflow="hidden" px={4} boxShadow="1px 1px 6px lightgray" _dark={{boxShadow: "0 0 0"}}>
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
                  {userMessages.followRequests?.length ? (
                    <AvatarBadge 
                      borderColor="papayawhip" 
                      borderBottomLeftRadius="1px"
                      borderBottomRightRadius="1px"
                      borderWidth="1.5px"
                      bg="tomato" 
                      boxSize="1.25em"
                      _before={{
                        content: `"1"`,
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
                    aria-label="messages"
                    onClick={onOpenMessagesModal}
                    icon={<FiMail size={20}/>}
                    fontSize="lg"
                    fontWeight="600"
                  >
                      Messages
                      {userMessages.followRequests?.length ? (
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

        <Modal isOpen={isOpenMessagesModal} onClose={onCloseMessagesModal} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader fontSize="2xl">Messages</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text color="tomato">{messagesError}</Text>
              {userMessages?.followRequests?.map((followRequest,i)=>{
                {console.log(followRequest)}
                return (
                  <Flex align="center" gap={2} key={i}>
                    <Avatar src={followRequest.profile_photo} size="sm"/>
                    <Text>
                      <Text as="span" fontWeight="bold">@{followRequest.username}</Text> would like to follow you
                    </Text>
                    <Box m={1}>
                      <Button 
                        size="sm"
                        onClick={e=>acceptFollowRequest(followRequest.followId!)}
                      >
                        Accept
                      </Button>
                      <Button variant="ghost" size="sm">
                        Reject
                      </Button>
                    </Box>
                  </Flex>
                )
              })}
              
            </ModalBody>
            <ModalFooter>
              <Button variant='ghost' onClick={onCloseMessagesModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Box>

      <Box id="main">
        <Outlet />
      </Box>
    </>
  );
}
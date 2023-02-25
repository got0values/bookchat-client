import { ReactNode, useState, useLayoutEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { TopNavProps } from './types/types';
import { useAuth } from './hooks/useAuth';
import {
  Box,
  Flex,
  Avatar,
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
  useColorMode
} from '@chakra-ui/react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdClose, MdLogout } from 'react-icons/md';
import { BsFillMoonFill, BsFillSunFill } from 'react-icons/bs';
import { FiSettings } from 'react-icons/fi';
import logoIcon from './assets/community-book-club-logo-logo-only.png';
import logoIconWhite from './assets/community-book-club-logo-logo-only-white.png';

interface LinkItemProps {
  name: string;
  linkTo: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Book Clubs', linkTo: "/" },
  { name: 'Reading Clubs', linkTo: "/" },
  { name: 'Favorites', linkTo: "/" },
];

export default function TopNav({onLogout}: TopNavProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profilePhoto,setProfilePhoto] = useState<string | null>(null);
  useLayoutEffect(()=>{
    setProfilePhoto(`${user.Profile.profile_photo}?x=${new Date().getTime()}`);
  },[user.Profile])

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
                />
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={e=>navigate("/profile")}
                  fontSize="lg"
                  fontWeight="600"
                >
                  {`${user.first_name} ${user.last_name}`}
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
      </Box>

      <Box id="main">
        <Outlet />
      </Box>
    </>
  );
}
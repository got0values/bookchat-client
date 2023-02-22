import { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { TopNavProps } from './types/types';
import { useAuth } from './hooks/useAuth';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Text,
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
import logo from './assets/community-book-club-logo3.png';
import logoWhite from './assets/community-book-club-logo3-white.png';

interface LinkItemProps {
  name: string;
  linkTo: string;
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', linkTo: "/" },
  { name: 'Profile', linkTo: "/profile" },
  { name: 'Reading Clubs', linkTo: "/" },
  { name: 'Favorites', linkTo: "/" },
];

export default function TopNav({onLogout}: TopNavProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} overflow="hidden" px={4} boxShadow="1px 1px 6px lightgray" _dark={{boxShadow: "0 0 0"}}>
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
              <Image 
                src={colorMode === "light" ? logo : logoWhite}
                h="40px"
              />
              {user && user.role === "admin" && user.Library.version === "free" ? (
              <Badge
                colorScheme="green"
                position="absolute"
                bottom="0"
                right="0"
              >
                FREE
              </Badge>
              ) : null}
            </Box>
            {user.Library ? (
              <Heading 
                as="h6" 
                size="xs"
                maxW="25%"
                textTransform="uppercase"
                whiteSpace="break-spaces"
                display={["none","none","block"]}
              >
                {user.Library.name}
              </Heading>
            ) : null}
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}>
              {LinkItems.map((linkItem, index) => (
                <NavLink key={index} to={linkItem.linkTo}>{linkItem.name}</NavLink>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  src={user.Profile.profile_photo ? user.Profile.profile_photo : ""}
                />
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={e=>navigate("/profile")}
                >
                  {`${user.first_name} ${user.last_name}`}
                </MenuItem>
                <MenuDivider/>
                <MenuItem
                  aria-label="toggle color mode"
                  onClick={toggleColorMode}
                  icon={colorMode === "light" ? <BsFillMoonFill/> : <BsFillSunFill/>}
                >
                  {colorMode === "light" ? "Dark" : "Light"} Mode
                </MenuItem>
                <MenuItem
                  aria-label="settings"
                  onClick={e=>navigate("/settings")}
                  icon={<FiSettings/>}
                >
                  Settings
                </MenuItem>
                <MenuItem
                  aria-label="logout"
                  onClick={e=>onLogout()}
                  icon={<MdLogout/>} 
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
                  px={2}
                  py={1}
                  rounded={'md'}
                  _hover={{
                    textDecoration: 'none',
                    color: 'blue',
                    bg: useColorModeValue('gray.200', 'gray.700'),
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
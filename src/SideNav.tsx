import React, { ReactNode } from 'react';
import { Link, Outlet, useNavigate } from "react-router-dom"
import { SideNavProps } from './types/types';
import { useAuth } from './hooks/useAuth';
import {
  Avatar,
  Stack,
  Heading,
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  Button,
  useDisclosure,
  BoxProps,
  FlexProps,
  Image,
  useColorMode
} from '@chakra-ui/react';
import {
  FiHome,
  FiStar,
  FiSettings,
  FiMenu,
} from 'react-icons/fi';
import { BsFillMoonFill, BsFillSunFill, BsBook } from 'react-icons/bs';
import { MdLogout } from 'react-icons/md';
import { CgProfile } from 'react-icons/cg';
import logo from './assets/community-book-club-logo3.png';
import logoWhite from './assets/community-book-club-logo3-white.png';
import { IconType } from 'react-icons';
import { ReactText } from 'react';

interface LinkItemProps {
  name: string;
  linkTo: string;
  icon: IconType;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  linkTo: string;
  children: ReactText;
}


const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: FiHome, linkTo: "/" },
  { name: 'Profile', icon: CgProfile, linkTo: "/profile" },
  { name: 'Reading Clubs', icon: BsBook, linkTo: "/" },
  { name: 'Favorites', icon: FiStar, linkTo: "/" },
];

export default function SideNav({onLogout}: SideNavProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const navigate = useNavigate();

  const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    return (
      <Flex
        direction="column"
        bg={useColorModeValue('white', 'gray.900')}
        borderRight="1px"
        borderRightColor={useColorModeValue('gray.200', 'gray.700')}
        w={{ base: 'full', md: "275px" }}
        pos="fixed"
        h="full"
        {...rest}>
        <Flex alignItems="center" mx={8} my={3} justifyContent="space-between">
          <Stack align="center">
            <Box position="relative">
              <Image src={colorMode === "light" ? logo : logoWhite}/>
              {user && user.role === "admin" && user.Library.version === "free" ? (
              <Text  
                fontSize="xs" 
                position="absolute"
                bottom="0"
                right="0"
                fontWeight="800"
                px={1}
                bg="black"
                color="white"
                _dark={{
                  bg: "white",
                  color: "black"
                }}
              >
                FREE
              </Text>
              ) : null}
            </Box>
            {user.Library ? (
              <Heading 
                as="h4" 
                size="xs"
                textTransform="uppercase"
              >
                {user.Library.name}
              </Heading>
            ) : null}
            <Flex align="center" gap={2}>
              <Avatar
                size="md"
                src={user.Profile.profile_photo ? user.Profile.profile_photo : ""}
              />
              <Flex flexDirection="column">
                <Heading as="h4" size="xs">{user.email}</Heading>
                {user.role === "admin" ? (
                  <Text as="span" fontSize="sm">(admin)</Text>
                ) : null}
              </Flex>
            </Flex>
          </Stack>
          <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
        </Flex>
        <Flex direction="column" justify="space-between" h="100%">
          <Box>
            {LinkItems.map((link) => (
              <NavItem key={link.name} icon={link.icon} linkTo={link.linkTo}>
                {link.name}
              </NavItem>
            ))}
          </Box>
          <Flex 
            align="center" 
            justify="space-evenly" 
            flexWrap="wrap"
            w="100%"
          >
            <Button
              bg="transparent"
              aria-label="toggle color mode"
              onClick={toggleColorMode}
            >
              <Icon 
                as={colorMode === "light" ? BsFillMoonFill : BsFillSunFill}
              />
            </Button>
            <Button
              bg="transparent"
              aria-label="settings"
              onClick={e=>navigate("/settings")}
            >
              <Icon as={FiSettings}/>
            </Button>
            <Button 
              bg="transparent"
              aria-label="logout"
              onClick={e=>onLogout()}
            >
              <Icon 
                as={MdLogout} 
                fontSize="20px" 
              />
            </Button>
          </Flex>
        </Flex>
      </Flex>
    );
  };

  const NavItem = ({ icon, linkTo, children, ...rest }: NavItemProps) => {
    return (
      <Link to={linkTo} style={{ textDecoration: 'none' }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: 'cyan.400',
            color: 'white',
          }}
          {...rest}>
          {icon && (
            <Icon
              mr="4"
              fontSize="16"
              _groupHover={{
                color: 'white',
              }}
              as={icon}
            />
          )}
          {children}
        </Flex>
      </Link>
    );
  };

  return (
    <>
      <Box 
        bg={useColorModeValue('gray.100', 'gray.900')}
      >
        <SidebarContent
          onClose={() => onClose}
          display={{ base: 'none', md: 'flex' }}
        />
        <Drawer
          autoFocus={false}
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="full">
          <DrawerContent>
            <SidebarContent onClose={onClose} />
          </DrawerContent>
        </Drawer>
        {/* mobilenav */}
        <Flex
          ml={{ base: 0, md: 60 }}
          px={{ base: 4, md: 24 }}
          height="20"
          alignItems="center"
          bg={useColorModeValue('white', 'gray.900')}
          borderBottomWidth="1px"
          borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
          justifyContent="space-between"
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            variant="outline"
            onClick={onOpen}
            aria-label="open menu"
            icon={<FiMenu />}
          />
          <Image src={logo} maxHeight="50px"/>
        </Flex>
      </Box>
      <Box id="main-content">
        <Outlet />
      </Box>
    </>
  );
}
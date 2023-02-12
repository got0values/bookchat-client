import React, { ReactNode } from 'react';
import { Link, Outlet } from "react-router-dom"
import {
  IconButton,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  Heading,
  useDisclosure,
  BoxProps,
  FlexProps,
} from '@chakra-ui/react';
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { ReactText } from 'react';

interface LinkItemProps {
  name: string;
  linkTo: string;
  icon: IconType;
}
const LinkItems: Array<LinkItemProps> = [
  { name: 'Home', icon: FiHome, linkTo: "/" },
  { name: 'Trending', icon: FiTrendingUp, linkTo: "/" },
  { name: 'Explore', icon: FiCompass, linkTo: "/" },
  { name: 'Favourites', icon: FiStar, linkTo: "/" },
  { name: 'Settings', icon: FiSettings, linkTo: "/settings" },
];

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

interface NavItemProps extends FlexProps {
  icon: IconType;
  linkTo: string;
  children: ReactText;
}

export default function SideNav() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    return (
      <Box
        bg={useColorModeValue('white', 'gray.900')}
        borderRight="1px"
        borderRightColor={useColorModeValue('gray.200', 'gray.700')}
        w={{ base: 'full', md: "275px" }}
        pos="fixed"
        h="full"
        {...rest}>
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <Heading 
            size="lg"
          >
            Community Book Club
          </Heading>
          <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
        </Flex>
        {LinkItems.map((link) => (
          <NavItem key={link.name} icon={link.icon} linkTo={link.linkTo}>
            {link.name}
          </NavItem>
        ))}
      </Box>
    );
  };

  const NavItem = ({ icon, linkTo, children, ...rest }: NavItemProps) => {
    return (
      <Link to={linkTo} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
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
          display={{ base: 'none', md: 'block' }}
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
          justifyContent="flex-start"
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            variant="outline"
            onClick={onOpen}
            aria-label="open menu"
            icon={<FiMenu />}
          />
          <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
            Logo
          </Text>
        </Flex>
      </Box>
      <Box id="main-content">
        <Outlet />
      </Box>
    </>
  );
}
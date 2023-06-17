import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { BookshelfCategory, BookshelfBook, BookshelfType } from "../types/types";
import { 
  Box,
  Tag,
  Heading,
  Text,
  Image,
  Center,
  Spinner,
  Stack,
  Button,
  Input,
  Flex,
  Skeleton,
  useToast,
  CloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  FormLabel,
  Switch,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  CheckboxGroup,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  useColorMode
} from "@chakra-ui/react";
import { BookSuggestionToList } from "./BookSuggestToList";
// import { IoIosAdd, IoIosRemove } from 'react-icons/io';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export default function BookSuggestions({server, gbooksapi}: {server: string; gbooksapi: string;}) {
  const toast = useToast();
  const navigate = useNavigate();
  const {colorMode} = useColorMode();
  dayjs.extend(utc);
  const queryClient = useQueryClient();

  

  return (
    <Box className="main-content-smaller">
      <Tabs 
        variant="enclosed"
        p={2}
      >
        <TabList
          borderBottom="none"
        >
          <Tab 
            fontWeight="bold"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            For Me
          </Tab>
          <Tab 
            fontWeight="bold"
            _selected={{
              borderBottom: "2px solid gray"
            }}
          >
            Suggest
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0}>
            
            {/* <Box className="well">
              <Heading as="h2" size="md">
                Check
              </Heading>
            </Box> */}

          </TabPanel>

          <TabPanel px={0}>
            

            <BookSuggestionToList server={server} />


          </TabPanel>

        </TabPanels>
      </Tabs>
    </Box>
  )
}
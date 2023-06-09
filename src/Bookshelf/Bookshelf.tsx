import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Box,
  Tag,
  Heading,
  Text,
  Image,
  Fade,
  Stack,
  HStack,
  Button,
  Input,
  Flex,
  Skeleton,
  useToast,
  useDisclosure,
  Avatar,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Checkbox,
  CheckboxGroup,
  useColorMode
} from "@chakra-ui/react";
import { IoIosAdd } from 'react-icons/io';
import Cookies from "js-cookie";
import axios from "axios";
import { BookClubsType } from "../types/types";


export default function Bookshelf({server, gbooksapi}: {server: string; gbooksapi: string;}) {
  const toast = useToast();
  const navigate = useNavigate();
  const {colorMode} = useColorMode();


  const createCategoryRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const [createCategoryError,setCreateCategoryError] = useState<string>("");
  async function createCategory() {
    const createCategory = createCategoryRef.current.value;
    let tokenCookie: string | null = Cookies.get().token;
    const subdomain = window.location.hostname.split(".")[0];
    if (createCategory.length) {
      await axios
      .post(server + "/api/createbookclub", 
      {
        bookClubName: createCategory,
        subdomain: subdomain
      },
      {headers: {
        'authorization': tokenCookie
      }}
      )
      .then((response)=>{
        if (response.data.success){
          toast({
            description: "Category created!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data) {
          setCreateCategoryError(response.data.message)
        }
      })
    }
    else {
      setCreateCategoryError("Please enter a book club name")
    }
  }

 
  // const { isLoading, isError, data, error } = useQuery({ 
  //   queryKey: ['bookShelfKey'], 
  //   queryFn: async ()=>{
      
  //   }
  // });
  // // const allBookClubsFriends = data?
  // // const allBookClubsPublic = data?
  
  // if (isError) {
  //   return <Flex align="center" justify="center" minH="90vh">
  //     <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
  //   </Flex>
  // }
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={true}
      >

        <Flex flexWrap="wrap">
          <Stack flex="1 1 30%" minW="200px">
            <Box className="well">
              <Flex align="center" flexWrap="wrap" justify="space-between" mb={2}>
                <Heading as="h3" size="md">
                  Categories
                </Heading>
                <Button
                  variant="ghost"
                  // onClick={createBookClubModalOpen}
                >
                  <IoIosAdd size={25} /> New
                </Button>
              </Flex>
              <Box>
                
              </Box>
            </Box>
          </Stack>
          <Stack flex="1 1 65%" maxW="100%">
            <Box className="well">
              <Flex align="center" justify="space-between" gap={2} mb={2}>
                <Heading as="h3" size="md">
                  Bookshelf
                </Heading>
              </Flex>

              <Box>
                
              </Box>
            </Box>
          </Stack>
        </Flex>

      </Skeleton>
    </Box>
  );
};

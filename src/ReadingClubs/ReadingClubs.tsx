import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Box,
  Tag,
  Heading,
  Text,
  Spinner,
  Fade,
  Stack,
  HStack,
  Button,
  Input,
  Flex,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  useDisclosure,
  Avatar,
  Radio,
  RadioGroup,
  Divider,
  HTMLChakraComponents
} from "@chakra-ui/react";
import { IoIosAdd } from 'react-icons/io';
import { FaBookReader } from 'react-icons/fa';
import { BsDot } from 'react-icons/bs';
import Cookies from "js-cookie";
import axios from "axios";
import { BookClubsType } from "../types/types";


export default function ReadingClubs({server}: {server: string}) {
  const toast = useToast();
  const navigate = useNavigate();

  const { 
    isOpen: isOpenCreateReadingClubModal, 
    onOpen: onOpenCreateReadingClubModal, 
    onClose: onCloseCreateReadingClubModal 
  } = useDisclosure()

  function openCreateReadingClubModal() {
    onOpenCreateReadingClubModal();
  }

  function closeCreateReadingClubModal() {
    setCreateReadingClubError("");
    onCloseCreateReadingClubModal();
  }

  const createReadingClubNameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const [createReadingClubError,setCreateReadingClubError] = useState<string>("");
  async function createReadingClub() {
    const createReadingClubName = createReadingClubNameRef.current.value;
    let tokenCookie: string | null = Cookies.get().token;
    const subdomain = window.location.hostname.split(".")[0];
    if (createReadingClubName.length) {
      await axios
      .post(server + "/api/createreadingclub", 
      {
        bookClubName: createReadingClubName,
        subdomain: subdomain
      },
      {headers: {
        'authorization': tokenCookie
      }}
      )
      .then((response)=>{
        if (response.data.success){
          toast({
            description: "Reading club created!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data) {
          setCreateReadingClubError(response.data.message)
        }
      })
    }
    else {
      setCreateReadingClubError("Please enter a book club name")
    }
  }

 
  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['readingClubsKey'], 
    queryFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        const readingClubsData = axios
          .get(server + "/api/getbookclubs",
            {
              headers: {
                'authorization': tokenCookie
              }
            }
          )
          .then((response)=>{
            console.log(response.data)
            const {data} = response;
            return response.data;
          })
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.error)
          })
        return readingClubsData
      }
      else {
        throw new Error("RC101")
      }
    }
  });
  
  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={!isLoading}
      >
          <Flex>
            <Box className="well" flex="1 1 30%">
              <Stack
                flexWrap="wrap" 
                justify="space-between" 
                mb={2}
              >
                <Flex align="center" justify="space-between" gap={2}>
                  <Heading as="h3" size="md">
                    Admin
                  </Heading>
                </Flex>
                <Button
                  // variant="ghost"
                  leftIcon={<IoIosAdd size={25} />}
                  onClick={openCreateReadingClubModal}
                >
                  Create Reading Club
                </Button>
              </Stack>
            </Box>

            <Box className="well" flex="1 1 65%">
              <Heading as="h3" size="md">
                Reading Clubs
              </Heading>

              <Box>

              </Box>
            </Box>
          </Flex>

        <Modal isOpen={isOpenCreateReadingClubModal} onClose={closeCreateReadingClubModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Heading as="h3" size="lg">
                What is your reading club name?
              </Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
              type="text"
              ref={createReadingClubNameRef}
              required
              />
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Text color="red">
                  {createReadingClubError}
                </Text>
                <Button 
                  variant='ghost' 
                  mr={3}
                  size="lg"
                  onClick={createReadingClub}
                >
                  Create
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Skeleton>
    </Box>
  );
};

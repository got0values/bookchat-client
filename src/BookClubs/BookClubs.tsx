import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { SetStateAction, Dispatch } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { ProfileProps, HTMLInputEvent, ProfileType } from '../types/types';
import { 
  Box,
  Heading,
  Text,
  Avatar,
  AvatarGroup,
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
  useDisclosure
} from "@chakra-ui/react";
import { IoIosAdd } from 'react-icons/io';
import { MdGroups } from 'react-icons/md';
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";


export default function BookClubs({server}: {server: string}) {
  const toast = useToast();
  const navigate = useNavigate();

  const { 
    isOpen: isOpenCreateBookClubModal, 
    onOpen: onOpenCreateBookClubModal, 
    onClose: onCloseCreateBookClubModal 
  } = useDisclosure()

  function createBookClubModalOpen() {
    onOpenCreateBookClubModal();
  }

  const createBookClubNameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const [createBookClubError,setCreateBookClubError] = useState<string>("");
  async function createBookClub() {
    const createBookClubName = createBookClubNameRef.current.value;
    let tokenCookie: string | null = Cookies.get().token;
    if (createBookClubName.length) {
      await axios
      .post(server + "/api/createbookclub", 
      {
        bookClubName: createBookClubName
      },
      {headers: {
        'authorization': tokenCookie
      }}
      )
      .then((response)=>{
        if (response.data.success){
          toast({
            description: "Book club created!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
          if (response.data.club) {
            navigate(`/bookclubs/${response.data.club.id}`);
          }
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data) {
          setCreateBookClubError(response.data.message)
        }
      })
    }
    else {
      setCreateBookClubError("Please enter a book club name")
    }
  }

  function closeCreateBookClubModal() {
    setCreateBookClubError("");
    onCloseCreateBookClubModal();
  }
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={true}
      >
        <Stack>

          <Box className="well">
            <Flex align="center" justify="space-between">
              <Flex align="center" justify="space-between" gap={2}>
                <MdGroups size={30} />
                <Heading as="h3" size="md">
                  My Book Clubs
                </Heading>
              </Flex>
              <Button
                variant="ghost"
                leftIcon={<IoIosAdd size={25} />}
                onClick={createBookClubModalOpen}
              >
                Create a book club
              </Button>
            </Flex>

            <Box>
            </Box>
          </Box>

        </Stack>

        <Modal isOpen={isOpenCreateBookClubModal} onClose={closeCreateBookClubModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Heading as="h3" size="lg">
                What is your book club name?
              </Heading>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
               type="text"
               ref={createBookClubNameRef}
               required
              />
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Text color="red">
                  {createBookClubError}
                </Text>
                <Button 
                  variant='ghost' 
                  mr={3}
                  size="lg"
                  onClick={createBookClub}
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

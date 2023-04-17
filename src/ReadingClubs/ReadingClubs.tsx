import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReadingClub } from "../types/types";
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
  Textarea,
  FormLabel,
  Flex,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Checkbox,
  useToast,
  useDisclosure
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
  const queryClient = useQueryClient();

  async function getReadingClubs() {
    let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        const readingClubsData = await axios
          .get(server + "/api/getreadingclubs",
            {
              headers: {
                'authorization': tokenCookie
              }
            }
          )
          .then((response)=>{
            console.log(response.data)
            const {data} = response;
            return data;
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
  const createReadingClubDescriptionRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const [createReadingClubError,setCreateReadingClubError] = useState<string>("");
  const createReadingClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const readingClubName = createReadingClubNameRef.current.value;
      const readingClubDescription = createReadingClubDescriptionRef.current.value;
      let tokenCookie: string | null = Cookies.get().token;
      if (readingClubName.length) {
        await axios
        .post(server + "/api/createreadingclub", 
        {
          readingClubName: readingClubName,
          readingClubDescription: readingClubDescription
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            closeCreateReadingClubModal();
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
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function createReadingClub(e: React.FormEvent<HTMLFormElement>) {
    createReadingClubMutation.mutate(e);
  }

  const { 
    isOpen: isOpenEditReadingClubModal, 
    onOpen: onOpenEditReadingClubModal, 
    onClose: onCloseEditReadingClubModal 
  } = useDisclosure()

  const [editId,setEditId] = useState("");
  const [editName,setEditName] = useState("");
  const [editDescription,setEditDescription] = useState("");
  const [editHidden,setEditHidden] = useState("");
  function openEditReadingClubModal(e: React.FormEvent<HTMLButtonElement>) {
    setEditId((e.target as HTMLElement).dataset.id!)
    setEditName((e.target as HTMLElement).dataset.name!)
    setEditDescription((e.target as HTMLElement).dataset.description!)
    setEditHidden((e.target as HTMLElement).dataset.display!)
    onOpenEditReadingClubModal();
  }

  function closeEditReadingClubModal() {
    setEditId("")
    setEditName("")
    setEditDescription("")
    setEditHidden("")
    setEditReadingClubError("");
    onCloseEditReadingClubModal();
  }

  const editReadingClubNameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const editReadingClubDescriptionRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const editReadingClubHiddenRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const [editReadingClubError,setEditReadingClubError] = useState<string>("");
  const editReadingClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      console.log(editReadingClubHiddenRef.current.checked)
      const readingClubName = editReadingClubNameRef.current.value;
      const readingClubDescription = editReadingClubDescriptionRef.current.value;
      const readingClubHidden = editReadingClubHiddenRef.current.checked ? 1 : 0;
      let tokenCookie: string | null = Cookies.get().token;
      if (readingClubName.length) {
        await axios
        .put(server + "/api/editreadingclub", 
        {
          readingClubId: (e.target as HTMLElement).dataset.id,
          readingClubName: readingClubName,
          readingClubDescription: readingClubDescription,
          readingClubHidden: readingClubHidden
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            closeEditReadingClubModal();
            toast({
              description: "Reading club edited!",
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
        setEditReadingClubError("Please enter a book club name")
      }
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function editReadingClub(e: React.FormEvent<HTMLFormElement>) {
    editReadingClubMutation.mutate(e);
  }

  const deleteReadingClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLButtonElement>)=>{
      e.preventDefault();
      if (window.confirm("Are you sure you would like to delete this reading club?")) {
        let tokenCookie: string | null = Cookies.get().token;
        await axios
          .delete(server + "/api/deletereadingclub", 
          {
            headers: {
              'authorization': tokenCookie
            },
            data: {
              readingClubId: (e.target as HTMLElement).dataset.id
            }
          })
          .then((response)=>{
            if (response.data.success){
              closeEditReadingClubModal();
              toast({
                description: "Reading club deleted!",
                status: "success",
                duration: 9000,
                isClosable: true
              })
            }
          })
          .catch(({response})=>{
            console.log(response)
            if (response.data) {
              setEditReadingClubError(response.data.message)
            }
        })
      }
    return getReadingClubs()
    },
    onSuccess: (data)=>{
      closeEditReadingClubModal();
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function deleteReadingClub(e: React.FormEvent<HTMLButtonElement>) {
    deleteReadingClubMutation.mutate(e);
  }

 
  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['readingClubsKey'], 
    queryFn: getReadingClubs
  });
  const viewer = data?.viewer;
  const readingClubs = data?.readingClubs;
  
  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }
  
  return (
    <Box className={viewer === "admin" ? "main-content" : "main-content-smaller"}>
      <Skeleton 
        isLoaded={!isLoading}
      >
          <Flex flexWrap="wrap">
            {viewer === "admin" ? (
              <Box className="well" height="fit-content" flex="1 1 30%">
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
                    width="auto"
                    leftIcon={<IoIosAdd size={25} />}
                    onClick={openCreateReadingClubModal}
                  >
                    Create Reading Club
                  </Button>
                </Stack>
              </Box>
            ) : null}

            <Box className="well" flex="1 1 65%">
              <Heading as="h3" size="md" mb={3}>
                Reading Clubs
              </Heading>
              <Flex 
                direction="column"
                gap={5}
              >
                {readingClubs?.length ? (
                  readingClubs.map((readingClub: ReadingClub, i: number)=>{
                    return (
                      <Flex 
                        key={i} 
                        direction="column"
                        align="center"
                        justify="center"
                        minH="70px"
                        gap={2}
                        width="100%"
                        p={2}
                        rounded="md"
                        bg="gray.200"
                        _dark={{
                          bg: 'gray.600'
                        }}
                      >
                        <Flex  gap={2} align="center" justify="center">
                          <Heading as="h3" size="sm">
                            {readingClub.name}
                          </Heading>
                          {readingClub.hidden ? <i>(hidden)</i> : ""}
                        </Flex>
                        <Text textAlign="center">
                          {readingClub.description}
                        </Text>
                        {viewer === "admin" ? (
                          <Button
                            size="sm"
                            data-id={readingClub.id}
                            data-name={readingClub.name}
                            data-description={readingClub.description}
                            data-display={readingClub.hidden}
                            onClick={e=>openEditReadingClubModal(e as React.FormEvent<HTMLButtonElement>)}
                          >
                            Edit
                          </Button>
                        ): null}
                      </Flex>
                    )
                  })
                ) : null}
              </Flex>
            </Box>
          </Flex>

        {viewer === "admin" ? (
          <>
            <Modal isOpen={isOpenCreateReadingClubModal} onClose={closeCreateReadingClubModal} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading as="h3" size="lg">
                    Create Reading Club
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                <form onSubmit={e=>createReadingClub(e as React.FormEvent<HTMLFormElement>)}>
                  <ModalBody>
                    <Box mb={2}>
                      <FormLabel htmlFor="name" mb={1}>Name</FormLabel>
                      <Input
                        type="text"
                        id="name"
                        ref={createReadingClubNameRef}
                        required
                      />
                    </Box>
                    <Box>
                      <FormLabel htmlFor="description" mb={1}>Description</FormLabel>
                      <Textarea
                        id="description"
                        ref={createReadingClubDescriptionRef}
                      ></Textarea>
                    </Box>
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
                        type="submit"
                      >
                        Create
                      </Button>
                    </HStack>
                  </ModalFooter>
                </form>
              </ModalContent>
            </Modal>

            <Modal isOpen={isOpenEditReadingClubModal} onClose={closeEditReadingClubModal} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Heading as="h3" size="lg">
                  Edit Reading Club
                </Heading>
              </ModalHeader>
              <ModalCloseButton />
              <form 
                data-id={editId}
                onSubmit={e=>editReadingClub(e as React.FormEvent<HTMLFormElement>)}
              >
                <ModalBody>
                  <Box mb={2}>
                    <FormLabel htmlFor="name" mb={1}>Name</FormLabel>
                    <Input
                    type="text"
                    id="name"
                    ref={editReadingClubNameRef}
                    defaultValue={editName}
                    required
                    />
                  </Box>
                  <Box>
                    <FormLabel htmlFor="description" mb={1}>Description</FormLabel>
                    <Textarea
                      id="description"
                      ref={editReadingClubDescriptionRef}
                      defaultValue={editDescription}
                    ></Textarea>
                  </Box>
                  <Text color="red" width="100%">
                    {editReadingClubError}
                  </Text>
                  <Checkbox 
                    defaultChecked={editHidden.includes("1")}
                    ref={editReadingClubHiddenRef}
                    onChange={e=>console.log(e)}
                    mt={2}
                  >
                    Hide?
                  </Checkbox>
                </ModalBody>
                <ModalFooter>
                  <Flex width="100%" justify="space-between">
                    <Button
                      colorScheme="red"
                      data-id={editId}
                      onClick={e=>deleteReadingClub(e as React.FormEvent<HTMLButtonElement>)}
                    >
                      Delete
                    </Button>
                    <Button  
                      mr={3}
                      type="submit"
                      colorScheme="green"
                    >
                      Submit
                    </Button>
                  </Flex>
                </ModalFooter>
              </form>
            </ModalContent>
            </Modal>
          </>
        ) : null}
      </Skeleton>
    </Box>
  );
};

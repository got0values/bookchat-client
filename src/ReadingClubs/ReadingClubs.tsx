import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReadingClub, FormType, ReadingClubQuestionnaire } from "../types/types";
import { 
  Box,
  Tag,
  Heading,
  Text,
  Spinner,
  Select,
  Stack,
  HStack,
  Button,
  Input,
  Textarea,
  FormLabel,
  InputGroup,
  InputLeftAddon,
  Flex,
  Skeleton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
import { IoIosAdd, IoIosRemove } from 'react-icons/io';
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { AiOutlineLineChart } from 'react-icons/ai';
import { MdEdit } from 'react-icons/md';
import Cookies from "js-cookie";
import axios from "axios";


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
    isOpen: isOpenCreateQuestionnaireModal, 
    onOpen: onOpenCreateQuestionnaireModal, 
    onClose: onCloseCreateQuestionnaireModal 
  } = useDisclosure()

  function openCreateQuestionnaireModal() {
    onOpenCreateQuestionnaireModal();
  }

  function closeCreateQuestionnaireModal() {
    setCreateQuestionnaireError("");
    (labelRef.current as HTMLInputElement).value = "";
    setQuestionnaireFields([]);
    onCloseCreateQuestionnaireModal();
  }

  const createQuestionnaireNameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const [questionnaireFields,setQuestionnaireFields] = useState<FormType[]>([]);
  const [createQuestionnaireError,setCreateQuestionnaireError] = useState<string>("");
  const createQuestionnaireMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const questionnaireName = createQuestionnaireNameRef.current.value;
      console.log(questionnaireName)
      let tokenCookie: string | null = Cookies.get().token;
      if (questionnaireName) {
        await axios
        .post(server + "/api/createreadingclubquestionnaire", 
        {
          questionnaireName: questionnaireName,
          questionnaireFields: JSON.stringify(questionnaireFields)
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            closeCreateQuestionnaireModal();
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
            setCreateQuestionnaireError(response.data.message)
          }
        })
      }
      else {
        setCreateQuestionnaireError("Please enter a questionnaire name")
      }
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function createQuestionnaire(e: React.FormEvent<HTMLFormElement>) {
    createQuestionnaireMutation.mutate(e);
  }

  const labelRef = useRef<HTMLInputElement>()
  const typeRef = useRef<HTMLInputElement>();
  const requiredRef = useRef<HTMLInputElement>();
  function addQuestionnaireField() {
    console.log(questionnaireFields)
    const labelText = (labelRef.current as HTMLInputElement).value
    const typeText = (typeRef.current as HTMLInputElement).value
    const requiredBool = (requiredRef.current as HTMLInputElement).checked
    setQuestionnaireFields((prev)=>{
      const i = 0;
      return (
        [...prev,
          {
            id: `${typeText}-${prev.length}`,
            type: typeText,
            label: labelText,
            required: requiredBool,
            sequence: prev.length
          }
        ]
      )
    });
    (labelRef.current as HTMLInputElement).value = "";
  }
  function removeQuestionnaireField(fieldId: string) {
    setQuestionnaireFields(prev=>{
      return prev.filter((field)=>field.id !== fieldId)
    })
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
  const [defaultQuestionnaire,setDefaultQuestionnaire] = useState("");
  const editReadingClubQuestionnaireRef = useRef<HTMLInputElement>(null);
  function openEditReadingClubModal(e: React.FormEvent<HTMLButtonElement>) {
    setEditId((e.target as HTMLElement).dataset.id!)
    setEditName((e.target as HTMLElement).dataset.name!)
    setEditDescription((e.target as HTMLElement).dataset.description!)
    setEditHidden((e.target as HTMLElement).dataset.display!)
    setDefaultQuestionnaire((e.target as HTMLElement).dataset.questionnaire!)
    onOpenEditReadingClubModal();
  }

  function closeEditReadingClubModal() {
    setEditId("")
    setEditName("")
    setEditDescription("")
    setEditHidden("")
    setEditReadingClubError("");
    setDefaultQuestionnaire("");
    (editReadingClubQuestionnaireRef.current as HTMLInputElement).value = "";
    onCloseEditReadingClubModal();
  }

  const { 
    isOpen: isOpenFillQuestionnaireModal, 
    onOpen: onOpenFillQuestionnaireModal, 
    onClose: onCloseFillQuestionnaireModal 
  } = useDisclosure()

  const [fillQuestionnaire,setFillQuestionnaire] = useState({} as ReadingClubQuestionnaire)
  function openFillQuestionnaireModal(e: HTMLFormElement) {
    if ((e.target as any).dataset.questionnaire !== "null") {
      setFillQuestionnaire(JSON.parse((e.target as any).dataset.questionnaire))
      onOpenFillQuestionnaireModal();
    }
  }

  function closeFillQuestionnaireModal() {
    setFillQuestionnaire({} as ReadingClubQuestionnaire)
    onCloseFillQuestionnaireModal();
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
      const readingClubQuestionnaireAnswer = (editReadingClubQuestionnaireRef.current as HTMLInputElement).value === "" ? null : parseInt((editReadingClubQuestionnaireRef.current as HTMLInputElement).value)

      let tokenCookie: string | null = Cookies.get().token;
      if (readingClubName.length) {
        await axios
        .put(server + "/api/editreadingclub", 
        {
          readingClubId: (e.target as HTMLElement).dataset.id,
          readingClubName: readingClubName,
          readingClubDescription: readingClubDescription,
          readingClubQuestionnaire: readingClubQuestionnaireAnswer,
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
  const questionnaires = data?.questionnaires;
  
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
                  align="flex-start"
                >
                  <Flex align="center" justify="space-between" gap={2}>
                    <Heading as="h3" size="md">
                      Admin
                    </Heading>
                  </Flex>
                  <Button
                    width="auto"
                    variant="ghost"
                    size="sm"
                    leftIcon={<IoIosAdd size={25} />}
                    onClick={openCreateQuestionnaireModal}
                  >
                    Create Reading Questionnaire
                  </Button>
                  <Button
                    width="auto"
                    variant="ghost"
                    size="sm"
                    leftIcon={<IoIosRemove size={25} />}
                    // onClick={openCreateQuestionnaireModal}
                  >
                    Delete Reading Questionnaire
                  </Button>
                  <Button
                    width="auto"
                    variant="ghost"
                    size="sm"
                    leftIcon={<IoIosAdd size={25} />}
                    onClick={openCreateReadingClubModal}
                  >
                    Create Reading Club
                  </Button>
                  <Button
                    width="auto"
                    variant="ghost"
                    size="sm"
                    leftIcon={<AiOutlineLineChart size={25} />}
                    // onClick={openCreateReadingClubModal}
                  >
                    View Entries
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
                        position="relative"
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
                          <Heading 
                            as="h3" 
                            size="sm"
                            data-questionnaire={JSON.stringify(readingClub.ReadingClubQuestionnaire)}
                            onClick={e=>openFillQuestionnaireModal(e as any)}
                            _hover={{
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                          >
                            {readingClub.name}
                          </Heading>
                          {readingClub.hidden ? <i>(hidden)</i> : ""}
                        </Flex>
                        <Text textAlign="center">
                          {readingClub.description}
                        </Text>
                        {viewer === "admin" ? (
                          <Menu>
                            <MenuButton 
                              as={Button}
                              size="md"
                              variant="ghost"
                              rounded="full"
                              height="25px"
                              position="absolute" 
                              top={2} 
                              right={2}
                            >
                              <BiDotsHorizontalRounded/>
                            </MenuButton>
                            <MenuList>
                              <MenuItem 
                                data-id={readingClub.id}
                                data-name={readingClub.name}
                                data-description={readingClub.description}
                                data-display={readingClub.hidden}
                                data-questionnaire={readingClub.ReadingClubQuestionnaire ? readingClub.ReadingClubQuestionnaire.id : null}
                                onClick={e=>openEditReadingClubModal(e as React.FormEvent<HTMLButtonElement>)}
                                icon={<MdEdit size={20} />}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem
                                data-id={readingClub.id}
                                onClick={e=>deleteReadingClub(e as React.FormEvent<HTMLButtonElement>)}
                                color="red"
                                fontWeight="bold"
                                icon={<BiTrash size={20} />}
                              >
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
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
            <Modal isOpen={isOpenCreateQuestionnaireModal} onClose={closeCreateQuestionnaireModal} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading as="h3" size="lg">
                    Create Questionnaire
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Box mb={2}>
                    <FormLabel htmlFor="name" mb={1}>Name</FormLabel>
                    <Input
                      type="text"
                      id="name"
                      ref={createQuestionnaireNameRef}
                    />
                  </Box>

                  <Flex direction="column" gap={3} border="1px solid grey" rounded="md" p={3}>
                    <Heading as="h4" size="sm">Preview:</Heading>
                    {questionnaireFields.length ? (
                      questionnaireFields.map((field,i)=>{
                        return (
                          <Box key={i}>
                            {field.type === "short-text" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeQuestionnaireField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="text"/>
                              </>
                            ) : field.type === "long-text" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeQuestionnaireField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Textarea id={field.id}></Textarea>
                              </>
                            ) : field.type === "number" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeQuestionnaireField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="number"/>
                              </>
                            ) : field.type === "checkbox" ? (
                              <>
                                <Flex justify="space-between">
                                  <Checkbox id={field.id}>
                                    {field.label}
                                  </Checkbox>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeQuestionnaireField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                              </>
                            ) : field.type === "telephone" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeQuestionnaireField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="tel"/>
                              </>
                            ) : field.type === "email" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeQuestionnaireField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="email"/>
                              </>
                            ) : field.type === "date" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeQuestionnaireField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="date"/>
                              </>
                            ) : null}
                          </Box>
                        )
                      })
                    ): null}
                  </Flex>

                  <Flex mt={5} direction="column" gap={2}>
                    <InputGroup>
                      <InputLeftAddon children="Label"/>
                      <Input 
                        type="text"
                        ref={labelRef as any}
                      />
                    </InputGroup>
                    <InputGroup>
                      <InputLeftAddon children="Type"/>
                      <Select 
                        ref={typeRef as any} 
                      >
                        <option value="short-text">Short Text</option>
                        <option value="long-text">Long Text</option>
                        <option value="number">Number</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="telephone">Telephone</option>
                        <option value="email">Email</option>
                        <option value="date">Date</option>
                      </Select>
                    </InputGroup>
                    <Checkbox ref={requiredRef as any}>Required?</Checkbox>
                    <Button
                      onClick={addQuestionnaireField}
                    >
                      Add
                    </Button>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <Text color="red">
                      {createQuestionnaireError}
                    </Text>
                    <Button 
                      variant='ghost' 
                      mr={3}
                      size="lg"
                      onClick={e=>createQuestionnaire(e as any)}
                    >
                      Save
                    </Button>
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>

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
                  <Flex direction="column" gap={2}>
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
                    <Select 
                      ref={editReadingClubQuestionnaireRef as any}
                      defaultValue={defaultQuestionnaire}
                    >
                        <option value="">None</option>
                        {questionnaires && questionnaires.length ? (
                          questionnaires.map((q: ReadingClubQuestionnaire,i: number)=>{
                            return (
                              <option key={i} value={q.id}>{q.name}</option>
                            )
                          })
                        ) : null}
                    </Select>
                    <Checkbox 
                      defaultChecked={editHidden.includes("1")}
                      ref={editReadingClubHiddenRef}
                      onChange={e=>console.log(e)}
                      mt={2}
                    >
                      Hide?
                    </Checkbox>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Button  
                    mr={3}
                    type="submit"
                    colorScheme="green"
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
            </Modal>
          </>
        ) : null}

          <Modal isOpen={isOpenFillQuestionnaireModal} onClose={closeFillQuestionnaireModal} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Heading as="h3" size="lg">
                  {fillQuestionnaire.name}
                </Heading>
              </ModalHeader>
              <ModalCloseButton />
              <form 
                // data-id={editId}
                // onSubmit={e=>editReadingClub(e as React.FormEvent<HTMLFormElement>)}
                onSubmit={e=>{
                  e.preventDefault();
                  console.log(e)
                }}
              >
                <ModalBody>
                  <Flex direction="column" gap={2}>
                  {fillQuestionnaire.questionnaire_fields && 
                    JSON.parse(fillQuestionnaire.questionnaire_fields).length ? (
                      JSON.parse(fillQuestionnaire.questionnaire_fields).map((field: FormType,i: number)=>{
                        return (
                          <Box key={i}>
                            {field.type === "short-text" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="text" 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                />
                              </>
                            ) : field.type === "long-text" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Textarea 
                                  id={field.id} 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                ></Textarea>
                              </>
                            ) : field.type === "number" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="number" 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                />
                              </>
                            ) : field.type === "checkbox" ? (
                              <>
                                <Checkbox 
                                  id={field.id}
                                  data-question={field.label}
                                >
                                  {field.label}
                                </Checkbox>
                              </>
                            ) : field.type === "telephone" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="tel" 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                />
                              </>
                            ) : field.type === "email" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="email" 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                />
                              </>
                            ) : field.type === "date" ? (
                              <>
                                <Flex gap={2}>
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeQuestionnaireField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="date"/>
                              </>
                            ) : null}
                          </Box>
                        )
                      })
                    ): null}
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Flex width="100%" justify="flex-end">
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
      </Skeleton>
    </Box>
  );
};

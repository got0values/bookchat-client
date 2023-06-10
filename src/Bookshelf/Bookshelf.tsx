import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookshelfCategory, BookshelfBook } from "../types/types";
import { 
  Box,
  Tag,
  Heading,
  Text,
  Image,
  Center,
  Spinner,
  Badge,
  Fade,
  Stack,
  HStack,
  Card,
  CardBody,
  CardHeader,
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
  Select,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
import { IoIosAdd, IoIosRemove } from 'react-icons/io';
import { MdEdit, MdOutlineChat, MdSubject } from 'react-icons/md';
import { BiDotsHorizontalRounded, BiTrash, BiPlus } from 'react-icons/bi';
import ReactQuill from 'react-quill';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export default function Bookshelf({server, gbooksapi}: {server: string; gbooksapi: string;}) {
  const toast = useToast();
  const navigate = useNavigate();
  const {colorMode} = useColorMode();
  dayjs.extend(utc);
  const queryClient = useQueryClient();

  const [bookshelfBooks,setBookshelfBooks] = useState([] as BookshelfBook[])
  const [showAddCategory,setShowAddCategory] = useState(false)

  async function getBookshelf() {
    const tokenCookie: string | null = Cookies.get().token;
    const bookshelfData = await axios
      .get(server + "/api/bookshelf",
      {
        headers: {
          Authorization: tokenCookie
        }
      })
      .then((response)=>{
        const responseMessage = response.data.message
        setBookshelfBooks(responseMessage.books)
        return responseMessage
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error("An error has occurred")
      })
    return bookshelfData
  }

  const createCategoryInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const createCategoryButtonRef = useRef<HTMLButtonElement>({} as HTMLButtonElement);
  const [createCategoryError,setCreateCategoryError] = useState<string>("");
  const createCategoryMutation = useMutation({
    mutationFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      const createCategoryInput = createCategoryInputRef.current.value;
      if (createCategoryInput.length) {
        await axios
        .post(server + "/api/createbookshelfcategory", 
        {
          name: createCategoryInput
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
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
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
      toast({
        description: "Bookshelf Category created",
        status: "success",
        duration: 9000,
        isClosable: true
      })
      getBookshelf()
    }
  })
  async function createCategory() {
    createCategoryMutation.mutate();
  }

  const removeCategoryMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const id = e.target.dataset.id;
        await axios
        .delete(server + "/api/removebookshelfcategory", 
          {
            headers: {
              'authorization': tokenCookie
            },
            data: {
              id: parseInt(id)
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            setCreateCategoryError(response.data.message)
          }
        })
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
      toast({
        description: "Bookshelf Category removed",
        status: "success",
        duration: 9000,
        isClosable: true
      })
      getBookshelf()
    }
  })
  async function removeCategory(e: any) {
    removeCategoryMutation.mutate(e);
  }

  const { 
    isOpen: isOpenBookSearchModal, 
    onOpen: onOpenBookSearchModal, 
    onClose: onCloseBookSearchModal 
  } = useDisclosure()
  
  const [bookResults,setBookResults] = useState<any[] | null>(null);
  const [bookResultsLoading,setBookResultsLoading] = useState(false);
  const searchBookRef = useRef({} as HTMLInputElement);
  const searchBookButtonRef = useRef({} as HTMLButtonElement)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
      .get("https://www.googleapis.com/books/v1/volumes?q=" + searchBookRef.current.value + "&key=" + gbooksapi)
      .then((response)=>{
        setBookResults(response.data.items)
        setBookResultsLoading(false)
        onOpenBookSearchModal();
      })
      .catch((error)=>{
        console.log(error)
      })
  }
  const [bookToAdd,setBookToAdd] = useState<any | null>(null);
  function selectBookToAdd(e: any) {
    const title = e.target.dataset.title;
    const author = e.target.dataset.author;
    const image = e.target.dataset.image;
    const description = e.target.dataset.description;
    setBookToAdd({title,author,image,description})
    onCloseBookSearchModal();
  }
  const [bookToAddCategories,setBookToAddCategories] = useState([] as any);
  const notesRef = useRef({} as HTMLTextAreaElement)
  const addBookshelfBookMutation = useMutation({
    mutationFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      await axios
        .post(server + "/api/addbookshelfbook", 
          {
            book: bookToAdd,
            categories: bookToAddCategories,
            notes: notesRef.current.value
          },
          {headers: {
            'authorization': tokenCookie
          }}
        )
        .then((response)=>{
          setBookToAdd(null)
        })
        .catch(({response})=>{
          console.log(response)
          toast({
            description: "An error has occurred",
            status: "error",
            duration: 9000,
            isClosable: true
          })
        })
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
      toast({
        description: "Book added to bookshelf",
        status: "success",
        duration: 9000,
        isClosable: true
      })
      setBookToAdd(null)
      getBookshelf()
    }
  })
  async function addBookshelfBook() {
    addBookshelfBookMutation.mutate();
  }

  const deleteBookshelfBookMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const id = e.target.dataset.id;
        await axios
        .delete(server + "/api/deletebookshelfbook", 
          {
            headers: {
              'authorization': tokenCookie
            },
            data: {
              id: parseInt(id)
            }
          }
        )
        .then((response)=>{
          toast({
            description: "Bookshelf Book removed",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: "An error has occurred",
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
      getBookshelf()
    }
  })
  async function deleteBookshelfBook(e: any) {
    deleteBookshelfBookMutation.mutate(e);
  }

  function filterByCategory(checkedValues: string[]) {
    if (!checkedValues.length) {
      setBookshelfBooks(books);
    }
    else {
      setBookshelfBooks(prev=>{
        return (
          books.filter((book: BookshelfBook)=>{
            if (book.BookshelfBookCategory.length) {
              const categories = book.BookshelfBookCategory.map((bsbc)=>bsbc.BookshelfCategory.id)
              return !checkedValues.some((cV)=>categories.indexOf(parseInt(cV)) == -1)
            }
            else {
              return true;
            }
          })
        )
      })
    }
  }

 
  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookshelfKey'], 
    queryFn: getBookshelf
  });
  const categories = data?.categories;
  const books = data?.books;
  
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

        <Flex flexWrap="wrap" align="flex-start">
          <Stack flex="1 1 30%" minW="200px">
            <Box className="well">
              <Flex align="center" flexWrap="wrap" justify="space-between" mb={2}>
                <Heading as="h3" size="md">
                  Categories
                </Heading>

                {!showAddCategory ? (
                  <Box
                    onClick={e=>setShowAddCategory(true)}
                    rounded="md"
                    _hover={{
                      cursor: "pointer",
                      bg: "grey"
                    }}
                  >
                    <IoIosAdd size={25} />
                  </Box>
                ) : (
                  <Box
                    onClick={e=>setShowAddCategory(false)}
                    rounded="md"
                    _hover={{
                      cursor: "pointer",
                      bg: "grey"
                    }}
                  >
                    <IoIosRemove size={25} />
                  </Box>
                )}

              </Flex>

              {showAddCategory && (
                <>
                  <Flex
                    align="center"
                    justify="space-between"
                    gap={1}
                    mb={2}
                  >
                    <Input
                      type="text"
                      ref={createCategoryInputRef}
                      onKeyUp={e=>e.key === 'Enter' ? createCategoryButtonRef.current.click() : null}
                      maxLength={40}
                    />
                    <Button
                      ref={createCategoryButtonRef}
                      onClick={e=>createCategory()}
                    >
                      Add
                    </Button>
                  </Flex>
                  {createCategoryError && (
                    <Text color="red">{createCategoryError}</Text>
                  )}
                </>
              )}

              <CheckboxGroup
                onChange={e=>filterByCategory(e as string[])}
              >         
                <Stack>
                  {categories ? (
                    categories.map((category: BookshelfCategory,i: number)=>{
                      return (
                        <Flex
                          align="center"
                          justify="space-between"
                          key={i}
                        >
                          <Checkbox 
                            me={1}
                            value={category.id.toString()}
                          >
                            <Text>
                              {category.name}
                            </Text>
                          </Checkbox>
                          <Button 
                            size="xs" 
                            p={0}
                            colorScheme="red"
                            variant="ghost"
                            data-id={category.id}
                            onClick={e=>removeCategory(e)}
                          >
                            <Box
                              as={IoIosRemove} 
                              size={15} 
                              pointerEvents="none"
                            />
                          </Button>
                        </Flex>
                      )
                    })
                  ): null}
                </Stack>
              </CheckboxGroup>
            </Box>
          </Stack>
          <Stack flex="1 1 65%" maxW="100%" className="well">
            <Flex align="center" justify="space-between">
              <Heading as="h3" size="md">
                Bookshelf
              </Heading>
              <Button
                onClick={onOpenBookSearchModal}
                size="sm"
              >
                New
              </Button>
            </Flex>

            {bookToAdd && (
              <Stack className="well-card" position="relative">
                <CloseButton
                  position="absolute"
                  top={0}
                  right={0}
                  onClick={e=>setBookToAdd(null)}
                />
                <Flex mb={1}>
                  <Image
                    src={bookToAdd.image}
                    maxH="50px"
                  />
                  <Box mx={2} w="100%">
                    <Popover isLazy>
                      <PopoverTrigger>
                        <Box
                          _hover={{
                            cursor: "pointer"
                          }}
                        >
                          <Heading 
                            as="h5" 
                            size="md"
                            me={3}
                          >
                            {bookToAdd.title}
                          </Heading>
                          <Text fontSize="lg">
                            {bookToAdd.author}
                          </Text>
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverBody fontSize="sm">
                          {bookToAdd.description}
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Box>
                </Flex>
                <Flex
                  align="center"
                  justify="space-between"
                >
                  <Select
                    w="auto"
                    size="sm"
                    rounded="md"
                    onClick={(e)=>{
                      setBookToAddCategories((prev: BookshelfCategory[])=>{
                        const id = (e as any).target.value;
                        const name = (e as any).target.options[(e as any).target.selectedIndex].dataset.name;
                        const alreadyIn = prev.filter((cat)=>cat.id===id).length;
                        if (id !== "" && alreadyIn === 0) {
                          return [...prev,{
                            id: id,
                            name: name
                          }]
                        }
                        else {
                          if (id === "") {
                            return []
                          }
                          else {
                            return [...prev]
                          }
                        }
                      })
                    }}
                  >
                    <option value="">None</option>
                    {categories ? (
                      categories.map((category: BookshelfCategory)=>{
                        return (
                          <option
                            key={category.id}
                            data-id={category.id}
                            data-name={category.name}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        )
                      })
                    ):null}
                  </Select>
                  <Flex
                    align="center"
                    gap={1}
                  >
                    {bookToAddCategories ? (
                      bookToAddCategories.map((category: BookshelfCategory)=>{
                        return (
                          <Tag
                            size="xs"
                            rounded="lg"
                            p={1}
                            px={2}
                            fontSize="xs"
                            key={category.id}
                          >
                            {category.name}
                          </Tag>
                        )
                      })
                    ): null}
                  </Flex>
                </Flex>
                <Box>
                  <Textarea
                    as={ReactQuill} 
                    // id="location" 
                    ref={notesRef}
                    mb={1}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'header': []}],
                        ['bold', 'italic', 'underline'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['link'],
                        [{'align': []}],
                        ['clean']
                      ]
                    }}
                    formats={[
                      'header','bold', 'italic', 'underline','list', 'bullet', 'align','link'
                    ]}
                  />
                </Box>
                <Button
                  size="sm"
                  ml="auto"
                  w="auto"
                  onClick={e=>addBookshelfBook()}
                >
                  Save
                </Button>
              </Stack>
            )}

            <Stack>
              {bookshelfBooks ? (
                bookshelfBooks.map((book: BookshelfBook)=>{
                  return (
                    <Flex 
                      direction="column" 
                      gap={2} 
                      className="well-card" 
                      key={book.id} 
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        top="5px"
                        right={0}
                      >
                        <Menu>
                          <MenuButton 
                            as={Button}
                            size="md"
                            variant="ghost"
                            rounded="full"
                            height="25px"
                          >
                            <BiDotsHorizontalRounded/>
                          </MenuButton>
                          <MenuList>
                            <MenuItem 
                              onClick={e=>navigate(`/chat/room?title=${book.title}&author=${book.author}`)}
                              fontWeight="bold"
                              icon={<MdOutlineChat size={20} />}
                            >
                              Chat Room
                            </MenuItem>
                            <MenuItem
                              data-id={book.id}
                              // onClick={e=>deleteBookshelfBook(e)}
                              fontWeight="bold"
                              icon={<MdSubject size={20} />}
                            >
                              Add/Edit Categories
                            </MenuItem>
                            <MenuItem
                              color="tomato"
                              data-id={book.id}
                              onClick={e=>deleteBookshelfBook(e)}
                              fontWeight="bold"
                              icon={<BiTrash size={20} />}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Box>
                      <Text fontStyle="italic">
                        {dayjs(book.created_on).local().format('MMM DD, h:mm a')}
                      </Text>
                      <Flex>
                        <Image
                          src={book.image}
                          maxH="50px"
                        />
                        <Box mx={2} w="100%">
                          <Popover isLazy>
                            <PopoverTrigger>
                              <Box
                                _hover={{
                                  cursor: "pointer"
                                }}
                              >
                                <Heading 
                                  as="h5" 
                                  size="md"
                                  me={3}
                                >
                                  {book.title}
                                </Heading>
                                <Text fontSize="lg">
                                  {book.author}
                                </Text>
                              </Box>
                            </PopoverTrigger>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverBody fontSize="sm">
                                {book.description}
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Box>
                      </Flex>

                      <Flex align="center" gap={1} justify="flex-end">
                        {book.BookshelfBookCategory.length ? (
                          book.BookshelfBookCategory.map((category,i)=>{
                            return (
                              <Tag
                                size="xs"
                                rounded="lg"
                                p={1}
                                pl={4}
                                fontSize="xs"
                                display="flex"
                                gap={1}
                                key={i}
                                _hover={{
                                  color: "red",
                                  cursor: "pointer",
                                  'div': {
                                    visibility: "visible"
                                  }
                                }}
                              >
                                <Text>
                                  {category.BookshelfCategory.name}
                                </Text>
                                <Box visibility="hidden">
                                  <CloseButton size="xs" p="0" pointerEvents="none"/>
                                </Box>
                              </Tag>
                            )
                          })
                        ): null}
                        <Menu>
                          <MenuButton 
                            as={Button}
                            size="md"
                            variant="ghost"
                            rounded="full"
                            height="25px"
                          >
                            <BiPlus size={15}/>
                          </MenuButton>
                          <MenuList>
                            <MenuItem>
                              None
                            </MenuItem>
                            {categories ? (
                              categories.map((category: BookshelfCategory)=>{
                                return (
                                  <MenuItem
                                    key={category.id}
                                  >
                                    {category.name}
                                  </MenuItem>
                                )
                              })
                            ):null}

                          </MenuList>
                        </Menu>
                      </Flex>
                      <Accordion allowToggle>
                        <AccordionItem 
                          border="0" 
                          borderColor="inherit" 
                          rounded="md"
                          boxShadow="base"
                          py={1}
                          bg="white"
                          _dark={{
                            bg: "blackAlpha.300"
                          }}
                        >
                          <AccordionButton>
                            <Heading as="h4" size="sm">
                              Notes
                            </Heading>
                            <AccordionIcon ml="auto" />
                          </AccordionButton>
                          <AccordionPanel>
                            <Flex
                              direction="column"
                              gap={2}
                            >
                              <Textarea
                                as={ReactQuill}
                                border="0" 
                                rounded="md"
                                theme="snow"
                                sx={{
                                  '.ql-toolbar': {
                                    borderTopRadius: "5px",
                                    borderColor: "#ccc"
                                  },
                                  '.ql-container': {
                                    borderBottomRadius: "5px",
                                    borderColor: "#ccc"
                                  }
                                }}
                                modules={{
                                  toolbar: [
                                    [{ 'header': []}],
                                    ['bold', 'italic', 'underline'],
                                    [{'list': 'ordered'}, {'list': 'bullet'}],
                                    ['link'],
                                    [{'align': []}],
                                    ['clean']
                                  ]
                                }}
                                formats={[
                                  'header','bold', 'italic', 'underline','list', 'bullet', 'align','link'
                                ]}
                                defaultValue={book.notes}
                              />
                              <Button
                                w="100%"
                              >
                                Save
                              </Button>
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  )
                }).reverse()
              ): null}
            </Stack>
          </Stack>

        </Flex>

        <Modal 
          isOpen={isOpenBookSearchModal} 
          onClose={onCloseBookSearchModal}
          size="lg"
          // isCentered
        >
          <ModalOverlay />
          <ModalContent 
            // maxH="80vh"
          >
            <ModalHeader>
              New Book Club Book
            </ModalHeader>
            <ModalCloseButton />
              <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
                <Stack gap={2} position="relative">
                  <Flex
                    justify="space-between"
                    align="center"
                    gap={1}
                  >
                    <Input
                      type="search"
                      ref={searchBookRef}
                      onKeyUp={e=>e.key === 'Enter' ? searchBookButtonRef.current.click() : null}
                    />
                    <Button
                      onClick={e=>searchBook()}
                      ref={searchBookButtonRef}
                    >
                      Search
                    </Button>
                  </Flex>
                  {bookResultsLoading ? (
                    <Center>
                      <Spinner size="xl"/>
                    </Center>
                  ) : (
                    <Flex gap={1} align="center" justify="space-between" flexWrap="wrap">
                      {bookResults ? bookResults.map((book,i)=>{
                        return (
                          <Flex
                            m={1}
                            p={2}
                            maxW="165px"
                            direction="column"
                            align="center"
                            rounded="md"
                            bg="white"
                            _dark={{
                              bg: "gray.600"
                            }}
                            key={i}
                          >
                            <Box
                              pointerEvents="none"
                            >
                              <Image
                                maxW="100%" 
                                w="100%"
                                h="auto"
                                pt={2} 
                                mb={1}
                                className="book-image"
                                onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                src={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215"}
                                alt="book image"
                              />
                              <Heading
                                as="h4"
                                size="sm"
                                noOfLines={1}
                              >
                                {book.volumeInfo.title}
                              </Heading>
                              <Text>
                                {book.volumeInfo.authors ? book.volumeInfo.authors[0] : null}
                              </Text>
                            </Box>
                            <Flex align="center" justify="space-between">
                              <Popover isLazy>
                                <PopoverTrigger>
                                  <Button size="xs" m={2}>Description</Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <PopoverArrow />
                                  <PopoverCloseButton />
                                  <PopoverBody>{book.volumeInfo.description}</PopoverBody>
                                </PopoverContent>
                              </Popover>
                              <Button 
                                size="xs"
                                data-book={JSON.stringify(book)}
                                data-title={book.volumeInfo.title}
                                data-author={book.volumeInfo.authors ? book.volumeInfo.authors[0] : null}
                                data-description={book.volumeInfo.description}
                                data-image={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : null}
                                onClick={e=>selectBookToAdd(e)}
                                colorScheme="green"
                              >
                                Set
                              </Button>
                            </Flex>
                          </Flex>
                        )
                      }) : null}
                    </Flex>
                  )}
                </Stack>
              </ModalBody>
              <ModalFooter flexDirection="column">
              </ModalFooter>
          </ModalContent>
        </Modal>

      </Skeleton>
    </Box>
  );
};

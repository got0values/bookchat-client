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
  IconButton,
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
import StarRating from "../shared/StarRating";


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
      if (createCategoryInput !== "") {
        await axios
          .post(server + "/api/createbookshelfcategory", 
          {
            name: createCategoryInput
          },
          {headers: {
            'authorization': tokenCookie
          }}
          )
          .then((response)=> {
            toast({
              description: "Bookshelf Category created",
              status: "success",
              duration: 9000,
              isClosable: true
            })
            setCreateCategoryError("")
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
      return getBookshelf()
    },
    onSuccess: (data,variables)=>{
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
        queryClient.resetQueries({queryKey: ['bookshelfKey']})
        queryClient.setQueryData(["bookshelfKey"],data)
      }
      else {
        setCreateCategoryError("Please enter category name")
      }
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
        console.log(response.data.items)
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
    const isbn = e.target.dataset.isbn;
    setBookToAdd({title,author,image,description,isbn})
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
      return getBookshelf();
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
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function deleteBookshelfBook(e: any) {
    deleteBookshelfBookMutation.mutate(e);
  }

  const addCategoryToBookMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const categoryid = e.target.dataset.categoryid;
      const bookid = e.target.dataset.bookid;
      await axios
        .put(server + "/api/addcategorytobook", 
          {
            categoryid: parseInt(categoryid),
            bookid: parseInt(bookid)
          },
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function addCategoryToBook(e: any) {
    addCategoryToBookMutation.mutate(e);
  }

  const removeCategoryFromBookMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const categoryid = e.target.dataset.categoryid;
      const bookid = e.target.dataset.bookid;
      await axios
        .delete(server + "/api/removecategoryfrombook", 
          {
            headers: {
              'authorization': tokenCookie
            },
            data: {
              bookid: parseInt(bookid),
              categoryid: parseInt(categoryid)
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function removeCategoryFromBook(e: any) {
    removeCategoryFromBookMutation.mutate(e);
  }

  const updateNotesMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const bookid = e.target.dataset.bookid;
      const notesInput = (document.getElementById(`notes-input-${bookid}`) as HTMLInputElement);
      const notes = notesInput.value
      await axios
        .put(server + "/api/updatenotes", 
          {
            bookid: parseInt(bookid),
            notes: notes
          },
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          toast({
            description: "Notes updated!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function updateNotes(e: any) {
    updateNotesMutation.mutate(e);
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
              return false;
            }
          })
        )
      })
    }
  }

  const ratingCallbackMutation = useMutation({
    mutationFn: async ([rating,starRatingId]:[rating: number,starRatingId: number]) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        axios
        .put(server + "/api/ratebookshelfbook",
          {
            rating: rating,
            id: starRatingId
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      }
      else {
        throw new Error("An error has occured")
      }
      return getBookshelf()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  function ratingCallback([rating,starRatingId]: [rating:number,starRatingId:number]) {
    ratingCallbackMutation.mutate([rating,starRatingId])
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
          <Stack flex="1 1 30%">
            <Stack className="well">
              <Box>
                <Flex align="center" flexWrap="wrap" justify="space-between" mb={2}>
                  <Heading as="h3" size="md">
                    Categories
                  </Heading>

                  {!showAddCategory && (
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
                      <Button
                        onClick={e=>setShowAddCategory(false)}
                      >
                        Cancel
                      </Button>
                    </Flex>
                    {createCategoryError && (
                      <Text color="red">{createCategoryError}</Text>
                    )}
                  </>
                )}
              </Box>

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
                            rounded="xl"
                            data-id={category.id}
                            onClick={e=>removeCategory(e)}
                          >
                            <Box
                              as={IoIosRemove} 
                              size={20} 
                              pointerEvents="none"
                            />
                          </Button>
                        </Flex>
                      )
                    })
                  ): null}
                </Stack>
              </CheckboxGroup>
            </Stack>
          </Stack>
          <Stack flex="1 1 65%" maxW="100%" className="well">
            <Box>
              <Flex align="center" justify="space-between">
                <Heading as="h3" size="md">
                  Bookshelf
                </Heading>
                <Box
                  onClick={onOpenBookSearchModal}
                  rounded="md"
                  _hover={{
                    cursor: "pointer",
                    bg: "grey"
                  }}
                >
                  <IoIosAdd size={25} />
                </Box>
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
                              noOfLines={1}
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
                          <PopoverBody 
                            fontSize="sm"
                            _dark={{
                              bg: "black"
                            }}
                          >
                            {bookToAdd.description}
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Box>
                  </Flex>
                  <Flex
                    align="center"
                    gap={1}
                    wrap="wrap"
                    justify="flex-end"
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
                    {categories.length ? (
                      <Menu>
                        <MenuButton 
                          as={Button}
                          variant="ghost"
                          rounded="full"
                          height="20px"
                          minWidth="auto"
                          px={0}
                        >
                          <BiPlus size={20} />
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            onClick={e=>setBookToAddCategories([])}
                          >
                            None
                          </MenuItem>
                          {categories ? (
                            categories.map((category: BookshelfCategory)=>{
                              return (
                                <MenuItem
                                  key={category.id}
                                  data-id={category.id}
                                  data-name={category.name}
                                  onClick={(e)=>{
                                    setBookToAddCategories((prev: BookshelfCategory[])=>{
                                      const id = (e as any).target.dataset.id;
                                      const name = (e as any).target.dataset.name;
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
                                  {category.name}
                                </MenuItem>
                              )
                            })
                          ):null}

                        </MenuList>
                      </Menu>
                    ) : null}
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
                        <Textarea
                          as={ReactQuill} 
                          // id="location" 
                          ref={notesRef}
                          mb={1}
                          theme="snow"
                          rounded="md"
                          sx={{
                            '.ql-toolbar': {
                              borderTopRadius: "5px",
                              borderColor: colorMode === "light" ? "#ccc" : "#222222"
                            },
                            '.ql-container': {
                              borderBottomRadius: "5px",
                              borderColor: colorMode === "light" ? "#ccc" : "#222222"
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
                        />
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                  <Button
                    // size="sm"
                    ml="auto"
                    // w="auto"
                    colorScheme="teal"
                    onClick={e=>addBookshelfBook()}
                  >
                    Save to Bookshelf
                  </Button>
                </Stack>
              )}
            </Box>

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
                      <Flex
                        align="center"
                        justify="space-between"
                      >
                        <Text fontStyle="italic">
                          {dayjs(book.created_on).local().format('MMM DD, h:mm a')}
                        </Text>
                        <Menu>
                          <MenuButton 
                            as={Button}
                            size="md"
                            variant="ghost"
                            rounded="full"
                            // height="25px"
                            position="absolute"
                            top="0"
                            right="0"
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
                      </Flex>
                      <Flex>
                        <Image
                          src={book.image}
                          maxH="100px"
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
                                  noOfLines={1}
                                >
                                  {book.title}
                                </Heading>
                              </Box>
                            </PopoverTrigger>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverBody 
                              _dark={{
                                bg: "black"
                              }}
                                fontSize="sm"
                              >
                                {book.description}
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                          <Text fontSize="lg">
                            {book.author}
                          </Text>
                          <Text>
                            {book.isbn}
                          </Text>
                          <StarRating
                            ratingCallback={ratingCallback} 
                            starRatingId={book.id}
                            defaultRating={book.rating}
                          />
                        </Box>
                      </Flex>

                      <Flex align="center" gap={1} wrap="wrap" justify="flex-end">
                        {book.BookshelfBookCategory.length ? (
                          book.BookshelfBookCategory.map((category,i)=>{
                            return (
                              <Tag
                                size="xs"
                                rounded="lg"
                                p={1}
                                pl={4}
                                fontSize="sm"
                                display="flex"
                                alignItems="center"
                                gap={2}
                                key={i}
                                onClick={e=>{
                                  const closeButton = document.getElementById(`close-button-${book.id}-${category.BookshelfCategory.id}`)
                                  if(closeButton?.style.visibility === "hidden") {
                                    closeButton.style.visibility = "visible"
                                  }
                                  else if (closeButton?.style.visibility === "visible") {
                                    closeButton.style.visibility = "hidden"
                                  }
                                }}
                                _hover={{
                                  cursor: "pointer"
                                }}
                              >
                                <Text pointerEvents="none">
                                  {category.BookshelfCategory.name}
                                </Text>
                                <Box 
                                  id={`close-button-${book.id}-${category.BookshelfCategory.id}`}
                                  style={{visibility: "hidden"}}
                                  data-bookid={book.id}
                                  data-categoryid={category.BookshelfCategory.id}
                                  onClick={e=>removeCategoryFromBook(e)}
                                  _hover={{
                                    cursor: "pointer"
                                  }}
                                >
                                  <CloseButton 
                                    size="xs" 
                                    fontSize="xs"
                                    p="0" 
                                    color="red"
                                    pointerEvents="none"
                                  />
                                </Box>
                                {removeCategoryFromBookMutation.isLoading && (
                                  <Spinner size="xs"/>
                                )}
                              </Tag>
                            )
                          })
                        ): null}
                        {categories?.length ? (
                          <Menu>
                            <MenuButton 
                              as={Button}
                              variant="ghost"
                              rounded="full"
                              height="20px"
                              minWidth="auto"
                              px={0}
                            >
                              <BiPlus size={20} />
                            </MenuButton>
                            <MenuList>
                              {categories ? (
                                categories.map((category: BookshelfCategory)=>{
                                  return (
                                    <MenuItem
                                      data-categoryid={category.id}
                                      data-bookid={book.id}
                                      key={category.id}
                                      onClick={e=>addCategoryToBook(e)}
                                    >
                                      {category.name}
                                    </MenuItem>
                                  )
                                })
                              ):null}

                            </MenuList>
                          </Menu>
                        ) : null}
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
                              align="center"
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
                                    borderColor: colorMode === "light" ? "#ccc" : "#222222"
                                  },
                                  '.ql-container': {
                                    borderBottomRadius: "5px",
                                    borderColor: colorMode === "light" ? "#ccc" : "#222222"
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
                                onChange={e=>{ 
                                    const notesInput: any = document.getElementById(`notes-input-${book.id}`);
                                    notesInput!.value = e;
                                  }
                                }
                                id={`notes-input-${book.id}`}
                              />
                              <Button
                                w="auto"
                                alignSelf="flex-end"
                                data-bookid={book.id}
                                onClick={e=>updateNotes(e)}
                                colorScheme="purple"
                              >
                                Save Notes
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
          size="md"
          // maxW="90vw"
          isCentered
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
                      colorScheme="purple"
                      variant="outline"
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
                                  <PopoverBody
                                    _dark={{
                                      bg: "black"
                                    }}
                                  >{book.volumeInfo.description}</PopoverBody>
                                </PopoverContent>
                              </Popover>
                              <Button 
                                size="xs"
                                data-title={book.volumeInfo.title}
                                data-author={book.volumeInfo.authors ? book.volumeInfo.authors[0] : null}
                                data-description={book.volumeInfo.description}
                                data-image={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : null}
                                data-isbn={book.volumeInfo.industryIdentifiers ? book.volumeInfo.industryIdentifiers[0].identifier : null}
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

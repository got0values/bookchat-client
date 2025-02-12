import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookshelfBook, SelectedBook, TbrBook } from "../types/types";
import { 
  Box,
  Text,
  Image,
  Spinner,
  Center,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverHeader,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Heading, 
  useColorMode
} from "@chakra-ui/react";
import BooksSearch from "../shared/BooksSearch";
import GooglePopoverContent from "../shared/GooglePopover.Content";
import { IoIosAdd, IoIosRemove } from 'react-icons/io';
import { MdOutlineChat, MdEdit } from 'react-icons/md';
import { BiDotsHorizontalRounded, BiTrash, BiPlus, BiHide } from 'react-icons/bi';
import { FaStore } from 'react-icons/fa';
import { ImInfo } from 'react-icons/im';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";

export default function Tbr({server, gbooksapi}: {server: string; gbooksapi: string;}) {
  const toast = useToast()
  const navigate = useNavigate();
  dayjs.extend(utc);
  const queryClient = useQueryClient();

  const [tbrBooks,setTbrBooks] = useState<TbrBook[]>([]);
  async function getTbr() {
    const tokenCookie: string | null = Cookies.get().token;
    const bookshelfData = await axios
      .get(server + "/api/tbr",
      {
        headers: {
          Authorization: tokenCookie
        }
      })
      .then((response)=>{
        const responseMessage = response.data.message;
        setTbrBooks(prev=>{
          return responseMessage
        });
        return responseMessage
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error("An error has occurred")
      })
    return bookshelfData
  }

  const { 
    isOpen: isOpenTbrSearchModal, 
    onOpen: onOpenTbrSearchModal, 
    onClose: onCloseTbrSearchModal 
  } = useDisclosure()

  const [tbrToAdd,setTbrToAdd] = useState<any | null>(null);
  function selectTbrToAdd(book: SelectedBook) {
    setTbrToAdd(book)
    onCloseTbrSearchModal();
  }
  const imageRef = useRef({} as HTMLInputElement);
  const titleRef = useRef({} as HTMLInputElement);
  const authorRef = useRef({} as HTMLInputElement);
  const yearRef = useRef({} as HTMLInputElement);
  const pagesRef = useRef({} as HTMLInputElement);
  const addTbrBookMutation = useMutation({
    mutationFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      const tbrBookToAdd = {
        image: imageRef.current.value,
        title: titleRef.current.value,
        author: authorRef.current.value,
        description: tbrToAdd.description,
        isbn: tbrToAdd.isbn,
        page_count: parseInt(pagesRef.current.value),
        published_date: yearRef.current.value
      }
      await axios
        .post(server + "/api/addtbrbook", 
          {
            book: tbrBookToAdd
          },
          {headers: {
            'authorization': tokenCookie
          }}
        )
        .then((response)=>{
          setTbrToAdd(null);
          if (response.data.success === false) {
            toast({
              description: response.data?.message ? response.data.message : "An error has occurred",
              status: "error",
              duration: 9000,
              isClosable: true
            })
          }
          else {
            toast({
              description: "Book added to TBR",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          }
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
      return getTbr();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['tbrKey'] })
      queryClient.resetQueries({queryKey: ['tbrKey']})
      queryClient.setQueryData(["tbrKey"],data)
      setTbrToAdd(null)
    }
  })
  async function addTbrBook() {
    addTbrBookMutation.mutate();
  }

  const deleteTbrBookMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const id = e.target.dataset.id;
      await axios
        .delete(server + "/api/deletetbrbook", 
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
            description: "Tbr Book removed",
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
      return getTbr();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['tbrKey'] })
      queryClient.resetQueries({queryKey: ['tbrKey']})
      queryClient.setQueryData(["tbrKey"],data)
    }
  })
  async function deleteTbrBook(e: any) {
    deleteTbrBookMutation.mutate(e);
  }

  async function addToBookshelf(bookToAdd: any) {
    let tokenCookie: string | null = Cookies.get().token;
    await axios
      .post(server + "/api/addbookshelfbook", 
        {
          book: bookToAdd,
          categories: [],
          notes: ""
        },
        {headers: {
          'authorization': tokenCookie
        }}
      ).then((response)=>{
        toast({
          description: "Added to bookshelf",
          status: "success",
          duration: 9000,
          isClosable: true
        })
        queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
        queryClient.resetQueries({queryKey: ['bookshelfKey']})
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
  }

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['tbrKey'], 
    queryFn: getTbr
  });
  const tbrs = data ? data : null;

  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h2" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }

  return (
    <Skeleton isLoaded={!isLoading}>
      <Stack maxW="100%" className="well">
        <Box>
          <Flex align="center" justify="space-between">
            <Heading as="h2" size="md">
              TBR
            </Heading>
            <Menu>
              <MenuButton 
                as={Button}
                variant="ghost"
                rounded="full"
                height="20px"
                minWidth="auto"
                px={0}
                title="add"
              >
                <IoIosAdd size={25} />
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={onOpenTbrSearchModal}
                >
                  Add New
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
          {tbrToAdd && (
            <Stack className="well-card" position="relative">
              <CloseButton
                position="absolute"
                top={0}
                right={0}
                onClick={e=>setTbrToAdd(null)}
              />
              <Flex>
                <Image
                  src={tbrToAdd.image}
                  onError={(e)=>(e.target as HTMLImageElement).src = "https://placehold.co/165x215"}
                  maxH="125px"
                  // minW="60px"
                  boxShadow="1px 1px 1px 1px darkgrey"
                  alt={tbrToAdd.title}
                />
                <Input
                  type="hidden"
                  defaultValue={tbrToAdd.image ? tbrToAdd.image : "https://placehold.co/165x215"}
                  ref={imageRef}
                />
                <Box mx={2} w="100%">
                  <Stack spacing={3} lineHeight={1.4}>
                    <FormControl variant="floatingstatic">
                      <FormLabel>
                        Title
                      </FormLabel>
                      <Input
                        type="text"
                        defaultValue={tbrToAdd.title}
                        ref={titleRef}
                        maxLength={200}
                      />
                    </FormControl>
                    <FormControl variant="floatingstatic">
                      <FormLabel>
                        Author
                      </FormLabel>
                      <Input
                        type="text"
                        defaultValue={tbrToAdd.author}
                        ref={authorRef}
                        maxLength={150}
                      />
                    </FormControl>
                    <FormControl variant="floatingstatic">
                      <FormLabel>
                        Year
                      </FormLabel>
                      <Input
                        type="text"
                        defaultValue={tbrToAdd.published_date ? dayjs(tbrToAdd.published_date).format("YYYY") : ""}
                        maxW="125px"
                        ref={yearRef}
                        maxLength={4}
                      />
                    </FormControl>
                    <FormControl variant="floatingstatic">
                      <FormLabel>
                        Pages
                      </FormLabel>
                      <NumberInput
                        defaultValue={tbrToAdd.page_count ? tbrToAdd.page_count : ""}
                        maxW="125px"
                      >
                        <NumberInputField 
                          ref={pagesRef} 
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </Stack>
                </Box>
              </Flex>
              <Flex
                justify="flex-end"
              >
                <Button
                  backgroundColor="black"
                  color="white"
                  onClick={e=>addTbrBook()}
                >
                  Save to TBR
                </Button>
              </Flex>
            </Stack>
          )}
        </Box>

        <Flex wrap="wrap">
          {tbrBooks && tbrBooks.length ? (
            tbrBooks.map((book: TbrBook)=>{
              return (
                <Flex 
                  className="well-card" 
                  flex="1 1 275px"
                  maxW="350px"
                  key={book.id} 
                >
                  <Image
                    src={book.image}
                    maxH="150px"
                    // minW="60px"
                    onError={(e)=>(e.target as HTMLImageElement).src = "https://placehold.co/165x215"}
                    boxShadow="1px 1px 1px 1px darkgrey"
                    alt={book.title}
                  />
                  <Box
                    mx={2} 
                    w="100%" 
                    lineHeight={1.4}
                  >
                    <Popover isLazy>
                      <PopoverTrigger>
                        <Heading 
                          as="h2" 
                          size="md"
                          noOfLines={2}
                          _hover={{
                            cursor: 'pointer'
                          }}
                        >
                          {book.title}
                        </Heading>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader pe={5} fontWeight="bold">{book.title}</PopoverHeader>
                        <PopoverBody>
                          {book.description ? (
                            book.description
                          ): (
                            <GooglePopoverContent title={book.title} author={book.author} gBooksApi={gbooksapi} />
                          )}
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                      {book.author}
                    </Text>
                    <Text fontStyle="italic">
                      {book.published_date ? dayjs(book.published_date).format("YYYY") : null}
                    </Text>
                    {book.page_count ? (
                      <Text noOfLines={1}>
                        {book.page_count} pages
                      </Text>
                    ): null}
                    <Flex align="center" gap={1}>
                      <Button 
                        as={Link}
                        to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(book.title + " " + book.author)}`}
                        target="blank"
                        fontWeight="bold"
                        aria-label="view on bookshop.org"
                        size="xs"
                        p={0}
                        variant="ghost"
                      >
                        <FaStore size={17} />
                      </Button>
                      <Button 
                        onClick={e=>navigate(`/chat/room?title=${book.title}&author=${book.author}`)}
                        fontWeight="bold"
                        aria-label="go to book chat room"
                        size="xs"
                        p={0}
                        variant="ghost"
                      >
                        <MdOutlineChat size={17} />
                      </Button>
                      <Button
                        color="tomato"
                        data-id={book.id}
                        onClick={e=>deleteTbrBook(e)}
                        fontWeight="bold"
                        aria-label="delete"
                        size="xs"
                        p={0}
                        variant="ghost"
                      >
                        <Box 
                          as={BiTrash} 
                          pointerEvents="none"
                          size={17} 
                        />
                      </Button>
                    </Flex>
                    <Button
                      data-id={book.id}
                      onClick={e=>addToBookshelf({
                        image: book.image,
                        title: book.title,
                        author: book.author,
                        description: book.description,
                        isbn: book.isbn ? book.isbn : "",
                        page_count: book.page_count ? parseInt(book.page_count as any) : null,
                        published_date: book.published_date ? book.published_date : "",
                      })}
                      fontWeight="bold"
                      size="xs"
                      p={0}
                      variant="ghost"
                    >
                      Add to bookshelf
                    </Button>
                  </Box>
                </Flex>
              )
            })
          ): (
            <Text fontStyle="italic">
              No books added yet.
            </Text>
          )}
        </Flex>
      </Stack>
    
      <Modal 
        isOpen={isOpenTbrSearchModal} 
        onClose={onCloseTbrSearchModal}
        // maxW="90vw"
        isCentered
      >
        <ModalOverlay />
        <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            New TBR Book
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
              <BooksSearch selectText="Add" selectCallback={selectTbrToAdd as any} gBooksApi={gbooksapi}/>
            </ModalBody>
            <ModalFooter flexDirection="column">
            </ModalFooter>
        </ModalContent>
      </Modal>
    </Skeleton>
  )
}
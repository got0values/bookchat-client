import React, { useRef, useState, useEffect } from "react";
import { SelectedBook, EditCurrentlyReadingType } from "../types/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Box,
  Flex,
  Image,
  Button,
  FormControl,
  FormLabel,
  Input,
  Tag,
  TagLabel,
  TagCloseButton,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast
} from "@chakra-ui/react";
import * as htmlToImage from 'html-to-image';
import dayjs from "dayjs";
import Cookies from "js-cookie";
import axios from "axios";

export default function EditCurrentlyReading({server,selectedBook, setSelectedBook, getPageCallback, setSharedTitle, setSharedAuthor, showQuoteDesigner}: EditCurrentlyReadingType) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [selectedBook2,setSelectedBook2] = useState<any | null>(selectedBook);

  const thoughtsRef = useRef({} as HTMLInputElement);
  const pagesReadRef = useRef({} as HTMLInputElement);
  const imageRef = useRef({} as HTMLInputElement);
  const titleRef = useRef({} as HTMLInputElement);
  const authorRef = useRef({} as HTMLInputElement);
  const descriptionRef = useRef({} as HTMLInputElement);
  const yearRef = useRef({} as HTMLInputElement);
  const pagesRef = useRef({} as HTMLInputElement);
  const postCurrentlyReadingMutation = useMutation({
    mutationFn: async ()=>{
      if (!titleRef.current.value) {
        toast({
          description: "Please enter a title",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        throw new Error("Please enter a title");
      }

      let tokenCookie: string | null = Cookies.get().token;

      const quoteBox = document.getElementById('quote-box');

      let image = imageRef.current.value;
      let title = titleRef.current.value;
      let author = authorRef.current.value;
      let description = descriptionRef.current.value;
      let page_count = parseInt(pagesRef.current.value);
      let published_date = yearRef.current.value;
      let thoughts = thoughtsRef.current.value;
      let pages_read = parseInt(pagesReadRef.current.value);

      if (showQuoteDesigner && quoteBox) {
        htmlToImage.toPng(quoteBox!)
          .then(async function (quoteImageBase) {
            await axios
            .post(server + "/api/currentlyreading",
              {
                id: selectedBook2.id ? selectedBook2.id : null,
                google_books_id: selectedBook2.google_books_id,
                image: image,
                title: title,
                author: author,
                description: description,
                isbn: selectedBook2.isbn,
                page_count: page_count,
                subjects: JSON.stringify(selectedBook2.subjects),
                published_date: published_date,
                thoughts: thoughts,
                pages_read: pages_read,
                quote_image: quoteImageBase
              },
              {
                headers: {
                  'authorization': tokenCookie
                }
              }
            )
            .then((response)=>{
              setSelectedBook2(null);
              if (setSelectedBook) {
                setSelectedBook(null)
              }
            })
            .catch(({response})=>{
              console.log(response)
              throw new Error(response.message)
            })
          })
          .catch(function (error) {
            console.error('oops, something went wrong!', error);
          });
      }
      else {
        await axios
        .post(server + "/api/currentlyreading",
          {
            id: selectedBook2.id ? selectedBook2.id : null,
            google_books_id: selectedBook2.google_books_id,
            image: image,
            title: title,
            author: author,
            description: description,
            isbn: selectedBook2.isbn,
            page_count: page_count,
            subjects: JSON.stringify(selectedBook2.subjects),
            published_date: published_date,
            thoughts: thoughts,
            pages_read: pages_read,
            quote_image: null
          },
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          setSelectedBook2(null);
          if (setSelectedBook) {
            setSelectedBook(null)
          }
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      }
      return getPageCallback;
    },
    onError: (e)=>{
      toast({
        description: "An error has occurred",
          status: "error",
          duration: 9000,
          isClosable: true
      })
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['dashboardKey'] })
      queryClient.resetQueries({queryKey: ['dashboardKey']})
      queryClient.setQueryData(["dashboardKey"],data)
      queryClient.invalidateQueries({ queryKey: ['profileKey'] })
      queryClient.resetQueries({queryKey: ['profileKey']})
      queryClient.setQueryData(["profileKey"],data)
      setSelectedBook2(null);
      if (setSelectedBook) {
        setSelectedBook(null)
      }
    }
  })
  function postCurrentlyReading() {
    postCurrentlyReadingMutation.mutate();
  }

  return (
    <>
      {selectedBook2 ? (
        <Box>
          <Input
            type="text"
            mt={3}
            mb={3}
            placeholder="Thoughts?"
            maxLength={300}
            ref={thoughtsRef}
            defaultValue={selectedBook2.thoughts ? selectedBook2.thoughts : ""}
          />
          <Flex>
            <Box>
              <Image 
                src={selectedBook2.image ? selectedBook2.image : "https://via.placeholder.com/165x215"}
                maxH="120px"
                boxShadow="1px 1px 1px 1px darkgrey"
                alt={selectedBook2.title}
              />
              <Input
                type="hidden"
                defaultValue={selectedBook2.image ? selectedBook2.image : "https://via.placeholder.com/165x215"}
                ref={imageRef}
              />
              {/* <Flex justify="center" mt={1}>
                <Popover>
                  <PopoverTrigger>
                    <IconButton 
                      aria-label="edit" 
                      size='sm' 
                      icon={<MdEdit />} 
                      variant="ghost"
                    />
                  </PopoverTrigger>
                  <PopoverContent p={5}>
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <FormControl variant="floatingstatic">
                      <FormLabel>
                        Image Source
                      </FormLabel>
                      <Input
                        type="text"
                        ref={imageRef}
                        defaultValue={selectedBook2.image}
                      />
                    </FormControl>
                  </PopoverContent>
                </Popover>
              </Flex> */}
            </Box>
            <Box 
              mx={2}
              w="100%"
            >
              <Stack spacing={3} lineHeight={1.4}>
                <FormControl variant="floatingstatic">
                  <FormLabel>
                    Title
                  </FormLabel>
                  <Input
                    type="text"
                    defaultValue={selectedBook2.title}
                    ref={titleRef}
                    maxLength={200}
                    onChange={e=>{
                      if (setSharedTitle) {
                        setSharedTitle(()=>e.target.value)
                      }
                    }}
                  />
                </FormControl>
                <FormControl variant="floatingstatic">
                  <FormLabel>
                    Author
                  </FormLabel>
                  <Input
                    type="text"
                    defaultValue={selectedBook2.author}
                    ref={authorRef}
                    maxLength={150}
                    onChange={e=>{
                      if (setSharedAuthor) {
                        setSharedAuthor(()=>e.target.value)
                      }
                    }}
                  />
                </FormControl>
                <FormControl variant="floatingstatic">
                  <FormLabel>
                    Year
                  </FormLabel>
                  <Input
                    type="text"
                    defaultValue={selectedBook2.published_date !== null ? (dayjs(selectedBook2.published_date).format("YYYY")) : ""}
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
                    defaultValue={selectedBook2.page_count ? selectedBook2.page_count : ""}
                    maxW="125px"
                  >
                    <NumberInputField ref={pagesRef} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl variant="floatingstatic">
                  <FormLabel>
                    Pages read
                  </FormLabel>
                  <NumberInput
                    maxWidth="125px"
                    min={0}
                    defaultValue={selectedBook2.pages_read ? selectedBook2.pages_read : ""}
                  >
                    <NumberInputField ref={pagesReadRef} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                {selectedBook2.subjects ? (
                  <Flex 
                    // noOfLines={1}
                    align="center"
                    // height="2.2rem"
                    py={1}
                    gap={1}
                    // maxWidth="350px"
                    wrap="wrap"
                    _hover={{
                      cursor: "pointer"
                    }}
                    sx={{
                      display: "flex",
                      mt: "0px!important"
                    }}
                  >
                    {selectedBook2.subjects.map((subject:string,i:number)=>{
                      return (
                        <Tag
                          key={i}
                          colorScheme="purple"
                          size="sm"
                          minH={15}
                          minW="unset"
                        >
                          <TagLabel>{subject}</TagLabel>
                          <TagCloseButton
                            onClick={e=>{
                              return setSelectedBook2((prev:any)=>{
                                let newSubjects =  prev.subjects.filter((s:string,fi:number)=>{
                                  return fi !== i;
                                })
                                return {...prev, subjects: newSubjects}
                              });
                            }}
                          />
                        </Tag>
                      )
                    })}
                  </Flex>
                ):null}
              </Stack>
              <Flex justify="flex-end">
                <Button 
                  backgroundColor="black"
                  color="white"
                  onClick={e=>postCurrentlyReading()}
                >
                  Post
                </Button>
              </Flex>
            </Box>
          </Flex>
        </Box>
      ): null}
    </>
  )
}
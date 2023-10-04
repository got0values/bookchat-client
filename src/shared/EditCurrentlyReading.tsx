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
  Text,
  Stack,
  Checkbox,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast
} from "@chakra-ui/react";
import { QuoteDesigner } from "./QuoteDesigner";
import { genres } from "./genres";
import { MultiSelect } from 'chakra-multiselect'
import * as htmlToImage from 'html-to-image';
import { b64toBlob } from "./b64toBlob";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import axios from "axios";

export default function EditCurrentlyReading({server,selectedBook, setSelectedBook, getPageCallback, newBook, isOwner}: EditCurrentlyReadingType) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [selectedBook2,setSelectedBook2] = useState<any | null>(selectedBook);

  useEffect(()=>{
    const genresNames = genres.map((g)=>g.name);
    setSelectedBook2((prev:any)=>{
      return {...prev,subjects: prev.subjects ? [...prev.subjects,...genresNames] : [...genresNames]}
    })
  },[])

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

      let id = selectedBook2.id ? selectedBook2.id.toString() : "";
      let google_books_id = selectedBook2.google_books_id;
      let image = imageRef.current.value;
      let title = titleRef.current.value;
      let author = authorRef.current.value;
      let description = descriptionRef.current.value;
      let subjects = selectedSubjects ? JSON.stringify(selectedSubjects.map((subject:any)=>subject.value)) : "";
      let isbn = selectedBook2.isbn;
      let page_count = pagesRef.current.value;
      let published_date = yearRef.current.value;
      let thoughts = thoughtsRef.current.value;
      let pages_read = pagesReadRef.current.value;

      const quoteBox = document.getElementById('quote-box');
      const uploadImagePreview = document.getElementById('upload-image-preview');

      if (showQuoteDesigner && quoteBox) {
        // const bcnWatermark = document.getElementById("bcn-watermark")
        // bcnWatermark ? bcnWatermark!.style.display = "block" : null;
        await htmlToImage.toPng(quoteBox!)
        .then(async function (quoteImageBase) {
          let blob = await b64toBlob(quoteImageBase,'image/png',1024)
          let newFile = new File([blob], "quoteImage", {type: "image/png"})
          // bcnWatermark ? bcnWatermark.style.display = "none" : null;
          const formData = new FormData();
          formData.append("uploadedimage", newFile as Blob)
          formData.append("uploadedimagetype", "quoteimage")
          formData.append("id", id)
          formData.append("google_books_id",google_books_id)
          formData.append("image",image)
          formData.append("title",title)
          formData.append("author",author)
          formData.append("description",description)
          formData.append("isbn",isbn)
          formData.append("page_count",page_count)
          formData.append("subjects",subjects)
          formData.append("published_date",published_date)
          formData.append("thoughts",thoughts)
          formData.append("pages_read",pages_read)

          await axios
          .post(server + "/api/currentlyreading",
            formData,
            {
              headers: {
                'authorization': tokenCookie,
                'content-type': 'multipart/form-data'
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
        return getPageCallback;
      }
      else if (uploadImagePreview) {
        await htmlToImage.toPng(uploadImagePreview!)
          .then(async function(uploadedImageBase) {
            let blob = await b64toBlob(uploadedImageBase,'image/png',1024)
            let newFile = new File([blob], "uploadedimage", {type: "image/png"})
            const formData = new FormData();
            formData.append("uploadedimage", newFile as Blob)
            formData.append("uploadedimagetype", "uploadedimage")
            formData.append("id", id)
            formData.append("google_books_id",google_books_id)
            formData.append("image",image)
            formData.append("title",title)
            formData.append("author",author)
            formData.append("description",description)
            formData.append("isbn",isbn)
            formData.append("page_count",page_count)
            formData.append("subjects",subjects)
            formData.append("published_date",published_date)
            formData.append("thoughts",thoughts)
            formData.append("pages_read",pages_read)

            await axios
            .post(server + "/api/currentlyreading",
              formData,
              {
                headers: {
                  'authorization': tokenCookie,
                  'content-type': 'multipart/form-data'
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
        return getPageCallback;
      }
      else {
        await axios
        .post(server + "/api/currentlyreading",
          {
            id: id,
            uploadedimagetype: "",
            google_books_id: google_books_id,
            image: image,
            title: title,
            author: author,
            description: description,
            isbn: isbn,
            page_count: page_count,
            subjects: subjects,
            published_date: published_date,
            thoughts: thoughts,
            pages_read: pages_read,
            uploaded_image: null
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
        return getPageCallback;
      }
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
    }
  })
  function postCurrentlyReading() {
    postCurrentlyReadingMutation.mutate();
  }

  const [selectedSubjects,setSelectedSubjects] = useState([]);


  const [showQuoteDesigner,setShowQuoteDesigner] = useState(false);
  const [sharedTitle,setSharedTitle] = useState(selectedBook?.title);
  const [sharedAuthor,setSharedAuthor] = useState(selectedBook?.author);
  const bookImage = selectedBook?.image;

  const currentlyReadingImageUploadRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const currentlyReadingImagePreviewRef = useRef<HTMLImageElement>({} as HTMLImageElement);
  const [currentlyReadingPreviewImage,setCurrentlyReadingPreviewImage] = useState("");
  const [currentlyReadingImageFile,setCurrentlyReadingImageFile] = useState<Blob | string | ArrayBuffer | null>(null);
  async function currentlyReadingImageChange(e: HTMLInputElement | any) {
    // currentlyReadingImagePreviewRef.current.style ? currentlyReadingImagePreviewRef.current.style.display = "block" : null;
    let targetFiles = e.target.files as FileList
    let previewImageFile = targetFiles[0];

    setCurrentlyReadingPreviewImage(URL.createObjectURL(previewImageFile))
    let blob = previewImageFile.slice(0,previewImageFile.size,"image/png")
    let newFile = new File([blob], previewImageFile.name, {type: "image/png"})
    setCurrentlyReadingImageFile(newFile)
  }

  return (
    <>
      {selectedBook2 && isOwner ? (
        <>
          {newBook ? (
            <Box>
              {!currentlyReadingPreviewImage ? (
                <Box>
                  <Checkbox
                    isChecked={showQuoteDesigner}
                    onChange={e=>setShowQuoteDesigner((prev: any)=>!prev)}
                    fontWeight="bold"
                  >
                    Add a quote
                  </Checkbox>

                  {showQuoteDesigner ? (
                    <>
                      <QuoteDesigner 
                        sharedTitle={sharedTitle} 
                        sharedAuthor={sharedAuthor}
                        bookImage={bookImage}
                      />
                      <Divider mt={3} />
                    </>
                  ): null}
                </Box>
              ): null}
              {!showQuoteDesigner ? (
                <Box mt={2}>
                  {!currentlyReadingPreviewImage ? (
                    <Button
                      size="sm"
                      variant="outline"
                      backgroundColor="white"
                      color="black"
                      borderColor="black"
                      onClick={e=>currentlyReadingImageUploadRef.current.click()}
                      boxShadow="2px 3px 2px black"
                      _active={{
                        boxShadow: "0 1px 1px black"
                      }}
                    >
                      Add Image
                      <Input
                        type="file" 
                        accept="image/png, image/jpeg"
                        ref={currentlyReadingImageUploadRef}
                        isRequired={true} 
                        display="none"
                        onChange={e=>currentlyReadingImageChange(e)}
                      />
                    </Button>
                    ): (
                    <Button
                      size="sm"
                      // backgroundColor="tomato"
                      color="red"
                      variant="ghost"
                      onClick={e=>{
                        setCurrentlyReadingPreviewImage("")
                        setCurrentlyReadingImageFile(null)
                      }}
                    >
                      Remove
                    </Button>
                  )}
                  {currentlyReadingPreviewImage ? (
                    <Flex 
                      justify="center"
                    >
                      <Image 
                        src={currentlyReadingPreviewImage ? currentlyReadingPreviewImage : ""} 
                        ref={currentlyReadingImagePreviewRef}
                        id="upload-image-preview"
                        alt="profile preview image"
                        maxH="400px"
                      />
                    </Flex>
                  ) : (
                    null
                  )}
                </Box>
              ): null}
            </Box>
          ): null}

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
                  <Input
                    type="hidden"
                    value={selectedBook2.description}
                    ref={descriptionRef}
                  />
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
                  <FormControl variant="floatingstatic">
                    {selectedBook2.subjects ? (
                      <>
                        <FormLabel>
                          Add subjects/genres
                        </FormLabel>
                        <Box pb={2}>
                          {selectedBook2.subjects.length ? (
                            <Box
                              sx={{
                                "& ul": {
                                  zIndex: 2
                                }
                              }}
                            >
                              <MultiSelect
                                backgroundColor="black"
                                sx={{
                                  "& ul": {
                                    bg: "black"
                                  }
                                }}
                                options={selectedBook2.subjects.map((subject:any)=>{
                                  return (
                                    {
                                      label: subject,
                                      value: subject
                                    }
                                  )
                                })}
                                value={selectedSubjects}
                                onChange={e=>setSelectedSubjects(e as any)}
                              />
                            </Box>
                          ): null}
                        </Box>
                      </>
                    ):null}
                </FormControl>
                </Stack>
                <Flex justify="flex-end">
                  <Flex
                    align="center"
                    gap={2}
                  >
                    <>
                      {postCurrentlyReadingMutation.error && (
                        <Text color="red">
                          {(postCurrentlyReadingMutation.error as Error).message}
                        </Text>
                      )}
                      <Button 
                        backgroundColor="black"
                        color="white"
                        onClick={e=>postCurrentlyReading()}
                        isLoading={postCurrentlyReadingMutation.isLoading}
                      >
                        Post
                      </Button>
                    </>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </Box>
        </>
      ): null}
    </>
  )
}
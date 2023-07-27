import React, {useState,useRef,useEffect} from 'react';
import { Link } from 'react-router-dom';
import { BooksSearchType } from '../types/types';
import { 
  Box,
  Heading,
  Text,
  Image,
  Center,
  Spinner,
  Stack,
  Button,
  Input,
  Flex,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverHeader,
  PopoverContent,
  PopoverBody,
  PopoverArrow
} from "@chakra-ui/react";
import dayjs from "dayjs";
import axios from "axios";

export default function BooksSearch({selectText,selectCallback}: BooksSearchType) {
  const RAPIDAPIKEY = import.meta.env.VITE_RAPID_API_KEY;
  const searchInputRef = useRef({} as HTMLInputElement);
  const [bookResults,setBookResults] = useState<any[] | null>(null);
  const [bookResultsOther,setBookResultsOther] = useState<any[] | null>(null);
  const [bookResultsError,setBookResultsError] = useState("");
  const [bookResultsLoading,setBookResultsLoading] = useState(false)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
    .get("https://openlibrary.org/search.json?q=" + searchInputRef.current.value)
      .then((response)=>{
        if (response.data.docs) {
          if (response.data.docs.length > 5) {
            const slicedResponse = response.data.docs.slice(0,5);
            setBookResults(slicedResponse)
          }
          else {
            setBookResults(response.data.docs)
          }
        }
        else {
          setBookResults(null)
        }
        // onOpenSearchModal();
      })
      .catch((error)=>{
        setBookResults(null)
        setBookResultsError(error.message)
        // axios
        //   .get("https://openlibrary.org/search.json?q=" + searchInputRef.current.value)
        //   .then((response)=>{
        //     if(response.data.docs) {
        //       setBookResultsOther(response.data.docs)
        //     }
        //   })
        //   .catch((error)=>{
        //     setBookResultsError(error.message);
        //     console.log(error)
        //   })
      })
    setBookResultsLoading(false)
  }

  const BookImage = ({isbn,id}: {isbn?: string,id:string}) => {
    const [bookImageSrc,setBookImageSrc] = useState("https://via.placeholder.com/165x215");
    const [bookImgIsLoading,setBookImgIsLoading] = useState(false);
    useEffect(()=>{
      async function getBookImage() {
        await axios
          .request({
            method: "GET",
            url: "https://book-cover-api2.p.rapidapi.com/api/public/books/v1/cover/url?languageCode=en&isbn=" + isbn,
            headers: {
              'X-RapidAPI-Key': RAPIDAPIKEY,
              'X-RapidAPI-Host': 'book-cover-api2.p.rapidapi.com'
            }
          })
          .then((response)=>{
            if(response.data.url) {
              setBookImageSrc(response.data.url)
            }
            else {
              setBookImageSrc("https://via.placeholder.com/165x215")
            }
          })
          .catch((error)=>{
            // console.log(error)
          })
      }
      if (isbn) {
        setBookImgIsLoading(true)
        getBookImage();
        setBookImgIsLoading(false)
      }
    },[isbn])

    return (
      <>
        {bookImgIsLoading ? (
          <Spinner/>
        ): (
          <Image
            maxW="100%" 
            w="100%"
            h="auto"
            className="book-image"
            onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
            src={bookImageSrc}
            alt="book image"
            boxShadow="1px 1px 1px 1px darkgrey"
            _hover={{
              cursor: "pointer"
            }}
            id={id}
          />
        )}
      </>
    )
  }

  return (
    <Stack gap={2} position="relative">
      <Flex
        align="center"
        justify="space-between"
        gap={1}
      >
        <Input
          type="search"
          bg="white"
          borderColor="black"
          size="lg"
          placeholder="Search"
          _dark={{
            bg: "gray.800"
          }}
          onKeyUp={e=>e.key === 'Enter' ? searchBook() : null}
          ref={searchInputRef}
        />
        <Button
          borderColor="black"
          variant="outline"
          size="lg"
          onClick={e=>searchBook()}
        >
          Search
        </Button>
      </Flex>
      {bookResultsLoading ? (
        <Center>
          <Spinner size="xl"/>
        </Center>
      ) : (
        <Flex
          gap={1}
          direction="column"
        >
          {bookResults ? bookResults.map((book,i)=>{
            return (
              <React.Fragment key={i}>
                <Flex
                  gap={2}
                >
                  <Box flex="1 1 auto" maxW="65px">
                    {book.cover_i || book.lccn ? (
                      <Image
                        maxW="100%" 
                        w="100%"
                        h="auto"
                        className="book-image"
                        onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                        src={book.cover_i ? (
                          `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg?default=false`
                        ) : (
                          book.lccn ? (
                            `https://covers.openlibrary.org/b/lccn/${book.lccn[0]}-M.jpg?default=false`
                          ) : (
                            "https://via.placeholder.com/165x215"
                          )
                        )}
                        alt="book image"
                        boxShadow="1px 1px 1px 1px darkgrey"
                        _hover={{
                          cursor: "pointer"
                        }}
                        id={`book-cover-${i}`}
                      />
                    ): (
                      <BookImage 
                        isbn={book.isbn?.length ? book.isbn[book.isbn.length - 1] : null}
                        id={`book-cover-${i}`}
                      />
                    )}
                  </Box>
                  <Box flex="1 1 auto">
                    <Heading
                      as="h4"
                      size="sm"
                      noOfLines={1}
                    >
                      {book.title}
                    </Heading>
                    <Text fontSize="sm" noOfLines={1}>
                      {book.author_name ? book.author_name[0] : null}
                    </Text>
                    <Text fontSize="sm" fontStyle="italic">
                      {book.publish_date ? dayjs(book.publish_date[0]).format('YYYY') : null}
                    </Text>
                    <Flex align="center" gap={1}>
                      {/* <GooglePreviewLink book={book}/> */}
                      <Button 
                        as="a"
                        href={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(book.title + " " + (book.author_name ? book.author_name[0] : null) + " " + (book.isbn?.length >= 2 ? book.isbn[1] : null))}`}
                        target="blank"
                        size="xs"
                        variant="outline"
                        backgroundColor="white"
                        color="black"
                      >
                        Shop
                      </Button>
                      <Button 
                        size="xs"
                        data-book={JSON.stringify(book)}
                        onClick={e=>selectCallback({
                          title: book.title,
                          google_books_id: null,
                          author: book.author_name ? book.author_name[0] : "",
                          image: document.getElementById(`book-cover-${i}`)!.getAttribute("src"),
                          isbn: book.isbn?.length ? book.isbn[book.isbn.length - 1] : null,
                          description: "",
                          page_count: book.number_of_pages_median,
                          published_date: book.publish_date?.length ? dayjs(book.publish_date[0]).format('YYYY') : ""
                        } as any)}
                        backgroundColor="black"
                        color="white"
                      >
                        {selectText}
                      </Button>
                    </Flex>
                  </Box>
                </Flex>
                {i !== bookResults.length - 1 ? (
                  <Divider/>
                ): null}
              </React.Fragment>
            )
          }) : (
            <Text fontStyle="italic" color="red">
              {bookResultsError ? bookResultsError + ". Please try again later." : null}
            </Text>
          )}

          {bookResultsOther ? bookResultsOther.map((book,i)=>{
            return (
              <React.Fragment key={i}>
                <Flex
                  gap={2}
                >
                  <Box flex="1 1 auto" maxW="65px">
                    {book.cover_i || book.lccn ? (
                      <Image
                        maxW="100%" 
                        w="100%"
                        h="auto"
                        className="book-image"
                        onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                        src={book.cover_i ? (
                          `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg?default=false`
                        ) : (
                          book.lccn ? (
                            `https://covers.openlibrary.org/b/lccn/${book.lccn[0]}-M.jpg?default=false`
                          ) : (
                            "https://via.placeholder.com/165x215"
                          )
                        )}
                        alt="book image"
                        boxShadow="1px 1px 1px 1px darkgrey"
                        _hover={{
                          cursor: "pointer"
                        }}
                        id={`book-cover-${i}`}
                      />
                    ): (
                      <BookImage 
                        isbn={book.isbn?.length ? book.isbn[book.isbn.length - 1] : null}
                        id={`book-cover-${i}`}
                      />
                    )}
                  </Box>
                  <Box flex="1 1 auto">
                    <Heading
                      as="h4"
                      size="sm"
                      noOfLines={1}
                    >
                      {book.title}
                    </Heading>
                    <Text fontSize="sm" noOfLines={1}>
                      {book.author_name ? book.author_name[0] : null}
                    </Text>
                    <Text fontSize="sm" fontStyle="italic">
                      {book.publish_date ? dayjs(book.publish_date[0]).format('YYYY') : null}
                    </Text>
                    <Flex align="center" gap={1}>
                      {/* <GooglePreviewLink book={book}/> */}
                      <Button 
                        as="a"
                        href={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(book.title + " " + (book.author_name ? book.author_name[0] : null) + " " + (book.isbn?.length >= 2 ? book.isbn[1] : null))}`}
                        target="blank"
                        size="xs"
                        variant="outline"
                        backgroundColor="white"
                        color="black"
                      >
                        Shop
                      </Button>
                      <Button 
                        size="xs"
                        data-book={JSON.stringify(book)}
                        onClick={e=>selectCallback({
                          title: book.title,
                          google_books_id: null,
                          author: book.author_name ? book.author_name[0] : "",
                          image: document.getElementById(`book-cover-${i}`)!.getAttribute("src"),
                          isbn: book.isbn?.length ? book.isbn[book.isbn.length - 1] : null,
                          description: "",
                          page_count: book.number_of_pages_median,
                          published_date: book.publish_date?.length ? dayjs(book.publish_date[0]).format('YYYY') : ""
                        } as any)}
                        backgroundColor="black"
                        color="white"
                      >
                        {selectText}
                      </Button>
                    </Flex>
                  </Box>
                </Flex>
                {i !== bookResultsOther.length - 1 ? (
                  <Divider/>
                ): null}
              </React.Fragment>
            )
          }) : (
            <Text fontStyle="italic" color="red">
              {bookResultsError ? bookResultsError + ". Please try again later." : null}
            </Text>
          )}
        </Flex>
      )}
    </Stack>
  )
}
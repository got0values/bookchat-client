import React, {useState,useRef} from 'react';
import { Link } from 'react-router-dom';
import { GoogleBooksSearchType } from '../types/types';
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
import googleWatermark from "/src/assets/google_watermark.gif";

export default function GoogleBooksSearch({selectText,selectCallback,gBooksApi}: GoogleBooksSearchType) {
  const searchInputRef = useRef({} as HTMLInputElement);
  const [bookResultsGoogle,setBookResultsGoogle] = useState<any[] | null>(null);
  const [bookResultsOther,setBookResultsOther] = useState<any[] | null>(null);
  const [bookResultsError,setBookResultsError] = useState("");
  const [bookResultsLoading,setBookResultsLoading] = useState(false)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
      .get("https://www.googleapis.com/books/v1/volumes?q=" + searchInputRef.current.value + "&key=" + gBooksApi)
      // .get("https://openlibrary.org/sear" + searchInputRef.current.value)
      .then((response)=>{
        if (response.data.items) {
          setBookResultsGoogle(response.data.items)
        }
        else {
          setBookResultsGoogle(null)
        }
        // onOpenSearchModal();
      })
      .catch((error)=>{
        setBookResultsGoogle(null)
        axios
          .get("https://openlibrary.org/search.json?q=" + searchInputRef.current.value)
          .then((response)=>{
            if(response.data.docs) {
              setBookResultsOther(response.data.docs)
            }
          })
          .catch((error)=>{
            setBookResultsError(error.message);
            console.log(error)
          })
      })
    setBookResultsLoading(false)
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
          style={{
            background: `no-repeat url(${googleWatermark})`,
            backgroundPosition: "top 0px right 5px"
          }}
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
          {bookResultsGoogle ? bookResultsGoogle.map((book,i)=>{
            return (
              <React.Fragment key={i}>
                <Flex
                  gap={2}
                >
                  <Box flex="1 1 auto" maxW="65px">
                    <Popover isLazy>
                      <PopoverTrigger>
                      <Image
                        maxW="100%" 
                        w="100%"
                        h="auto"
                        className="book-image"
                        onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                        src={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215"}
                        alt="book image"
                        boxShadow="1px 1px 1px 1px darkgrey"
                        _hover={{
                          cursor: "pointer"
                        }}
                      />
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>{book.volumeInfo.title}</PopoverHeader>
                        <PopoverBody>{book.volumeInfo.description}</PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Box>
                  <Box flex="1 1 auto">
                    <Heading
                      as="h4"
                      size="sm"
                      noOfLines={1}
                    >
                      {book.volumeInfo.title}
                    </Heading>
                    <Text fontSize="sm" noOfLines={1}>
                      {book.volumeInfo.authors ? book.volumeInfo.authors[0] : null}
                    </Text>
                    <Text fontSize="sm" fontStyle="italic">
                      {book.volumeInfo.publishedDate ? dayjs(book.volumeInfo.publishedDate).format('YYYY') : null}
                    </Text>
                    <Flex align="center" gap={1}>
                      {/* <GooglePreviewLink book={book}/> */}
                      {/* <a
                        href={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(book.volumeInfo.title + " " + (book.volumeInfo.authors ? book.volumeInfo.authors[0] : null) + " " + (book.volumeInfo.industryIdentifiers ? book.volumeInfo.industryIdentifiers[0]?.identifier : null))}`}
                        target="blank"
                      >
                        <Button 
                          size="xs"
                          variant="outline"
                          backgroundColor="white"
                          color="black"
                        >
                          Shop
                        </Button>
                      </a> */}
                      <Button 
                        size="xs"
                        data-book={JSON.stringify(book)}
                        // onClick={selectCallback}
                        onClick={e=>selectCallback({
                          title: book.volumeInfo.title,
                          author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : "",
                          image: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215",
                          isbn: book.volumeInfo.industryIdentifiers?.length ? book.volumeInfo.industryIdentifiers[0].identifier : null,
                          description: book.volumeInfo.description,
                          page_count: book.volumeInfo.pageCount ? book.volumeInfo.pageCount: null,
                          published_date: book.volumeInfo.publishedDate ? dayjs(book.volumeInfo.publishedDate).format('YYYY') : null
                        } as any)}
                        backgroundColor="black"
                        color="white"
                      >
                        {selectText}
                      </Button>
                    </Flex>
                  </Box>
                </Flex>
                {i !== bookResultsGoogle.length - 1 ? (
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
                    <Popover isLazy>
                      <PopoverTrigger>
                      <Image
                        maxW="100%" 
                        w="100%"
                        h="auto"
                        className="book-image"
                        onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                        src={book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0] || book.isbn.length > 1 ? book.isbn[1] : "1"}-M.jpg?default=false` : "https://via.placeholder.com/165x215"}
                        alt="book image"
                        boxShadow="1px 1px 1px 1px darkgrey"
                        _hover={{
                          cursor: "pointer"
                        }}
                      />
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>{book.title}</PopoverHeader>
                        <PopoverBody>{}</PopoverBody>
                      </PopoverContent>
                    </Popover>
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
                      {book.published_year ? dayjs(book.published_year[0]).format('YYYY') : null}
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
                          author: book.author_name ? book.author_name[0] : "",
                          image: book.isbn ? `https://covers.openlibrary.org/b/isbn/${book.isbn[0] || book.isbn.length >= 2 ? book.isbn[1] : "1"}-M.jpg?default=false` : "https://via.placeholder.com/165x215",
                          isbn: book.isbn ? book.isbn[0] : book.isbn.length > 1 ? book.isbn[1] : "",
                          description: "",
                          page_count: book.number_of_pages_median,
                          published_date: book.publish_year?.length ? dayjs(book.publish_year[0]).format('YYYY') : ""
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
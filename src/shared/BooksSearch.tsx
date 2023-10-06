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
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  FormControl,
  FormLabel,
  PopoverBody,
  Select
} from "@chakra-ui/react";
import GooglePopoverContent from './GooglePopover.Content';
import dayjs from "dayjs";
import axios from "axios";

export default function BooksSearch({selectText,selectCallback,gBooksApi}: BooksSearchType) {
  const [apiChoice,setApiChoice] = useState("1");
  const searchInputRef = useRef({} as HTMLInputElement);
  const [bookResults,setBookResults] = useState<any[] | null>(null);
  const [bookResultsOther,setBookResultsOther] = useState<any[] | null>(null);
  const [bookResultsError,setBookResultsError] = useState("");
  const [bookResultsLoading,setBookResultsLoading] = useState(false)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
    .get(apiChoice === "1" ? `https://api2.isbndb.com/books/${searchInputRef.current.value}?page=1&pageSize=10` : `https://openlibrary.org/search.json?q=${searchInputRef.current.value}`,
    apiChoice === "1" ? {headers: { "Authorization": import.meta.env.VITE_ISBNDB_API_KEY}} : {}
    )
      .then((response)=>{
        if (apiChoice === "1") {
          if (response.data.books) {
            if (response.data.books.length > 10) {
              const slicedResponse = response.data.books;
              setBookResults(slicedResponse)
            }
            else {
              setBookResults(response.data.books)
            }
          }
          else {
            setBookResults(null)
          }
        }
        else if (apiChoice === "2") {
          if (response.data.docs) {
            if (response.data.docs.length > 10) {
              const slicedResponse = response.data.docs.slice(0,10);
              setBookResults(slicedResponse)
            }
            else {
              setBookResults(response.data.docs)
            }
          }
          else {
            setBookResults(null)
          }
        }
        
        // onOpenSearchModal();
      })
      .catch((error)=>{
        setBookResults(null)
        axios
          .get("https://www.googleapis.com/books/v1/volumes?q=" + searchInputRef.current.value + "&key=" + gBooksApi)
          .then((response)=>{
            if(response.data.items) {
              setBookResultsOther(response.data.items)
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
        <FormControl 
          variant="floatingstatic"
          maxW="60px"
        >
          <FormLabel left="-10px!important">
            Source
          </FormLabel>
          <Select
            onChange={e=>{
              setBookResults(null)
              setBookResultsOther(null)
              setApiChoice(e.target.value)
            }}
            variant="filled"
            bg="white"
            borderColor="black"
            size="lg"
            defaultValue="1"
            _dark={{
              bg: "gray.800"
            }}
          >
            <option
              value="1"
            >
              1
            </option>
            <option
              value="2"
            >
              2
            </option>
          </Select>
        </FormControl>
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
                {apiChoice === "1" ? (
                  <Flex
                    gap={2}
                  >
                    <Box flex="1 1 auto" maxW="65px">
                      <Image
                        maxW="100%" 
                        w="100%"
                        h="auto"
                        className="book-image"
                        onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                        src={book.image ? book.image : "https://via.placeholder.com/165x215"}
                        alt="book image"
                        boxShadow="1px 1px 1px 1px darkgrey"
                        _hover={{
                          cursor: "pointer"
                        }}
                        id={`book-cover-${i}`}
                      />
                    </Box>
                    <Box flex="1 1 auto">
                      <Popover isLazy>
                        <PopoverTrigger>
                          <Box
                            _hover={{
                              cursor: "pointer"
                            }}
                          >
                            <Heading
                              as="h4"
                              size="sm"
                              noOfLines={1}
                            >
                              {book.title}
                            </Heading>
                          </Box>
                        </PopoverTrigger>
                        {book.synopsis ? (
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                              <PopoverBody 
                              _dark={{
                                bg: "black"
                              }}
                                fontSize="sm"
                              >
                                {book.synopsis}
                              </PopoverBody>
                          </PopoverContent>
                        ): (
                          <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                              <PopoverBody 
                              _dark={{
                                bg: "black"
                              }}
                                fontSize="sm"
                              >
                                <GooglePopoverContent title={book.title} author={book.authors?.length ? book.authors[0] : null} gBooksApi={gBooksApi}/>
                              </PopoverBody>
                          </PopoverContent>
                        )}
                      </Popover>
                      <Text fontSize="sm" noOfLines={1}>
                        {book.authors?.length ? book.authors[0] : null}
                      </Text>
                      <Text fontSize="sm" fontStyle="italic">
                        {book.date_published ? dayjs(book.date_published).format('YYYY') : null}
                      </Text>
                      <Flex align="center" gap={1}>
                        <Button 
                          size="xs"
                          data-book={JSON.stringify(book)}
                          onClick={e=>selectCallback({
                            title: book.title,
                            google_books_id: null,
                            author: book?.authors.length ? book.authors[0] : "",
                            image: document.getElementById(`book-cover-${i}`)!.getAttribute("src"),
                            isbn: book.isbn ? book.isbn : null,
                            description: book.synopsis ? book.synopsis : "",
                            subjects: book.subjects?.length ? book.subjects : null,
                            page_count: book.pages ? book.pages : null,
                            published_date: book.date_published ? dayjs(book.date_published).format('YYYY') : ""
                          } as any)}
                          backgroundColor="black"
                          color="white"
                        >
                          {selectText}
                        </Button>
                      </Flex>
                    </Box>
                  </Flex>
                ): (
                  <Flex
                    gap={2}
                  >
                    <Box flex="1 1 auto" maxW="65px">
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
                    </Box>
                    <Box flex="1 1 auto">
                      <Popover isLazy>
                        <PopoverTrigger>
                          <Box
                            _hover={{
                              cursor: "pointer"
                            }}
                          >
                            <Heading
                              as="h4"
                              size="sm"
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
                              <GooglePopoverContent title={book.title} author={book.author_name ? book.author_name[0] : null} gBooksApi={gBooksApi}/>
                            </PopoverBody>
                        </PopoverContent>
                      </Popover>
                      <Text fontSize="sm" noOfLines={1}>
                        {book.author_name ? book.author_name[0] : null}
                      </Text>
                      <Text fontSize="sm" fontStyle="italic">
                        {book.publish_date ? dayjs(book.publish_date[0]).format('YYYY') : null}
                      </Text>
                      <Flex align="center" gap={1}>
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
                            subjects: book.subject?.length ? book.subject : null,
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
                )}

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
                      id={`book-cover-${i}`}
                    />
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
                      <Button 
                        as="a"
                        href={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(book.volumeInfo.title + " " + (book.volumeInfo.authors ? book.volumeInfo.authors[0] : null))}`}
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
                          google_books_id: book.id,
                          title: book.volumeInfo.title,
                          author: book.volumeInfo.authors ? book.volumeInfo.authors[0] : "",
                          image: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215",
                          isbn: book.volumeInfo.industryIdentifiers?.length ? book.volumeInfo.industryIdentifiers[0].identifier : null,
                          description: book.volumeInfo.description,
                          page_count: book.volumeInfo.pageCount ? book.volumeInfo.pageCount : null,
                          subjects: null,
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
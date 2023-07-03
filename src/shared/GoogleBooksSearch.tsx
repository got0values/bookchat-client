import React, {useState,useRef} from 'react';
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
  const [bookResults,setBookResults] = useState<any[] | null>(null);
  const [bookResultsLoading,setBookResultsLoading] = useState(false)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
      .get("https://www.googleapis.com/books/v1/volumes?q=" + searchInputRef.current.value + "&key=" + gBooksApi)
      .then((response)=>{
        setBookResults(response.data.items)
        setBookResultsLoading(false)
        // onOpenSearchModal();
      })
      .catch((error)=>{
        console.log(error)
      })
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
          // style={{
          //   background: `no-repeat url(${googleWatermark})`,
          //   backgroundPosition: "top 0px right 5px"
          // }}
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
                    <Flex align="center" gap={2}>
                      {/* <GooglePreviewLink book={book}/> */}
                      <Button 
                        size="xs"
                        data-book={JSON.stringify(book)}
                        onClick={selectCallback}
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
          }) : null}
        </Flex>
      )}
    </Stack>
  )
}
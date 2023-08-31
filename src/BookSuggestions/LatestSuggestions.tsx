import React, { useState, useRef, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { BookSuggestionType } from "../types/types";
import { 
  Box,
  Flex,
  Fade,
  Text,
  Image,
  Button,
} from "@chakra-ui/react";
import { BsArrowRightShort } from 'react-icons/bs';
import dayjs from "dayjs";
import Cookies from "js-cookie";
import axios from "axios";

export default function LatestSuggestions({server}: {server: string}) {
  const [latestSuggestions,setLatestSuggestions] = useState<BookSuggestionType[] | null>(null)
  async function getLatestSuggestions() {
    const tokenCookie = Cookies.get().token
    if (tokenCookie) {
      const dash = await axios
        .get(server + "/api/latestsuggestions",
        {
          headers: {
            Authorization: tokenCookie
          }
        }
        )
        .then((response)=>{
          setLatestSuggestions(response.data.message)
          return response.data.message
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      return dash;
    }
    else {
      throw new Error("An error occurred")
    }
  }

  useEffect(()=>{
    getLatestSuggestions();
  },[])

  return (
    <Flex
      gap={4}
      wrap="wrap"
      justify="space-between"
      alignItems="stretch"
    >
      {latestSuggestions ? (
        latestSuggestions.map((suggestion,i)=>{
          return (
            <Flex
              as={Fade}
              in={Boolean(latestSuggestions)}
              key={i}
              direction="column"
              justify="space-between"
              border="1px solid"
              p={2}
              flex="1 1 0"
              minW="200px"
              minH="150px"
            >
              <Box>
                <Flex 
                  align="center" 
                  gap={0} 
                  wrap="wrap" 
                  lineHeight={1}
                  mb={1}
                  fontWeight="bold"
                >
                  <Text
                    as={Link}
                    to={`/profile/${suggestion.Profile_BookSuggestion_suggestorToProfile.username}`}
                    color="teal"
                  >
                    {suggestion.Profile_BookSuggestion_suggestorToProfile.username}
                  </Text>
                  <BsArrowRightShort size={20} />
                  <Link
                    to={`/profile/${suggestion.Profile_BookSuggestion_suggesteeToProfile?.username}`}
                  >
                    {suggestion.Profile_BookSuggestion_suggesteeToProfile?.username}
                  </Link>
                </Flex>
                <Flex gap={2} mb={2}>
                  <Image
                    src={suggestion.image ? suggestion.image : "https://via.placeholder.com/165x215"}
                    onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                    maxH="85px"
                    boxShadow="1px 1px 1px 1px darkgrey"
                    alt={`${suggestion.title} image`}
                  />
                  <Box lineHeight={1.2}>
                    <Text size="sm" fontWeight="bold" me={3} noOfLines={1}>
                      {suggestion.title}
                    </Text>
                    <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                      {suggestion.author}
                    </Text>
                    <Text fontSize="sm" fontStyle="italic">
                      {suggestion.published_date !== null ? 
                        (
                          dayjs(suggestion.published_date).format("YYYY")
                        ) : null
                      }
                    </Text>
                    {suggestion.page_count ? (
                      <Text fontSize="sm" noOfLines={1}>
                        {suggestion.page_count} pages
                      </Text>
                    ): null}
                  </Box>
                </Flex>
              </Box>
              <Flex justify="center">
                <Button
                  as={Link}
                  to={`/booksuggestions/bookshelf?profile=${suggestion.Profile_BookSuggestion_suggesteeToProfile?.username}`}
                  size="xs"
                  variant="outline"
                  borderColor="black"
                  isDisabled={!suggestion.Profile_BookSuggestion_suggesteeToProfile?.Bookshelf || !suggestion.Profile_BookSuggestion_suggesteeToProfile?.Bookshelf.allow_suggestions}
                >
                  Bookshelf
                </Button>
              </Flex>
            </Flex>
          )
        })
      ): null}
    </Flex>
  )
}
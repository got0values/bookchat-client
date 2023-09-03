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
  Divider
} from "@chakra-ui/react";
import StarRating from "../shared/StarRating";
import { BsArrowRightShort } from 'react-icons/bs';
import dayjs from "dayjs";
import Cookies from "js-cookie";
import axios from "axios";

export default function BookSuggestionRatings({server}: {server: string}) {
  const [suggestionRatings,setSuggestionRatings] = useState<BookSuggestionType[] | null>(null)
  async function getSuggestionRatings() {
    const tokenCookie = Cookies.get().token
    if (tokenCookie) {
      const dash = await axios
        .get(server + "/api/suggestionratings",
        {
          headers: {
            Authorization: tokenCookie
          }
        }
        )
        .then((response)=>{
          setSuggestionRatings(response.data.message)
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
    getSuggestionRatings();
  },[])

  return (
    <Flex
      // gap={2}
      direction="column"
      alignItems="stretch"
    >
      {suggestionRatings && suggestionRatings.length ? (
        suggestionRatings.map((suggestion,i)=>{
          return (
            <React.Fragment key={i}>
              <Flex
                as={Fade}
                in={Boolean(suggestionRatings)}
                direction="column"
                justify="space-between"
                px={2}
              >
                <Box>
                  <Flex 
                    align="center" 
                    gap={0} 
                    wrap="wrap" 
                    lineHeight={1}
                    mb={1}
                    fontSize="sm"
                  >
                    <Text>
                      {dayjs(suggestion.created_on).local().format('M/DD/YY')}
                    </Text>
                    <BsArrowRightShort size={20} />
                    <Text
                      as={Link}
                      to={`/profile/${suggestion.Profile_BookSuggestion_suggesteeToProfile?.username}`}
                      fontWeight="bold"
                    >
                      @{suggestion.Profile_BookSuggestion_suggesteeToProfile?.username}
                    </Text>
                  </Flex>
                  <Flex gap={2} mb={2}>
                    <Image
                      src={suggestion.image ? suggestion.image : "https://via.placeholder.com/165x215"}
                      onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                      maxH="60px"
                      boxShadow="1px 1px 1px 1px darkgrey"
                      alt={`${suggestion.title} image`}
                    />
                    <Box lineHeight={1.2}>
                      <Flex 
                        align="center"
                        wrap="wrap"
                        gap={1}
                      >
                        <Text size="sm" fontWeight="bold" noOfLines={1} maxW={["150px","250px"]}>
                          {suggestion.title}
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" noOfLines={1} maxW={["150px","250px"]}>
                        · {suggestion.author}
                        </Text>
                        <Text fontSize="sm" fontStyle="italic">
                          {suggestion.published_date !== null ? 
                            (
                              "· " + dayjs(suggestion.published_date).format("YYYY")
                            ) : null
                          }
                        </Text>
                      </Flex>
                      <StarRating
                        ratingCallback={null} 
                        starRatingId={suggestion.id}
                        defaultRating={suggestion.rating}
                      />
                      <Button
                        as={Link}
                        to={suggestion.Profile_BookSuggestion_suggesteeToProfile?.Bookshelf && suggestion.Profile_BookSuggestion_suggesteeToProfile?.Bookshelf.allow_suggestions ? `/booksuggestions/bookshelf?profile=${suggestion.Profile_BookSuggestion_suggesteeToProfile?.username}` : "#"}
                        size="xs"
                        variant="ghost"
                        p={0}
                        borderColor="black"
                        isDisabled={!suggestion.Profile_BookSuggestion_suggesteeToProfile?.Bookshelf || !suggestion.Profile_BookSuggestion_suggesteeToProfile?.Bookshelf.allow_suggestions}
                      >
                        Bookshelf
                      </Button>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
              {i < suggestionRatings.length - 1 ? (
                <Flex justify="center" mb={1}>
                  <Divider/>
                </Flex>
              ): null}
            </React.Fragment>
          )
        })
      ): (
        <Text fontStyle="italic">
          You have not received any ratings yet
        </Text>
      )}
    </Flex>
  )
}
import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, HTMLInputTypeAttribute } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookshelfType, BookSuggestionType } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Avatar,
  Button,
  Image,
  Stack,
  Flex,
  Skeleton,
  Divider,
  useToast,
} from "@chakra-ui/react";
import StarRating from "../shared/StarRating";
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export function BookSuggestionsForMe({server}: {server: string;}) {
  dayjs.extend(utc);
  const queryClient = useQueryClient();

  async function getBookSuggestionsForMe() {
    let tokenCookie: string | null = Cookies.get().token;
    const bookSuggestToList = axios
      .get(server + "/api/getbooksuggestionsforme",
        {
          headers: {
            'authorization': tokenCookie
          }
        }
      )
      .then((response)=>{
        const {data} = response;
        return data.message;
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.error)
      })
    return bookSuggestToList;
  }

  const ratingCallbackMutation = useMutation({
    mutationFn: async ([rating,starRatingId]:[rating: number,starRatingId: number]) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/ratesuggestion",
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
      return getBookSuggestionsForMe()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookSuggestionsForMeKey'] })
      queryClient.resetQueries({queryKey: ['bookSuggestionsForMeKey']})
      queryClient.setQueryData(["bookSuggestionsForMeKey"],data)
    }
  })
  function ratingCallback([rating,starRatingId]: [rating:number,starRatingId:number]) {
    ratingCallbackMutation.mutate([rating,starRatingId])
  }

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookSuggestionsForMeKey'], 
    queryFn: getBookSuggestionsForMe
  });

  let bookSuggestionsForMe: any = data ? data : null;

  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }

  return (
    <Skeleton
      isLoaded={!isLoading}
    >
      {bookSuggestionsForMe?.length ? (
        bookSuggestionsForMe.map((suggestion: BookSuggestionType, i: number)=>{
          return (
            <Stack 
              className="well"
              spacing={4}
              key={i}
            >
              <Flex
                as={Link}
                to={`/profile/${suggestion.Profile_BookSuggestion_suggestorToProfile.username}`}
                align="center"
                gap={2}
              >
                <Avatar 
                  src={suggestion.Profile_BookSuggestion_suggestorToProfile.profile_photo}
                />
                <Box>
                  <Flex align="center" gap={1}>
                    <Text fontWeight="bold">
                      {suggestion.Profile_BookSuggestion_suggestorToProfile.username}
                    </Text>
                    {/* <StarRating
                      ratingCallback={null} 
                      starRatingId={suggestion.id}
                      defaultRating={suggestion.suggestorRating ? suggestion.suggestorRating : 0}
                    /> */}
                    {suggestion.suggestorRating ? (
                      <Text fontStyle="italic" fontSize="sm">
                        {suggestion.suggestorRating}/5 rating
                      </Text>
                    ): null}
                  </Flex>
                  <Text fontStyle="italic" opacity="75%">
                    {dayjs(suggestion.created_on).local().format('MMM DD, YYYY')}
                  </Text>
                </Box>
                {/* <Box w="1.4rem">
                  {bookshelf.Flag ? <bookshelf.Flag/> : null}
                </Box> */}
              </Flex>
              <Divider />
              <Flex
                gap={1}
              >
                <Image
                  src={suggestion.image}
                  height="100%"
                  maxH="125px"
                  boxShadow="1px 1px 1px 1px darkgrey"
                />
                <Box>
                  <Text
                    noOfLines={1}
                    fontWeight="bold"
                  >
                    {suggestion.title}
                  </Text>
                  <Text
                    noOfLines={1}
                  >
                    {suggestion.author}
                  </Text>
                  <Text
                    noOfLines={1}
                  >
                    {suggestion.published_date ? dayjs(suggestion.published_date).format("YYYY") : null}
                  </Text>
                  <Text
                    noOfLines={1}
                  >
                    {suggestion.description}
                  </Text>
                  <Text
                    fontStyle="italic"
                  >
                    {suggestion.isbn}
                  </Text>
                  <Flex
                    align="center"
                    gap={1}
                  >
                    <Text
                      fontWeight="bold"
                    >
                      Rate: 
                    </Text>
                    {/* <Text>
                      Coming soon!
                    </Text> */}
                    <StarRating
                      ratingCallback={ratingCallback} 
                      starRatingId={suggestion.id}
                      defaultRating={suggestion.rating ? suggestion.rating : 0}
                    />
                  </Flex>
                </Box>
              </Flex>
            </Stack>
          )
        })
      ): (
        <Box></Box>
      )}

    </Skeleton>
  )
}
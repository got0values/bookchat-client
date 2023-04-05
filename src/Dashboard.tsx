import React, { useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardProps, Following_Following_self_profile_idToProfile, CurrentlyReading } from './types/types';
import { 
  Box,
  Heading,
  Flex,
  Spinner,
  Text,
  Image,
  HStack,
  Avatar,
  Button
} from "@chakra-ui/react";
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";


export default function Dashboard({server}: DashboardProps) {
  dayjs.extend(utc);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {data,isLoading,isError,error} = useQuery({
    queryKey: ["dashboardKey"],
    queryFn: async ()=>{
      const tokenCookie = Cookies.get().token
      if (tokenCookie) {
        const dash = await axios
          .get(server + "/api/dashboard",
          {
            headers: {
              Authorization: tokenCookie
            }
          }
          )
          .then((response)=>{
            console.log(response.data)
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
  })
  const currentlyReading = data?.currentlyReading;
  let followingCurrentlyReading = data?.followingProfiles.map((following: Following_Following_self_profile_idToProfile)=>{
    return following.Profile_Following_following_profile_idToProfile.CurrentlyReading;
  })
  followingCurrentlyReading = followingCurrentlyReading?.flat()
  user?.Profile?.CurrentlyReading?.forEach((book)=>{
    followingCurrentlyReading?.push(book)
  })
  console.log(followingCurrentlyReading)
  let followingCurrentlyReadingSorted = followingCurrentlyReading?.sort((a: CurrentlyReading,b: CurrentlyReading)=>{
    return (new Date(a.created_on) as any) - (new Date(b.created_on) as any);
  }).reverse()

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="80vh">
        <Spinner size="xl"/>
      </Flex>
    )
  }
  if (isError) {
    console.log(error)
    return (
      <div>
        Error!
      </div>
    )
  }

  return (
    <Box className="main-content">
      <Box>
        {followingCurrentlyReadingSorted.map((reading: CurrentlyReading,i: number)=>{
            return (
              <Box
                my={5}
                p={3}
                rounded="md"
                bg="gray.200"
                _dark={{
                  bg: 'gray.600'
                }}
                key={i}
              >
                <Flex
                  justify="space-between"
                  mb={3}
                >
                  <HStack>
                    <Avatar
                      onClick={e=>navigate(`/profile/${reading.Profile.username}`)} 
                      size="md"
                      cursor="pointer"
                      src={`${reading.Profile.profile_photo}?x=${new Date().getTime()}`}
                      border="2px solid gray"
                      title={`@${reading.Profile.username}`}
                    />
                    <Text fontWeight="bold">
                      {reading.Profile.User.first_name + " " + reading.Profile.User.last_name}
                    </Text>
                  </HStack>
                  <Text>
                    {dayjs(reading.created_on).local().format('MMM DD, hh:mm a')}
                  </Text>
                </Flex>
                <Flex>
                  <Image 
                    src={reading.image}
                    maxH="125px"
                  />
                  <Box mx={2}>
                    <Heading as="h5" size="sm" me={3}>
                      {reading.title}
                    </Heading>
                    <Text>
                      {reading.author}
                    </Text>
                    <Text
                      noOfLines={3}
                    >
                      {reading.description}
                    </Text>
                  </Box>
                </Flex>
                {reading.Profile.id === user.Profile.id ? (
                  <Flex justify="flex-end">
                    <Button
                      colorScheme="red"
                      size="xs"
                    >
                      Delete
                    </Button>
                  </Flex>
                ): null}
              </Box>
            )
          })
        }
      </Box>
    </Box>
  );
};

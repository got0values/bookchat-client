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
  Button,
  Skeleton,
} from "@chakra-ui/react";
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";


export default function Dashboard({server}: DashboardProps) {
  dayjs.extend(utc);
  const navigate = useNavigate();
  const { user, getUser } = useAuth();
  const queryClient = useQueryClient();

  async function getDashboard() {
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
          getUser();
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

  const deleteReadingMutation = useMutation({
    mutationFn: async (readingId: number)=>{
      const tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .delete(server + "/api/currentlyreading",
            {
              headers: {
                Authorization: tokenCookie
              },
              data: {
                readingId
              }
            }
          )
          .then((response)=>{
            getUser();
          })
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.message)
          })
          console.log(getDashboard())
          return getDashboard();
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ["dashboardKey"] })
      queryClient.resetQueries({queryKey: ["dashboardKey"]})
      queryClient.setQueryData(["dashboardKey"],data)
    }
  })
  function deleteReading(readingId: number) {
    deleteReadingMutation.mutate(readingId)
  }
  
  const dashboard = useQuery({
    queryKey: ["dashboardKey"],
    queryFn: getDashboard
  })
  let followingCurrentlyReading = dashboard?.data?.followingProfiles.map((following: Following_Following_self_profile_idToProfile)=>{
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

  if (dashboard.isLoading) {
    return (
      <Flex align="center" justify="center" minH="80vh">
        <Spinner size="xl"/>
      </Flex>
    )
  }
  if (dashboard.isError) {
    console.log(dashboard.error)
    return (
      <div>
        Error!
      </div>
    )
  }

  return (
    <Box className="main-content-smaller">
      <Skeleton isLoaded={!dashboard.isLoading}>
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
                      onClick={e=>deleteReading(reading.id)}
                      disabled={deleteReadingMutation.isLoading}
                    >
                      Delete
                    </Button>
                  </Flex>
                ): null}
              </Box>
            )
          })
        }
      </Skeleton>
    </Box>
  );
};

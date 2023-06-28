import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {CurrentlyReadingComment} from '../types/types';
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Avatar,
  Menu,
  MenuList,
  MenuButton,
  MenuItem
} from '@chakra-ui/react';
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { useAuth } from "../hooks/useAuth";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import utc from "dayjs/plugin/utc";
import axios from "axios";


const Comments: Function = (
    {
      comments,
      getDashboard, 
      getProfile,
      location,
      server
    }: {
      comments: CurrentlyReadingComment[], 
      getDashboard?: ()=>void;
      getProfile?: ()=>void;
      location: string;
      server: string
    }
  ) => {
  const navigate = useNavigate()
  const [increment,setIncrement] = useState(3);
  const {user} = useAuth();
  const queryClient = useQueryClient();
  dayjs.extend(utc)


  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId)=>{
      const tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .delete(server + "/api/currentlyreadingcomment",
            {
              headers: {
                Authorization: tokenCookie
              },
              data: {
                commentId: commentId
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.message)
          })
          if (getDashboard && location === "dashboard") {
            return getDashboard();
          }
          if (getProfile && location === "profile") {
            return getProfile();
          }
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      if (location === "dashboard") {
        queryClient.invalidateQueries({ queryKey: ["dashboardKey"] })
        queryClient.resetQueries({queryKey: ["dashboardKey"]})
        queryClient.setQueryData(["dashboardKey"],data)
      }
      else if (location === "profile") {
        queryClient.invalidateQueries({ queryKey: ["profileKey"] })
        queryClient.resetQueries({queryKey: ["profileKey"]})
        queryClient.setQueryData(["profileKey"],data)
      }
    }
  })
  function deleteComment(commentId: number) {
    deleteCommentMutation.mutate(commentId as any)
  }

  return (
    comments.map((comment: CurrentlyReadingComment,i: number)=>{
      return (
        i >= increment ? (
          i === increment + 1 ? (
            <Box key={999} textAlign="center">
              <Button 
                onClick={e=>setIncrement(prev=>prev+3)}
                size="xs"
                w="auto"
                variant="ghost"
              >
                ...
              </Button>
            </Box>
          ) : <Box key={i}></Box>
        ) : (
          <Flex key={i} my={2}>
            <Box pe={2}>
              <Link to={`/profile/${comment.Profile_CurrentlyReadingComment_commenter_idToProfile}`}>
                <Avatar
                  size="sm"
                  cursor="pointer"
                  src={comment.Profile_CurrentlyReadingComment_commenter_idToProfile.profile_photo}
                  name={comment.Profile_CurrentlyReadingComment_commenter_idToProfile.username}
                  border="1px solid gray"
                />
              </Link>
            </Box>
            <Box w="100%">
              <Flex justify="space-between">
                <Flex flexWrap="wrap" columnGap={2}>
                  <Text 
                    as={Link}
                    fontWeight="bold"
                    to={`/profile/${comment.Profile_CurrentlyReadingComment_commenter_idToProfile.username}`}
                  >
                    {comment.Profile_CurrentlyReadingComment_commenter_idToProfile.username}
                  </Text>
                  <Text fontStyle="italic">
                    {dayjs(comment.datetime).local().format('MMM DD, h:mm a')}
                  </Text>
                </Flex>
                {comment.Profile_CurrentlyReadingComment_commenter_idToProfile.id === user?.Profile.id ? (
                  <Menu>
                    <MenuButton
                      as={Button}
                      size="md"
                      variant="ghost"
                      rounded="full"
                      height="25px"
                    >
                      <BiDotsHorizontalRounded/>
                    </MenuButton>
                    <MenuList>
                      <MenuItem
                        color="tomato"
                        onClick={e=>deleteComment(comment.id)}
                        fontWeight="bold"
                        icon={<BiTrash size={20} />}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                ): <Box></Box>}
              </Flex>
              <Text>{comment.comment}</Text>
            </Box>
          </Flex>
        )
      )
    })
  )
}

export default Comments;
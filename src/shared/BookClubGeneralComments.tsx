import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookClubGeneralCommentsType } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Avatar,
  AvatarGroup,
  Button,
  Stack,
  HStack,
  Flex,
  Skeleton,
  Textarea,
  Divider,
  useToast
} from "@chakra-ui/react";
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";

export const BookClubGeneralComments = (props: any) => {
  const {server,bookClubId,subdomain,uri} = props;
  const navigate = useNavigate();
  const {user} = useAuth();
  
  const [commentsError,setCommentsError] = useState("");
  const [commentsIsLoading,setCommentsIsLoading] = useState(false);
  const [comments,setComments] = useState<BookClubGeneralCommentsType[]>([] as BookClubGeneralCommentsType[]);
  function getComments() {
    let tokenCookie: string | null = Cookies.get().token;
    setCommentsIsLoading(true);
    if (tokenCookie) {
      axios
      .get(server + "/api/bookclubgeneralcomments?bookclubid=" + bookClubId,
        {
          headers: {
            authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        console.log(response)
        if (response.data.success) {
          setCommentsError("")
          setComments(response.data.comments)
          setCommentsIsLoading(false);
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data?.message) {
          setCommentsError(response.data?.message)
        }
      })
      setCommentsIsLoading(false);
    }
    else {
      setCommentsError("An error has occured")
    }
  }

  useEffect(()=>{
    getComments()
    return ()=>{
      setComments([])
    }
  },[])

  const commentRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const [postIsLoading,setPostIsLoading] = useState(false);
  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      setPostIsLoading(true)
      let comment = commentRef.current.value;
      await axios
      .post(server + "/api/bookclubgeneralcomment",
      {
        bookClubId,
        subdomain,
        uri,
        comment
      },
      {headers: {
        'authorization': tokenCookie
      }})
      .then((response)=>{
        getComments()
        commentRef.current.value = "";
        setPostIsLoading(false)
      })
      .catch(({response})=>{
        console.log(response)
        setCommentsError(response.data?.message)
      })
      setPostIsLoading(false)
    }
    else {
      setCommentsError("Error: TKBC")
    }
  }
    
  return (
    <Flex
      direction="column" 
      gap={2}
     >
      {commentsIsLoading ? (
        "Loading"
      ): (
        <Flex 
          as="form" 
          onSubmit={e=>postComment(e)}
          direction="column"
          gap={2}
        >
          <Flex align="center" gap={1}>
            <Avatar
              onClick={e=>navigate(`/profile/${user.Profile.username}`)} 
              size="sm"
              cursor="pointer"
              src={user.Profile.profile_photo}
              border="2px solid gray"
            />
            <Text fontWeight="bold">@{user.Profile.username}</Text>
          </Flex>
          <Textarea
            ref={commentRef}
          />
          <Flex align="center" justify="space-between">
            <Text color="tomato">{commentsError}</Text>
            {postIsLoading ? (
              <></>
            ) : (
              <Button
                type="submit"
              >
                Post
              </Button>
            )}
          </Flex>
          <Divider py={2}/>
            <Flex direction="column">
              {comments ? comments.map((comment,i) => {
                return (
                  <Box 
                    key={i}
                    my={1}
                    p={2}
                    bg="gray.100"
                    rounded="md"
                    _dark={{
                      bg: "gray.600"
                    }}
                  >
                    <Flex justify="flex-end">
                      <Text fontSize="sm">
                        {new Date(comment.datetime).toLocaleString()}
                      </Text>
                    </Flex>
                    <HStack 
                      align="center" 
                    >
                      <Avatar
                        onClick={e=>navigate(`/profile/${comment.Profile.username}`)} 
                        size="sm"
                        cursor="pointer"
                        src={comment.Profile.profile_photo}
                        border="2px solid gray"
                      />
                      <Text>
                        <Text as="span" fontWeight="bold">@{comment.Profile.username}</Text>: {comment.comment}
                        </Text>
                    </HStack>
                  </Box>
                )
              }): null}
            </Flex>
        </Flex>
      )}
    </Flex>
  )
}
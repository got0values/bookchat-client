import React, { useState, useEffect, useRef, MouseEvent } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";

export const BookClubGeneralComments = (props: any) => {
  const {server,bookClubId,subdomain,uri} = props;
  const navigate = useNavigate();
  const toast = useToast();
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

  async function deleteComment(e: MouseEvent<HTMLButtonElement>) {
    const tokenCookie = Cookies.get().token;
    const commentId = (e.target as HTMLButtonElement).value;
    await axios
    .delete(server + "/api/bookclubgeneralcomment",
    {
      headers: {
        'authorization': tokenCookie
      },
      data: {
        commentId: parseInt(commentId)
      }
    })
    .then((response)=>{
      if (response.data.success) {
        getComments()
      }
    })
    .catch(({response})=>{
      console.log(response)
      toast({
        description: "An error has occurred",
        status: "error",
        duration: 9000,
        isClosable: true
      })
    })
  }

  const { 
    isOpen: isOpenReplyModal, 
    onOpen: onOpenReplyModal, 
    onClose: onClosReplyModal 
  } = useDisclosure()
  const [commentReplyId,setCommentReplyId] = useState<string | null>(null);
  function openReplyModal(e: MouseEvent<HTMLButtonElement>) {
    setCommentReplyId((e.target as HTMLButtonElement).value)
    onOpenReplyModal()
  }

  const [replyError,setReplyError] = useState("");
  const [replyText,setReplyText] = useState("");
  async function replyComment(e: React.FormEvent) {
    e.preventDefault();
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      await axios
      .post(server + "/api/bookclubgeneralcommentreply",
      {
        replyText,
        commentReplyId
      },
      {headers: {
        'authorization': tokenCookie
      }})
      .then((response)=>{
        getComments()
        closeReplyModal();
      })
      .catch(({response})=>{
        console.log(response)
        setReplyError(response.data?.message)
      })
    }
    else {
      setReplyError("Error: TKBCR")
    }
  }

  function closeReplyModal() {
    setCommentReplyId(null);
    setReplyError("");
    setReplyText("");
    onClosReplyModal();
  }
    
  return (
    <>
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
                {comments ? comments.slice(0).reverse().map((comment,i) => {
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
                      <HStack 
                        align="flex-start" 
                      >
                        <Avatar
                          onClick={e=>navigate(`/profile/${comment.Profile.username}`)} 
                          size="md"
                          cursor="pointer"
                          src={comment.Profile.profile_photo}
                          border="2px solid gray"
                        />
                        <Box flex="1">
                          <Flex align="baseline" justify="space-between">
                            <Flex gap={2} align="center">
                              <Text as="span" fontWeight="bold">
                                {comment.Profile.User.first_name} {comment.Profile.User.last_name}
                              </Text>
                              <Text as="span" fontSize="sm">@{comment.Profile.username}</Text>
                            </Flex>
                            <Text fontSize="sm">
                              {new Date(comment.datetime).toLocaleString()}
                            </Text>
                          </Flex>
                          <Text>
                            {comment.comment}
                          </Text>
                        </Box>
                      </HStack>
                      <Flex justify="flex-end" gap={1}>
                        {comment.Profile.id === user.Profile.id ? (
                          <Button 
                            size="xs"
                            color="tomato"
                            value={comment.id}
                            onClick={e=>deleteComment(e)}
                          >
                            Delete
                          </Button>
                        ): null}
                          <Button 
                            size="xs"
                            value={comment.id}
                            onClick={e=>openReplyModal(e)}
                          >
                            Reply
                          </Button>
                      </Flex>
                    </Box>
                  )
                }): null}
              </Flex>
          </Flex>
        )}
      </Flex>

      <Modal isOpen={isOpenReplyModal} onClose={closeReplyModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Reply
          </ModalHeader>
          <ModalCloseButton />
          <form>
            <ModalBody>
              <Textarea
                onChange={e=>setReplyText(e.target.value)}
                required
              />
            </ModalBody>
            <ModalFooter>
              <HStack>
                <Text color="red">
                  {replyError}
                </Text>
                <Button 
                  variant='ghost'
                  mr={3}
                  size="lg"
                  onClick={e=>replyComment(e)}
                >
                  Reply
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

    </>
  )
}
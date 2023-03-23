import React, { useState, useEffect, useRef, MouseEvent, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookClubGeneralCommentsType, BookClubGeneralReply } from "../types/types";
import dayjs from "dayjs";
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
  Spinner,
  Skeleton,
  Textarea,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Input
} from "@chakra-ui/react";
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { BsReplyFill } from 'react-icons/bs';
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";

export const BookClubGeneralComments = (props: any) => {
  const {server,bookClubId,subdomain,uri,isBookClubCreator} = props;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const {user} = useAuth();

  const [increment,setIncrement] = useState(5);
  
  function getComments() {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      const commentsData = axios
        .get(server + "/api/bookclubgeneralcomments?bookclubid=" + bookClubId,
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          if (response.data.success) {
            return response.data.comments
          }
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      return commentsData
    }
    else {
      throw new Error("An error has occured")
    }
  }

  const commentRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const postCommentMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
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
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data?.message)
        })
      }
      else {
        throw new Error("Error: TKBC")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubGeneralCommentsKey'] })
      queryClient.resetQueries({queryKey: ['bookClubGeneralCommentsKey']})
      getComments()
      commentRef.current.value = "";
    }
  })
  function postComment(e: React.FormEvent) {
    postCommentMutation.mutate(e);
  }

  const deleteCommentMutation = useMutation({
    mutationFn: async (e: MouseEvent<HTMLButtonElement>) => {
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
      .catch(({response})=>{
        console.log(response)
        toast({
          description: "An error has occurred",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        throw new Error(response.data?.message)
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubGeneralCommentsKey'] })
      queryClient.resetQueries({queryKey: ['bookClubGeneralCommentsKey']})
      getComments()
    }
  })
  function deleteComment(e: MouseEvent<HTMLButtonElement>) {
    deleteCommentMutation.mutate(e);
  }

  const { 
    isOpen: isOpenReplyModal, 
    onOpen: onOpenReplyModal, 
    onClose: onClosReplyModal 
  } = useDisclosure()
  const [commentReplyData,setCommentReplyData] = useState<BookClubGeneralCommentsType | null>(null);
  function openReplyModal(e: MouseEvent<HTMLButtonElement>) {
    const commentId = (e.target as HTMLButtonElement).value;
    setCommentReplyData(comments.filter((comment)=>comment.id === parseInt(commentId))[0])
    onOpenReplyModal()
  }

  const [replyError,setReplyError] = useState("");
  const replyBoxRef = useRef({} as HTMLInputElement);
  const replyCommentMutation = useMutation({
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        let replyText = replyBoxRef.current.value;
        const commentReplyId = parseInt((commentReplyData as BookClubGeneralCommentsType).id as string)
        await axios
        .post(server + "/api/bookclubgeneralreply",
        {
          replyText,
          commentId: commentReplyId
        },
        {headers: {
          'authorization': tokenCookie
        }})
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data?.message)
        })
      }
      else {
        throw new Error("Error: TKBCR")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookClubGeneralCommentsKey'] })
      queryClient.resetQueries({queryKey: ['bookClubGeneralCommentsKey']})
      getComments()
      closeReplyModal()
    }
  })
  function replyComment(e: React.FormEvent) {
    replyCommentMutation.mutate(e);
  }

  function closeReplyModal() {
    setCommentReplyData(null);
    setReplyError("");
    replyBoxRef.current.value = "";
    replyCommentMutation.reset();
    onClosReplyModal();
  }

  const bookClubGeneralCommentsQuery = useQuery({ 
    queryKey: ['bookClubGeneralCommentsKey'], 
    queryFn: getComments
  });
  const comments: BookClubGeneralCommentsType[] = bookClubGeneralCommentsQuery.data;
  if (bookClubGeneralCommentsQuery.isLoading) {
    return (
      <Flex align="center" justify="center" minH="100%">
        <Spinner size="xl"/>
      </Flex>
    )
  }
  if (bookClubGeneralCommentsQuery.isError) {
    return <Flex align="center" justify="center" minH="80vh">
      <Heading as="h1" size="xl">Error: {(bookClubGeneralCommentsQuery.error as Error).message}</Heading>
    </Flex>
  }
    
  return (
    <>
      <Flex
        direction="column" 
        gap={2}
      >
        <Flex 
          direction="column"
          gap={2}
        >
          <>
            {postCommentMutation.error && (
              <Text color="tomato">{(postCommentMutation.error as Error).message}</Text>
            )}
            <Flex
              as="form" 
              onSubmit={e=>postComment(e)}
              align="center" 
              justify="space-between"
              gap={1}
            >
              <Input
                type="text"
                ref={commentRef}
              />
              <Button
                type="submit"
                disabled={postCommentMutation.isLoading}
              >
                Post
              </Button>
            </Flex>
            
            <Flex direction="column">
              {comments ? (
                comments.slice(0).reverse().map((comment,i) => {
                  return (
                    i >= increment ? (
                        null
                      ) : (
                      (
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
                              src={`${comment.Profile.profile_photo}?x=${new Date().getTime()}`}
                              border="2px solid gray"
                            />
                            <Box flex="1">
                              <Flex align="flex-start" justify="space-between">
                                <Flex columnGap={2} align="center" flexWrap="wrap">
                                  <Text as="span" fontWeight="bold">
                                    {comment.Profile.User.first_name} {comment.Profile.User.last_name}
                                  </Text>
                                  <Flex align="center" gap={1}>
                                    <Text as="span" fontSize="sm">@{comment.Profile.username}</Text>
                                    ·
                                    <Text fontSize="sm" title={new Date(comment.datetime).toLocaleDateString()}>
                                      {dayjs(comment.datetime).format('MMM D')}
                                    </Text>
                                  </Flex>
                                </Flex>

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
                                  {comment.Profile.id === user.Profile.id || isBookClubCreator ? (
                                    <>
                                      <MenuItem
                                        color="tomato"
                                        value={comment.id}
                                        onClick={e=>deleteComment(e)}
                                        fontWeight="bold"
                                        icon={<BiTrash size={20} />}
                                      >
                                        Delete
                                      </MenuItem>
                                    </>
                                  ): null}
                                  <MenuItem 
                                    value={comment.id}
                                    onClick={e=>openReplyModal(e)}
                                    fontWeight="bold"
                                    icon={<BsReplyFill size={20} />}
                                  >
                                    Reply
                                  </MenuItem>
                                  </MenuList>
                                </Menu>

                              </Flex>
                              <Text>
                                {comment.comment}
                              </Text>
                            </Box>
                          </HStack>
                          {comment.BookClubGeneralReply.length ? ( <Divider my={3} /> ) : null}
                          {comment.BookClubGeneralReply.length ? (
                            comment.BookClubGeneralReply.reverse().map((reply,i)=>{
                            return (
                              <Fragment key={i}>
                                {i === 0 ? (
                                  <HStack 
                                    align="flex-start"
                                    p={2}
                                    rounded="md"
                                    _hover={{
                                      bg: "gray.300"
                                    }}
                                    _dark={{
                                      '&:hover': {
                                        bg: "gray.500"
                                      }
                                    }}
                                  >
                                    <Box pe={2}>
                                      <Avatar
                                        onClick={e=>navigate(`/profile/${reply.Profile.username}`)} 
                                        size="sm"
                                        cursor="pointer"
                                        src={reply.Profile.profile_photo}
                                        border="1px solid gray"
                                      />
                                    </Box>
                                    <Box flex="1">
                                      <Flex align="flex-start" justify="space-between">
                                        <Flex columnGap={2} align="center" flexWrap="wrap">
                                          <Text as="span" fontWeight="bold">
                                            {reply.Profile.User.first_name} {reply.Profile.User.last_name}
                                          </Text>
                                          <Flex align="center" gap={1}>
                                            <Text as="span" fontSize="sm">@{reply.Profile.username}</Text>
                                            ·
                                            <Text fontSize="sm" title={new Date(reply.datetime).toLocaleDateString()}>
                                              {dayjs(reply.datetime).format('MMM D')}
                                            </Text>
                                          </Flex>
                                        </Flex>
                                        {reply.Profile.id === user.Profile.id || isBookClubCreator ? (
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
                                                value={comment.id}
                                                onClick={e=>deleteComment(e)}
                                                fontWeight="bold"
                                                icon={<BiTrash size={20} />}
                                              >
                                                Delete
                                              </MenuItem>
                                            </MenuList>
                                          </Menu>
                                        ): null}
                                      </Flex>
                                      <Text>
                                        {reply.reply}
                                      </Text>
                                    </Box>
                                  </HStack>
                                ) : (
                                  i === 1 ? (
                                    <Flex justify="center">
                                      <Button
                                        size="xs"
                                        color="navy"
                                        variant="ghost"
                                        value={reply.comment_id}
                                        onClick={e=>openReplyModal(e)}
                                      >
                                        View more({comment.BookClubGeneralReply.length})
                                      </Button>
                                    </Flex>
                                  ) : null
                                )}
                              </Fragment>
                            )
                          })) : null}
                        </Box>
                      )
                    )
                  )
                })
              ): null}
            </Flex>
            {comments?.length > increment ? (
              <Button
                size="xs"
                width="auto"
                variant="ghost"
                onClick={e=>setIncrement(prev=>prev + 5)}
              >
                ...
              </Button>
              ) : null}
          </>
        </Flex>
      </Flex>

      <Modal isOpen={isOpenReplyModal} onClose={closeReplyModal} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>
            Reply
          </ModalHeader>
          <ModalCloseButton />
            {commentReplyData ? (
              <>
                <ModalBody maxH="80vh" overflowX="auto">
                  <HStack 
                    align="flex-start" 
                  >
                    <Avatar
                      onClick={e=>navigate(`/profile/${commentReplyData.Profile.username}`)} 
                      size="md"
                      cursor="pointer"
                      src={commentReplyData?.Profile?.profile_photo}
                      border="2px solid gray"
                    />
                    <Box flex="1">
                      <Flex align="flex-start" justify="space-between">
                        <Flex columnGap={2} align="center" flexWrap="wrap">
                          <Text as="span" fontWeight="bold">
                            {commentReplyData.Profile.User.first_name} {commentReplyData.Profile.User.last_name}
                          </Text>
                          <Flex align="center" gap={1}>
                            <Text as="span" fontSize="sm">@{commentReplyData.Profile.username}</Text>
                            ·
                            <Text fontSize="sm" title={new Date(commentReplyData.datetime).toLocaleDateString()}>
                              {dayjs(commentReplyData.datetime).format('MMM D')}
                            </Text>
                          </Flex>
                        </Flex>
                      </Flex>
                      <Text>
                        {commentReplyData.comment}
                      </Text>
                    </Box>
                  </HStack>
                  {commentReplyData.BookClubGeneralReply.length ? ( <Divider my={3} /> ) : null}
                  {commentReplyData.BookClubGeneralReply.length ? (
                    commentReplyData.BookClubGeneralReply.map((reply,i)=>{
                    return (
                      <Fragment key={i}>
                        <HStack 
                          align="flex-start"
                          p={2}
                          rounded="md"
                          _hover={{
                            bg: "gray.100"
                          }}
                          _dark={{
                            '&:hover': {
                              bg: "gray.600"
                            }
                          }}
                        >
                          <Box pe={2}>
                            <Avatar
                              onClick={e=>navigate(`/profile/${reply.Profile.username}`)} 
                              size="sm"
                              cursor="pointer"
                              src={reply.Profile.profile_photo}
                              border="1px solid gray"
                            />
                          </Box>
                          <Box flex="1">
                            <Flex align="flex-start" justify="space-between">
                              <Flex columnGap={2} align="center" flexWrap="wrap">
                                <Text as="span" fontWeight="bold">
                                  {reply.Profile.User.first_name} {reply.Profile.User.last_name}
                                </Text>
                                <Flex align="center" gap={1}>
                                  <Text as="span" fontSize="sm">@{reply.Profile.username}</Text>
                                  ·
                                  <Text fontSize="sm" title={new Date(reply.datetime).toLocaleDateString()}>
                                    {dayjs(reply.datetime).format('MMM D')}
                                  </Text>
                                </Flex>
                              </Flex>
                              {reply.Profile.id === user.Profile.id || isBookClubCreator ? (
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
                                      value={commentReplyData.id}
                                      onClick={e=>deleteComment(e)}
                                      fontWeight="bold"
                                      icon={<BiTrash size={20} />}
                                    >
                                      Delete
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              ): null}
                            </Flex>
                            <Text>
                              {reply.reply}
                            </Text>
                          </Box>
                        </HStack>
                      </Fragment>
                    )
                  })) : null}
                </ModalBody>
                <ModalFooter flexDirection="column">
                  <Text color="red">
                    {replyError}
                  </Text>
                  <Flex as="form" direction="column" w="100%" onSubmit={e=>replyComment(e)}>
                    <Flex align="center" justify="space-between" gap={1}>
                      <Input
                        type="text"
                        ref={replyBoxRef}
                        required
                      />
                      <Button 
                        type="submit"
                        mr={3}
                        size="lg"
                      >
                        Reply
                      </Button>
                    </Flex>
                  </Flex>
                </ModalFooter>
              </>
            ) : null}
        </ModalContent>
      </Modal>

    </>
  )
}
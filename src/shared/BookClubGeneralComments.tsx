import React, { useState, useEffect, useRef, MouseEvent, Fragment } from "react";
import { useNavigate } from "react-router-dom";
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

  const commentRef = useRef<HTMLInputElement>({} as HTMLInputElement);
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
  const [commentReplyData,setCommentReplyData] = useState<BookClubGeneralCommentsType | null>(null);
  function openReplyModal(e: MouseEvent<HTMLButtonElement>) {
    const commentId = (e.target as HTMLButtonElement).value;
    setCommentReplyData(comments.filter((comment)=>comment.id === parseInt(commentId))[0])
    console.log(comments.filter((comment)=>comment.id === parseInt(commentId))[0])
    onOpenReplyModal()
  }

  const [replyError,setReplyError] = useState("");
  const replyBoxRef = useRef({} as HTMLInputElement);
  async function replyComment(e: React.FormEvent) {
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
    setCommentReplyData(null);
    setReplyError("");
    replyBoxRef.current.value = "";
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
            direction="column"
            gap={2}
          >
            <Text color="tomato">{commentsError}</Text>
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
                        <Flex align="flex-start" justify="space-between">
                          <Flex columnGap={2} align="center" flexWrap="wrap">
                            <Text as="span" fontWeight="bold">
                              {comment.Profile.User.first_name} {comment.Profile.User.last_name}
                            </Text>
                            <Flex align="center" gap={1}>
                              <Text as="span" fontSize="sm">@{comment.Profile.username}</Text>
                              ·
                              <Text fontSize="sm" title={new Date(comment.datetime).toLocaleDateString()}>
                                {dayjs(comment.datetime).format('MMM d')}
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
                            {comment.Profile.id === user.Profile.id ? (
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
                                        {dayjs(reply.datetime).format('MMM d')}
                                      </Text>
                                    </Flex>
                                  </Flex>
                                  {reply.Profile.id === user.Profile.id ? (
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
              }): null}
            </Flex>
          </Flex>
        )}
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
                              {dayjs(commentReplyData.datetime).format('MMM d')}
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
                                    {dayjs(reply.datetime).format('MMM d')}
                                  </Text>
                                </Flex>
                              </Flex>
                              {reply.Profile.id === user.Profile.id ? (
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
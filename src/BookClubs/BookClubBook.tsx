import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookClubGeneralCommentsType } from "../types/types";
import { BookClubBookType } from '../types/types';
import { 
  Box,
  Heading,
  Text,
  Avatar,
  AvatarGroup,
  Button,
  Stack,
  Flex,
  Skeleton,
  Textarea,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
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
import { BookClubGeneralComments } from "../shared/BookClubGeneralComments";
import ReactQuill from 'react-quill';
import { MdChevronRight } from 'react-icons/md';
import { HiOutlinePencil } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";


export default function BookClub({server}: {server: string}) {
  const { paramsBookClubBookId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  async function getBookClubBook() {
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      const bookClubBook = await axios
        .get(server + "/api/bookclubdiscussion?bookclubbookid=" + paramsBookClubBookId,
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          return response.data.message;
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      return bookClubBook;
    }
    else {
      throw new Error("An error has occurred")
    }
  }

  const { 
    isOpen: isOpenEditQuestionModal, 
    onOpen: onOpenEditQuestionModal, 
    onClose: onClosEditQuestionModal 
  } = useDisclosure()
  function openEditQuestionModal() {
    onOpenEditQuestionModal()
  }
  function closeEditQuestionModal() {
    onClosEditQuestionModal()
  }
  const topicRef = useRef({} as ReactQuill)
  const updateTopicMutation = useMutation({
    mutationFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .post(server + "/api/updatebookclubbooktopic",
          {
            topic: topicRef.current.value,
            bookClubBookId: parseInt(paramsBookClubBookId!)
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
      }
      else {
        throw new Error("An error has occurred")
      }
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookClubBookKey'] })
      queryClient.resetQueries({queryKey: ['bookClubBookKey']})
      queryClient.setQueryData(["bookClubBookKey"],data)
      toast({
        description: "Book club topic updated",
        status: "success",
        duration: 9000,
        isClosable: true
      })
      closeEditQuestionModal()
    }
  })
  function updateTopic() {
    updateTopicMutation.mutate();
  }

  const bookClubBookQuery = useQuery({ 
    queryKey: ['bookClubBookKey'], 
    queryFn: getBookClubBook
  });
  const bookClubBook: BookClubBookType = bookClubBookQuery.data;
  const isCreator: boolean = bookClubBook?.BookClubs!.creator === user.Profile.id ? true : false;
  const topic = bookClubBook?.topic;

  if (bookClubBookQuery.isError) {
    return (
      <Flex align="center" justify="center" minH="90vh">
        <Heading as="h1" size="xl">Error: {(bookClubBookQuery.error as Error).message}</Heading>
      </Flex>
    )
  }
  
  return (
    <>
      <Box className="main-content-smaller">
        <Breadcrumb 
          spacing='8px' 
          separator={<MdChevronRight color='gray.500' />}
          m=".5rem"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href='/bookclubs'>Book Clubs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/bookclubs/${bookClubBook?.book_club}`}>Book Club</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href='#'>Discussion</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Skeleton 
          isLoaded={!bookClubBookQuery.isLoading}
        >
          <Heading as="h1" className="visually-hidden">Book Club Discussion</Heading>
          <Stack flex="1 1 65%" maxW="100%" gap={1}>
            <Box className="well">

              <Box>
                <Flex 
                  w="100%"
                  direction="column"
                  align="center" 
                  justify="center"
                >
                  <Text fontWeight="bold" >{bookClubBook?.title}</Text>
                  {bookClubBook?.author}
                </Flex>
              </Box>

              <Divider my={2} />

              <Flex direction="column" gap={2}>
                <Flex align="center" justify="space-between">
                  <Heading as="h2" size="sm">Topic/Question</Heading>
                  {isCreator ? (
                    <Button 
                      variant="ghost"
                      onClick={e=>openEditQuestionModal()}
                      leftIcon={<HiOutlinePencil size={15} />}
                    >
                      Edit
                    </Button>
                  ) : null}
                </Flex>
                {topic && topic !== "<p><br></p>" ? (
                  <Box boxShadow="md">
                    <Box 
                      as={ReactQuill} 
                      theme="snow"
                      modules={{
                        toolbar: ''
                      }}
                      readOnly={true}
                      defaultValue={topic}
                      border="none"
                      sx={{
                        '.ql-container': {
                          borderRadius: '5px'
                        }
                      }}
                    />
                  </Box>
                ): null}
              </Flex>

            </Box>

            <Box className="well">
              <Heading as="h2" size="sm" mb={2}>Discussion</Heading>
              <BookClubGeneralComments
                server={server}
                bookClubId={null}
                bookClubBookId={paramsBookClubBookId!}
                subdomain={window.location.host.split(".")[0]}
                uri={window.location.pathname}
                isBookClubCreator={isCreator}
                type="bookClubBook"
              />
            </Box>
          </Stack>
        </Skeleton>
      </Box>
      <Modal isOpen={isOpenEditQuestionModal} onClose={closeEditQuestionModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Topic/Questions
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <ReactQuill 
                id="location" 
                theme="snow"
                modules={{
                  toolbar: [
                    [{ 'header': []}],
                    ['bold', 'italic', 'underline'],
                    [{'list': 'ordered'}, {'list': 'bullet'}],
                    ['link'],
                    [{'align': []}],
                    ['clean']
                  ]
                }}
                formats={[
                  'header','bold', 'italic', 'underline','list', 'bullet', 'align','link'
                ]}
                ref={topicRef}
                value={topic}
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={e=>updateTopic()}
            >
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

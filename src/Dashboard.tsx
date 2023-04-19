import React, { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardProps, Following_Following_self_profile_idToProfile, CurrentlyReading, CurrentlyReadingComment } from './types/types';
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Center,
  useDisclosure
} from "@chakra-ui/react";
import { BiDotsHorizontalRounded, BiTrash } from 'react-icons/bi';
import { BsReplyFill } from 'react-icons/bs';
import Comments from "./shared/CurrentlyReadingComments";
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

  const { 
    isOpen: isOpenCommentModal, 
    onOpen: onOpenCommentModal, 
    onClose: onCloseCommentModal 
  } = useDisclosure()

  const [commentBookData,setCommentBookData] = useState({} as any)
  function openCommentModal(e: any) {
    setCommentBookData(JSON.parse(e.target.dataset.book))
    onOpenCommentModal()
  }

  function closeCommentModal(){
    (commentRef.current as any).value = "";
    setCommentBookData(null)
    onCloseCommentModal()
  }

  const commentRef = useRef({} as HTMLTextAreaElement);
  const commentCurrentlyReadingButton = useRef({} as HTMLButtonElement)
  const commentCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: React.MouseEvent<HTMLButtonElement>)=>{
      const tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .post(server + "/api/commentcurrentlyreading",
            {
              profileId: parseInt((e.target as any).dataset.profileid),
              currentlyReadingId: parseInt((e.target as any).dataset.currentlyreadingid),
              libraryId: parseInt((e.target as any).dataset.libraryid),
              uri: window.location.pathname,
              comment: (commentRef.current as any).value
            },
            {
              headers: {
                Authorization: tokenCookie
              }
            }
          )
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.message)
          })
          return getDashboard();
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      getUser();
      queryClient.invalidateQueries({ queryKey: ["dashboardKey"] })
      queryClient.resetQueries({queryKey: ["dashboardKey"]})
      queryClient.setQueryData(["dashboardKey"],data)
      closeCommentModal()
    }
  })
  function commentCurrentlyReading(e: any) {
    commentCurrentlyReadingMutation.mutate(e as any)
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
    <>
      <Box className="main-content-smaller">
        <Skeleton isLoaded={!dashboard.isLoading}>
          {followingCurrentlyReadingSorted.map((reading: CurrentlyReading,i: number)=>{
              return (
                reading.hidden ? (
                  null
                ) : (
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
                      align="flex-start"
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
                        <Flex direction="column">
                          <Text fontWeight="bold">
                            {reading.Profile.User.first_name + " " + reading.Profile.User.last_name}
                          </Text>
                          <Text fontStyle="italic">
                            {dayjs(reading.created_on).local().format('MMM DD, hh:mm a')}
                          </Text>
                        </Flex>
                      </HStack>
                      <Box>
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
                              data-book={JSON.stringify(reading)}
                              onClick={e=>openCommentModal(e)}
                              fontWeight="bold"
                              icon={<BsReplyFill size={20} />}
                            >
                              Comment
                            </MenuItem>
                            {reading.Profile.id === user.Profile.id ? (
                              <MenuItem
                                color="tomato"
                                onClick={e=>deleteReading(reading.id)}
                                fontWeight="bold"
                                icon={<BiTrash size={20} />}
                              >
                                Delete
                              </MenuItem>
                            ): null}
                          </MenuList>
                        </Menu>
                      </Box>
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
                        <Center>
                          <Popover isLazy>
                            <PopoverTrigger>
                              <Button 
                                size="xs" 
                                variant="ghost" 
                                m={1}
                                h="auto"
                              >
                                ...
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <PopoverArrow />
                              <PopoverCloseButton />
                              <PopoverBody>
                                {reading.description}
                              </PopoverBody>
                            </PopoverContent>
                          </Popover>
                        </Center>
                      </Box>
                    </Flex>
                    <Divider my={3} />
                    {reading.CurrentlyReadingComment && reading.CurrentlyReadingComment.length ? (
                      <Comments comments={reading.CurrentlyReadingComment}/>
                    ): null}
                  </Box>
                )
              )
            })
          }
        </Skeleton>
      </Box>

      <Modal 
        isOpen={isOpenCommentModal} 
        onClose={closeCommentModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="80vh">
          <ModalHeader>
            Comment
          </ModalHeader>
          <ModalCloseButton />
            <ModalBody h="auto" maxH="75vh" overflow="auto">
              <Input
                type="text"
                ref={commentRef as any}
                onKeyUp={e=>e.key === 'Enter' ? commentCurrentlyReadingButton.current.click() : null}
              />
            </ModalBody>
            <ModalFooter flexDirection="column">
            <> 
              <Button
                colorScheme="green"
                data-profileid={commentBookData?.Profile?.id}
                data-libraryid={user.Library.id}
                data-currentlyreadingid={commentBookData?.id}
                ref={commentCurrentlyReadingButton}
                onClick={e=>commentCurrentlyReading(e)}
              >
                Submit
              </Button>
            </>
            </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, Key, ReactComponentElement } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileProps, HTMLInputEvent, ProfileType, Following_Following_following_profile_idToProfile } from '../types/types';
import { 
  Box,
  Heading,
  Avatar,
  AvatarGroup,
  Stack,
  HStack,
  Flex,
  Text,
  Image,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  Center,
  FormControl,
  FormLabel,
  Select,
  Badge,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
  Skeleton,
  Spinner,
  UnorderedList,
  ListItem,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  CloseButton,
  Divider,
  useDisclosure
} from "@chakra-ui/react";
import collectionToArray from "../utils/collectionToArray";
import { FiFile } from 'react-icons/fi';
import { MdEdit, MdOutlineChat } from 'react-icons/md';
import { BsPlusLg } from 'react-icons/bs';
import { BiDotsHorizontalRounded, BiTrash, BiHide } from 'react-icons/bi';
import { BsReplyFill } from 'react-icons/bs';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useAuth } from '../hooks/useAuth';
import { FollowProfileButton, CancelRequestButton, UnFollowProfileButton } from "./profileButtons";
import Comments from "../shared/CurrentlyReadingComments";
import { capitalizeLetters } from "../utils/capitalizeLetters";
import countryList from 'country-list';
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";

export const useProfile = ({server}: ProfileProps) => {
  const { user, getUser } = useAuth();
  const { paramsUsername } = useParams<{paramsUsername: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profileData: any = queryClient.getQueryData(["profileKey",paramsUsername])
  const countries = countryList.getNameList();
  dayjs.extend(utc)

  //self, nonFollower, requesting, follower
  const [ viewer, setViewer ] = useState("nonFollower");
  async function getProfile() {
    const tokenCookie = Cookies.get().token;
    if (tokenCookie) {
      const getProfileData = await axios
        .post(server + "/api/getprofile", 
        {
          profileUsername: paramsUsername
        },
        {headers: {
          Authorization: tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            const message = response.data.message;
            const responseProfileData = response.data.profileData;
            switch(message) {
              case "self":
                setViewer("self")
                break;
              case "nonFollower":
                setViewer("nonFollower")
                break;
              case "requesting":
                setViewer("requesting")
                break;
              case "following":
                setViewer("following")
                break;
              default:
                setViewer("nonFollower")
                break;
            }
            return responseProfileData;
          }
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.message)
      })
      return getProfileData;
    }
    else {
      throw new Error("TCP102")
    }
  }

  const [profileActionError,setProfileActionError] = useState<string>("")

  //User update stuff
  const profileUploadRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const imagePreviewRef = useRef<HTMLImageElement>({} as HTMLImageElement);
  const [previewImage,setPreviewImage] = useState("");
  const [profileImageFile,setProfileImageFile] = useState<Blob | string | ArrayBuffer | null>(null);
  function photoImageChange(e: HTMLInputEvent | any) {
    imagePreviewRef.current.style.display = "block";
    let targetFiles = e.target.files as FileList
    let previewImageFile = targetFiles[0];
    setPreviewImage(URL.createObjectURL(previewImageFile))
    let blob = previewImageFile.slice(0,previewImageFile.size,"image/png")
    let newFile = new File([blob], previewImageFile.name, {type: "image/png"})
    setProfileImageFile(newFile)
  }

  const profilePhotoMutation = useMutation({
    mutationFn: async () => {
      let tokenCookie = Cookies.get().token;
      const formData = new FormData();
      formData.append("photo", profileImageFile as Blob)

      if (tokenCookie) {
        await axios
          .post(server + "/api/updateprofilephoto", 
          formData,
          {headers: {
            'authorization': tokenCookie,
            'content-type': 'multipart/form-data'
          }}
          )
          .catch(({response})=>{
            if (axios.isCancel(response)) {
              console.log("successfully aborted")
            }
            console.log(response)
            throw new Error(response?.data?.message)
          })
      }
      else {
        throw new Error("Error: TC102")
      }
      return getProfile();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['profileKey'] })
      queryClient.resetQueries({queryKey: ['profileKey']})
      queryClient.setQueryData(["profileKey"],data)
      getUser();
      closeProfileDataModal();
    }
  })
  function updateUserProfilePhoto() {
    profilePhotoMutation.mutate();
  }
  function closeProfilePicModal() {
    profilePhotoMutation.reset();
    onCloseProfilePicModal();
  }

  const { 
    isOpen: isOpenProfileDataModal, 
    onOpen: onOpenProfileDataModal, 
    onClose: onCloseProfileDataModal 
  } = useDisclosure()

  function openProfileDataModal() {
    setProfileInterests(user.Profile.Interests ? (collectionToArray(user.Profile.Interests, "interest")) : [""])
    onOpenProfileDataModal()
  }
  const profileUserNameRef = useRef({} as HTMLInputElement);
  const profileAboutRef = useRef({} as HTMLInputElement);
  const countrySelectRef = useRef({} as HTMLSelectElement);
  const profileDataMutation = useMutation({
    mutationFn: async () => {
      let tokenCookie: string | null = Cookies.get().token;
      let navigateToNewUsernameOnReponse = false;
      if (paramsUsername !== profileUserNameRef.current.value) {
        navigateToNewUsernameOnReponse = true;
      }
      if (tokenCookie){
        await axios
        .post(server + "/api/updateprofiledata", 
        {
          username: profileUserNameRef.current.value,
          about: profileAboutRef.current.value,
          interests: profileInterests,
          country: countrySelectRef.current.value
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            if (navigateToNewUsernameOnReponse) {
              const newUsername = profileUserNameRef.current.value
              navigate("/profile/" + newUsername)
            }
            closeProfileDataModal();
          }
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.message);
        })
      }
      else {
        throw new Error("Please login again");
      }
      getUser();
      return getProfile()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['profileKey'] })
      queryClient.resetQueries({queryKey: ['profileKey']})
      queryClient.setQueryData(["profileKey"],data)
    }
  })
  function updateProfileData() {
    profileDataMutation.mutate();
  }
  function closeProfileDataModal() {
    profileDataMutation.reset();
    onCloseProfileDataModal()
  }

  //User edit modals
  const { 
    isOpen: isOpenProfilePicModal, 
    onOpen: onOpenProfilePicModal, 
    onClose: onCloseProfilePicModal 
  } = useDisclosure()

  const [userProfilePhoto,setUserProfilePhoto] = useState<string>("");
  useLayoutEffect(()=>{
    setUserProfilePhoto(`${user.Profile.profile_photo}?x=${new Date().getTime()}`)
  },[user.Profile])

  const interestsInputRef = useRef({} as HTMLInputElement);
  const [profileInterests,setProfileInterests] = useState<string[]>([]);

  function handleAddInterest() {
    if (interestsInputRef.current.value) {
      setProfileInterests([...profileInterests, interestsInputRef.current.value])
      interestsInputRef.current.value = "";
    }
  }

  function handleDeleteInterest(e: MouseEvent<HTMLButtonElement | MouseEvent>, index: number) {
  setProfileInterests(prev=>{
      return prev.filter((item,i)=> i != index)
    })
  }

  //Followers modal
  const { 
    isOpen: isOpenFollowersModal, 
    onOpen: onOpenFollowersModal, 
    onClose: onCloseFollowersModal 
  } = useDisclosure()
  const [followers,setFollowers] = useState<any[] | null>(null)
  function openFollowersModal() {
    if (profileData!.Following_Following_following_profile_idToProfile && profileData?.Following_Following_following_profile_idToProfile?.length) {
      setFollowers(profileData!.Following_Following_following_profile_idToProfile)
    }
    onOpenFollowersModal()
  }
  function closeFollowersModal(){
    setFollowers(null)
    onCloseFollowersModal()
  }

  //Following modal
  const { 
    isOpen: isOpenFollowingModal, 
    onOpen: onOpenFollowingModal, 
    onClose: onCloseFollowingModal 
  } = useDisclosure()
  const [following,setFollowing] = useState<any[] | null>(null)
  function openFollowingModal(e: any) {
    if (profileData!.Following_Following_self_profile_idToProfile && profileData?.Following_Following_self_profile_idToProfile?.length) {
      setFollowing(profileData!.Following_Following_self_profile_idToProfile)
    }
    onOpenFollowingModal()
  }
  function closeFollowingModal(){
    setFollowing(null)
    onCloseFollowingModal()
  }

  const { 
    isOpen: isOpenReadingModal, 
    onOpen: onOpenReadingModal, 
    onClose: onCloseReadingModal 
  } = useDisclosure()

  function closeReadingModal() {
    setBookResults(null)
    onCloseReadingModal();
  }

  const whatImReadingRef = useRef({} as HTMLInputElement);
  const [bookResults,setBookResults] = useState<any[] | null>(null);
  const [bookResultsLoading,setBookResultsLoading] = useState(false)
  async function searchBook() {
    setBookResultsLoading(true)
    await axios
      .get("https://www.googleapis.com/books/v1/volumes?q=" + whatImReadingRef.current.value)
      .then((response)=>{
        setBookResults(response.data.items)
        setBookResultsLoading(false)
        onOpenReadingModal();
      })
      .catch((error)=>{
        console.log(error)
      })
  }

  const [selectedBook,setSelectedBook] = useState<any | null>(null);
  function selectBook(e: React.FormEvent) {
    setSelectedBook(JSON.parse((e.target as HTMLDivElement).dataset.book!))
    whatImReadingRef.current.value = "";
    closeReadingModal();
  }

  const thoughtsRef = useRef({} as HTMLInputElement);
  const postCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: React.FormEvent)=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .post(server + "/api/currentlyreading",
        {
          image: (e.target as HTMLDivElement).dataset.image,
          title: (e.target as HTMLDivElement).dataset.title,
          author: (e.target as HTMLDivElement).dataset.author,
          description: (e.target as HTMLDivElement).dataset.description,
          thoughts: thoughtsRef.current.value
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .then((response)=>{
          setSelectedBook(null)
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      }
      else {
        throw new Error("Please login again")
      }
      return getProfile();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['profileKey'] })
      queryClient.resetQueries({queryKey: ['profileKey']})
      queryClient.setQueryData(["profileKey"],data)
    }
  })
  function postCurrentlyReading(e: React.FormEvent) {
    postCurrentlyReadingMutation.mutate(e);
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
          return getProfile();
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ["profileKey"] })
      queryClient.resetQueries({queryKey: ["profileKey"]})
      queryClient.setQueryData(["profileKey"],data)
    }
  })
  function deleteReading(readingId: number) {
    deleteReadingMutation.mutate(readingId)
  }

  const hideReadingMutation = useMutation({
    mutationFn: async (e: any)=>{
      const tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .put(server + "/api/hidecurrentlyreading",
            {
              readingId: parseInt(e.target.dataset.readingid),
              hide: e.target.dataset.hide
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
          return getProfile();
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ["profileKey"] })
      queryClient.resetQueries({queryKey: ["profileKey"]})
      queryClient.setQueryData(["profileKey"],data)
    }
  })
  function hideReading(e: HTMLElement) {
    hideReadingMutation.mutate(e)
  }

  const commentRef = useRef({} as HTMLTextAreaElement);
  const commentCurrentlyReadingButton = useRef({} as HTMLButtonElement)
  const commentCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: MouseEvent<HTMLButtonElement>)=>{
      const tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .post(server + "/api/commentcurrentlyreading",
            {
              profileId: parseInt((e.target as any).dataset.profileid),
              currentlyReadingId: parseInt((e.target as any).dataset.currentlyreadingid),
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
          return getProfile();
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ["profileKey"] })
      queryClient.resetQueries({queryKey: ["profileKey"]})
      queryClient.setQueryData(["profileKey"],data)
      closeCommentModal()
    }
  })
  function commentCurrentlyReading(e: any) {
    commentCurrentlyReadingMutation.mutate(e as any)
  }

  const removeFollowerMutation = useMutation({
    mutationFn: async (followerProfileId: number)=>{
      const tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .delete(server + "/api/removefollower",
            {
              headers: {
                Authorization: tokenCookie
              },
              data: {
                followerProfileId: followerProfileId
              }
            }
          )
          .then((response=>{
            closeFollowersModal()
            queryClient.invalidateQueries({ queryKey: ['profileKey',paramsUsername] })
            queryClient.resetQueries({queryKey: ['profileKey',paramsUsername]})
          }))
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.message)
          })
          return getProfile();
      }
      else {
        throw new Error("An error occurred")
      }
    },
    onSuccess: (data,variables)=>{
      queryClient.setQueryData(['profileKey',paramsUsername],data)
      openFollowersModal()
    }
  })
  function removeFollower(followerProfileId: number) {
    removeFollowerMutation.mutate(followerProfileId)
  }

  //User edit modals
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

  const likeUnlikeCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: React.FormEvent)=>{
      let tokenCookie: string | null = Cookies.get().token;
      let currentlyReading = parseInt((e.target as HTMLDivElement).dataset.currentlyreading!);
      if (tokenCookie) {
        await axios
        .post(server + "/api/likeunlikecurrentlyreading",
        {
          currentlyReading
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      }
      else {
        throw new Error("Please login again")
      }
      return getProfile();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['profileKey',paramsUsername] })
      queryClient.resetQueries({queryKey: ['profileKey',paramsUsername]})
      queryClient.setQueryData(['profileKey',paramsUsername],data)
    }
  })
  function likeUnlikeCurrentlyReading(e: React.FormEvent) {
    likeUnlikeCurrentlyReadingMutation.mutate(e);
  }

  function editCurrentlyReadingThoughts(bookId: number) {
    if (viewer === "self") {
      const currentlyReadingText = document.getElementById(`currently-reading-text-${bookId}`);
      const currentlyReadingInputDiv = document.getElementById(`currently-reading-input-div-${bookId}`);
      currentlyReadingText!.style.display = "none";
      currentlyReadingInputDiv!.style.display = "flex";
    }
  }
  function cancelEditCurrentlyReadingThoughts(bookId: number) {
    const currentlyReadingText = document.getElementById(`currently-reading-text-${bookId}`);
    const currentlyReadingInputDiv = document.getElementById(`currently-reading-input-div-${bookId}`);
    currentlyReadingText!.style.display = "block";
    currentlyReadingInputDiv!.style.display = "none";
  }
  const updateCurrentlyReadingThoughtsMutation = useMutation({
    mutationFn: async (bookId: number)=>{
      const currentlyReadingText = document.getElementById(`currently-reading-text-${bookId}`);
      const currentlyReadingInputDiv = document.getElementById(`currently-reading-input-div-${bookId}`);
      const currentlyReadingInput = document.getElementById(`currently-reading-input-${bookId}`);
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/updatecurrentlyreadingthoughts",
        {
          currentlyReadingId: bookId,
          thoughts: (currentlyReadingInput as HTMLInputElement)!.value
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .then((response)=>{
          currentlyReadingText!.style.display = "block";
          currentlyReadingInputDiv!.style.display = "none";
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.message)
        })
      }
      else {
        throw new Error("Please login again")
      }
      return getProfile();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['profileKey',paramsUsername] })
      queryClient.resetQueries({queryKey: ['profileKey',paramsUsername]})
      queryClient.setQueryData(['profileKey',paramsUsername],data)
    }
  })
  function updateCurrentlyReadingThoughts(bookId: number) {
    updateCurrentlyReadingThoughtsMutation.mutate(bookId)
  }

  return {user,navigate,viewer,profileActionError,setProfileActionError,profileUploadRef,profileImageFile,isOpenProfileDataModal,onOpenProfilePicModal,userProfilePhoto,openProfileDataModal,isOpenProfilePicModal,closeProfilePicModal,photoImageChange,previewImage,imagePreviewRef,onCloseProfileDataModal,profileUserNameRef,profileAboutRef,profileInterests,interestsInputRef,handleAddInterest,handleDeleteInterest,updateProfileData,getProfile,paramsUsername,profilePhotoMutation,updateUserProfilePhoto,closeProfileDataModal,profileDataMutation,whatImReadingRef,searchBook,bookResults,bookResultsLoading,closeReadingModal,isOpenReadingModal,onOpenReadingModal,selectBook,selectedBook,setSelectedBook,postCurrentlyReading,deleteReading,hideReading,commentCurrentlyReading,openCommentModal,closeCommentModal,isOpenCommentModal,commentBookData,commentRef,commentCurrentlyReadingButton,Comments,isOpenFollowersModal,openFollowersModal,closeFollowersModal,isOpenFollowingModal,openFollowingModal,closeFollowingModal,followers,following,removeFollower,removeFollowerMutation,likeUnlikeCurrentlyReading,countries,countrySelectRef,thoughtsRef,editCurrentlyReadingThoughts,cancelEditCurrentlyReadingThoughts,updateCurrentlyReadingThoughts,updateCurrentlyReadingThoughtsMutation};
}


export default function Profile({server}: ProfileProps) {
  const {user,navigate,viewer,profileActionError,setProfileActionError,profileUploadRef,isOpenProfileDataModal,onOpenProfilePicModal,userProfilePhoto,openProfileDataModal,isOpenProfilePicModal,closeProfilePicModal,photoImageChange,previewImage,imagePreviewRef,profileUserNameRef,profileAboutRef,profileInterests,interestsInputRef,handleAddInterest,handleDeleteInterest,updateProfileData,getProfile,paramsUsername,profilePhotoMutation,updateUserProfilePhoto,closeProfileDataModal,profileDataMutation,whatImReadingRef,searchBook,bookResults,bookResultsLoading,closeReadingModal,isOpenReadingModal,selectBook,selectedBook,setSelectedBook,postCurrentlyReading,deleteReading,hideReading,commentCurrentlyReading,openCommentModal,closeCommentModal,isOpenCommentModal,commentBookData,commentRef,commentCurrentlyReadingButton,Comments,isOpenFollowersModal,openFollowersModal,closeFollowersModal,isOpenFollowingModal,openFollowingModal,closeFollowingModal,followers,following,removeFollower,removeFollowerMutation,likeUnlikeCurrentlyReading,countries,countrySelectRef,thoughtsRef,editCurrentlyReadingThoughts,cancelEditCurrentlyReadingThoughts,updateCurrentlyReadingThoughts,updateCurrentlyReadingThoughtsMutation} = useProfile({server});

  

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['profileKey',paramsUsername], 
    queryFn: getProfile 
  });
  const profileData: ProfileType = data;
  let Flag: any | null = null;
  if (profileData?.country) {
    Flag = (countryFlagIconsReact as any)[profileData?.country];
  }
  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="80vh">
        <Spinner size="xl"/>
      </Flex>
    )
  }
  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }
  
  return (
    <Box className="main-content">
      <Skeleton isLoaded={!isLoading}>
        {profileData ? (
        <>
          <Flex flexWrap="wrap" gap={2} w="100%" align="start" justify="space-between">

            <Stack flex="1 1 30%" gap={1}>
              <Center
                flexDirection="column"
                className="profile-card"
                rounded={'lg'}
                textAlign={'center'}
                boxShadow="base"
              >
                <Avatar
                  mb={4}
                  onClick={e=> viewer === "self" ? onOpenProfilePicModal() : e.preventDefault()} 
                  size="xl"
                  cursor={viewer === "self" ? "pointer": "default"}
                  src={viewer === "self" ? (userProfilePhoto ? userProfilePhoto : "") : profileData.profile_photo ? profileData.profile_photo : ""}
                  border="2px solid gray"
                />
                <Heading fontSize={'3xl'}>
                  {`${profileData.User?.first_name} ${profileData.User?.last_name}`}
                </Heading>
                <Flex align="center" wrap="nowrap" gap={2} mb={4}>
                  {profileData?.country ? (
                    <Box w="1.4rem">
                      <Flag alt={profileData.country} title={profileData.country}/>
                    </Box>
                  ):null}
                  <Text fontWeight={600} color={'gray.500'}>
                    {`@${profileData.username}`}
                  </Text>
                </Flex>
                {profileData?.about ? (
                  <Text
                    textAlign={'center'}
                    color='gray.700'
                    px={3}
                    mb={4}
                    _dark={{
                      color: 'gray.400'
                    }}
                  >
                    {profileData.about}
                  </Text>
                ): null}

                {profileData.Interests && profileData.Interests.length ? (
                <HStack align={'center'} justify={'center'} px={3} mb={4} flexWrap="wrap">
                  {collectionToArray(profileData.Interests, "interest").map((interest, i)=>{
                    if (i === 5) {
                      return <Text key={i}>...</Text>
                    }
                    else if (i > 5 ) {
                      return;
                    }
                    else {
                      return (
                        <Badge
                          key={i}
                          px={1}
                          py={0}
                          m={1}
                          size="sm"
                          bg='gray.200'
                          rounded="md"
                          fontWeight={'400'}
                          _dark={{
                            bg: 'gray.600',
                            color: 'white'
                          }}
                        >
                          {`#${interest}`}
                        </Badge>
                      )}
                    }) 
                  }
                </HStack>
                ) : null}

                <Stack mb={4}>
                  <Flex justify="space-between" gap={3} flexWrap="wrap">
                    <Box flex="1">
                      <Heading as="h5" size="sm" whiteSpace="nowrap">
                        {profileData.Following_Following_following_profile_idToProfile?.length} followers
                      </Heading>
                      <Flex justify="center">
                        <AvatarGroup 
                          size="sm" 
                          max={4} 
                          mt={1}
                          onClick={openFollowersModal}
                        >
                        {profileData.Following_Following_following_profile_idToProfile?.length ? (
                          profileData.Following_Following_following_profile_idToProfile?.map((follower,i)=>{
                            return (
                              <Avatar 
                                key={i}
                                src={follower.Profile_Following_self_profile_idToProfile?.profile_photo}
                                title={follower.Profile_Following_self_profile_idToProfile?.username}
                                cursor="pointer"
                              />
                            )
                          })
                        ): null}
                        </AvatarGroup>
                      </Flex>
                    </Box>
                    <Box flex="1">
                      <Heading as="h5" size="sm" whiteSpace="nowrap">
                        {profileData.Following_Following_self_profile_idToProfile?.length} following
                      </Heading>
                      <Flex justify="center">
                        <AvatarGroup 
                          size="sm" 
                          max={4} 
                          mt={1}
                          onClick={openFollowingModal}
                        >
                        {profileData.Following_Following_self_profile_idToProfile?.length ? (
                          profileData.Following_Following_self_profile_idToProfile?.map((follower,i)=>{
                            return (
                              <Avatar 
                                key={i}
                                src={follower.Profile_Following_following_profile_idToProfile?.profile_photo}
                                title={follower.Profile_Following_following_profile_idToProfile?.username}
                                cursor="pointer"
                              />
                            )
                          })
                        ): null}
                        </AvatarGroup>
                      </Flex>
                    </Box>
                  </Flex>
                </Stack>

                <Box>
                  {viewer === "self" ? (
                    <Button leftIcon={<MdEdit/>} onClick={openProfileDataModal}>
                      Edit
                    </Button>
                    ) : (
                    viewer === "nonFollower" ? (
                    <FollowProfileButton server={server} profileId={profileData.id} setProfileActionError={setProfileActionError} /> 
                    ) : (
                      viewer === "requesting" ? (
                        <CancelRequestButton server={server} profileId={profileData.id} setProfileActionError={setProfileActionError} />
                      ) : (
                        viewer === "following" ? (
                          profileData.User.role === "admin" ? null : (
                            <UnFollowProfileButton server={server} profileId={profileData.id} setProfileActionError={setProfileActionError} />
                          )
                        ) : null
                      )
                    ) 
                  )}
                </Box>
                <Text color="red" pt={2}>{profileActionError}</Text>
              </Center>

              <Box className="well">
                {viewer === "following" || viewer === "self" ? (
                  <>
                    <Heading as="h2" size="md">{profileData?.User.first_name}'s Book Clubs</Heading>
                    <UnorderedList my={1}>
                      {profileData.BookClubs.length ? profileData.BookClubs.map((bookClub,i)=>{
                        return (
                          <ListItem key={i}>
                            <Link
                              to={`/bookclubs/${bookClub.id}`}
                            >
                              {bookClub.name}
                            </Link>
                          </ListItem>
                        )
                      }) : (
                        <i>No book clubs yet</i>
                      )}
                    </UnorderedList>
                  </>
                ) : (
                  <Text fontStyle="italic">Follow to see more</Text>
                )}
              </Box>
            </Stack>

            <Stack flex="1 1 65%" gap={1}>

              <Box className="well">
                {viewer === "self" ? (
                  <>
                    <Heading as="h3" size="md" mb={2}>
                      What I'm Reading
                    </Heading>
                    <Flex gap={2} align="center">
                      <Input 
                        type="text" 
                        placeholder="What i'm reading"
                        variant="ghost"
                        bg="white" 
                        _dark={{
                          bg: "blackAlpha.400"
                        }}
                        ref={whatImReadingRef}
                        onKeyDown={e=>e.key === 'Enter' ? searchBook() : null}
                      />
                      <Button onClick={searchBook}>Search</Button>
                    </Flex>
                    {selectedBook ? (
                      <Box
                        className="well-card"
                        position="relative"
                      >
                        <CloseButton
                          position="absolute"
                          top="0"
                          right="0"
                          onClick={e=>setSelectedBook(null)}
                        />
                        <Input
                          type="text"
                          mt={3}
                          mb={2}
                          placeholder="Thoughts?"
                          maxLength={300}
                          ref={thoughtsRef}
                        />
                        <Flex>
                          <Image 
                            src={selectedBook.volumeInfo.imageLinks?.smallThumbnail}
                            maxH="125px"
                          />
                          <Box 
                            mx={2}
                          >
                            <Heading as="h5" size="sm" me={3}>
                              {selectedBook.volumeInfo.title}
                            </Heading>
                            <Text>
                              {selectedBook.volumeInfo.authors ? selectedBook.volumeInfo.authors[0] : null}
                            </Text>
                            <Popover isLazy>
                              <PopoverTrigger>
                                <Text
                                  noOfLines={2}
                                  cursor="pointer"
                                >
                                  {selectedBook.volumeInfo.description ? selectedBook.volumeInfo.description : null}
                                </Text>
                              </PopoverTrigger>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody>
                                  {selectedBook.volumeInfo.description ? selectedBook.volumeInfo.description: null}
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <Flex justify="flex-end">
                              <Button 
                                size="sm"
                                data-image={selectedBook.volumeInfo.imageLinks?.smallThumbnail}
                                data-title={selectedBook.volumeInfo.title}
                                data-author={selectedBook.volumeInfo.authors ? selectedBook.volumeInfo.authors[0] : null}
                                data-description={selectedBook.volumeInfo.description ? selectedBook.volumeInfo.description : null}
                                onClick={e=>postCurrentlyReading(e)}
                              >
                                Post
                              </Button>
                            </Flex>
                          </Box>
                        </Flex>
                      </Box>
                    ) : null}

                    {profileData?.CurrentlyReading?.length ? (
                      <Box
                        my={2}
                        className="well-card"
                        position="relative"
                      >
                        <Box
                          position="absolute"
                          top={2}
                          right={0}
                        >
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
                                data-book={JSON.stringify(profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1])}
                                onClick={e=>openCommentModal(e)}
                                fontWeight="bold"
                                icon={<BsReplyFill size={20} />}
                              >
                                Comment
                              </MenuItem>
                              <MenuItem 
                                onClick={e=>navigate(`/chat/room?title=${profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].title}&author=${profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].author}`)}
                                fontWeight="bold"
                                icon={<MdOutlineChat size={20} />}
                              >
                                Chat Room
                              </MenuItem>
                              {viewer === "self" ? (
                              <>
                                <MenuItem
                                  data-readingid={profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id}
                                  data-hide={profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].hidden ? false : true}
                                  onClick={e=>hideReading(e as any)}
                                  fontWeight="bold"
                                  icon={<BiHide size={20} />}
                                >
                                  {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].hidden ? "Unhide" : "Hide"}
                                </MenuItem>
                                <MenuItem
                                  color="tomato"
                                  onClick={e=>deleteReading(profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id)}
                                  fontWeight="bold"
                                  icon={<BiTrash size={20} />}
                                >
                                  Delete
                                </MenuItem>
                              </>
                              ): null}
                            </MenuList>
                          </Menu>
                        </Box>
                        <Text 
                          my={2}
                          rounded="md"
                          p={1}
                          _hover={{
                            cursor: viewer === "self" ? "pointer" : "default",
                            backgroundColor: viewer === "self" ? "gray" : "unset"
                          }}
                          id={`currently-reading-text-${profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id}`}
                          onClick={e=>editCurrentlyReadingThoughts(profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id)}
                        >
                          {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].thoughts ? profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].thoughts : null}
                        </Text>
                        <Flex 
                          align="center" 
                          gap={1}
                          display="none"
                          id={`currently-reading-input-div-${profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id}`}
                        >
                          <Input
                            my={2}
                            type="text"
                            defaultValue={profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].thoughts ? profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].thoughts : ""}
                            id={`currently-reading-input-${profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id}`}
                          />
                          <Button
                            onClick={e=>updateCurrentlyReadingThoughts(profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id)}
                            disabled={updateCurrentlyReadingThoughtsMutation.isLoading}
                          >
                            Update
                          </Button>
                          <Button
                            onClick={e=>cancelEditCurrentlyReadingThoughts(profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id)}
                          >
                            Cancel
                          </Button>
                        </Flex>
                        <Flex>
                          <Image 
                            src={
                              profileData
                              .CurrentlyReading[profileData.CurrentlyReading.length - 1]
                              .image
                            }
                            maxH="125px"
                          />
                          <Box mx={2}>
                            <Flex justify="space-between">
                              <Text>
                                {
                                  dayjs(profileData
                                    .CurrentlyReading[profileData.CurrentlyReading.length - 1]
                                    .created_on).local().format('MMM DD, h:mm a')
                                }
                              </Text>
                              <Text>
                                {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].hidden ? <i>hidden</i> : ""}
                              </Text>
                            </Flex>
                            <Heading as="h5" size="sm" me={3}>
                              {
                                profileData
                                .CurrentlyReading[profileData.CurrentlyReading.length - 1]
                                .title
                              }
                            </Heading>
                            <Text>
                              {
                              
                              profileData
                              .CurrentlyReading[profileData.CurrentlyReading.length - 1]
                              .author
                              }
                            </Text>
                            <Popover isLazy>
                              <PopoverTrigger>
                                <Text
                                  noOfLines={2}
                                  cursor="pointer"
                                >
                                  {
                                    profileData
                                    .CurrentlyReading[profileData.CurrentlyReading.length - 1]
                                    .description
                                  }
                                </Text>
                              </PopoverTrigger>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody>
                                  {
                                    profileData
                                    .CurrentlyReading[profileData.CurrentlyReading.length - 1]
                                    .description
                                  }
                                </PopoverBody>
                              </PopoverContent>
                            </Popover>
                            <Flex justify="flex-end">
                              <Flex align="center" gap={0}>
                                <Button 
                                  px={0}
                                  pb={0.5}
                                  size="xs"
                                  variant="ghost"
                                  data-currentlyreading={profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id}
                                  onClick={e=>likeUnlikeCurrentlyReading(e)}
                                >
                                  {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.filter((like)=>like.profile===user.Profile.id).length ? <AiFillHeart color="red" pointerEvents="none" size={20} /> : <AiOutlineHeart pointerEvents="none" size={20} />}
                                </Button>
                                {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.length ? (
                                  <Popover isLazy size="sm">
                                    <PopoverTrigger>
                                      <Text
                                        cursor="pointer"
                                      >
                                        {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.length ? profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike.length.toString() : "0"}
                                      </Text>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                      <PopoverArrow />
                                      <PopoverCloseButton />
                                      <PopoverBody>
                                        {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.length ? (
                                          profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.map((like,i)=>{
                                            return (
                                              <Box mb={1} key={i}>
                                                <Link 
                                                  key={i}
                                                  to={`/profile/${like.Profile.username}`}
                                                >
                                                  {like.Profile.username}
                                                </Link>
                                              </Box>
                                            )
                                          })
                                        ) : null}
                                      </PopoverBody>
                                    </PopoverContent>
                                  </Popover>
                                ) : (
                                  <Text
                                    cursor="pointer"
                                  >
                                    {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.length ? profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike.length.toString() : "0"}
                                  </Text>
                                )}
                              </Flex>
                            </Flex>
                          </Box>
                        </Flex>
                        <Divider my={3} />
                        {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingComment ? (
                            <Comments 
                              comments={profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingComment} 
                              getProfile={getProfile} 
                              location="profile"
                              server={server}
                            />
                        ): null}
                      </Box>
                    ) : null}
                  </>
                ) : (
                  <>
                  {viewer === "following" ? (
                    profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1]?.hidden ? (
                      null
                    ) : (
                      <>
                        <Heading as="h3" size="md" mb={2}>
                          Currently Reading
                        </Heading>
                        {profileData?.CurrentlyReading?.length ? (
                          <Box
                            my={2}
                            className="well-card"
                            position="relative"
                          >
                            <Box
                              position="absolute"
                              top={2}
                              right={0}
                            >
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
                                    data-book={JSON.stringify(profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1])}
                                    onClick={e=>openCommentModal(e)}
                                    fontWeight="bold"
                                    icon={<BsReplyFill size={20} />}
                                  >
                                    Comment
                                  </MenuItem>
                                  <MenuItem 
                                    onClick={e=>navigate(`/chat/room?title=${profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].title}&author=${profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].author}`)}
                                    fontWeight="bold"
                                    icon={<MdOutlineChat size={20} />}
                                  >
                                    Chat Room
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </Box>
                            <Text 
                              my={2}
                              rounded="md"
                              p={1}
                            >
                              {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].thoughts ? profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].thoughts : null}
                            </Text>
                            <Flex>
                              <Image 
                                src={
                                  profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].image
                                }
                                maxH="125px"
                              />
                              <Box mx={2}>
                                <Text>
                                  {
                                    dayjs(profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1]
                                      .created_on)
                                      .local()
                                      .format('MMM DD, m a')
                                  }
                                </Text>
                                <Heading as="h5" size="sm" me={3}>
                                  {
                                    profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1]
                                    .title
                                  }
                                </Heading>
                                <Text>
                                  {
                                    profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1]
                                    .author
                                  }
                                </Text>
                                <Popover isLazy>
                                  <PopoverTrigger>
                                    <Text
                                      noOfLines={2}
                                      cursor="pointer"
                                    >
                                      {
                                        profileData
                                        .CurrentlyReading[0]
                                        .description
                                      }
                                    </Text>
                                  </PopoverTrigger>
                                  <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody>
                                      {
                                        profileData
                                        .CurrentlyReading[0]
                                        .description
                                      }
                                    </PopoverBody>
                                  </PopoverContent>
                                </Popover>
                                <Flex justify="flex-end">
                                  <Flex align="center" gap={0}>
                                    <Button 
                                      px={0}
                                      pb={0.5}
                                      size="xs"
                                      variant="ghost"
                                      data-currentlyreading={profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].id}
                                      onClick={e=>likeUnlikeCurrentlyReading(e)}
                                    >
                                      {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.filter((like)=>like.profile===user.Profile.id).length ? <AiFillHeart color="red" pointerEvents="none" size={20} /> : <AiOutlineHeart pointerEvents="none" size={20} />}
                                    </Button>
                                    {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.length ? (
                                      <Popover isLazy size="sm">
                                        <PopoverTrigger>
                                          <Text
                                            cursor="pointer"
                                          >
                                            {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.length ? profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike.length.toString() : "0"}
                                          </Text>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                          <PopoverArrow />
                                          <PopoverCloseButton />
                                          <PopoverBody>
                                            {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.length ? (
                                              profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.map((like,i)=>{
                                                return (
                                                  <Box mb={1} key={i}>
                                                    <Link 
                                                      key={i}
                                                      to={`/profile/${like.Profile.username}`}
                                                    >
                                                      {like.Profile.username}
                                                    </Link>
                                                  </Box>
                                                )
                                              })
                                            ) : null}
                                          </PopoverBody>
                                        </PopoverContent>
                                      </Popover>
                                    ) : (
                                      <Text
                                        cursor="pointer"
                                      >
                                        {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike?.length ? profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingLike.length.toString() : "0"}
                                      </Text>
                                    )}
                                  </Flex>
                                </Flex>
                              </Box>
                            </Flex>
                            {profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingComment ? (
                              <Comments 
                                comments={profileData.CurrentlyReading[profileData.CurrentlyReading.length - 1].CurrentlyReadingComment} 
                                getProfile={getProfile} 
                                location="profile"
                                server={server}
                              />
                          ): null}
                          </Box>
                        ) : null}
                      </>
                    )
                  ): (
                    <i>Follow to see more</i>
                  )}
                    
                  </>
                )}
              </Box>

              {viewer === "following" || viewer === "self" ? (
                <Box 
                  className="well" 
                >
                  <Heading as="h3" size="md" mb={2}>
                    Books I've Read
                  </Heading>
                  <>
                    {profileData?.CurrentlyReading?.length ? (
                      profileData.CurrentlyReading.map((readBook,i)=>{
                        return (
                          viewer !== "self" && readBook.hidden ? (
                            null
                          ) : (
                            i !== profileData.CurrentlyReading.length - 1 ? (
                              <Box 
                                key={i}
                                my={2}
                                className="well-card"
                                position="relative"
                              >
                                <Box
                                  position="absolute"
                                  top={2}
                                  right={0}
                                >
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
                                        data-book={JSON.stringify(readBook)}
                                        onClick={e=>openCommentModal(e)}
                                        fontWeight="bold"
                                        icon={<BsReplyFill size={20} />}
                                      >
                                        Comment
                                      </MenuItem>
                                      <MenuItem 
                                        onClick={e=>navigate(`/chat/room?title=${readBook.title}&author=${readBook.author}`)}
                                        fontWeight="bold"
                                        icon={<MdOutlineChat size={20} />}
                                      >
                                        Chat Room
                                      </MenuItem>
                                      {viewer === "self" ? (
                                      <>
                                        <MenuItem
                                          data-readingid={readBook.id}
                                          data-hide={readBook.hidden ? false : true}
                                          onClick={e=>hideReading(e as any)}
                                          fontWeight="bold"
                                          icon={<BiHide size={20} />}
                                        >
                                          {readBook.hidden ? "Unhide" : "Hide"}
                                        </MenuItem>
                                        <MenuItem
                                          color="tomato"
                                          onClick={e=>deleteReading(readBook.id)}
                                          fontWeight="bold"
                                          icon={<BiTrash size={20} />}
                                        >
                                          Delete
                                        </MenuItem>
                                      </>
                                      ): null}
                                    </MenuList>
                                  </Menu>
                              </Box>
                                <Text 
                                  my={2}
                                  rounded="md"
                                  p={1}
                                  _hover={{
                                    cursor: viewer === "self" ? "pointer" : "default",
                                    backgroundColor: viewer === "self" ? "gray" : "unset"
                                  }}
                                  id={`currently-reading-text-${readBook.id}`}
                                  onClick={e=>editCurrentlyReadingThoughts(readBook.id)}
                                >
                                  {readBook.thoughts ? readBook.thoughts : null}
                                </Text>
                                <Flex 
                                  align="center" 
                                  gap={1}
                                  display="none"
                                  id={`currently-reading-input-div-${readBook.id}`}
                                >
                                  <Input
                                    my={2}
                                    type="text"
                                    defaultValue={readBook.thoughts ? readBook.thoughts : ""}
                                    id={`currently-reading-input-${readBook.id}`}
                                  />
                                  <Button
                                    onClick={e=>updateCurrentlyReadingThoughts(readBook.id)}
                                    disabled={updateCurrentlyReadingThoughtsMutation.isLoading}
                                  >
                                    Update
                                  </Button>
                                  <Button
                                    onClick={e=>cancelEditCurrentlyReadingThoughts(readBook.id)}
                                  >
                                    Cancel
                                  </Button>
                                </Flex>
                                <Flex>
                                  <Image 
                                    src={readBook.image}
                                    maxH="125px"
                                  />
                                  <Box mx={2} w="100%">
                                    <Flex justify="space-between">
                                      <Text>
                                        {dayjs(readBook.created_on).local().format('MMM DD, h:mm a')}
                                      </Text>
                                      <Text>
                                        {viewer === "self" && readBook.hidden ? <i>hidden</i> : ""}
                                      </Text>
                                    </Flex>
                                    <Heading as="h5" size="sm" me={3}>
                                      {readBook.title}
                                    </Heading>
                                    <Text>{readBook.author}</Text>
                                    <Popover isLazy>
                                      <PopoverTrigger>
                                        <Text
                                          noOfLines={2}
                                          cursor="pointer"
                                        >
                                          {readBook.description}
                                        </Text>
                                      </PopoverTrigger>
                                      <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody>
                                          {readBook.description}
                                        </PopoverBody>
                                      </PopoverContent>
                                    </Popover>
                                    <Flex justify="flex-end">
                                      <Flex align="center" gap={0}>
                                        <Button 
                                          px={0}
                                          pb={0.5}
                                          size="xs"
                                          variant="ghost"
                                          data-currentlyreading={readBook.id}
                                          onClick={e=>likeUnlikeCurrentlyReading(e)}
                                        >
                                          {readBook.CurrentlyReadingLike?.filter((like)=>like.profile===user.Profile.id).length ? <AiFillHeart color="red" pointerEvents="none" size={20} /> : <AiOutlineHeart pointerEvents="none" size={20} />}
                                        </Button>
                                        {readBook.CurrentlyReadingLike?.length ? (
                                          <Popover isLazy size="sm">
                                            <PopoverTrigger>
                                              <Text
                                                cursor="pointer"
                                              >
                                                {readBook.CurrentlyReadingLike?.length ? readBook.CurrentlyReadingLike.length.toString() : "0"}
                                              </Text>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                              <PopoverArrow />
                                              <PopoverCloseButton />
                                              <PopoverBody>
                                                {readBook.CurrentlyReadingLike?.length ? (
                                                  readBook.CurrentlyReadingLike?.map((like,i)=>{
                                                    return (
                                                      <Box mb={1} key={i}>
                                                        <Link 
                                                          key={i}
                                                          to={`/profile/${like.Profile.username}`}
                                                        >
                                                          {like.Profile.username}
                                                        </Link>
                                                      </Box>
                                                    )
                                                  })
                                                ) : null}
                                              </PopoverBody>
                                            </PopoverContent>
                                          </Popover>
                                        ) : (
                                          <Text
                                            cursor="pointer"
                                          >
                                            {readBook.CurrentlyReadingLike?.length ? readBook.CurrentlyReadingLike.length.toString() : "0"}
                                          </Text>
                                        )}
                                      </Flex>
                                    </Flex>
                                  </Box>
                                </Flex>
                                <Divider my={3} />
                                {readBook.CurrentlyReadingComment ? (
                                    <Comments 
                                      comments={readBook.CurrentlyReadingComment} 
                                      getProfile={getProfile} 
                                      location="profile"
                                      server={server}
                                    />
                                ): null}
                              </Box>
                            ) : null
                          )
                        )
                      }).reverse()
                    ) : null}
                  </>
                </Box>
              ): null}
              

            </Stack>

          </Flex>

          {viewer === "self" && (
          <>
            <Modal isOpen={isOpenProfilePicModal} onClose={closeProfilePicModal}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading as="h3" size="lg">
                    Change Profile Photo
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Input 
                    type="file" 
                    accept="image/png, image/jpeg"
                    ref={profileUploadRef}
                    isRequired={true} 
                    display="none"
                    onChange={e=>photoImageChange(e)}
                  />
                  <Flex 
                    justify="center" 
                    mt={5} 
                    border="2px solid gray"
                    _hover={{
                      cursor: "pointer"
                    }}
                    onClick={()=>profileUploadRef.current.click()}
                  >
                    {previewImage || userProfilePhoto ? (
                    <Image 
                      src={previewImage || userProfilePhoto ? (previewImage ? previewImage : userProfilePhoto) : ""} 
                      objectFit="cover"
                      boxSize="100%" 
                      ref={imagePreviewRef}
                      p={5}
                      maxW="80%"
                    />
                    ) : (
                    <Box p="15%">
                    <Icon as={FiFile} />
                    </Box>
                    )}
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <>
                      {profilePhotoMutation.error && (
                        <Text color="red">
                          {(profilePhotoMutation.error as Error).message}
                        </Text>
                      )}
                      <Button variant='ghost' mr={3} onClick={updateUserProfilePhoto}  size="lg">
                        Save
                      </Button>
                    </>
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal isOpen={isOpenProfileDataModal} onClose={closeProfileDataModal}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading as="h3" size="lg">
                    Update Profile
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mt="5%">
                    <FormLabel htmlFor="userName">Username</FormLabel>
                    <Input 
                      type="text" 
                      id="userName"
                      ref={profileUserNameRef}
                      defaultValue={user.Profile.username}
                      maxLength={15}
                      size="lg"
                    />
                  </FormControl>
                  <FormControl mt="5%">
                    <FormLabel htmlFor="about">About</FormLabel>
                    <Input 
                      type="text" 
                      id="about"
                      ref={profileAboutRef}
                      defaultValue={user.Profile.about}
                      size="lg"
                    />
                  </FormControl>
                  <FormControl mt="5%">
                    <FormLabel htmlFor="country">Country</FormLabel>
                    <Select
                      id="country"
                      placeholder="Select"
                      ref={countrySelectRef}
                      defaultValue={user.Profile.country}
                    >
                      <option
                        value="US"
                      >
                        United States of America
                      </option>
                      {Object.entries(countries)
                        .filter((country)=>country[1] !== "US")
                        .map((country,i)=>{
                          return (
                            <option
                              value={country[1]}
                              key={i}
                            >
                              {capitalizeLetters(country[0])}
                            </option>
                          )
                      })}
                    </Select>
                  </FormControl>
                  <FormControl mt="5%">
                    <FormLabel htmlFor="interests">Interests</FormLabel>
                    <HStack>
                      <Input 
                        type="text" 
                        id="interests"
                        ref={interestsInputRef}
                        size="lg"
                        maxLength={15}
                        onKeyDown={e=>e.key==='Enter' ? handleAddInterest() : null}
                      />
                      <Button
                        onClick={e=> handleAddInterest()}
                        variant="ghost"
                        px={0}
                        size="lg"
                      >
                        <BsPlusLg/>
                      </Button>
                    </HStack>
                  </FormControl>
                  <Flex
                    gap={1}
                    maxW="100%"
                    flexWrap="wrap"
                    alignItems="center"
                    justify="flex-start"
                    my={4}
                  >
                    {profileInterests.length ? (
                      profileInterests.map((interest,i)=>{
                        return (
                          <Tag 
                            key={i}
                            borderRadius="full"
                            size="md"
                            variant="outline"
                            // colorScheme="black"
                          >
                            <TagLabel
                              _hover={{
                                cursor: "default"
                              }}
                            >
                              {interest}
                            </TagLabel>
                            <TagCloseButton
                              data-tagname={interest}
                              color="red"
                              onClick={e=>handleDeleteInterest(e,i)}
                              _hover={{
                                bg: "lightgray"
                              }}
                            />
                          </Tag>
                        )
                      })
                    ): null}
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <>
                    {profileDataMutation.error && (
                      <Text color="red">
                        {(profileDataMutation.error as Error).message}
                      </Text>
                    )}
                    <Button mr={3} onClick={updateProfileData} size="lg">
                      Save
                    </Button>
                    </>
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal 
              isOpen={isOpenReadingModal} 
              onClose={closeReadingModal}
              isCentered
            >
              <ModalOverlay />
              <ModalContent maxH="80vh">
                <ModalHeader>
                  New Book Club Book
                </ModalHeader>
                <ModalCloseButton />
                  <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
                    <Stack gap={2} position="relative">
                      {bookResultsLoading ? (
                        <Center>
                          <Spinner size="xl"/>
                        </Center>
                      ) : (
                        <Flex gap={1} align="center" justify="space-between" flexWrap="wrap">
                          {bookResults ? bookResults.map((book,i)=>{
                            return (
                              <Flex
                                m={3}
                                p={2}
                                maxW="165px"
                                direction="column"
                                align="center"
                                rounded="md"
                                bg="white"
                                _dark={{
                                  bg: "gray.600"
                                }}
                                key={i}
                              >
                                <Box
                                  pointerEvents="none"
                                >
                                  <Image
                                    maxW="100%" 
                                    w="100%"
                                    h="auto"
                                    pt={2} 
                                    mb={1}
                                    className="book-image"
                                    onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                                    src={book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.smallThumbnail : "https://via.placeholder.com/165x215"}
                                    alt="book image"
                                  />
                                  <Heading
                                    as="h4"
                                    size="sm"
                                  >
                                    {book.volumeInfo.title}
                                  </Heading>
                                  <Text>
                                    {book.volumeInfo.authors ? book.volumeInfo.authors[0] : null}
                                  </Text>
                                </Box>
                                <Flex align="center" justify="space-between">
                                  <Popover isLazy>
                                    <PopoverTrigger>
                                      <Button size="xs" m={2}>Description</Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                      <PopoverArrow />
                                      <PopoverCloseButton />
                                      <PopoverBody>{book.volumeInfo.description}</PopoverBody>
                                    </PopoverContent>
                                  </Popover>
                                  <Button 
                                    size="xs"
                                    data-book={JSON.stringify(book)}
                                    onClick={e=>selectBook(e)}
                                    colorScheme="green"
                                  >
                                    Set
                                  </Button>
                                </Flex>
                              </Flex>
                            )
                          }) : null}
                        </Flex>
                      )}
                    </Stack>
                  </ModalBody>
                  <ModalFooter flexDirection="column">
                  <> 
                    {/* {selectBookMutation.error && (
                        <Text color="red">{(selectBookMutation.error as Error).message}</Text>
                      )
                    } */}
                  </>
                  </ModalFooter>
              </ModalContent>
            </Modal>
          </>
          )}
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
                    data-profileid={profileData.id}
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
          
          <Modal 
            isOpen={isOpenFollowersModal} 
            onClose={closeFollowersModal}
            isCentered
          >
            <ModalOverlay />
            <ModalContent maxH="80vh">
              <ModalHeader>
                Followers
              </ModalHeader>
              <ModalCloseButton />
                <ModalBody h="auto" maxH="75vh" overflow="auto">
                  {followers ? (
                    followers.map((f,i: number)=>{
                      return (
                        <Flex
                          key={f.id}
                          align="center"
                          mb={2}
                          wrap="wrap"
                          justify="space-between"
                        >
                          <Flex 
                            align="center"
                            gap={2}
                            onClick={e=>{
                              closeFollowersModal()
                              navigate(`/profile/${f.Profile_Following_self_profile_idToProfile!.username}`)
                            }}
                            cursor="pointer"
                          >
                            <Avatar
                              size="sm"
                              src={f.Profile_Following_self_profile_idToProfile!.profile_photo}
                              border="2px solid gray"
                            />
                            <Text>
                              @{f.Profile_Following_self_profile_idToProfile!.username}
                            </Text>
                          </Flex>
                          {viewer === "self" ? (
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={e=>removeFollower(f.Profile_Following_self_profile_idToProfile!.id)}
                              isLoading={removeFollowerMutation.isLoading}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </Flex>
                      )
                    })
                  ): null}
                </ModalBody>
                <ModalFooter flexDirection="column">
                </ModalFooter>
            </ModalContent>
          </Modal>

          <Modal 
            isOpen={isOpenFollowingModal} 
            onClose={closeFollowingModal}
            isCentered
          >
            <ModalOverlay />
            <ModalContent maxH="80vh">
              <ModalHeader>
                Following
              </ModalHeader>
              <ModalCloseButton />
                <ModalBody h="auto" maxH="75vh" overflow="auto">
                {following ? (
                    following.map((f,i: number)=>{
                      return (
                        <Flex 
                          key={f.id} 
                          align="center" 
                          mb={2} 
                          flexWrap="wrap"
                          gap={2}
                          onClick={e=>{
                            closeFollowersModal()
                            navigate(`/profile/${f.Profile_Following_following_profile_idToProfile!.username}`)
                          }}
                          cursor="pointer"
                        >
                          <Avatar
                            size="sm"
                            src={f.Profile_Following_following_profile_idToProfile!.profile_photo}
                            border="2px solid gray"
                          />
                          <Text>
                            @{f.Profile_Following_following_profile_idToProfile!.username}
                          </Text>
                        </Flex>
                      )
                    })
                  ): null}
                </ModalBody>
                <ModalFooter flexDirection="column">
                </ModalFooter>
            </ModalContent>
          </Modal>
        </>
        ) : <Box></Box>}
      </Skeleton>
    </Box>
  );
};

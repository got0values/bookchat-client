import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileProps, HTMLInputEvent, ProfileType, Following_Following_following_profile_idToProfile, BookshelfBook, SelectedBook } from '../types/types';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  CloseButton,
  Progress,
  Divider,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import { editPagesRead, cancelEditPagesRead } from "../shared/editCancelPagesRead";
import {SuggestionCountBadge} from "../shared/SuggestionCount";
import SocialShareButtons from "../shared/SocialShareButtons";
import { showEditCurrentlyReading, hideEditCurrentlyReading } from "../shared/editCancelCurrentlyReading";
import collectionToArray from "../utils/collectionToArray";
import GooglePreviewLink from "../shared/GooglePreviewLink";
import BooksSearch from "../shared/BooksSearch";
import EditCurrentlyReading from "../shared/EditCurrentlyReading";
import { FiFile } from 'react-icons/fi';
import { MdEdit, MdOutlineChat, MdOutlineCancel } from 'react-icons/md';
import { BsPlusLg } from 'react-icons/bs';
import { BiDotsHorizontalRounded, BiTrash, BiHide } from 'react-icons/bi';
import { BsReplyFill } from 'react-icons/bs';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { ImBooks } from 'react-icons/im';
import { FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { FollowProfileButton, CancelRequestButton, UnFollowProfileButton } from "./profileButtons";
import Comments from "../shared/CurrentlyReadingComments";
import { capitalizeLetters } from "../utils/capitalizeLetters";
import StarRating from "../shared/StarRating";
import countryList from 'country-list';
import countryFlagIconsReact from 'country-flag-icons/react/3x2';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";
import googleWatermark from "/src/assets/google_watermark.gif";

export const useProfile = ({server}: {server: string}) => {
  const { user, getUser } = useAuth();
  const { paramsUsername } = useParams<{paramsUsername: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profileData: any = queryClient.getQueryData(["profileKey",paramsUsername])
  const countries = countryList.getNameList();
  dayjs.extend(utc)
  const toast = useToast();

  //self, nonFollower, requesting, follower
  const [ viewer, setViewer ] = useState("nonFollower");
  const [items, setItems] = useState(5);
  const [theEnd,setTheEnd] = useState(false);
  const [currentlyReadingLength,setCurrentlyReadingLength] = useState(0)
  const [advisorCount,setAdvisorCount] = useState(0);
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
            setCurrentlyReadingLength(responseProfileData.CurrentlyReading ? responseProfileData.CurrentlyReading : 0);
            setAdvisorCount(response.data.advisorCount)
            return responseProfileData;
          }
      })
      .catch((response)=>{
        console.log(response)
        throw new Error(response)
      })
      return getProfileData;
    }
    else {
      throw new Error("TCP102")
    }
  }

  //lazy loading
  const [isFetching,setIsFetching] = useState(false)
  function handleScroll() {
    if (Math.ceil(window.innerHeight + document.documentElement.scrollTop) !== document.documentElement.offsetHeight || isFetching) {
      return;
    }
    setIsFetching(true);
  }
  useEffect(()=>{
    window.addEventListener("scroll",handleScroll)
  },[])
  useEffect(()=>{
    if (!isFetching || theEnd) return;
    setItems(prev=>{
      if (prev + 3 > currentlyReadingLength) {
        const left = currentlyReadingLength - prev;
        setTheEnd(true)
        return prev + left;
      }
      else {
        return prev + 5;
      }
    })
    setIsFetching(false)
  },[isFetching])

  const [profileActionError,setProfileActionError] = useState<string>("")

  //User update stuff
  const profileUploadRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const imagePreviewRef = useRef<HTMLImageElement>({} as HTMLImageElement);
  const [previewImage,setPreviewImage] = useState("");
  const [profileImageFile,setProfileImageFile] = useState<Blob | string | ArrayBuffer | null>(null);
  function photoImageChange(e: HTMLInputEvent | any) {
    imagePreviewRef.current.style ? imagePreviewRef.current.style.display = "block" : null;
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

  const removeProfilePhotoMutation = useMutation({
    mutationFn: async () => {
      let tokenCookie = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .put(server + "/api/removeprofilephoto", {},
          {headers: {
            'authorization': tokenCookie
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
        throw new Error("Error: RPP103")
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
  function removeProfilePhoto() {
    removeProfilePhotoMutation.mutate();
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
    setUserProfilePhoto(user.Profile.profile_photo ? `${user.Profile.profile_photo}?x=${new Date().getTime()}` : "")
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
    onCloseReadingModal();
  }

  const whatImReadingRef = useRef({} as HTMLInputElement);
  const [selectedBook,setSelectedBook] = useState<any | null>(null);
  function selectBook(book: SelectedBook) {
    setSelectedBook(book);
    closeReadingModal();
  }

  const thoughtsRef = useRef({} as HTMLInputElement);
  const pagesReadRef = useRef({} as HTMLInputElement);
  const postCurrentlyReadingMutation = useMutation({
    mutationFn: async (e: React.FormEvent)=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .post(server + "/api/currentlyreading",
        {
          google_books_id: (e.target as HTMLDivElement).dataset.googlebooksid,
          image: (e.target as HTMLDivElement).dataset.image,
          title: (e.target as HTMLDivElement).dataset.title,
          author: (e.target as HTMLDivElement).dataset.author,
          description: (e.target as HTMLDivElement).dataset.description,
          isbn: (e.target as HTMLDivElement).dataset.isbn,
          page_count: parseInt((e.target as HTMLDivElement).dataset.pagecount as string),
          subjects: (e.target as HTMLDivElement).dataset.subjects as string,
          published_date: (e.target as HTMLDivElement).dataset.publisheddate,
          thoughts: thoughtsRef.current.value,
          pages_read: parseInt(pagesReadRef.current.value)
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .then((response)=>{
          setSelectedBook(null)
          getUser()
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
          .then(()=>{
            getUser()
          })
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

  const updatePagesReadMutation = useMutation({
    mutationFn: async (bookId: number)=>{
      const pagesReadText = document.getElementById(`pages-read-text-${bookId}`);
      const pagesReadInputDiv = document.getElementById(`pages-read-input-div-${bookId}`);
      const pagesReadInput = document.getElementById(`pages-read-input-${bookId}`);
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/updatepagesread",
        {
          currentlyReadingId: bookId,
          pages_read: parseInt((pagesReadInput as HTMLInputElement)!.value)
        },
        {
          headers: {
            'authorization': tokenCookie
          }
        }
        )
        .then((response)=>{
          pagesReadText!.style.display = "block";
          pagesReadInputDiv!.style.display = "none";
          getUser();
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
  function updatePagesRead(bookId: number) {
    updatePagesReadMutation.mutate(bookId)
  }

  const removeCurrentlyReadingUploadedImageMutation = useMutation({
    mutationFn: async (bookId: number)=>{
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
          .put(server + "/api/removecurrentlyreadinguploadedimage",
            {
              currentlyReadingId: bookId
            },
            {
              headers: {
                'authorization': tokenCookie
              }
            })
            .then((response)=>{
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
      queryClient.invalidateQueries({ queryKey: ["profileKey"] })
      queryClient.resetQueries({queryKey: ["profileKey"]})
      queryClient.setQueryData(["profileKey"],data)
    }
  })
  function removeCurrentlyReadingUploadedImage(bookId: number) {
    removeCurrentlyReadingUploadedImageMutation.mutate(bookId)
  }

  async function addToBookshelf(bookToAdd: any) {
    let tokenCookie: string | null = Cookies.get().token;
    await axios
      .post(server + "/api/addbookshelfbook", 
        {
          book: bookToAdd,
          categories: [],
          notes: ""
        },
        {headers: {
          'authorization': tokenCookie
        }}
      ).then((response)=>{
        toast({
          description: "Added to bookshelf",
          status: "success",
          duration: 9000,
          isClosable: true
        })
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

  return {user,navigate,viewer,profileActionError,setProfileActionError,profileUploadRef,profileImageFile,isOpenProfileDataModal,onOpenProfilePicModal,userProfilePhoto,openProfileDataModal,isOpenProfilePicModal,closeProfilePicModal,photoImageChange,previewImage,imagePreviewRef,onCloseProfileDataModal,profileUserNameRef,profileAboutRef,profileInterests,interestsInputRef,handleAddInterest,handleDeleteInterest,updateProfileData,getProfile,paramsUsername,profilePhotoMutation,updateUserProfilePhoto,removeProfilePhoto,closeProfileDataModal,profileDataMutation,whatImReadingRef,closeReadingModal,isOpenReadingModal,onOpenReadingModal,selectBook,selectedBook,setSelectedBook,postCurrentlyReading,deleteReading,hideReading,commentCurrentlyReading,openCommentModal,closeCommentModal,isOpenCommentModal,commentBookData,commentRef,commentCurrentlyReadingButton,Comments,isOpenFollowersModal,openFollowersModal,closeFollowersModal,isOpenFollowingModal,openFollowingModal,closeFollowingModal,followers,following,removeFollower,removeFollowerMutation,likeUnlikeCurrentlyReading,countries,countrySelectRef,thoughtsRef,addToBookshelf,isFetching,items,theEnd,editPagesRead,cancelEditPagesRead,pagesReadRef,updatePagesRead,advisorCount,removeCurrentlyReadingUploadedImage};
}


export default function Profile({server,gbooksapi}: ProfileProps) {
  const {user,navigate,viewer,profileActionError,setProfileActionError,profileUploadRef,isOpenProfileDataModal,onOpenProfilePicModal,userProfilePhoto,openProfileDataModal,isOpenProfilePicModal,closeProfilePicModal,photoImageChange,previewImage,imagePreviewRef,profileUserNameRef,profileAboutRef,profileInterests,interestsInputRef,handleAddInterest,handleDeleteInterest,updateProfileData,getProfile,paramsUsername,profilePhotoMutation,updateUserProfilePhoto,removeProfilePhoto,closeProfileDataModal,profileDataMutation,whatImReadingRef,closeReadingModal,isOpenReadingModal,onOpenReadingModal,selectBook,selectedBook,setSelectedBook,postCurrentlyReading,deleteReading,hideReading,commentCurrentlyReading,openCommentModal,closeCommentModal,isOpenCommentModal,commentBookData,commentRef,commentCurrentlyReadingButton,Comments,isOpenFollowersModal,openFollowersModal,closeFollowersModal,isOpenFollowingModal,openFollowingModal,closeFollowingModal,followers,following,removeFollower,removeFollowerMutation,likeUnlikeCurrentlyReading,countries,countrySelectRef,thoughtsRef,addToBookshelf,isFetching,items,theEnd,editPagesRead,cancelEditPagesRead,pagesReadRef,updatePagesRead,advisorCount,removeCurrentlyReadingUploadedImage} = useProfile({server});

  

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
      <Heading as="h1" className="visually-hidden">Profile</Heading>
      <Skeleton isLoaded={!isLoading}>
        {viewer !== "self" && profileData.hidden ? (
          <Center
            h="75vh"
          >
            <Heading my="auto">
              Profile not available
            </Heading>
          </Center>
        ) : (
          profileData ? (
            <>
              <Flex flexWrap="wrap" gap={2} w="100%" align="start" justify="space-between">
    
                <Stack flex="1 1 30%" gap={1}>
                  <Center
                    flexDirection="column"
                    className="well"
                    textAlign={'center'}
                  >
                    <Avatar
                      mb={4}
                      onClick={e=> viewer === "self" ? onOpenProfilePicModal() : e.preventDefault()} 
                      size="xl"
                      cursor={viewer === "self" ? "pointer": "default"}
                      src={viewer === "self" ? (userProfilePhoto ? userProfilePhoto : "") : profileData.profile_photo ? profileData.profile_photo : ""}
                      border="2px solid gray"
                      name={profileData.username}
                    />
                    <Flex align="center" wrap="nowrap" gap={2} mb={1}>
                      <Heading fontSize={'3xl'}>
                        {`@${profileData.username}`}
                      </Heading>
                      {profileData?.country ? (
                        <Box w="1.4rem">
                          <Flag alt={profileData.country} title={profileData.country}/>
                        </Box>
                      ):null}
                      <SuggestionCountBadge suggestionCount={advisorCount}/>
                    </Flex>
                    {profileData.rating ? (
                      <Box mb={1}>
                        <Flex
                          align="center"
                          gap={1}
                          mb={-1}
                        >
                          <StarRating
                            ratingCallback={null} 
                            starRatingId={0}
                            defaultRating={profileData.rating}
                          />
                          <Text 
                            fontWeight={600} 
                            fontSize="sm"
                            opacity="80%"
                          >
                            {profileData.rating.toFixed(1)}
                          </Text>
                        </Flex>
                        <Text
                          fontSize="sm"
                          opacity="80%"
                        >
                          {profileData._count?.BookSuggestion_BookSuggestion_suggestorToProfile ? profileData._count?.BookSuggestion_BookSuggestion_suggestorToProfile + " ratings" : null}
                        </Text>
                      </Box>
                    ): null}
                    {profileData?.about ? (
                      <Text
                        textAlign={'center'}
                        color='gray.700'
                        px={3}
                        mb={2}
                        _dark={{
                          color: 'gray.400'
                        }}
                      >
                        {profileData.about}
                      </Text>
                    ): null}
    
                    {profileData.Interests && profileData.Interests.length ? (
                    <HStack align={'center'} justify={'center'} px={3} mb={2} flexWrap="wrap">
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
    
                    <Stack mb={1}>
                      <Flex justify="space-between" gap={3} flexWrap="wrap">
                        <Box flex="1">
                          <Heading as="h3" size="sm" whiteSpace="nowrap">
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
                                    name={follower.Profile_Following_self_profile_idToProfile?.username}
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
                          <Heading as="h3" size="sm" whiteSpace="nowrap">
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
                                    name={follower.Profile_Following_following_profile_idToProfile?.username}
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
                      {profileData.PagesRead?.map((p)=>p.pages_read).reduce((partialSum, a) => partialSum + a as number, 0) > 0 ? (
                        <Text 
                          fontStyle="italic"
                          mb={1}
                        >
                          {profileData.PagesRead?.map((p)=>p.pages_read).reduce((partialSum, a) => partialSum + a as number, 0)} pages read this week
                        </Text>
                      ): null}

                    {profileData.Bookshelf?.allow_suggestions ? (
                      <Flex 
                        as={Link} 
                        to={`/booksuggestions/bookshelf?profile=${profileData.username}`}
                        gap={1}
                        align="center"
                        justify="center"
                        pt={1}
                        pb={2}
                      >
                        <ImBooks size="20"/>
                        View Bookshelf
                      </Flex>
                    ):(
                      null
                    )}

                      {viewer === "self" ? (
                        <>
                          {profileData.hidden ? (
                            <Text
                              fontStyle="italic"
                              mb={1}
                            >
                              Your profile is hidden
                            </Text>
                          ) : null}
                          <Button 
                            leftIcon={<MdEdit/>} 
                            onClick={openProfileDataModal}
                            variant="outline"
                            borderColor="black"
                          >
                            Edit
                          </Button>
                        </>
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
    
                  {profileData.BookClubs.length && (viewer === "following" || viewer === "self") ? (
                    <Box className="well">
                      <Heading as="h2" size="md">{profileData?.User.first_name}'s Book Clubs</Heading>
                      <UnorderedList my={1}>
                        {profileData.BookClubs.map((bookClub,i)=>{
                          return (
                            <ListItem key={i}>
                              <Link
                                to={`/bookclubs/${bookClub.id}`}
                              >
                                {bookClub.name}
                              </Link>
                            </ListItem>
                          )
                        })}
                      </UnorderedList>
                    </Box>
                  ): null}
                </Stack>
    
                <Stack flex="1 1 65%" gap={1}>
    
                  <Box className="well">
                    {viewer === "self" ? (
                      <>
                        <Heading as="h2" size="md" mb={2}>
                          Currently Reading
                        </Heading>
                        <Flex gap={2} align="center">
                          <Input 
                            type="text" 
                            borderColor="black"
                            size="lg"
                            placeholder="What are you reading?" 
                            onClick={e=>onOpenReadingModal()}
                            _dark={{
                              bg: "blackAlpha.400"
                            }}
                            sx={{
                              '&:hover': {
                                cursor: 'pointer'
                              }
                            }}
                            readOnly={true}
                          />
                        </Flex>
                        {selectedBook ? (
                          <Box
                            my={2}
                            p={4}
                            className="well"
                            position="relative"
                            id="edit-currently-reading-000"
                          >
                            <CloseButton
                              position="absolute"
                              top="0"
                              right="0"
                              onClick={e=>hideEditCurrentlyReading("000")}
                            />
                            <EditCurrentlyReading server={server} selectedBook={selectedBook} setSelectedBook={setSelectedBook} getPageCallback={getProfile} />
                          </Box>
                        ) : null}
    
                        {profileData?.CurrentlyReading?.length ? (
                          <Box
                            my={2}
                            className="well-card"
                            position="relative"
                          >
                            <Flex align="center" justify="space-between">
                              <Text fontStyle="italic">
                                {
                                  dayjs(profileData
                                    .CurrentlyReading[0]
                                    .created_on).local().format('MMM DD, h:mm a')
                                }
                              </Text>
                              <Flex align="center" gap={1}>
                                <Text>
                                  {profileData.CurrentlyReading[0].hidden ? <i>hidden</i> : ""}
                                </Text>
                                <Box>
                                  <Menu>
                                    <MenuButton 
                                      as={Button}
                                      size="md"
                                      variant="ghost"
                                      rounded="full"
                                      height="25px"
                                      aria-label="like/unlike"
                                    >
                                      <BiDotsHorizontalRounded/>
                                    </MenuButton>
                                    <MenuList>
                                      <MenuItem
                                        // color="tomato"
                                        onClick={e=>showEditCurrentlyReading(profileData.CurrentlyReading[0].id.toString())}
                                        fontWeight="bold"
                                        title="edit"
                                        id={`edit-currently-reading-button-${profileData.CurrentlyReading[0].id}`}
                                        icon={<MdEdit size={20} />}
                                      >
                                        Edit
                                      </MenuItem>
                                      <MenuItem 
                                        as={Link}
                                        to={`/chat/room?title=${profileData.CurrentlyReading[0].title}&author=${profileData.CurrentlyReading[0].author}`}
                                        fontWeight="bold"
                                        icon={<MdOutlineChat size={20} />}
                                      >
                                        Chat Room
                                      </MenuItem>
                                      <MenuItem 
                                        as={Link}
                                        to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(profileData.CurrentlyReading[0].title + " " + profileData.CurrentlyReading[0].author)}`}
                                        target="blank"
                                        fontWeight="bold"
                                        icon={<FaShoppingCart size={20} />}
                                      >
                                        Shop
                                      </MenuItem>
                                      {viewer === "self" ? (
                                      <>
                                        <MenuItem
                                          onClick={e=>addToBookshelf({
                                            image: profileData.CurrentlyReading[0].image,
                                            title: profileData.CurrentlyReading[0].title,
                                            author: profileData.CurrentlyReading[0].author,
                                            description: profileData.CurrentlyReading[0].description,
                                            isbn: profileData.CurrentlyReading[0].isbn ? profileData.CurrentlyReading[0].isbn : "",
                                            page_count: profileData.CurrentlyReading[0].page_count ? parseInt(profileData.CurrentlyReading[0].page_count as any) : null,
                                            published_date: profileData.CurrentlyReading[0].published_date ? profileData.CurrentlyReading[0].published_date : "",
                                          })}
                                          fontWeight="bold"
                                          icon={<ImBooks size={20} />}
                                        >
                                          Add to Bookshelf
                                        </MenuItem>
                                        <MenuItem
                                          data-readingid={profileData.CurrentlyReading[0].id}
                                          data-hide={profileData.CurrentlyReading[0].hidden ? false : true}
                                          onClick={e=>hideReading(e as any)}
                                          fontWeight="bold"
                                          icon={<BiHide size={20} />}
                                        >
                                          {profileData.CurrentlyReading[0].hidden ? "Unhide" : "Hide"}
                                        </MenuItem>
                                        <MenuItem
                                          color="tomato"
                                          onClick={e=>deleteReading(profileData.CurrentlyReading[0].id)}
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
                              </Flex>
                            </Flex>
                            <Divider my={2} />
                            <Flex justify="flex-end" mt={1}>
                              <Button
                                color="tomato"
                                display="none"
                                size="xs"
                                variant="ghost"
                                onClick={e=>hideEditCurrentlyReading(profileData.CurrentlyReading[0].id.toString())}
                                fontWeight="bold"
                                title="cancel edit"
                                id={`cancel-edit-currently-reading-button-${profileData.CurrentlyReading[0].id}`}
                              >
                                <MdOutlineCancel size={25} />
                              </Button>
                            </Flex>
                            {profileData.CurrentlyReading[0].uploaded_image ? (
                              <>
                                <Flex 
                                  id="preview-div"
                                  align="center"
                                  justify="center"
                                  mb={2}
                                >
                                  <Image
                                    src={profileData.CurrentlyReading[0].uploaded_image}
                                    // w="100%"
                                  />
                                </Flex>
                                <Flex
                                  justify="flex-end"
                                  mb={2}
                                >
                                  <Button
                                    color="tomato"
                                    size="xs"
                                    variant="ghost"
                                    onClick={e=>removeCurrentlyReadingUploadedImage(profileData.CurrentlyReading[0].id)}
                                    fontWeight="bold"
                                    title="remove image"
                                  >
                                    <BiTrash size={18} />
                                  </Button>
                                </Flex>
                                <Divider mb={2} />
                              </>
                            ): null}
                            <Box
                              id={`currently-reading-${profileData.CurrentlyReading[0].id}`}
                            >
                              {profileData.CurrentlyReading[0].thoughts ? (
                                <Text 
                                  rounded="md"
                                  mb={2}
                                >
                                  {profileData.CurrentlyReading[0].thoughts}
                                </Text>
                              ): null}
                              <Flex>
                                <Image 
                                  src={
                                    profileData
                                    .CurrentlyReading[0]
                                    .image
                                  }
                                  maxH="115px"
                                  // minW="60px"
                                  boxShadow="1px 1px 1px 1px darkgrey"
                                  alt={profileData.CurrentlyReading[0].title}
                                />
                                <Box mx={2} w="100%">
                                  <Box lineHeight={1.4}>
                                    <Heading as="h3" size="md" me={3} noOfLines={1}>
                                      {
                                        profileData
                                        .CurrentlyReading[0]
                                        .title
                                      }
                                    </Heading>
                                    <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                                      {
                                        profileData
                                        .CurrentlyReading[0]
                                        .author
                                      }
                                    </Text>
                                    {/* <Popover isLazy>
                                      <PopoverTrigger>
                                        <Box
                                          _hover={{
                                            cursor: "pointer"
                                          }}
                                        >
                                          <Text fontSize="lg" noOfLines={1}>
                                            {
                                              profileData
                                              .CurrentlyReading[0]
                                              .description
                                            }
                                          </Text>
                                        </Box>
                                      </PopoverTrigger>
                                      <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody 
                                          fontSize="sm"
                                          _dark={{
                                            bg: "black"
                                          }}
                                        >
                                          {
                                            profileData
                                            .CurrentlyReading[0]
                                            .description
                                          }
                                        </PopoverBody>
                                      </PopoverContent>
                                    </Popover> */}
                                    <Text fontStyle="italic">
                                      {
                                        profileData.CurrentlyReading[0].published_date ? (
                                          dayjs(profileData
                                          .CurrentlyReading[0]
                                          .published_date).format("YYYY")
                                        ) : null
                                      }
                                    </Text>
                                    {profileData.CurrentlyReading[0].page_count ? (
                                      <Text noOfLines={1}>
                                        {profileData.CurrentlyReading[0].page_count} pages
                                      </Text>
                                    ): null}
                                    {profileData.CurrentlyReading[0].subjects && JSON.parse(profileData.CurrentlyReading[0].subjects)?.length ? (
                                      <Popover isLazy>
                                        <PopoverTrigger>
                                          <HStack 
                                            spacing={1} 
                                            noOfLines={1}
                                            maxW="275px"
                                            _hover={{
                                              cursor: "pointer"
                                            }}
                                          >
                                            {JSON.parse(profileData.CurrentlyReading[0].subjects).map((subject:string,i:number)=>{
                                              return (
                                                <Tag
                                                  key={i}
                                                  // variant="solid"
                                                  colorScheme="purple"
                                                  size="sm"
                                                  // borderRadius="full"
                                                >
                                                  <TagLabel>{subject}</TagLabel>
                                                </Tag>
                                              )
                                            })}
                                          </HStack>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                          <PopoverArrow />
                                          <PopoverCloseButton />
                                          <PopoverBody 
                                            fontSize="sm"
                                            _dark={{
                                              bg: "black"
                                            }}
                                          >
                                            {JSON.parse(profileData.CurrentlyReading[0].subjects).map((subject:string,i:number)=>{
                                              return (
                                                <Text key={i}>
                                                  {subject}
                                                </Text>
                                              )}
                                            )}
                                          </PopoverBody>
                                        </PopoverContent>
                                      </Popover>
                                    ):null}
                                  </Box>
                                  <Box>
                                    <Text 
                                      padding={0}
                                      rounded="md"
                                      _hover={{
                                        cursor: viewer === "self" ? "pointer" : "default",
                                        backgroundColor: viewer === "self" ? "gray" : "unset",
                                      }}
                                      id={`pages-read-text-${profileData.CurrentlyReading[0].id}`}
                                      onClick={e=>viewer === "self" ? editPagesRead(profileData.CurrentlyReading[0].id) : null}
                                    >
                                      Pages read: {profileData.CurrentlyReading[0].pages_read ? profileData.CurrentlyReading[0].pages_read : 0}
                                    </Text>
                                    <Flex 
                                      align="center" 
                                      gap={1}
                                      id={`pages-read-input-div-${profileData.CurrentlyReading[0].id}`}
                                      display="none"
                                      wrap="wrap"
                                      padding={0}
                                    >
                                      Pages read:
                                      <NumberInput
                                        maxWidth="75px"
                                        size="sm"
                                        min={0}
                                        defaultValue={profileData.CurrentlyReading[0].pages_read}
                                      >
                                        <NumberInputField id={`pages-read-input-${profileData.CurrentlyReading[0].id}`} />
                                        <NumberInputStepper>
                                          <NumberIncrementStepper />
                                          <NumberDecrementStepper />
                                        </NumberInputStepper>
                                      </NumberInput>
                                      <Button
                                        size="sm"
                                        backgroundColor="black"
                                        color="white"
                                        onClick={e=>updatePagesRead(profileData.CurrentlyReading[0].id)}
                                      >
                                        Update
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={e=>cancelEditPagesRead(profileData.CurrentlyReading[0].id)}
                                      >
                                        Cancel
                                      </Button>
                                    </Flex>
                                  </Box>
                                </Box>
                              </Flex>
                            </Box>
                            <Box
                              id={`edit-currently-reading-${profileData.CurrentlyReading[0].id}`}
                              display="none"
                            >
                              <EditCurrentlyReading 
                                server={server} 
                                getPageCallback={getProfile} 
                                setSelectedBook={null}
                                selectedBook={{
                                  id: profileData.CurrentlyReading[0].id,
                                  google_books_id: "",
                                  title: profileData.CurrentlyReading[0].title,
                                  author: profileData.CurrentlyReading[0].author,
                                  image: profileData.CurrentlyReading[0].image,
                                  description: "",
                                  isbn: profileData.CurrentlyReading[0].isbn,
                                  page_count: profileData.CurrentlyReading[0].page_count,
                                  subjects: profileData.CurrentlyReading[0].subjects ? JSON.parse(profileData.CurrentlyReading[0].subjects) : null,
                                  published_date: profileData.CurrentlyReading[0].published_date,
                                  pages_read: profileData.CurrentlyReading[0].pages_read,
                                  thoughts: profileData.CurrentlyReading[0].thoughts
                                }}
                              />
                            </Box>
                            <Divider mb={1} mt={3} />
                            <Flex
                              align="center"
                              justify="space-between"
                              w="100%"
                              wrap="wrap"
                            >
                              <SocialShareButtons reading={profileData.CurrentlyReading[0]} username={profileData.username} />
                              <Flex
                                align="center"
                                gap={1}
                                ms="auto"
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  data-book={JSON.stringify(profileData.CurrentlyReading[0])}
                                  onClick={e=>openCommentModal(e)}
                                >
                                  <Box as={BsReplyFill} size={20} pb={1} /> Comment
                                </Button>
                                <Flex align="center" gap={0}>
                                  <Button 
                                    px={0}
                                    pb={0.5}
                                    size="xs"
                                    variant="ghost"
                                    data-currentlyreading={profileData.CurrentlyReading[0].id}
                                    onClick={e=>likeUnlikeCurrentlyReading(e)}
                                    aria-label="like/unlike"
                                  >
                                    {profileData.CurrentlyReading[0].CurrentlyReadingLike?.filter((like)=>like.profile===user.Profile.id).length ? <AiFillHeart color="red" pointerEvents="none" size={20} /> : <AiOutlineHeart pointerEvents="none" size={20} />}
                                  </Button>
                                  {profileData.CurrentlyReading[0].CurrentlyReadingLike?.length ? (
                                    <Popover isLazy size="sm">
                                      <PopoverTrigger>
                                        <Text
                                          cursor="pointer"
                                        >
                                          {profileData.CurrentlyReading[0].CurrentlyReadingLike?.length ? profileData.CurrentlyReading[0].CurrentlyReadingLike.length.toString() : "0"}
                                        </Text>
                                      </PopoverTrigger>
                                      <PopoverContent>
                                        <PopoverArrow />
                                        <PopoverCloseButton />
                                        <PopoverBody
                                          _dark={{
                                            bg: "black"
                                          }}
                                        >
                                          {profileData.CurrentlyReading[0].CurrentlyReadingLike?.length ? (
                                            profileData.CurrentlyReading[0].CurrentlyReadingLike?.map((like,i)=>{
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
                                      {profileData.CurrentlyReading[0].CurrentlyReadingLike?.length ? profileData.CurrentlyReading[0].CurrentlyReadingLike.length.toString() : "0"}
                                    </Text>
                                  )}
                                </Flex>
                              </Flex>
                            </Flex>
                            {profileData.CurrentlyReading[0].CurrentlyReadingComment.length ? (
                                <>
                                  <Divider mb={1} />
                                  <Comments 
                                    comments={profileData.CurrentlyReading[0].CurrentlyReadingComment} 
                                    getProfile={getProfile} 
                                    location="profile"
                                    server={server}
                                  />
                                </>
                            ): null}
                          </Box>
                        ) : null}
                      </>
                    ) : (
                      <>
                      {viewer === "following" ? (
                        profileData.CurrentlyReading[0]?.hidden ? (
                          null
                        ) : (
                          <>
                            <Heading as="h2" size="md" mb={2}>
                              Currently Reading
                            </Heading>
                            {profileData?.CurrentlyReading?.length ? (
                              <Box
                                my={2}
                                className="well-card"
                                position="relative"
                              >
                                <Flex justify="space-between" align="center">
                                  <Text fontStyle="italic">
                                    {
                                      dayjs(profileData.CurrentlyReading[0]
                                        .created_on)
                                        .local()
                                        .format('MMM DD, m a')
                                    }
                                  </Text>
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
                                        aria-label="menu"
                                      >
                                        <BiDotsHorizontalRounded/>
                                      </MenuButton>
                                      <MenuList>
                                        <MenuItem 
                                          as={Link}
                                          to={`/chat/room?title=${profileData.CurrentlyReading[0].title}&author=${profileData.CurrentlyReading[0].author}`}
                                          fontWeight="bold"
                                          icon={<MdOutlineChat size={20} />}
                                        >
                                          Chat Room
                                        </MenuItem>
                                        <MenuItem 
                                          as={Link}
                                          to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(profileData.CurrentlyReading[0].title + " " + profileData.CurrentlyReading[0].author)}`}
                                          target="blank"
                                          fontWeight="bold"
                                          icon={<FaShoppingCart size={20} />}
                                        >
                                          Shop
                                        </MenuItem>
                                      </MenuList>
                                    </Menu>
                                  </Box>
                                </Flex>
                                <Divider mt={1} mb={2} />
                                {profileData.CurrentlyReading[0].uploaded_image ? (
                                  <>
                                    <Flex 
                                      id="preview-div"
                                      align="center"
                                      justify="center"
                                      mb={2}
                                    >
                                      <Image
                                        src={profileData.CurrentlyReading[0].uploaded_image}
                                        // w="100%"
                                      />
                                    </Flex>

                                    <Divider mb={2} />
                                  </>
                                ): null}
                                <Box mb={3}>
                                  {profileData.CurrentlyReading[0].thoughts ? (
                                    <Text 
                                      my={2}
                                      rounded="md"
                                      p={1}
                                    >
                                      {profileData.CurrentlyReading[0].thoughts ? profileData.CurrentlyReading[0].thoughts : null}
                                    </Text>
                                  ): null}
                                  <Flex>
                                    <Image 
                                      src={
                                        profileData.CurrentlyReading[0].image
                                      }
                                      maxH="115px"
                                      // minW="60px"
                                      boxShadow="1px 1px 1px 1px darkgrey"
                                      alt={profileData.CurrentlyReading[0].title}
                                    />
                                    <Box mx={2} w="100%">
                                      <Box lineHeight={1.4}>
                                        <Heading as="h3" size="md" me={3} noOfLines={1}>
                                          {
                                            profileData.CurrentlyReading[0]
                                            .title
                                          }
                                        </Heading>
                                        <Text fontWeight="bold" noOfLines={1}>
                                          {
                                            profileData.CurrentlyReading[0]
                                            .author
                                          }
                                        </Text>
                                        {/* <Popover isLazy>
                                          <PopoverTrigger>
                                            <Box
                                              _hover={{
                                                cursor: "pointer"
                                              }}
                                            >
                                              <Text fontSize="lg" noOfLines={1}>
                                                {
                                                  profileData
                                                  .CurrentlyReading[0]
                                                  .description
                                                }
                                              </Text>
                                            </Box>
                                          </PopoverTrigger>
                                          <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverBody 
                                            fontSize="sm"
                                            _dark={{
                                              bg: "black"
                                            }}
                                            >
                                              {
                                                profileData
                                                .CurrentlyReading[0]
                                                .description
                                              }
                                            </PopoverBody>
                                          </PopoverContent>
                                        </Popover> */}
                                        <Text fontStyle="italic">
                                          {
                                            profileData.CurrentlyReading[0].published_date ? (
                                              dayjs(profileData
                                              .CurrentlyReading[0]
                                              .published_date).format("YYYY")
                                            ) : null
                                          }
                                        </Text>
                                        {profileData.CurrentlyReading[0].page_count ? (
                                          <Text noOfLines={1}>
                                            {profileData.CurrentlyReading[0].page_count} pages
                                          </Text>
                                        ): null}
                                        {profileData.CurrentlyReading[0].subjects && JSON.parse(profileData.CurrentlyReading[0].subjects).length ? (
                                          <Popover isLazy>
                                            <PopoverTrigger>
                                              <HStack 
                                                spacing={1} 
                                                noOfLines={1}
                                                maxW="275px"
                                                _hover={{
                                                  cursor: "pointer"
                                                }}
                                              >
                                                {JSON.parse(profileData.CurrentlyReading[0].subjects).map((subject:string,i:number)=>{
                                                  return (
                                                    <Tag
                                                      key={i}
                                                      // variant="solid"
                                                      colorScheme="purple"
                                                      size="sm"
                                                      // borderRadius="full"
                                                    >
                                                      <TagLabel>{subject}</TagLabel>
                                                    </Tag>
                                                  )
                                                })}
                                              </HStack>
                                            </PopoverTrigger>
                                            <PopoverContent>
                                              <PopoverArrow />
                                              <PopoverCloseButton />
                                              <PopoverBody 
                                                fontSize="sm"
                                                _dark={{
                                                  bg: "black"
                                                }}
                                              >
                                                {JSON.parse(profileData.CurrentlyReading[0].subjects).map((subject:string,i:number)=>{
                                                  return (
                                                    <Text key={i}>
                                                      {subject}
                                                    </Text>
                                                  )}
                                                )}
                                              </PopoverBody>
                                            </PopoverContent>
                                          </Popover>
                                        ):null}
                                      </Box>
                                      <Text>
                                        Pages read: {profileData.CurrentlyReading[0].pages_read ? profileData.CurrentlyReading[0].pages_read : 0}
                                      </Text>
                                    </Box>
                                  </Flex>
                                </Box>
                                <Divider mt={1} />
                                <Flex
                                  align="center"
                                  justify="space-between"
                                  w="100%"
                                >
                                  <Flex
                                    align="center"
                                    gap={1}
                                    ms="auto"
                                  >
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      data-book={JSON.stringify(profileData.CurrentlyReading[0])}
                                      onClick={e=>openCommentModal(e)}
                                    >
                                      <Box as={BsReplyFill} size={20} pb={1} /> Comment
                                    </Button>
                                    <Flex align="center" gap={0}>
                                      <Button 
                                        px={0}
                                        pb={0.5}
                                        size="xs"
                                        variant="ghost"
                                        data-currentlyreading={profileData.CurrentlyReading[0].id}
                                        onClick={e=>likeUnlikeCurrentlyReading(e)}
                                        aria-label="like/unlike"
                                      >
                                        {profileData.CurrentlyReading[0].CurrentlyReadingLike?.filter((like)=>like.profile===user.Profile.id).length ? <AiFillHeart color="red" pointerEvents="none" size={20} /> : <AiOutlineHeart pointerEvents="none" size={20} />}
                                      </Button>
                                      {profileData.CurrentlyReading[0].CurrentlyReadingLike?.length ? (
                                        <Popover isLazy size="sm">
                                          <PopoverTrigger>
                                            <Text
                                              cursor="pointer"
                                            >
                                              {profileData.CurrentlyReading[0].CurrentlyReadingLike?.length ? profileData.CurrentlyReading[0].CurrentlyReadingLike.length.toString() : "0"}
                                            </Text>
                                          </PopoverTrigger>
                                          <PopoverContent>
                                            <PopoverArrow />
                                            <PopoverCloseButton />
                                            <PopoverBody
                                              _dark={{
                                                bg: "black"
                                              }}
                                            >
                                              {profileData.CurrentlyReading[0].CurrentlyReadingLike?.length ? (
                                                profileData.CurrentlyReading[0].CurrentlyReadingLike?.map((like,i)=>{
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
                                          {profileData.CurrentlyReading[0].CurrentlyReadingLike?.length ? profileData.CurrentlyReading[0].CurrentlyReadingLike.length.toString() : "0"}
                                        </Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                </Flex>
                                {profileData.CurrentlyReading[0].CurrentlyReadingComment.length ? (
                                  <>
                                    <Divider mb={1} />
                                    <Comments 
                                      comments={profileData.CurrentlyReading[0].CurrentlyReadingComment} 
                                      getProfile={getProfile} 
                                      location="profile"
                                      server={server}
                                    />
                                  </>
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
                      <Heading as="h2" size="md" mb={2}>
                        Past Reads
                      </Heading>
                      <>
                        {profileData?.CurrentlyReading?.length ? (
                          profileData.CurrentlyReading.map((readBook,i)=>{
                            return (
                              viewer !== "self" && readBook.hidden ? (
                                null
                              ) : (
                                i !== 0 && i + 1 <= items ? (
                                  <Box 
                                    key={i}
                                    my={2}
                                    className="well-card"
                                    position="relative"
                                  >
                                    <Suspense
                                      fallback={<Box>...</Box>}
                                    />
                                    <Flex justify="space-between" align="center">
                                      <Text fontStyle="italic">
                                        {dayjs(readBook.created_on).local().format('MMM DD, h:mm a')}
                                      </Text>
                                      <Flex align="center" gap={1}>
                                        <Text>
                                          {viewer === "self" && readBook.hidden ? <i>hidden</i> : ""}
                                        </Text>
                                        <Box>
                                          <Menu>
                                            <MenuButton 
                                              as={Button}
                                              size="md"
                                              variant="ghost"
                                              rounded="full"
                                              height="25px"
                                              aria-label="menu"
                                            >
                                              <BiDotsHorizontalRounded/>
                                            </MenuButton>
                                            <MenuList>
                                              <MenuItem
                                                // color="tomato"
                                                onClick={e=>showEditCurrentlyReading(readBook.id.toString())}
                                                fontWeight="bold"
                                                title="edit"
                                                id={`edit-currently-reading-button-${readBook.id}`}
                                                icon={<MdEdit size={20} />}
                                              >
                                                Edit
                                              </MenuItem>
                                              <MenuItem 
                                                as={Link}
                                                to={`/chat/room?title=${readBook.title}&author=${readBook.author}`}
                                                fontWeight="bold"
                                                icon={<MdOutlineChat size={20} />}
                                              >
                                                Chat Room
                                              </MenuItem>
                                              <MenuItem 
                                                as={Link}
                                                to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(readBook.title + " " + readBook.author)}`}
                                                target="blank"
                                                fontWeight="bold"
                                                icon={<FaShoppingCart size={20} />}
                                              >
                                                Shop
                                              </MenuItem>
                                              {viewer === "self" ? (
                                              <>
                                                <MenuItem
                                                  onClick={e=>addToBookshelf({
                                                    image: readBook.image,
                                                    title: readBook.title,
                                                    author: readBook.author,
                                                    description: readBook.description,
                                                    isbn: readBook.isbn ? readBook.isbn : "",
                                                    page_count: readBook.page_count ? parseInt(readBook.page_count as any) : null,
                                                    published_date: readBook.published_date ? readBook.published_date : "",
                                                  })}
                                                  fontWeight="bold"
                                                  icon={<ImBooks size={20} />}
                                                >
                                                  Add to Bookshelf
                                                </MenuItem>
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
                                      </Flex>
                                    </Flex>
                                    <Divider my={2} />
                                    {readBook.uploaded_image ? (
                                      <>
                                        <Flex 
                                          id="preview-div"
                                          align="center"
                                          justify="center"
                                          mb={2}
                                        >
                                          <Image
                                            src={readBook.uploaded_image}
                                            // w="100%"
                                          />
                                        </Flex>
                                        {viewer === "self" ? (
                                          <Flex
                                            justify="flex-end"
                                            mb={2}
                                          >
                                            <Button
                                              color="tomato"
                                              size="xs"
                                              variant="ghost"
                                              onClick={e=>removeCurrentlyReadingUploadedImage(readBook.id)}
                                              fontWeight="bold"
                                              title="remove image"
                                            >
                                              <BiTrash size={18} />
                                            </Button>
                                          </Flex>
                                        ): null}
                                        <Divider mb={2} />
                                      </>
                                    ): null}
                                    <Flex justify="flex-end" mb={1}>
                                      <Button
                                        color="tomato"
                                        display="none"
                                        size="xs"
                                        variant="ghost"
                                        onClick={e=>hideEditCurrentlyReading(readBook.id.toString())}
                                        fontWeight="bold"
                                        title="cancel edit"
                                        id={`cancel-edit-currently-reading-button-${readBook.id}`}
                                      >
                                        <MdOutlineCancel size={25} />
                                      </Button>
                                    </Flex>
                                    <Box
                                      id={`currently-reading-${readBook.id}`}
                                    >
                                      {readBook.thoughts ? (
                                        <Text 
                                          rounded="md"
                                          mb={2}
                                        >
                                          {readBook.thoughts}
                                        </Text>
                                      ): null}
                                      <Flex>
                                        <Image 
                                          src={readBook.image}
                                          maxH="115px"
                                          // minW="60px"
                                          boxShadow="1px 1px 1px 1px darkgrey"
                                          title={readBook.title}
                                        />
                                        <Box mx={2} w="100%">
                                          <Box lineHeight={1.4}>
                                            <Heading as="h3" size="md" me={3} noOfLines={1}>
                                              {readBook.title}
                                            </Heading>
                                            <Text fontWeight="bold" fontSize="lg" noOfLines={1}>{readBook.author}</Text>
                                            {/* <Popover isLazy>
                                              <PopoverTrigger>
                                                <Box
                                                  _hover={{
                                                    cursor: "pointer"
                                                  }}
                                                >
                                                  <Text fontSize="lg" noOfLines={1}>
                                                    {readBook.description}
                                                  </Text>
                                                </Box>
                                              </PopoverTrigger>
                                              <PopoverContent>
                                                <PopoverArrow />
                                                <PopoverCloseButton />
                                                <PopoverBody 
                                                  fontSize="sm"
                                                  _dark={{
                                                    bg: "black"
                                                  }}
                                                >
                                                  {readBook.description}
                                                </PopoverBody>
                                              </PopoverContent>
                                            </Popover> */}
                                            <Text fontStyle="italic">
                                              {
                                                readBook.published_date ? (
                                                  dayjs(readBook.published_date).format("YYYY")
                                                ) : null
                                              }
                                            </Text>
                                            {readBook.page_count ? (
                                              <Text noOfLines={1}>
                                                {readBook.page_count} pages
                                              </Text>
                                            ): null}
                                            {readBook.subjects && JSON.parse(readBook.subjects)?.length ? (
                                              <Popover isLazy>
                                                <PopoverTrigger>
                                                  <HStack 
                                                    spacing={1} 
                                                    noOfLines={1}
                                                    maxW="275px"
                                                    _hover={{
                                                      cursor: "pointer"
                                                    }}
                                                  >
                                                    {JSON.parse(readBook.subjects).map((subject:string,i:number)=>{
                                                      return (
                                                        <Tag
                                                          key={i}
                                                          // variant="solid"
                                                          colorScheme="purple"
                                                          size="sm"
                                                          // borderRadius="full"
                                                        >
                                                          <TagLabel>{subject}</TagLabel>
                                                        </Tag>
                                                      )
                                                    })}
                                                  </HStack>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                  <PopoverArrow />
                                                  <PopoverCloseButton />
                                                  <PopoverBody 
                                                    fontSize="sm"
                                                    _dark={{
                                                      bg: "black"
                                                    }}
                                                  >
                                                    {JSON.parse(readBook.subjects).map((subject:string,i:number)=>{
                                                      return (
                                                        <Text key={i}>
                                                          {subject}
                                                        </Text>
                                                      )}
                                                    )}
                                                  </PopoverBody>
                                                </PopoverContent>
                                              </Popover>
                                            ):null}
                                          </Box>
                                          <Box>
                                            <Text 
                                              padding={0}
                                              rounded="md"
                                              _hover={{
                                                cursor: viewer === "self" ? "pointer" : "default",
                                                backgroundColor: viewer === "self" ? "gray" : "unset",
                                              }}
                                              id={`pages-read-text-${readBook.id}`}
                                              onClick={e=>viewer === "self" ? editPagesRead(readBook.id) : null}
                                            >
                                              Pages read: {readBook.pages_read ? readBook.pages_read : 0}
                                            </Text>
                                            <Flex 
                                              align="center" 
                                              gap={1}
                                              id={`pages-read-input-div-${readBook.id}`}
                                              display="none"
                                              wrap="wrap"
                                              padding={0}
                                            >
                                              Pages read:
                                              <NumberInput
                                                maxWidth="75px"
                                                size="sm"
                                                min={0}
                                                defaultValue={readBook.pages_read}
                                              >
                                                <NumberInputField id={`pages-read-input-${readBook.id}`} />
                                                <NumberInputStepper>
                                                  <NumberIncrementStepper />
                                                  <NumberDecrementStepper />
                                                </NumberInputStepper>
                                              </NumberInput>
                                              <Button
                                                size="sm"
                                                backgroundColor="black"
                                                color="white"
                                                onClick={e=>updatePagesRead(readBook.id)}
                                              >
                                                Update
                                              </Button>
                                              <Button
                                                size="sm"
                                                onClick={e=>cancelEditPagesRead(readBook.id)}
                                              >
                                                Cancel
                                              </Button>
                                            </Flex>
                                          </Box>
                                        </Box>
                                      </Flex>
                                    </Box>
                                    <Box
                                      id={`edit-currently-reading-${readBook.id}`}
                                      display="none"
                                    >
                                      <EditCurrentlyReading 
                                        server={server} 
                                        getPageCallback={getProfile} 
                                        setSelectedBook={null}
                                        selectedBook={{
                                          id: readBook.id,
                                          google_books_id: "",
                                          title: readBook.title,
                                          author: readBook.author,
                                          image: readBook.image,
                                          description: "",
                                          isbn: readBook.isbn,
                                          page_count: readBook.page_count,
                                          subjects: readBook.subjects ? JSON.parse(readBook.subjects) : null,
                                          published_date: readBook.published_date,
                                          pages_read: readBook.pages_read,
                                          thoughts: readBook.thoughts
                                        }}
                                      />
                                    </Box>
                                    <Divider mt={2} />
                                    <Flex
                                      align="center"
                                      justify="space-between"
                                      w="100%"
                                    >
                                      <Flex
                                        align="center"
                                        gap={1}
                                        ms="auto"
                                      >
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          data-book={JSON.stringify(readBook)}
                                          onClick={e=>openCommentModal(e)}
                                        >
                                          <Box as={BsReplyFill} size={20} pb={1} /> Comment
                                        </Button>
                                        <Flex align="center" gap={0}>
                                          <Button 
                                            px={0}
                                            pb={0.5}
                                            size="xs"
                                            variant="ghost"
                                            data-currentlyreading={readBook.id}
                                            onClick={e=>likeUnlikeCurrentlyReading(e)}
                                            aria-label="like/unlike"
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
                                                <PopoverBody
                                                  _dark={{
                                                    bg: "black"
                                                  }}
                                                >
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
                                    </Flex>
                                    {readBook.CurrentlyReadingComment.length ? (
                                        <>
                                          <Divider mb={1} />
                                          <Comments 
                                            comments={readBook.CurrentlyReadingComment} 
                                            getProfile={getProfile} 
                                            location="profile"
                                            server={server}
                                          />
                                        </>
                                    ): null}
                                  </Box>
                                ) : null
                              )
                            )
                          })
                        ) : null}
                        {isFetching && !theEnd && (
                          <Flex justify="center">
                            <Spinner size="xl"/>
                          </Flex>
                        )}
                      </>
                    </Box>
                  ): null}
                  
    
                </Stack>
    
              </Flex>
    
              {viewer === "self" && (
              <>
                <Modal isOpen={isOpenProfilePicModal} onClose={closeProfilePicModal}>
                  <ModalOverlay />
                  <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
                    <ModalHeader>
                      <Heading as="h2" size="lg">
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
                          alt="profile preview image"
                        />
                        ) : (
                        <Box p="15%" textAlign="center">
                          <Icon as={FiFile} />
                          <Text fontSize="sm">Upload Image</Text>
                        </Box>
                        )}
                      </Flex>
                      {userProfilePhoto ? (
                        <Flex justify="flex-end" mt={2}>
                          <Button 
                            size="xs" 
                            variant="ghost" 
                            color="red"
                            onClick={e=>removeProfilePhoto()}
                          >
                            Remove
                          </Button>
                        </Flex>
                      ): null}
                    </ModalBody>
                    <ModalFooter>
                      <HStack>
                        <>
                          {profilePhotoMutation.error && (
                            <Text color="red">
                              {(profilePhotoMutation.error as Error).message}
                            </Text>
                          )}
                          <Button 
                            mr={3} 
                            onClick={updateUserProfilePhoto}  
                            size="lg" 
                            backgroundColor="black"
                            color="white"
                          >
                            Save
                          </Button>
                        </>
                      </HStack>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
    
                <Modal isOpen={isOpenProfileDataModal} onClose={closeProfileDataModal}>
                  <ModalOverlay />
                  <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
                    <ModalHeader>
                      <Heading as="h2" size="lg">
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
                          borderColor="black"
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
                          borderColor="black"
                          ref={profileAboutRef}
                          defaultValue={user.Profile.about}
                          size="lg"
                          maxLength={100}
                        />
                      </FormControl>
                      <FormControl mt="5%">
                        <FormLabel htmlFor="country">Country</FormLabel>
                        <Select
                          id="country"
                          placeholder="Select"
                          borderColor="black"
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
                            borderColor="black"
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
                        <Button 
                          mr={3} 
                          onClick={updateProfileData} 
                          size="lg" 
                          backgroundColor="black"
                          color="white"
                        >
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
                  <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
                    <ModalHeader>
                      What are you reading?
                    </ModalHeader>
                    <ModalCloseButton />
                      <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
                        <BooksSearch selectText="set" selectCallback={selectBook as any} gBooksApi={gbooksapi}/>
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
                <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
                  <ModalHeader>
                    Comment
                  </ModalHeader>
                  <ModalCloseButton />
                    <ModalBody h="auto" maxH="75vh" overflow="auto">
                      <Input
                        type="text"
                        borderColor="black"
                        ref={commentRef as any}
                        onKeyUp={e=>e.key === 'Enter' ? commentCurrentlyReadingButton.current.click() : null}
                      />
                    </ModalBody>
                    <ModalFooter>
                    <> 
                      <Button
                        backgroundColor="black"
                        color="white"
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
                <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
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
                                onClick={e=>closeFollowersModal()}
                                as={Link}
                                to={`/profile/${f.Profile_Following_self_profile_idToProfile!.username}`}
                                cursor="pointer"
                              >
                                <Avatar
                                  size="sm"
                                  src={f.Profile_Following_self_profile_idToProfile!.profile_photo}
                                  name={f.Profile_Following_self_profile_idToProfile!.username}
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
                <ModalContent maxH="80vh" rounded="sm" boxShadow="1px 1px 2px 1px black">
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
                              onClick={e=>closeFollowersModal()}
                              as={Link}
                              to={`/profile/${f.Profile_Following_following_profile_idToProfile!.username}`}
                              cursor="pointer"
                            >
                              <Avatar
                                size="sm"
                                src={f.Profile_Following_following_profile_idToProfile!.profile_photo}
                                name={f.Profile_Following_following_profile_idToProfile!.username}
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
          ) : <Box></Box>
        )}
      </Skeleton>

    </Box>
  );
};

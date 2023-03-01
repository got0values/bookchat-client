import React, { useState, useEffect, useRef, useLayoutEffect, MouseEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProfileProps, HTMLInputEvent, ProfileType } from '../types/types';
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
  Badge,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
  Skeleton,
  useDisclosure
} from "@chakra-ui/react";
import collectionToArray from "../utils/collectionToArray";
import { FiFile } from 'react-icons/fi';
import { MdEdit } from 'react-icons/md';
import { BsPlusLg } from 'react-icons/bs';
import { useAuth } from '../hooks/useAuth';
import { FollowProfileButton, CancelRequestButton, UnFollowProfileButton } from "./profileButtons";
import Cookies from "js-cookie";
import axios from "axios";

export default function Profile({server}: ProfileProps) {
  const { user, setUser } = useAuth();
  const { paramsUsername } = useParams<{paramsUsername: string}>();
  const [isLoading,setIsLoading] = useState(true);
  const navigate = useNavigate();

  //self, unauthorized (differentLibrary), nonFollower, requesting, follower
  const [ viewer, setViewer ] = useState("nonFollower");
  const [profileData, setProfileData] = useState<ProfileType | null>(null);
  async function getProfile() {
    setIsLoading(true);
    const tokenCookie = Cookies.get().token;
    if (tokenCookie) {
      await axios
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
          console.log(response.data.profileData)
          const message = response.data.message;
          const responseProfileData = response.data.profileData
          switch(message) {
            case "self":
              setViewer("self")
              setProfileData(responseProfileData)
              break;
            case "nonFollower":
              setViewer("nonFollower")
              setProfileData(responseProfileData)
              break;
            case "requesting":
              setViewer("requesting")
              setProfileData(responseProfileData)
              break;
            case "following":
              setViewer("following")
              setProfileData(responseProfileData)
              break;
            default:
              setViewer("nonFollower")
              setProfileData(responseProfileData)
              break;
          }
          setIsLoading(false);
        }
      })
      .catch(({response})=>{
        console.log(response)
        navigate(`/redirectpage?errortype=${response.status ? response.status : ""}`)
      })
    }
  }
  useEffect(()=>{
    getProfile();
  },[])

  const [profileActionError,setProfileActionError] = useState<string>("")

  //User update stuff
  const profileUploadRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const imagePrefiewRef = useRef<HTMLImageElement>({} as HTMLImageElement);
  const [previewImage,setPreviewImage] = useState("");
  const [profileImageFile,setProfileImageFile] = useState<Blob | string | ArrayBuffer | null>(null);
  function photoImageChange(e: HTMLInputEvent | any) {
    imagePrefiewRef.current.style.display = "block";
    let targetFiles = e.target.files as FileList
    let previewImageFile = targetFiles[0];
    setPreviewImage(URL.createObjectURL(previewImageFile))
    let blob = previewImageFile.slice(0,previewImageFile.size,"image/png")
    let newFile = new File([blob], previewImageFile.name, {type: "image/png"})
    setProfileImageFile(newFile)
  }

  const [userProfilePhotoError,setUserProfilePhotoError] = useState<string>("");
  async function updateUserProfilePhoto() {
    const tokenCookie = Cookies.get().token;
    const formData = new FormData();
    formData.append("photo", profileImageFile as Blob)

    const CancelToken=axios.CancelToken;
    const source = CancelToken.source();
    await axios
    .post(server + "/api/updateprofilephoto", 
    {...formData, cancelToken: source.token},
    {headers: {
      'authorization': tokenCookie,
      'content-type': 'multipart/form-data'
    }}
    )
    .then((response)=>{
      if (response.data.success){
        setUserProfilePhotoError("")
        setUser(response.data.message)
        onCloseProfilePicModal();
      }
    })
    .catch(({response})=>{
      if (axios.isCancel(response)) {
        console.log("successfully aborted")
      }
      console.log(response)
      setUserProfilePhotoError(response?.statusText)
    })
    return () => {
      source.cancel();
    }
  }

  const [userProfileDataError,setUserProfileDataError] = useState<string>("");
  const profileUserNameRef = useRef({} as HTMLInputElement);
  const profileAboutRef = useRef({} as HTMLInputElement);
  async function updateProfileData() {
    const tokenCookie = Cookies.get().token;
    console.log(profileInterests)

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
        interests: profileInterests
      },
      {headers: {
        'authorization': tokenCookie
      }}
      )
      .then((response)=>{
        if (response.data.success){
          setUserProfileDataError("")
          setUser(response.data.message)

          if (navigateToNewUsernameOnReponse) {
            const newUsername = response.data.message.Profile.username
            navigate("/profile/" + newUsername)
            window.location.reload();
          }
          else {
            getProfile()
          }
          onCloseProfileDataModal();
        }
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data) {
          setUserProfileDataError(response.data.message)
        }
        else if (response.statusText) {
          setUserProfileDataError(response?.statusText)
        }
      })
    }
    else {
      setUserProfileDataError("Please login again")
    }
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

  const { 
    isOpen: isOpenProfileDataModal, 
    onOpen: onOpenProfileDataModal, 
    onClose: onCloseProfileDataModal 
  } = useDisclosure()

  function openProfileDataModal() {
    setUserProfileDataError("")
    setProfileInterests(user.Profile.Interests ? (collectionToArray(user.Profile.Interests, "interest")) : [""])
    onOpenProfileDataModal()
  }

  const interestsInputRef = useRef({} as HTMLInputElement);
  const [profileInterests,setProfileInterests] = useState<string[]>([]);

  function handleDeleteInterest(e: MouseEvent<HTMLButtonElement | MouseEvent>, index: number) {
  setProfileInterests(prev=>{
      return prev.filter((item,i)=> i != index)
    })
  }

  return (
    <Box className="main-content">
      <Skeleton isLoaded={!isLoading}>
        {profileData ? (
        <>
          <HStack flexWrap="wrap" w="100%" align="start">

            <Stack flex="1 1 25%">
              <Center
                flexDirection="column"
                className="profile-card"
                rounded={'lg'}
                textAlign={'center'}
              >
                <Avatar
                  mb={4}
                  onClick={e=> viewer === "self" ? onOpenProfilePicModal() : e.preventDefault()} 
                  size="xl"
                  cursor={viewer === "self" ? "pointer": "default"}
                  src={viewer === "self" ? (userProfilePhoto ? userProfilePhoto : "") : profileData.profile_photo ? profileData.profile_photo : ""}
                  border="2px solid gray"
                />
                <Heading fontSize={'3xl'} fontFamily={'body'}>
                  {`${profileData.User?.first_name} ${profileData.User?.last_name}`}
                </Heading>
                <Text fontWeight={600} color={'gray.500'} mb={4}>
                  {`@${profileData.username}`}
                </Text>
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
                        <AvatarGroup size="sm" max={4} mt={1}>
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
                        <AvatarGroup size="sm" max={4} mt={1}>
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
                    <FollowProfileButton server={server} profileId={profileData.id} getProfile={getProfile} setProfileActionError={setProfileActionError} /> 
                    ) : (
                      viewer === "requesting" ? (
                        <CancelRequestButton server={server} profileId={profileData.id} getProfile={getProfile} setProfileActionError={setProfileActionError} />
                      ) : (
                        viewer === "following" ? (
                          <UnFollowProfileButton server={server} profileId={profileData.id} getProfile={getProfile} setProfileActionError={setProfileActionError} />
                        ) : null
                      )
                    ) 
                  )}
                </Box>
                <Text color="red" pt={2}>{profileActionError}</Text>
              </Center>
            </Stack>

            <Stack className="well" flex="1 1 65%">
              <Flex gap={2} align="center">
                <Text >Status:</Text>
                <Input 
                  type="text" 
                  borderRadius="25px" 
                  border="transparent"
                  bg="gray.100" 
                  _dark={{
                    bg: "gray.500"
                  }}
                />
                <Button>Submit</Button>
              </Flex>
            </Stack>
          </HStack>

          {viewer === "self" ? (
          <>
            <Modal isOpen={isOpenProfilePicModal} onClose={onCloseProfilePicModal}>
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
                      ref={imagePrefiewRef}
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
                    <Text color="red">
                      {userProfilePhotoError}
                    </Text>
                    <Button variant='ghost' mr={3} onClick={updateUserProfilePhoto}  size="lg">
                      Save
                    </Button>
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal isOpen={isOpenProfileDataModal} onClose={onCloseProfileDataModal}>
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
                    <FormLabel htmlFor="interests">Interests</FormLabel>
                    <HStack>
                      <Input 
                        type="text" 
                        id="interests"
                        ref={interestsInputRef}
                        size="lg"
                      />
                      <Button
                        onClick={e=>{
                          setProfileInterests([...profileInterests, interestsInputRef.current.value])
                          interestsInputRef.current.value = "";
                        }}
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
                    <Text color="red">
                      {userProfileDataError}
                    </Text>
                    <Button mr={3} onClick={updateProfileData} size="lg">
                      Save
                    </Button>
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
          ): null}
        </>
        ) : <Box></Box>}
      </Skeleton>
    </Box>
  );
};

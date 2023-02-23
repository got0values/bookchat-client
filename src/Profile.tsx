import React, { useState, useRef } from "react";
import { ProfileProps, HTMLInputEvent } from './types/types';
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
  Link,
  Badge,
  Icon,
  useDisclosure,
  useColorModeValue
} from "@chakra-ui/react";
import { FiFile } from 'react-icons/fi';
import { MdEdit } from 'react-icons/md';
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";

export default function Profile({server}: ProfileProps) {
  const { user, setUser } = useAuth();
  const { 
    isOpen: isOpenProfilePicModal, 
    onOpen: onOpenProfilePicModal, 
    onClose: onCloseProfilePicModal 
  } = useDisclosure()

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

  const [profilePhotoError,setProfilePhotoError] = useState<string>("");
  async function updateProfilePhoto() {
    const tokenCookie = Cookies.get().token;
    const formData = new FormData();
    formData.append("photo", profileImageFile as Blob)
    await axios
    .post(server + "/api/updateprofilephoto", 
    formData,
    {headers: {
      'authorization': tokenCookie,
      'content-type': 'multipart/form-data'
    }}
    )
    .then((response)=>{
      if (response.data.success){
        setProfilePhotoError("")
        setUser(response.data.message)
        onCloseProfilePicModal();
      }
    })
    .catch(({response})=>{
      console.log(response)
      setProfilePhotoError(response?.statusText)
    })
  }

  return (
    <Box className="main-content">

      <HStack flexWrap="wrap" w="100%" align="start">

        <Stack flex="1 1 30%">
          <Center
            flexDirection="column"
            className="profile-card"
            rounded={'lg'}
            textAlign={'center'}
          >
            <Avatar
              mb={4}
              onClick={onOpenProfilePicModal} 
              size="xl"
              cursor="pointer"
              src={user.Profile.profile_photo ? user.Profile.profile_photo : ""}
              border="2px solid gray"
            />
            <Heading fontSize={'2xl'} fontFamily={'body'}>
              {`${user.first_name} ${user.last_name}`}
            </Heading>
            <Text fontWeight={600} color={'gray.500'} mb={4}>
              {`@${user.Profile.username}`}
            </Text>
            {user.Profile.about ? (
              <Text
                textAlign={'center'}
                color={useColorModeValue('gray.700', 'gray.400')}
                px={3}>
                {user.Profile.about}
              </Text>
            ): null}

            {user.Profile.interests ? (
            <HStack align={'center'} justify={'center'} my={6}>
              {user.Profile.interests.map((interest)=>{
                return (
                  <Badge
                    px={2}
                    py={1}
                    bg={useColorModeValue('gray.50', 'gray.800')}
                    fontWeight={'400'}>
                    {`#${interest}`}
                  </Badge>
                )}
              )}
            </HStack>
            ) : null}

            <Stack>
              <Box>
                <Heading as="h5" size="sm">0 friends</Heading>
              </Box>
              <Box>
                <AvatarGroup size="sm" max={5}>
                  <Avatar/>
                  <Avatar/>
                  <Avatar/>
                  <Avatar/>
                  <Avatar/>
                  <Avatar/>
                  <Avatar/>
                  <Avatar/>
                </AvatarGroup>
              </Box>
            </Stack>

            <Box mt={8}>
              <Button
                flex={1}
                rounded={'full'}
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                _focus={{
                  bg: 'blue.500',
                }}>
                Follow
              </Button>
              <Box m={2}>
                <Button leftIcon={<MdEdit/>}>
                  Edit
                </Button>
              </Box>
            </Box>
          </Center>
        </Stack>

        <Stack className="well" flex="1 1 65%">
          <Flex gap={2} align="center">
            <Text >Status:</Text>
            <Input 
              type="text" 
              borderRadius="25px" 
              border="transparent"
              bg={useColorModeValue("gray.100", "gray.500")} 
            />
            <Button>Submit</Button>
          </Flex>
        </Stack>
      </HStack>

      <Modal isOpen={isOpenProfilePicModal} onClose={onCloseProfilePicModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading as="h3" size="md">
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
              {previewImage || user.Profile.profile_photo ? (
              <Image 
                src={previewImage || user.Profile.profile_photo ? (previewImage ? previewImage : user.Profile.profile_photo) : ""} 
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
                {profilePhotoError}
              </Text>
              <Button variant='ghost' mr={3} onClick={updateProfilePhoto}>
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

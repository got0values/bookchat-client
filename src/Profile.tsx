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
  InputGroup,
  InputLeftElement,
  Icon,
  useDisclosure
} from "@chakra-ui/react";
import { FiFile } from 'react-icons/fi';
import { useAuth } from './hooks/useAuth';
import Cookies from "js-cookie";
import axios from "axios";

export default function Profile({server}: ProfileProps) {
  const { user, setUser } = useAuth();
  const { 
    isOpen: isOpenProfileModal, 
    onOpen: onOpenProfileModal, 
    onClose: onCloseProfileModal 
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
        onCloseProfileModal();
      }
    })
    .catch(({response})=>{
      console.log(response?.data)
      setProfilePhotoError(response?.data?.message)
    })
  }

  return (
    <Box>
      <Stack>
        <Flex align="center" gap={2}>
          <Avatar 
            onClick={onOpenProfileModal} 
            size="2xl"
            cursor="pointer"
            src={user.Profile.profile_photo ? user.Profile.profile_photo : ""}
            border="2px solid gray"
          />
          <Flex direction="column" justify="space-between" gap={2}>
            <Heading as="h2" size="md">
              {`${user.first_name} ${user.last_name}`}
            </Heading>
            <Box>
              <Heading as="h5" size="sm">0 friends</Heading>
            </Box>
            <Box>
              <AvatarGroup size="sm" max={3}>
                <Avatar/>
                <Avatar/>
                <Avatar/>
                <Avatar/>
              </AvatarGroup>
            </Box>
          </Flex>
        </Flex>
      </Stack>

      <Modal isOpen={isOpenProfileModal} onClose={onCloseProfileModal}>
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

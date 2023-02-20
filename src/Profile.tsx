import React, { useState, useRef } from "react";
import { ProfileProps, HTMLInputEvent } from './types/types';
import { 
  Box,
  Heading,
  Avatar,
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
  const [profileImageBlob,setProfileImageBlob] = useState<string | ArrayBuffer | null>(null);
  function photoImageChange(e: HTMLInputEvent) {
    imagePrefiewRef.current.style.display = "block";
    let targetFiles = e.target.files as FileList
    let previewImageFile = targetFiles[0];
    setPreviewImage(URL.createObjectURL(previewImageFile))

    // let blob = previewImageFile.slice(0, previewImageFile.size, "image/png")
    // let newFile = new File([blob], "newFile.png", {type: "image/png"})
    // setProfileImageBlob(newFile)

    // const reader = new FileReader();
    // reader.onload = function(readerEvent: Event) {
    //   let readerEventTarget = readerEvent.target as FileReader;
    //   setProfileImageBlob(readerEventTarget.result)
    // }
    // reader.readAsDataURL(previewImageFile)
  }

  const [profilePhotoError,setProfilePhotoError] = useState<string>("");
  async function updateProfilePhoto() {
    const tokenCookie = Cookies.get().token;
    const file = profileUploadRef.current.files[0]
    let blob = file.slice(0,file.size,"image/png")
    let newFile = new File([blob], file.name, {type: "image/png"})
    const formData = new FormData();
    formData.append("photo", newFile)
    formData.forEach(x=>console.log(x))

    await axios
    .post(server + "/api/updateprofilephoto", 
    formData,
    {headers: {
      'authorization': tokenCookie,
      'content-type': 'multipart/form-data',
      'content-length': newFile.size
    }}
    )
    .then((response)=>{
      console.log(response)
      if (response.data.success){
        setProfilePhotoError("")
        setUser(response.data.message)
        return;
      }
    })
    .catch(({response})=>{
      console.log(response?.data)
      setProfilePhotoError(response?.data?.errorMessage)
    })
  }

  return (
    <Box>
      <Heading as="h1" size="lg">
        Profile
      </Heading>
      <Stack>
        <Flex align="center">
          <Avatar 
            onClick={onOpenProfileModal} 
            cursor="pointer"
            src={user.Profile.profile_photo ? user.Profile.profile_photo : ""}
          />
          <Heading as="h2" size="md">
            {user.email}
          </Heading>
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
            <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              children={<Icon as={FiFile} />}
            />
              <Input 
                type="file" 
                accept="image/png, image/jpeg"
                ref={profileUploadRef}
                isRequired={true} 
                display="none"
                onChange={e=>photoImageChange(e)}
              />
              <Input
                placeholder={"Your file ..."}
                onClick={()=>profileUploadRef.current.click()}
              />
            </InputGroup>
            <Image 
              src={previewImage} 
              objectFit="cover"
              boxSize="100%" 
              ref={imagePrefiewRef}
              p={5}
              maxW="80%"
              display="none"
            />
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

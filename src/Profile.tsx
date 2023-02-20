import React, { useState, useRef } from "react";
import { ProfileProps, HTMLInputEvent } from './types/types';
import { 
  Box,
  Heading,
  Avatar,
  Stack,
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
import axios from "axios";

export default function Profile({server}: ProfileProps) {
  const { user } = useAuth();
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
    let previewImage = targetFiles[0];
    setPreviewImage(URL.createObjectURL(previewImage))
    const reader = new FileReader();
    reader.onload = function(readerEvent: Event) {
      let readerEventTarget = readerEvent.target as FileReader;
      setProfileImageBlob(readerEventTarget.result)
    }
    reader.readAsDataURL(previewImage)
  }

  return (
    <Box>
      <Heading as="h1" size="lg">
        Profile
      </Heading>
      <Stack>
        <Flex align="center">
          <Avatar onClick={onOpenProfileModal} cursor="pointer"/>
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
            <Button variant='ghost' mr={3} onClick={onCloseProfileModal}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

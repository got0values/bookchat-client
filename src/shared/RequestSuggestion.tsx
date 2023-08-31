import React, { useState, useRef } from "react";
import { 
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  useDisclosure,
  Textarea,
  Text,
  MenuItem,
  Flex
} from "@chakra-ui/react";
import { HiOutlineMail } from 'react-icons/hi';
import Cookies from "js-cookie";
import axios from "axios";

export default function RequestSuggestion({server,requestee}:{server:string,requestee:number}) {
  const toast = useToast();

  const { 
    isOpen: isOpenRequestSuggestionModal, 
    onOpen: onOpenRequestSuggestionbModal, 
    onClose: onCloseRequestSuggestionModal 
  } = useDisclosure()

  const noteRef = useRef({} as HTMLTextAreaElement);
  const [error,setError] = useState("");
  async function sendSuggestionRequest() {
    let tokenCookie: string | null = Cookies.get().token;
    await axios
    .post(server + "/api/sendsuggestionrequest",
      {
        note: noteRef.current.value,
        requestee: requestee
      },
      {
        headers: {
          authorization: tokenCookie
        }
      }
    )
    .then((response)=>{
      toast({
        description: "Suggestion request sent",
        status: "success",
        duration: 9000,
        isClosable: true
      });
      onCloseRequestSuggestionModal()
    })
    .catch((response)=>{
      console.log(response)
      setError(response.data.message)
      throw new Error(response.data?.message)
    })
  }

  return (
    <>
      {/* <Button
        size="xs"
        variant="ghost"
        p={0}
        onClick={onOpenRequestSuggestionbModal}
        display="flex"
        gap={1}
      >
        <HiOutlineMail size={20} /> Request a suggestion
      </Button> */}

      <MenuItem
        onClick={onOpenRequestSuggestionbModal}
        fontWeight="bold"
        fontSize="sm"
        aria-label="request a suggestion"
        icon={<HiOutlineMail size={20} />}
      >
        Request a suggestion
      </MenuItem>

      <Modal isOpen={isOpenRequestSuggestionModal} onClose={onCloseRequestSuggestionModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
          <ModalHeader>
            Request a Suggestion
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box>
              <Textarea
                placeholder="Note? (optional)"
                ref={noteRef}
              >
              </Textarea>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Flex
              justify="flex-end"
              align="center"
              gap={2}
            >
              <Text color="red" fontStyle="italic">
                {error ? (
                  error
                ): null}
              </Text>
              <Button 
                // variant='ghost' 
                mr={3}
                onClick={e=>sendSuggestionRequest()}
                backgroundColor="black"
                color="white"
              >
                Send Request
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
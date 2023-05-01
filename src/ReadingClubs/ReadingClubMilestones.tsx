import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReadingClub, ReaderNotes, ReadingClubForm, School, EntryData, UserEntry } from "../types/types";
import { 
  Box,
  Heading,
  Text,
  Select,
  Stack,
  Button,
  Input,
  Textarea,
  FormLabel,
  Flex,
  Skeleton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  TableContainer,
  Spinner,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { MdChevronRight } from 'react-icons/md';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export default function ReadingClubMilestones({server}: {server: string}) {
  dayjs.extend(utc);
  const toast = useToast()
  const queryClient = useQueryClient();

  async function getMilestonesReadingClubs() {
    let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        const readingClubEntriesData = await axios
          .get(server + "/api/getmilestonesreadingclubs",
            {
              headers: {
                'authorization': tokenCookie
              }
            }
          )
          .then((response)=>{
            const {data} = response;
            return data;
          })
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.message)
          })
        return readingClubEntriesData
      }
      else {
        throw new Error("RCE100")
      }
  }

  const [milestonesNumber,setMilestonesNumber] = useState(0)
  const [entryPeople,setEntryPeople] = useState({} as any)
  const [entriesLoading,setEntriesLoading] = useState(false)
  async function getMilestonesReadingClubEntries(e: any) {
    setEntriesLoading(true)
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      await axios
        .get(`${server}/api/getmilestonesreadingclubentries?readingclub=${e.target.value}`,
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          const {data} = response;
          console.log(data)
          setMilestonesNumber(data.milestones)
          let entries = data.readingClubEntries.filter((value: any, index: number, self: any) =>
            index === self.findIndex((t: any) => (
              t.Profile.id === value.Profile.id
            ))
          )
          
          setEntryPeople(entries)
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.error)
        })
    }
    else {
      throw new Error("RCMSE101")
    }
    setEntriesLoading(false)
  }

  const { 
    isOpen: isOpenReaderNotesModal, 
    onOpen: onOpenReaderNotesModal, 
    onClose: onCloseReaderNotesModal 
  } = useDisclosure()
  const [readerNotesData,setReaderNotesData] = useState<ReaderNotes | null>(null);
  const [readerProfileIdForModal,setReaderProfileIdForModal] = useState<number | null>(null);
  const [readerName,setReaderName] = useState<string | null>(null);
  function openReaderNotesModal(e: React.FormEvent<HTMLElement>) {
    setReaderNotesData(prev=>JSON.parse((e.target as any).dataset.readernotesdata)[0])
    setReaderProfileIdForModal(prev=>parseInt((e.target as any).dataset.readerprofileid))
    setReaderName((e.target as any).dataset.readername)
    onOpenReaderNotesModal();
  }
  function closeReaderNotesModal() {
    setReaderNotesData(null)
    setReaderProfileIdForModal(null)
    setReaderName(null)
    onCloseReaderNotesModal();
  }

  const readerNotesRef = useRef<HTMLTextAreaElement>();
  const createUpdateReaderNotesMutation = useMutation({
    mutationFn: async (e: React.FormEvent)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const readerProfile = parseInt((e.target as any).dataset.readerprofileid);
      const notes = readerNotesRef.current!.value;
      await axios
        .post(server + "/api/readernotes", 
        {
          readerProfile,
          notes
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            toast({
              description: "Reader notes updated",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          }
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.message)
        })
      // return getReadingClubEntries();
    },
    onSuccess: (data,variables)=>{
      // queryClient.invalidateQueries({ queryKey: ['readingClubEntriesKey'] })
      // queryClient.resetQueries({queryKey: ['readingClubEntriesKey']})
      // queryClient.setQueryData(["readingClubEntriesKey"],data)
    }
  })
  function createUpdateReaderNotes(e: React.FormEvent) {
    createUpdateReaderNotesMutation.mutate(e);
  }
 
  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['milestonesReadingClubsKey'], 
    queryFn: getMilestonesReadingClubs
  });
  const readingClubs = data?.readingClubs;
  
  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }
  
  return (
    <Box className="main-content">
      <Breadcrumb 
        spacing='8px' 
        separator={<MdChevronRight color='gray.500' />}
        m=".5rem"
      >
        <BreadcrumbItem>
          <BreadcrumbLink href='/readingclubs'>Reading Clubs</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink href='#'>Reading Club Milestones</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Skeleton 
        isLoaded={!isLoading}
      >
        <Box className="well" height="fit-content">
          <Flex align="center" justify="space-between" wrap="wrap" mb={2}>
            <Heading as="h3" size="md">
              Milestones
            </Heading>
            <Select
              width="auto"
              onClick={e=>getMilestonesReadingClubEntries(e)}
            >
              <option value="">None</option>
              {readingClubs && readingClubs.length ? (
                readingClubs.map((readingClub: ReadingClub)=>{
                  return (
                    <option 
                      key={readingClub.id}
                      value={readingClub.id}
                    >
                      {readingClub.name}
                    </option>
                  )
                })
              ) : null}
            </Select>
          </Flex>
          <TableContainer
            whiteSpace="break-spaces"
            overflowX="auto"
            overflowY="auto"
            display="block"
            maxH="75vh"
          >
            <Table
              size="sm" 
              variant="simple"
              sx={{
                tableLayout: "auto"
              }}
            >
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th># of entries</Th>
                  {milestonesNumber ? (
                    [...Array(milestonesNumber)].map((m,i)=>{
                      return (
                        <Th key={i}>{i + 1}</Th>
                      )
                    })
                  ) : null}
                  <Th></Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
              {entriesLoading ? (
                <Flex justify="center" w="100%">
                  <Spinner/>
                </Flex>
              ) : (
                entryPeople && entryPeople.length ? (
                  entryPeople.map((eP: UserEntry,i: number)=>{
                    return (
                      <Tr key={i}>
                        <Td
                          maxWidth="125px"
                          whiteSpace="break-spaces"
                        >
                          {eP.Profile.User.last_name + ", " + eP.Profile.User.first_name}
                        </Td>
                        <Td
                          maxWidth="125px"
                          whiteSpace="break-spaces"
                        >
                          Number
                        </Td>
                        {milestonesNumber ? (
                          [...Array(milestonesNumber)].map((m,i)=>{
                            return (
                              <Td key={i}>
                                <Checkbox></Checkbox>
                              </Td>
                            )
                          })
                        ) : null}
                        <Td
                          maxWidth="125px"
                          whiteSpace="break-spaces"
                        >
                          <Button
                            size="xs"
                          >
                            Save
                          </Button>
                        </Td>
                        <Td
                          maxWidth="125px"
                          whiteSpace="break-spaces"
                        >
                          <Button
                            size="xs"
                          >
                            View
                          </Button>
                        </Td>
                      </Tr>
                    )
                  })
                ) : null
              )}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

          <Modal 
            isOpen={isOpenReaderNotesModal} 
            onClose={closeReaderNotesModal}
            isCentered
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Box>
                  <Heading as="h3" size="md">
                    {readerName}
                  </Heading>
                </Box>
              </ModalHeader>
              <ModalCloseButton />
                <ModalBody>
                  <Textarea
                    defaultValue={readerNotesData?.notes ? readerNotesData.notes : ""}
                    ref={readerNotesRef as any}
                    rows={15}
                  >
                  </Textarea>
                  <Text mt={2}>
                    last updated: <i>{readerNotesData?.datetime ? dayjs(readerNotesData.datetime).local().format("MM/DD/YYYY H:mm a") : null}</i>
                  </Text>
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="green"
                    data-readerprofileid={readerProfileIdForModal}
                    onClick={e=>createUpdateReaderNotes(e)}
                  >
                    Save
                  </Button>
                </ModalFooter>
            </ModalContent>
          </Modal>
      </Skeleton>
    </Box>
  );
};
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReadingClub, ReaderNotes, UserEntry, UserEntryWNumOfEntries, HTMLInputEvent } from "../types/types";
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
  async function getMilestonesReadingClubEntries(readingClubId: string) {
    if (readingClubId === "") return;
    setEntriesLoading(true)
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      await axios
        .get(`${server}/api/getmilestonesreadingclubentries?readingclub=${readingClubId}`,
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          const {data} = response;
          setMilestonesNumber(data.milestones)
          let entries = data.readingClubEntries.filter((value: any, index: number, self: any) =>
            index === self.findIndex((t: any) => (
              t.Profile.id === value.Profile.id
            ))
          )
          //enter number of entries
          entries = entries.map((entry: UserEntry)=>{
            return {...entry, numOfEntries: data.readingClubEntries.filter((e: UserEntry)=>e.Profile.id === entry.Profile.id).length}
          })
          //filter profile milestones to specific reading club
          entries = entries.map((entry: UserEntry)=>{
            return {
              ...entry, Profile: {
                ...entry.Profile, ReaderMilestones: entry.Profile.ReaderMilestones.filter((milestones)=>{
                  return milestones.reading_club === parseInt(readingClubId)
                })[0]
              }
            }
          })
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
          window.location.reload();
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.message)
        })
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

  async function saveMilestones(e: React.FormEvent<HTMLElement>) {
    const readerReadingClubId = parseInt((e.target as HTMLElement).dataset.readingclubid!);
    const readerProfileId = parseInt((e.target as HTMLElement).dataset.profileid!);
    const rowId = (e.target as HTMLElement).dataset.rowid!;
    const row = document.getElementById(rowId);
    const checkBoxes = row?.querySelectorAll("input[type='checkbox']");
    let milestones: any[] = []
    checkBoxes?.forEach((checkbox: any,i:number)=>{
      milestones.push({
        sequence: i,
        checked: checkbox.checked ? true : false
      })
    })
    let tokenCookie: string | null = Cookies.get().token;
    await axios
      .post(server + "/api/savemilestones", 
      {
        readerReadingClubId,
        readerProfileId,
        milestones: JSON.stringify(milestones)
      },
      {
          headers: {
          'authorization': tokenCookie
        }
      }
      )
      .then((response)=>{
        if (response.data.success){
          toast({
            description: "Reader milestones updated",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        }
        getMilestonesReadingClubEntries(readerReadingClubId.toString())
      })
      .catch(({response})=>{
        console.log(response)
        toast({
          description: "Error: RM200",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        throw new Error(response.data.message)
      })
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
              onClick={e=>getMilestonesReadingClubEntries((e.target as any).value)}
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
          {entriesLoading ? (
            <Flex justify="center" w="100%">
              <Spinner/>
            </Flex>
          ) : (
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
                  </Tr>
                </Thead>
                <Tbody>
                {entryPeople && entryPeople.length ? (
                    entryPeople.map((eP: UserEntryWNumOfEntries,index: number)=>{
                      let savedMilestones = eP.Profile.ReaderMilestones;
                      if (savedMilestones !== undefined) {
                        savedMilestones = JSON.parse((savedMilestones as any).milestones)
                      }
                      return (
                        <Tr key={index} id={index + "-" + eP.Profile.User.last_name.replace(/\s/g, '')}>
                          <Td
                            maxWidth="125px"
                            whiteSpace="break-spaces"
                          >
                            <Button
                                size="xs"
                                whiteSpace="break-spaces"
                                padding="5px"
                                height="auto"
                                variant="ghost"
                                data-readername={eP.Profile.User.last_name + ", " + eP.Profile.User.first_name}
                                data-readerprofileid={eP.Profile.id}
                                data-readernotesdata={JSON.stringify(eP.Profile.ReaderNotes)}
                                onClick={e=>openReaderNotesModal(e)}
                              >
                                {eP.Profile.User.last_name + ", " + eP.Profile.User.first_name}
                              </Button>
                          </Td>
                          <Td
                            maxWidth="125px"
                            whiteSpace="break-spaces"
                          >
                            {eP.numOfEntries}
                          </Td>
                          {milestonesNumber ? (
                            [...Array(milestonesNumber)].map((m,j)=>{
                              return (
                                <Td key={j}>
                                  <Checkbox
                                    defaultChecked={savedMilestones && savedMilestones[j] ? (savedMilestones[j] as any).checked : false}
                                  >
                                  </Checkbox>
                                </Td>
                              )
                            })
                          ) : null}
                          <Td
                            maxWidth="125px"
                            whiteSpace="break-spaces"
                          >
                            <Flex
                              direction="column"
                              align="center"
                              justify="center"
                            >
                              <Button
                                data-readingclubid={eP.reading_club}
                                data-profileid={eP.Profile.id}
                                data-rowid={index + "-" + eP.Profile.User.last_name.replace(/\s/g, '')}
                                onClick={e=>saveMilestones(e)}
                                size="xs"
                                mb={1}
                              >
                                Save
                              </Button>
                              <Box fontSize="xs">
                                {dayjs((eP.Profile.ReaderMilestones as any).datetime).local().format("MM/DD/YYYY h:mm a")}
                              </Box>
                            </Flex>
                          </Td>
                        </Tr>
                      )
                    })
                  ) : null}
                </Tbody>
              </Table>
            </TableContainer>
          )}
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
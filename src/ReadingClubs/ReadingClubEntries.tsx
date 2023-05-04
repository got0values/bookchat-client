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
  Fade,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { MdChevronRight } from 'react-icons/md';
import { BiDownload } from 'react-icons/bi';
import { tableToCsv } from "../utils/tableToCsv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export default function ReadingClubEntries({server}: {server: string}) {
  dayjs.extend(utc);
  const toast = useToast()
  const queryClient = useQueryClient();

  async function getReadingClubEntries() {
    let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        const readingClubEntriesData = await axios
          .get(server + "/api/getreadingclubentries",
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

  const { 
    isOpen: isOpenViewEntryModal, 
    onOpen: onOpenViewEntryModal, 
    onClose: onCloseViewEntryModal 
  } = useDisclosure()
  const [viewEntryData,setViewEntryData] = useState<string | null>(null);
  const [viewEntryPerson,setViewEntryPerson] = useState<string | null>(null);
  const [viewEntryDate,setViewEntryDate] = useState<string | null>(null);
  const [viewEntryTitle,setViewEntryTitle] = useState<string | null>(null);
  function openViewEntryModal(e: React.FormEvent<HTMLElement>) {
    if ((e.target as HTMLElement).dataset.entrydata) {
      setViewEntryData((e.target as HTMLElement).dataset.entrydata!)
      setViewEntryPerson((e.target as HTMLElement).dataset.entryperson!)
      setViewEntryDate((e.target as HTMLElement).dataset.entrydate!)
      setViewEntryTitle((e.target as HTMLElement).dataset.entrytitle!)
      onOpenViewEntryModal();
    }
  }
  function closeViewEntryModal() {
    setViewEntryData(null)
    setViewEntryPerson(null)
    setViewEntryDate(null)
    setViewEntryTitle(null)
    onCloseViewEntryModal();
  }

  const nameRef = useRef<HTMLInputElement>({} as HTMLInputElement)
  const clubRef = useRef<HTMLSelectElement>({} as HTMLSelectElement);
  const formRef = useRef<HTMLSelectElement>({} as HTMLSelectElement);
  const schoolRef = useRef<HTMLSelectElement>({} as HTMLSelectElement);
  function filterReadingClubEntries() {
    setEntries(prev=>originalEntries)
    setEntries((prev: any)=>{
      return prev?.filter((entry: UserEntry)=>{
        const currentName = nameRef.current.value.toLowerCase() !== "" ? nameRef.current.value.toLowerCase() : (entry.Profile.User.last_name + ", " + entry.Profile.User.first_name).toLowerCase();
        const currentClub = clubRef.current.value !== "" ? parseInt(clubRef.current.value) : entry.reading_club;
        const currentForm = formRef.current.value !== "" ? formRef.current.value : entry.form_name;
        const currentSchool = schoolRef.current.value !== "" ? parseInt(schoolRef.current.value) : parseInt(JSON.parse(entry.entry_data as string).filter(
          (data: EntryData)=>data.type === "school"
        )[0]?.answer);
        
        if (schoolRef.current.value) {
          return (
            (entry.Profile.User.last_name + ", " + entry.Profile.User.first_name).toLowerCase().includes(currentName) &&
            entry.reading_club === currentClub &&
            entry.form_name === currentForm && 
            parseInt(JSON.parse(entry.entry_data as string).filter(
              (data: EntryData)=>data.type === "school"
            )[0]?.answer) === currentSchool
          )
        }
        else {
          return (
            (entry.Profile.User.last_name + ", " + entry.Profile.User.first_name).toLowerCase().includes(currentName) &&
            entry.reading_club === currentClub &&
            entry.form_name === currentForm
          )
        }

      });
    })
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
      return getReadingClubEntries();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubEntriesKey'] })
      queryClient.resetQueries({queryKey: ['readingClubEntriesKey']})
      queryClient.setQueryData(["readingClubEntriesKey"],data)
    }
  })
  function createUpdateReaderNotes(e: React.FormEvent) {
    createUpdateReaderNotesMutation.mutate(e);
  }
 
  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['readingClubEntriesKey'], 
    queryFn: getReadingClubEntries
  });
  const readingClubs = data?.readingClubs;
  const forms = data?.forms;
  const schools = data?.schools;
  const clubEntries = data?.entries;

  const [originalEntries,setOriginalEntries] = useState<UserEntry[] | null>(null)
  const [entries,setEntries] = useState<UserEntry[] | null>(null)
  useEffect(()=>{
    setOriginalEntries(clubEntries)
    setEntries(clubEntries)
  },[clubEntries])
  
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
          <BreadcrumbLink href='#'>Reading Club Entries</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Skeleton 
        isLoaded={!isLoading}
      >
          <Flex flexWrap="wrap">
            <Box flex="1 1 30%" minW="250px">
              <Box className="well" height="fit-content">
                <Heading as="h3" size="md" mb={2}>
                  Filter
                </Heading>
                <Stack>
                  <Box>
                    <FormLabel htmlFor="name" mb={1}>Name</FormLabel>
                    <Input id="name" ref={nameRef} type="text"/>
                  </Box>
                  <Box>
                    <FormLabel htmlFor="clubs" mb={1}>Reading Club</FormLabel>
                    <Select id="clubs" ref={clubRef}>
                      <option value="">All</option>
                      {readingClubs && readingClubs.length ? (
                        readingClubs.map((club: ReadingClub)=>{
                          return (
                            <option key={club.id} value={club.id}>{club.name}</option>
                          )
                        })
                      ) : null}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel htmlFor="forms" mb={1}>Form</FormLabel>
                    <Select id="forms" ref={formRef}>
                      <option value="">All</option>
                      {forms && forms.length ? (
                        forms.map((form: ReadingClubForm)=>{
                          return (
                            <option key={form.id} value={form.name}>{form.name}</option>
                          )
                        })
                      ) : null}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel htmlFor="schools" mb={1}>School</FormLabel>
                    <Select id="schools" ref={schoolRef}>
                      <option value="">All</option>
                      {schools && schools.length ? (
                        schools.map((school: School)=>{
                          return (
                            <option key={school.id} value={school.id}>{school.name}</option>
                          )
                        })
                      ) : null}
                    </Select>
                  </Box>
                  <Button
                    onClick={e=>filterReadingClubEntries()}
                  >
                    Apply
                  </Button>
                </Stack>
              </Box>
            </Box>
            <Box flex="1 1 auto">
              <Box className="well" height="fit-content">
                <Flex align="center" justify="space-between" mb={3}>
                  <Heading as="h3" size="md" mb={2}>
                    Entries
                  </Heading>
                  <Button
                    onClick={e=>tableToCsv("ReadingClubEntries")}
                    leftIcon={<BiDownload size={20} />}
                    variant="ghost"
                    size="sm"
                    color="gray.700"
                  >
                    Export to CSV
                  </Button>
                </Flex>
                <TableContainer
                  whiteSpace="break-spaces"
                  overflowX="auto"
                  overflowY="auto"
                  // overflow="auto"
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
                    <TableCaption>
                      Total: {entries && entries.length}
                    </TableCaption>
                    <Thead>
                      <Tr>
                        <Th className="thGet">Name</Th>
                        <Th className="thGet">Date</Th>
                        <Th className="thGet">Club</Th>
                        <Th className="thGet">Form</Th>
                        <Th className="thGet">School</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                    {entries && entries.length ? (
                      entries
                      .sort((a: UserEntry, b: UserEntry)=>{
                        if (a.Profile.User.last_name.toLowerCase() + a.Profile.User.first_name.toLowerCase() < b.Profile.User.last_name.toLowerCase() + b.Profile.User.first_name.toLowerCase()) {
                          return -1
                        }
                        if (a.Profile.User.last_name.toLowerCase() + a.Profile.User.first_name.toLowerCase() > b.Profile.User.last_name.toLowerCase() + b.Profile.User.first_name.toLowerCase()) {
                          return 1;
                        }
                        return 0;
                      })
                      .map((entry: UserEntry,i: number)=>{
                        return (
                          <Tr key={i}>
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
                                data-readername={entry.Profile.User.last_name + ", " + entry.Profile.User.first_name}
                                data-readerprofileid={entry.Profile.id}
                                data-readernotesdata={JSON.stringify(entry.Profile.ReaderNotes)}
                                onClick={e=>openReaderNotesModal(e)}
                                className="tdGet"
                              >
                                {entry.Profile.User.last_name + ", " + entry.Profile.User.first_name}
                              </Button>
                            </Td>
                            <Td className="tdGet">{dayjs(entry.created_on).local().format("MM/DD/YYYY")}</Td>
                            <Td 
                              maxWidth="125px"
                              whiteSpace="break-spaces"
                              className="tdGet"
                            >
                              {entry.ReadingClub?.name}
                            </Td>
                            <Td
                              maxWidth="125px"
                              whiteSpace="break-spaces"
                            >
                              <Link
                                href="#"
                                data-entrytitle={entry.form_name}
                                data-entryperson={entry.Profile.User.last_name + ", " + entry.Profile.User.first_name}
                                data-entrydate={dayjs(entry.created_on).local().format("MM/DD/YYYY")}
                                data-entrydata={entry.entry_data}
                                onClick={e=>openViewEntryModal(e)}
                                className="tdGet"
                              >
                                {entry.form_name}
                              </Link>
                            </Td>
                            <Td
                              maxWidth="125px"
                              whiteSpace="break-spaces"
                              className="tdGet"
                            >
                              {JSON.parse(entry.entry_data as string).filter((data: EntryData)=>data.type === "school") ? 
                              (
                                JSON.parse(entry.entry_data as string).filter((data: EntryData)=>data.type === "school")[0]?.answer ? (
                                  schools?.filter(
                                    (school: School)=>school.id === parseInt(JSON.parse(entry.entry_data as string).filter(
                                      (data: EntryData)=>data.type === "school"
                                    )[0]?.answer)
                                  )[0]?.name
                                ) : null
                              ) : 
                              (
                                null
                              )}
                            </Td>
                          </Tr>
                        )
                      })
                    ) : null}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </Flex>

          <Modal 
            isOpen={isOpenViewEntryModal} 
            onClose={closeViewEntryModal}
            isCentered
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Box>
                  <Heading as="h3" size="md">
                    {viewEntryTitle}
                  </Heading>
                  <Heading as="h4" size="sm">
                    {viewEntryPerson} - {viewEntryDate}
                  </Heading>
                </Box>
              </ModalHeader>
              <ModalCloseButton />
                <ModalBody>
                  {viewEntryData ? (
                    JSON.parse(viewEntryData as string).map((entry: EntryData,i: number)=>{
                    return (
                      <Box key={i} mb={2}>
                        <Text fontWeight="bold">{entry.question}</Text>
                        <Text>{entry.answer}</Text>
                      </Box>
                    )
                  })) : null}
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </ModalContent>
          </Modal>

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
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReadingClub, FormType, ReadingClubForm, School, EntryData, UserEntry } from "../types/types";
import { 
  Box,
  Tag,
  Heading,
  Text,
  Spinner,
  Divider,
  Select,
  Stack,
  HStack,
  Button,
  Input,
  Textarea,
  FormLabel,
  InputGroup,
  InputLeftAddon,
  Flex,
  Skeleton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Checkbox,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Link,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { MdChevronRight } from 'react-icons/md';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export default function ReadingClubEntries({server}: {server: string}) {
  dayjs.extend(utc);

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
                <Heading as="h3" size="md" mb={2}>
                  Entries
                </Heading>
                <TableContainer
                  whiteSpace="break-spaces"
                  overflowX="auto"
                  overflowY="auto"
                  // maxWidth="60%"
                  display="block"
                >
                  <Table
                    size="sm" 
                    variant="simple"
                  >
                    <TableCaption>
                      Total: {entries && entries.length}
                    </TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Date</Th>
                        <Th>Club</Th>
                        <Th>Form</Th>
                        <Th>School</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                    {entries && entries.length ? (
                      entries.map((entry: UserEntry,i: number)=>{
                        return (
                          <Tr key={i}>
                            <Td
                              maxWidth="100px"
                              whiteSpace="break-spaces"
                            >
                              {entry.Profile.User.last_name + ", " + entry.Profile.User.first_name}
                            </Td>
                            <Td>{dayjs(entry.created_on).local().format("MM/DD/YYYY")}</Td>
                            <Td 
                              maxWidth="125px"
                              whiteSpace="break-spaces"
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
                              >
                                {entry.form_name}
                              </Link>
                            </Td>
                            <Td
                              maxWidth="125px"
                              whiteSpace="break-spaces"
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
      </Skeleton>
    </Box>
  );
};
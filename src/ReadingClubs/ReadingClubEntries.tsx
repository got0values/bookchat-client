import React, { useState, useRef } from "react";
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
  const toast = useToast();
  const queryClient = useQueryClient();
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
            console.log(response.data)
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
  const [viewEntryData,setViewEntryData] = useState(null);
  function openViewEntryModal(e: React.FormEvent<HTMLElement>) {
    if ((e.target as HTMLElement).dataset.entrydata) {
      setViewEntryData((e.target as HTMLElement).dataset.entrydate!)
      onOpenViewEntryModal();
    }
  }
  function closeViewEntryModal() {
    setViewEntryData(null)
    onCloseViewEntryModal();
  }
 
  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['readingClubEntriesKey'], 
    queryFn: getReadingClubEntries
  });
  const readingClubs = data?.readingClubs;
  const forms = data?.forms;
  const schools = data?.schools;
  const entries = data?.entries;
  
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
                  Search
                </Heading>
                <Flex mb={2} gap={2}>
                  <Input type="text"/>
                  <Button>
                    Search
                  </Button>
                </Flex>
              </Box>
              <Box className="well" height="fit-content">
                <Heading as="h3" size="md" mb={2}>
                  Filter
                </Heading>
                <Stack>
                  <Box>
                    <FormLabel htmlFor="clubs" mb={1}>Reading Club</FormLabel>
                    <Select id="clubs">
                      <option>All</option>
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
                    <FormLabel htmlFor="clubs" mb={1}>Form</FormLabel>
                    <Select id="clubs">
                      <option>All</option>
                      {forms && forms.length ? (
                        forms.map((form: ReadingClubForm)=>{
                          return (
                            <option key={form.id} value={form.id}>{form.name}</option>
                          )
                        })
                      ) : null}
                    </Select>
                  </Box>
                  <Box>
                    <FormLabel htmlFor="clubs" mb={1}>School</FormLabel>
                    <Select id="clubs">
                      <option>All</option>
                      {schools && schools.length ? (
                        schools.map((school: School)=>{
                          return (
                            <option key={school.id} value={school.id}>{school.name}</option>
                          )
                        })
                      ) : null}
                    </Select>
                  </Box>
                  <Button>Apply</Button>
                </Stack>
              </Box>
            </Box>
            <Box flex="1 1 auto">
              <Box className="well" height="fit-content">
                <Heading as="h3" size="md" mb={2}>
                  Entries
                </Heading>
                <TableContainer>
                  <Table 
                    variant="simple" 
                    size="sm" 
                    whiteSpace="nowrap"
                    overflowX="auto"
                    overflowY="auto"
                    maxWidth="100%"
                    display="block"
                  >
                    <TableCaption>
                      Total: {entries && entries.length}
                    </TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Date</Th>
                        <Th>Form</Th>
                        <Th>Notes</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                    {entries && entries.length ? (
                      entries.map((entry: UserEntry,i: number)=>{
                        return (
                          <Tr key={i}>
                            <Td>{entry.Profile.User.last_name + ", " + entry.Profile.User.first_name}</Td>
                            <Td>{dayjs(entry.created_on).local().format("MM/DD/YYYY")}</Td>
                            <Td>
                              <Link
                                href="#"
                                data-entrydata={entry.entry_data}
                                onClick={e=>openViewEntryModal(e)}
                              >
                                {entry.form_name}
                              </Link>
                            </Td>
                            <Td>
                              <Flex
                                align="center"
                                justify="center"
                                gap={1}
                              >
                                <Text></Text>
                                <Button size="xs">Add</Button>
                              </Flex>
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
            size="xl"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Heading as="h3" size="lg">
                  Modal
                </Heading>
              </ModalHeader>
              <ModalCloseButton />
                <ModalBody>
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </ModalContent>
          </Modal>
      </Skeleton>
    </Box>
  );
};
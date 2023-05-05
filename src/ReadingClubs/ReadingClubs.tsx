import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReadingClub, FormType, ReadingClubForm, School, EntryData, UserEntry, ProfileType } from "../types/types";
import { 
  Box,
  Image,
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
  useToast,
  Link,
  useDisclosure
} from "@chakra-ui/react";
import { IoIosAdd, IoIosRemove } from 'react-icons/io';
import { BiDotsHorizontalRounded, BiTrash, BiBuildings, BiEdit } from 'react-icons/bi';
import { AiOutlineLineChart } from 'react-icons/ai';
import { MdEdit, MdFormatListBulleted } from 'react-icons/md';
import { FaWpforms } from 'react-icons/fa';
import { FiTrash2 } from 'react-icons/fi';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";


export default function ReadingClubs({server}: {server: string}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  dayjs.extend(utc);

  async function getReadingClubs() {
    let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        const readingClubsData = await axios
          .get(server + "/api/getreadingclubs",
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
            throw new Error(response.data.error)
          })
        return readingClubsData
      }
      else {
        throw new Error("RC101")
      }
  }



  const { 
    isOpen: isOpenCreateFormModal, 
    onOpen: onOpenCreateFormModal, 
    onClose: onCloseCreateFormModal 
  } = useDisclosure()
  function openCreateFormModal() {
    onOpenCreateFormModal();
  }
  function closeCreateFormModal() {
    setCreateFormError("");
    (labelRef.current as HTMLInputElement).value = "";
    setFormFields([]);
    onCloseCreateFormModal();
  }
  const createFormNameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const [formFields,setFormFields] = useState<FormType[]>([]);
  const [createFormError,setCreateFormError] = useState<string>("");
  const createFormMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const formName = createFormNameRef.current.value;
      let tokenCookie: string | null = Cookies.get().token;
      if (formName) {
        await axios
        .post(server + "/api/createreadingclubform", 
        {
          formName: formName,
          formFields: JSON.stringify(formFields)
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            closeCreateFormModal();
            toast({
              description: "Reading club created!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          }
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            setCreateFormError(response.data.message)
          }
        })
      }
      else {
        setCreateFormError("Please enter a form name")
      }
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function createForm(e: React.FormEvent<HTMLFormElement>) {
    createFormMutation.mutate(e);
  }

  const labelRef = useRef<HTMLInputElement>()
  const typeRef = useRef<HTMLInputElement>();
  const requiredRef = useRef<HTMLInputElement>();
  function addFormField() {
    const labelText = (labelRef.current as HTMLInputElement).value
    const typeText = (typeRef.current as HTMLInputElement).value
    const requiredBool = (requiredRef.current as HTMLInputElement).checked
    setFormFields((prev: any[])=>{
      const i = 0;
      return (
        [...prev,
          {
            id: `${typeText}-${prev.length}`,
            type: typeText,
            label: labelText,
            required: requiredBool,
            sequence: prev.length
          }
        ]
      )
    });
    (labelRef.current as HTMLInputElement).value = "";
  }
  function removeFormField(fieldId: string) {
    setFormFields(prev=>{
      return prev.filter((field)=>field.id !== fieldId)
    })
  }


  const { 
    isOpen: isOpenCreateReadingClubModal, 
    onOpen: onOpenCreateReadingClubModal, 
    onClose: onCloseCreateReadingClubModal 
  } = useDisclosure()
  function openCreateReadingClubModal() {
    onOpenCreateReadingClubModal();
  }
  function closeCreateReadingClubModal() {
    setCreateReadingClubError("");
    onCloseCreateReadingClubModal();
  }
  const createReadingClubNameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const createReadingClubDescriptionRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const createReadingClubFormRef = useRef<HTMLInputElement>(null);
  const createReadingClubMilestonesRef = useRef<HTMLInputElement>(null);
  const [createReadingClubError,setCreateReadingClubError] = useState<string>("");
  const createReadingClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const readingClubName = createReadingClubNameRef.current.value;
      const readingClubDescription = createReadingClubDescriptionRef.current.value;
      const readingClubFormAnswer = (createReadingClubFormRef.current as HTMLInputElement).value === "" ? null : parseInt((createReadingClubFormRef.current as HTMLInputElement).value)
      const readingClubMilestones = parseInt((createReadingClubMilestonesRef.current as HTMLInputElement).value);
      let tokenCookie: string | null = Cookies.get().token;
      if (readingClubName.length) {
        await axios
        .post(server + "/api/createreadingclub", 
        {
          readingClubName: readingClubName,
          readingClubDescription: readingClubDescription,
          readingClubForm: readingClubFormAnswer,
          readingClubMilestones: readingClubMilestones
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            closeCreateReadingClubModal();
            toast({
              description: "Reading club created!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          }
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            setCreateReadingClubError(response.data.message)
          }
        })
      }
      else {
        setCreateReadingClubError("Please enter a book club name")
      }
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function createReadingClub(e: React.FormEvent<HTMLFormElement>) {
    createReadingClubMutation.mutate(e);
  }


  const { 
    isOpen: isOpenEditReadingClubModal, 
    onOpen: onOpenEditReadingClubModal, 
    onClose: onCloseEditReadingClubModal 
  } = useDisclosure()
  const [editId,setEditId] = useState("");
  const [editName,setEditName] = useState("");
  const [editDescription,setEditDescription] = useState("");
  const [editMilestones,setEditMilestones] = useState("");
  const [editHidden,setEditHidden] = useState("");
  const [defaultForm,setDefaultForm] = useState("");
  const editReadingClubFormRef = useRef<HTMLInputElement>(null);
  function openEditReadingClubModal(e: React.FormEvent<HTMLButtonElement>) {
    setEditId((e.target as HTMLElement).dataset.id!)
    setEditName((e.target as HTMLElement).dataset.name!)
    setEditDescription((e.target as HTMLElement).dataset.description!)
    setEditMilestones((e.target as HTMLElement).dataset.milestones!)
    setEditHidden((e.target as HTMLElement).dataset.display!)
    setDefaultForm((e.target as HTMLElement).dataset.form!)
    onOpenEditReadingClubModal();
  }
  function closeEditReadingClubModal() {
    setEditId("");
    setEditName("");
    setEditDescription("");
    setEditMilestones("");
    setEditHidden("");
    setEditReadingClubError("");
    setDefaultForm("");
    (editReadingClubFormRef.current as HTMLInputElement).value = "";
    onCloseEditReadingClubModal();
  }


  const editReadingClubNameRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const editReadingClubDescriptionRef = useRef<HTMLTextAreaElement>({} as HTMLTextAreaElement);
  const editReadingClubHiddenRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const editReadingClubMilestonesRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const [editReadingClubError,setEditReadingClubError] = useState<string>("");
  const editReadingClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const readingClubName = editReadingClubNameRef.current.value;
      const readingClubDescription = editReadingClubDescriptionRef.current.value;
      const readingClubHidden = editReadingClubHiddenRef.current.checked ? 1 : 0;
      const readingClubFormAnswer = (editReadingClubFormRef.current as HTMLInputElement).value === "" ? null : parseInt((editReadingClubFormRef.current as HTMLInputElement).value)
      const readingClubMilestones = parseInt((editReadingClubMilestonesRef.current as HTMLInputElement).value);

      let tokenCookie: string | null = Cookies.get().token;
      if (readingClubName.length) {
        await axios
        .put(server + "/api/editreadingclub", 
        {
          readingClubId: (e.target as HTMLElement).dataset.id,
          readingClubName: readingClubName,
          readingClubDescription: readingClubDescription,
          readingClubForm: readingClubFormAnswer,
          readingClubMilestones: readingClubMilestones,
          readingClubHidden: readingClubHidden
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            closeEditReadingClubModal();
            toast({
              description: "Reading club edited!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          }
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            setCreateReadingClubError(response.data.message)
          }
        })
      }
      else {
        setEditReadingClubError("Please enter a book club name")
      }
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function editReadingClub(e: React.FormEvent<HTMLFormElement>) {
    editReadingClubMutation.mutate(e);
  }
  

  const deleteReadingClubMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLButtonElement>)=>{
      e.preventDefault();
      if (window.confirm("Are you sure you would like to delete this reading club?")) {
        let tokenCookie: string | null = Cookies.get().token;
        await axios
          .delete(server + "/api/deletereadingclub", 
          {
            headers: {
              'authorization': tokenCookie
            },
            data: {
              readingClubId: (e.target as HTMLElement).dataset.id
            }
          })
          .then((response)=>{
            if (response.data.success){
              toast({
                description: "Reading club deleted!",
                status: "success",
                duration: 9000,
                isClosable: true
              })
            }
          })
          .catch(({response})=>{
            console.log(response)
            if (response.data) {
              setEditReadingClubError(response.data.message)
            }
        })
      }
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function deleteReadingClub(e: React.FormEvent<HTMLButtonElement>) {
    deleteReadingClubMutation.mutate(e);
  }


  const { 
    isOpen: isOpenFillFormModal, 
    onOpen: onOpenFillFormModal, 
    onClose: onCloseFillFormModal 
  } = useDisclosure()
  const [fillForm,setFillForm] = useState({} as ReadingClubForm)
  const [formReadingClubId,setFormReadingClubId] = useState<number | null>(null);
  function openFillFormModal(e: HTMLFormElement) {
    if ((e.target as any).dataset.form !== "null") {
      setFillForm(JSON.parse((e.target as any).dataset.form))
      setFormReadingClubId((e.target as any).dataset.readingclubid);
      onOpenFillFormModal();
    }
  }
  function closeFillFormModal() {
    setFillForm({} as ReadingClubForm)
    setFormReadingClubId(null)
    onCloseFillFormModal();
  }

  const submitReadingClubEntryMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const readingClubId = (e.target as HTMLFormElement).dataset.readingclubid;
      const formName = (e.target as HTMLFormElement).dataset.formname;
      let entryData: EntryData[] = []
      const entryFields: EventTarget[] = Array.from(e.target as HTMLFormElement);
      entryFields.forEach((field: any,i: number)=>{
        entryData.push({
          id: field.id,
          type: field.dataset.fieldtype,
          question: field.dataset.question,
          answer: field.value,
          required: field.required,
          sequence: i
        })
      })
      let tokenCookie: string | null = Cookies.get().token;
      await axios
        .post(server + "/api/submitreadingclubentry", 
        {
          entryData: JSON.stringify(entryData),
          readingClubId: parseInt(readingClubId!),
          formName: formName
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            toast({
              description: "Form submitted!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
            closeFillFormModal();
          }
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.message)
        })
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function submitReadingClubEntry(e: React.FormEvent<HTMLFormElement>) {
    submitReadingClubEntryMutation.mutate(e);
  }


  const { 
    isOpen: isOpenDeleteFormModal, 
    onOpen: onOpenDeleteFormModal, 
    onClose: onCloseDeleteFormModal 
  } = useDisclosure()
  const deleteFormRef = useRef<HTMLSelectElement>({} as HTMLSelectElement);
  function openDeleteFormModal() {
    onOpenDeleteFormModal();
  }
  function closeDeleteFormModal() {
    (deleteFormRef.current as any).value = "";
    onCloseDeleteFormModal();
  }
  const deleteFormMutation = useMutation({
    mutationFn: async ()=>{
      const deleteFormRefCurrent = deleteFormRef.current;
      let tokenCookie: string | null = Cookies.get().token;
      await axios
      .delete(server + "/api/deletereadingclubform",
        {
          headers: {
          'authorization': tokenCookie
          },
          data: {
            formId: parseInt((deleteFormRefCurrent as any).value)
          }
        })
        .then((response)=>{
          if (response.data.success){
            toast({
              description: "Reading club form deleted!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          }
        })
        .catch(({response})=>{
          console.log(response)
        })
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function deleteForm() {
    deleteFormMutation.mutate();
  }


  const { 
    isOpen: isOpenSchoolsModal, 
    onOpen: onOpenSchoolsModal, 
    onClose: onCloseSchoolsModal 
  } = useDisclosure()
  const schoolDeleteRef = useRef<HTMLSelectElement>({} as HTMLSelectElement);
  function openSchoolsModal() {
    onOpenSchoolsModal();
  }
  function closeSchoolsModal() {
    (schoolDeleteRef.current as any).value = "";
    onCloseSchoolsModal();
  }
  const schoolTextRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const addSchoolMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const schoolName = schoolTextRef.current.value;
      let tokenCookie: string | null = Cookies.get().token;
      await axios
        .post(server + "/api/addschool", 
        {
          schoolName: schoolName
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            toast({
              description: "School added!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
            schoolTextRef.current.value = "";
          }
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.message)
        })
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function addSchool(e: React.FormEvent<HTMLFormElement>) {
    addSchoolMutation.mutate(e);
  }

  const deleteSchoolMutation = useMutation({
    mutationFn: async ()=>{
      const schoolId = schoolDeleteRef.current.value;
      let tokenCookie: string | null = Cookies.get().token;
      await axios
      .delete(server + "/api/deleteschool",
        {
          headers: {
          'authorization': tokenCookie
          },
          data: {
            schoolId: parseInt(schoolId)
          }
        })
        .then((response)=>{
          if (response.data.success){
            toast({
              description: "School deleted!",
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
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function deleteSchool() {
    deleteSchoolMutation.mutate();
  }


  const { 
    isOpen: isOpenUserEditEntryModal, 
    onOpen: onOpenUserEditEntryModal, 
    onClose: onCloseUserEditEntryModal 
  } = useDisclosure()
  const [userEntryFormData,setUserEntryFormData] = useState(null);
  const [userEntryFormDataId,setUserEntryFormDataId] = useState<string | null>(null);
  const [userEntryFormName,setUserEntryFormName] = useState<string | null>(null);
  const [userEntryDate,setUserEntryDate] = useState<string | null>(null);
  function openUserEditEntryModal(e: React.FormEvent<HTMLElement>) {
    if ((e.target as HTMLElement).dataset.entryformdata) {
      setUserEntryFormData(JSON.parse((e.target as HTMLElement).dataset.entryformdata!))
      setUserEntryFormDataId((e.target as HTMLElement).dataset.entryid!)
      setUserEntryFormName((e.target as HTMLElement).dataset.entryformname!)
      setUserEntryDate((e.target as HTMLElement).dataset.entrydate!)
      onOpenUserEditEntryModal();
    }
  }
  function closeUserEditEntryModal() {
    setUserEntryFormData(null)
    setUserEntryFormDataId(null)
    setUserEntryFormName(null)
    setUserEntryDate(null)
    onCloseUserEditEntryModal();
  }


  const deleteUserEntryMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const userEntryId = (e.target as HTMLFormElement).dataset.userentryid!;
      let tokenCookie: string | null = Cookies.get().token;
      await axios
        .delete(server + "/api/deletereadingclubentry", 
        {
          headers: {
          'authorization': tokenCookie
          },
          data: {
            userEntryId: parseInt(userEntryId)
          }
        })
        .then((response)=>{
          if (response.data.success){
            toast({
              description: "Entry removed",
              status: "success",
              duration: 9000,
              isClosable: true
            })
            closeUserEditEntryModal();
          }
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.message)
        })
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function deleteUserEntry(e: React.FormEvent<HTMLFormElement>) {
    deleteUserEntryMutation.mutate(e);
  }

  const updateReadingClubEntryMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      const userEntryId = (e.target as HTMLFormElement).dataset.userentryid!;
      let entryData: EntryData[] = []
      const entryFields: EventTarget[] = Array.from(e.target as HTMLFormElement);
      entryFields.forEach((field: any,i: number)=>{
        entryData.push({
          id: field.id,
          type: field.dataset.fieldtype,
          question: field.dataset.question,
          answer: field.value,
          required: field.required,
          sequence: i
        })
      })
      let tokenCookie: string | null = Cookies.get().token;
      await axios
        .put(server + "/api/updatereadingclubentry", 
        {
          entryData: JSON.stringify(entryData),
          userEntryId: parseInt(userEntryId)
        },
        {headers: {
          'authorization': tokenCookie
        }}
        )
        .then((response)=>{
          if (response.data.success){
            toast({
              description: "Form updated!",
              status: "success",
              duration: 9000,
              isClosable: true
            })
            closeUserEditEntryModal();
          }
        })
        .catch(({response})=>{
          console.log(response)
          throw new Error(response.data.message)
        })
      return getReadingClubs()
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function updateReadingClubEntry(e: React.FormEvent<HTMLFormElement>) {
    updateReadingClubEntryMutation.mutate(e);
  }


  const { 
    isOpen: isOpenManualEntryModal, 
    onOpen: onOpenManualEntryModal, 
    onClose: onCloseManualEntryModal 
  } = useDisclosure()
  const [manualEntryIsLoading,setManualEntryIsLoading] = useState(false);
  const [manualEntryReaders,setManualEntryReaders] = useState<ProfileType[] | null>(null);
  const [manualEntryReadingClubs,setManualEntryReadingClubs] = useState<ReadingClub[] | null>(null);
  const [manualEntryForms,setManualEntryForms] = useState<ReadingClubForm[] | null>(null);
  const [manualEntryFormName,setManualEntryFormName] = useState("");
  async function openManualEntryModal() {
    onOpenManualEntryModal();
    setManualEntryIsLoading(true)
    let tokenCookie: string | null = Cookies.get().token;
    await axios
      .get(server + "/api/getmanualentry",
        {
          headers: {
            'authorization': tokenCookie
          }
        }
      )
      .then((response)=>{
        const {data} = response;
        setManualEntryReaders(data.readers)
        setManualEntryReadingClubs(data.readingClubs)
        setManualEntryForms(data.forms)
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error(response.data.message)
      })
    setManualEntryIsLoading(false)
  }
  function closeManualEntryModal() {
    setManualEntryReaders(null)
    setManualEntryReadingClubs(null)
    setManualEntryForms(null)
    setManualEntrySelectedForm(null)
    setManualEntryFormName("")
    onCloseManualEntryModal();
  }
  function selectManualEntryFormCallback(e: any) {
    if ((e.target as any).options[(e.target as any).selectedIndex].value !== "") {
      setManualEntrySelectedForm(JSON.parse((e.target as any).options[(e.target as any).selectedIndex].dataset.formfields))
      setManualEntryFormName((e.target as any).options[(e.target as any).selectedIndex].dataset.formname)
    }
    else {
      setManualEntrySelectedForm(null)
    }
  }
  const manualEntryReaderRef = useRef({} as HTMLSelectElement);
  const manualEntryReadingClubRef = useRef({} as HTMLSelectElement)
  const [manualEntrySelectedForm,setManualEntrySelectedForm] = useState(null)
  const submitManualReadingClubEntryMutation = useMutation({
    mutationFn: async (e: React.FormEvent<HTMLFormElement>)=>{
      e.preventDefault();
      if (manualEntrySelectedForm !== null && manualEntryReadingClubRef.current.value !== "" && manualEntryReaderRef.current.value !== "") {
        const readingClubId = manualEntryReadingClubRef.current.value;
        const readerProfileId = manualEntryReaderRef.current.value;
        const formName = manualEntryFormName;
        let entryData: EntryData[] = []
        const entryFields: EventTarget[] = Array.from(e.target as HTMLFormElement);
        entryFields.forEach((field: any,i: number)=>{
          entryData.push({
            id: field.id,
            type: field.dataset.fieldtype,
            question: field.dataset.question,
            answer: field.value,
            required: field.required,
            sequence: i
          })
        })
        let tokenCookie: string | null = Cookies.get().token;
        await axios
          .post(server + "/api/submitmanualreadingclubentry", 
          {
            entryData: JSON.stringify(entryData),
            readingClubId: parseInt(readingClubId!),
            readerProfileId: parseInt(readerProfileId),
            formName: formName
          },
          {headers: {
            'authorization': tokenCookie
          }}
          )
          .then((response)=>{
            if (response.data.success){
              toast({
                description: "Form submitted!",
                status: "success",
                duration: 9000,
                isClosable: true
              })
              closeManualEntryModal();
            }
          })
          .catch(({response})=>{
            console.log(response)
            throw new Error(response.data.message)
          })
        return getReadingClubs()
      }
    },
    onSuccess: (data)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
    }
  })
  async function submitManualReadingClubEntry(e: React.FormEvent<HTMLFormElement>) {
    submitManualReadingClubEntryMutation.mutate(e);
  }

  const { 
    isOpen: isOpenEditBgModal, 
    onOpen: onOpenEditBgModal, 
    onClose: onCloseEditBgModal 
  } = useDisclosure()
  const [editBgReadingClubId,setEditBgReadingClubId] = useState<string | null>(null);
  const bgUploadRef = useRef({} as HTMLInputElement);
  // const imagePreviewRef = useRef({} as HTMLImageElement);
  const textColorRef = useRef({} as HTMLInputElement);
  const [previewImage,setPreviewImage] = useState("");
  const [bgImageFile,setBgImageFile] = useState<Blob | string | ArrayBuffer | null>(null);
  const [textColor,setTextColor] = useState("#000000");
  const [deleteBgImage,setDeleteBgImage] = useState(false);
  function openEditBgModal(e: React.FormEvent<HTMLButtonElement>) {
    setEditBgReadingClubId((e.target as any).dataset.readingclubid)
    setPreviewImage((e.target as any).dataset.bgimage ? (e.target as any).dataset.bgimage : "")
    console.log(textColorRef.current)
    setTextColor((e.target as any).dataset.textcolor ? (e.target as any).dataset.textcolor : "#000000");
    onOpenEditBgModal();
  }
  function closeEditBgModal() {
    setEditBgReadingClubId(null)
    setPreviewImage("")
    setBgImageFile(null)
    setTextColor("#000000")
    setDeleteBgImage(false)
    onCloseEditBgModal();
  }
  function bgImageChange(e: HTMLInputElement | any) {
    // imagePreviewRef.current.style.display = "block";
    let targetFiles = e.target.files as FileList
    let previewImageFile = targetFiles[0];
    setPreviewImage(URL.createObjectURL(previewImageFile))
    let blob = previewImageFile.slice(0,previewImageFile.size,"image/png")
    let newFile = new File([blob], previewImageFile.name, {type: "image/png"})
    setBgImageFile(newFile)
  }
  function handleDeleteBgImage() {
    setPreviewImage("")
    setDeleteBgImage(true);
  }

  const updateBgPhotoMutation = useMutation({
    mutationFn: async () => {
      let tokenCookie = Cookies.get().token;
      const formData = new FormData();
      formData.append("photo", bgImageFile as Blob);
      formData.append("textColor", textColorRef.current.value)
      formData.append("readingClubId", editBgReadingClubId as string | Blob)
      formData.append("deleteBgImage", deleteBgImage.toString() as string | Blob)
      if (tokenCookie) {
        await axios
          .post(server + "/api/updatereadingclubbgphoto", 
          formData,
          {headers: {
            'authorization': tokenCookie,
            'content-type': 'multipart/form-data'
          }}
          )
          .catch(({response})=>{
            if (axios.isCancel(response)) {
              console.log("successfully aborted")
            }
            console.log(response)
            toast({
              description: response.data.message ? response.data.message : "An error has occurred",
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response?.data?.message)
          })
      }
      else {
        throw new Error("Error: BGP200")
      }
      return getReadingClubs();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['readingClubsKey'] })
      queryClient.resetQueries({queryKey: ['readingClubsKey']})
      queryClient.setQueryData(["readingClubsKey"],data)
      toast({
        description: "Background image updated",
        status: "success",
        duration: 9000,
        isClosable: true
      })
      closeEditBgModal();
    }
  })
  function updateBgPhoto() {
    updateBgPhotoMutation.mutate();
  }

 
  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['readingClubsKey'], 
    queryFn: getReadingClubs
  });
  const viewer = data?.viewer;
  const readingClubs = data?.readingClubs;
  const forms = data?.forms;
  const schools = data?.schools;
  const userEntries = data?.userEntries;
  
  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h1" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={!isLoading}
      >
          <Flex flexWrap="wrap">
            <Box flex="1 1 30%" minW="250px">
              {viewer === "admin" ? (
                <Box className="well" height="fit-content">
                  <Stack
                    flexWrap="wrap" 
                    justify="space-between"
                    align="flex-start"
                  >
                    <Flex align="center" justify="space-between" gap={2}>
                      <Heading as="h3" size="md">
                        Admin
                      </Heading>
                    </Flex>
                    <Button
                      width="auto"
                      variant="ghost"
                      size="sm"
                      leftIcon={<IoIosAdd size={25} />}
                      onClick={openCreateFormModal}
                    >
                      Create a form
                    </Button>
                    <Button
                      width="auto"
                      variant="ghost"
                      size="sm"
                      leftIcon={<IoIosRemove size={25} />}
                      onClick={e=>openDeleteFormModal()}
                    >
                      Delete a form
                    </Button>
                    <Divider/>
                    <Button
                      width="auto"
                      variant="ghost"
                      size="sm"
                      leftIcon={<BiBuildings size={25} />}
                      onClick={openSchoolsModal}
                    >
                      Schools
                    </Button>
                    <Divider/>
                    <Button
                      width="auto"
                      variant="ghost"
                      size="sm"
                      leftIcon={<AiOutlineLineChart size={25} />}
                      onClick={e=>navigate("/readingclubs/milestones")}
                    >
                      Milestones
                    </Button>
                    <Divider/>
                    <Button
                      width="auto"
                      variant="ghost"
                      size="sm"
                      leftIcon={<FaWpforms size={25} />}
                      onClick={e=>navigate("/readingclubs/entries")}
                    >
                      Entries
                    </Button>
                    <Button
                      width="auto"
                      variant="ghost"
                      size="sm"
                      leftIcon={<BiEdit size={25} />}
                      onClick={e=>openManualEntryModal()}
                    >
                      Manual Entry
                    </Button>
                    <Divider/>
                    <Flex justify="center" w="100%">
                      <Button
                        width="auto"
                        size="sm"
                        colorScheme="green"
                        onClick={openCreateReadingClubModal}
                      >
                        Create Reading Club
                      </Button>
                    </Flex>
                  </Stack>
                </Box>
              ) : null}

              <Box className="well" height="fit-content">
                <Heading as="h3" size="md" mb={2}>
                  My Entries
                </Heading>
                <Stack 
                  maxHeight="200px"
                  overflowY="auto"
                >
                  {userEntries?.length ? (
                    userEntries
                      .sort((a: UserEntry,b: UserEntry)=>{
                        return (new Date(a.created_on) as any) - (new Date(b.created_on) as any);
                      })
                      .map((entry: UserEntry, i: number)=>{
                        return (
                          <Flex key={i} align="flex-start" direction="column" gap={0}>
                            <Link 
                              key={i}
                              href="#"
                              data-entryformname={entry.form_name}
                              data-entrydate={entry.created_on}
                              data-entryformdata={entry.entry_data}
                              data-entryid={entry.id}
                              fontSize="sm"
                              onClick={e=>openUserEditEntryModal(e)}
                            >
                              {entry.form_name}
                            </Link>
                            <Text fontStyle="italic">{dayjs(entry.created_on).local().format('MMM DD, hh:mm a')}</Text>
                          </Flex>
                        )
                      })
                  ) : (
                    <Text fontStyle="italic">No entries yet</Text>
                  )}
                </Stack>
              </Box>
            </Box>
            <Box className="well" height="auto" flex="1 1 65%">
              <Heading as="h3" size="md" mb={3}>
                Reading Clubs
              </Heading>
              <Flex 
                direction="column"
                gap={5}
              >
                {readingClubs?.length ? (
                  readingClubs.map((readingClub: ReadingClub, i: number)=>{
                    return (
                      <Flex 
                        key={i} 
                        position="relative"
                        direction="column"
                        align="center"
                        justify="center"
                        minH="70px"
                        gap={2}
                        width="100%"
                        p={2}
                        rounded="md"
                        boxShadow="base"
                        _dark={{
                          backgroundColor: 'gray.600'
                        }}
                        backgroundImage={readingClub.background_image ? `url(${readingClub.background_image})` : "none"}
                        backgroundSize="cover"
                        backgroundColor={readingClub.background_image ? "rgb(0,0,0,.05)" : "white"}
                        _before={readingClub.background_image ? {
                          content: `" "`,
                          position: "absolute",
                          top: "0",
                          right: "0",
                          bottom: "0",
                          left: "0",
                          backgroundColor: "inherit"
                        } : {
                          top: "0"
                        }}
                      >
                        <Flex  gap={2} align="center" justify="center">
                          <Heading 
                            as="h3" 
                            size="sm"
                            data-readingclubid={readingClub.id}
                            data-form={JSON.stringify(readingClub.ReadingClubForm)}
                            onClick={e=>openFillFormModal(e as any)}
                            _hover={{
                              cursor: "pointer",
                              textDecoration: "underline"
                            }}
                            color={readingClub.text_color ? readingClub.text_color : "black"}
                            _dark={{
                              color: readingClub.text_color ? readingClub.text_color : "white"
                            }}
                          >
                            {readingClub.name}
                          </Heading>
                          {readingClub.hidden ? <i>(hidden)</i> : ""}
                        </Flex>
                        <Text 
                          textAlign="center" 
                          color={readingClub.text_color ? readingClub.text_color : "black"}
                          _dark={{
                            color: readingClub.text_color ? readingClub.text_color : "white"
                          }}
                        >
                          {readingClub.description}
                        </Text>
                        {viewer === "admin" ? (
                          <Menu>
                            <MenuButton 
                              as={Button}
                              size="md"
                              variant="ghost"
                              rounded="full"
                              height="25px"
                              position="absolute" 
                              top={2} 
                              right={2}
                            >
                              <BiDotsHorizontalRounded/>
                            </MenuButton>
                            <MenuList>
                              <MenuItem 
                                data-id={readingClub.id}
                                data-name={readingClub.name}
                                data-description={readingClub.description}
                                data-milestones={readingClub.milestones}
                                data-display={readingClub.hidden}
                                data-form={readingClub.ReadingClubForm ? readingClub.ReadingClubForm.id : null}
                                onClick={e=>openEditReadingClubModal(e as React.FormEvent<HTMLButtonElement>)}
                                icon={<MdEdit size={20} />}
                              >
                                Edit
                              </MenuItem>
                              <MenuItem 
                                data-readingclubid={readingClub.id}
                                data-textcolor={readingClub.text_color}
                                data-bgimage={readingClub.background_image}
                                onClick={e=>openEditBgModal(e as React.FormEvent<HTMLButtonElement>)}
                                icon={<MdEdit size={20} />}
                              >
                                Edit Background
                              </MenuItem>
                              <MenuItem
                                data-id={readingClub.id}
                                onClick={e=>deleteReadingClub(e as React.FormEvent<HTMLButtonElement>)}
                                color="red"
                                fontWeight="bold"
                                icon={<BiTrash size={20} />}
                              >
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        ): null}
                      </Flex>
                    )
                  })
                ) : null}
              </Flex>
            </Box>
          </Flex>

        {viewer === "admin" ? (
          <>
            <Modal isOpen={isOpenCreateFormModal} onClose={closeCreateFormModal} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading as="h3" size="lg">
                    Create Form
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Box mb={2}>
                    <FormLabel htmlFor="name" mb={1}>Name</FormLabel>
                    <Input
                      type="text"
                      id="name"
                      ref={createFormNameRef}
                    />
                  </Box>

                  <Flex 
                    direction="column" 
                    gap={3} 
                    border="1px solid grey" 
                    rounded="md" p={3}
                    boxShadow="lg"
                  >
                    <Heading as="h4" size="sm">Preview:</Heading>
                    {formFields.length ? (
                      formFields.map((field,i)=>{
                        return (
                          <Box key={i}>
                            {field.type === "short-text" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeFormField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="text"/>
                              </>
                            ) : field.type === "long-text" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeFormField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Textarea id={field.id}></Textarea>
                              </>
                            ) : field.type === "number" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeFormField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="number"/>
                              </>
                            ) : field.type === "checkbox" ? (
                              <>
                                <Flex justify="space-between">
                                  <Checkbox id={field.id}>
                                    {field.label}
                                  </Checkbox>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeFormField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                              </>
                            ) : field.type === "telephone" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeFormField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="tel"/>
                              </>
                            ) : field.type === "email" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeFormField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="email"/>
                              </>
                            ) : field.type === "date" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeFormField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Input id={field.id} type="date"/>
                              </>
                            ) : field.type === "school" ? (
                              <>
                                <Flex justify="space-between">
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={e=>removeFormField(field.id)}
                                  >
                                    Remove
                                  </Button>
                                </Flex>
                                <Select>
                                  {schools.length ? (
                                    schools.map((school: School,i: number)=>{
                                      return (
                                        <option key={i} value={school.id}>{school.name}</option>
                                      )
                                    })
                                  ) : null}
                                </Select>
                              </>
                            ) : null}
                          </Box>
                        )
                      })
                    ): null}
                  </Flex>

                  <Flex mt={5} direction="column" gap={2}>
                    <InputGroup>
                      <InputLeftAddon children="Label"/>
                      <Input 
                        type="text"
                        ref={labelRef as any}
                      />
                    </InputGroup>
                    <InputGroup>
                      <InputLeftAddon children="Type"/>
                      <Select 
                        ref={typeRef as any} 
                      >
                        <option value="short-text">Short Text</option>
                        <option value="long-text">Long Text</option>
                        <option value="number">Number</option>
                        <option value="checkbox">Checkbox</option>
                        <option value="telephone">Telephone</option>
                        <option value="email">Email</option>
                        <option value="date">Date</option>
                        <option value="school">School Selection</option>
                      </Select>
                    </InputGroup>
                    <Flex justify="center" w="100%">
                      <Checkbox ref={requiredRef as any}>Required?</Checkbox>
                    </Flex>
                    <Button
                      onClick={addFormField}
                    >
                      Add Field
                    </Button>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <HStack>
                    <Text color="red">
                      {createFormError}
                    </Text>
                    <Button 
                      mr={3}
                      size="lg"
                      colorScheme="green"
                      onClick={e=>createForm(e as any)}
                    >
                      Save
                    </Button>
                  </HStack>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal isOpen={isOpenCreateReadingClubModal} onClose={closeCreateReadingClubModal} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading as="h3" size="lg">
                    Create Reading Club
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                <form onSubmit={e=>createReadingClub(e as React.FormEvent<HTMLFormElement>)}>
                  <ModalBody>
                    <Flex direction="column" gap={2}>
                      <Box>
                        <FormLabel htmlFor="name" mb={1}>Name</FormLabel>
                        <Input
                          type="text"
                          id="name"
                          ref={createReadingClubNameRef}
                          required
                        />
                      </Box>
                      <Box>
                        <FormLabel htmlFor="description" mb={1}>Description</FormLabel>
                        <Textarea
                          id="description"
                          ref={createReadingClubDescriptionRef}
                        ></Textarea>
                      </Box>
                      <Box>
                        <FormLabel htmlFor="form" mb={1}>Form</FormLabel>
                        <Select 
                          ref={createReadingClubFormRef as any}
                          defaultValue={defaultForm}
                        >
                          <option value="">None</option>
                          {forms && forms.length ? (
                            forms.map((q: ReadingClubForm,i: number)=>{
                              return (
                                <option key={i} value={q.id}>{q.name}</option>
                              )
                            })
                          ) : null}
                        </Select>
                      </Box>
                      <Box>
                        <FormLabel htmlFor="milestones" mb={1}>Number of milestones</FormLabel>
                        <Input
                          type="number"
                          id="milestones"
                          ref={createReadingClubMilestonesRef}
                        />
                      </Box>
                    </Flex>
                  </ModalBody>
                  <ModalFooter>
                    <HStack>
                      <Text color="red">
                        {createReadingClubError}
                      </Text>
                      <Button 
                        variant='ghost' 
                        mr={3}
                        size="lg"
                        type="submit"
                      >
                        Create
                      </Button>
                    </HStack>
                  </ModalFooter>
                </form>
              </ModalContent>
            </Modal>

            <Modal isOpen={isOpenEditReadingClubModal} onClose={closeEditReadingClubModal} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Heading as="h3" size="lg">
                  Edit Reading Club
                </Heading>
              </ModalHeader>
              <ModalCloseButton />
              <form 
                data-id={editId}
                onSubmit={e=>editReadingClub(e as React.FormEvent<HTMLFormElement>)}
              >
                <ModalBody>
                  <Flex direction="column" gap={2}>
                    <Box mb={2}>
                      <FormLabel 
                        htmlFor="name" 
                        fontWeight="bold" 
                        mb={1}
                      >
                        Name
                      </FormLabel>
                      <Input
                      type="text"
                      id="name"
                      ref={editReadingClubNameRef}
                      defaultValue={editName}
                      required
                      />
                    </Box>
                    <Box>
                      <FormLabel 
                        htmlFor="description" 
                        fontWeight="bold" 
                        mb={1}
                      >
                        Description
                      </FormLabel>
                      <Textarea
                        id="description"
                        ref={editReadingClubDescriptionRef}
                        defaultValue={editDescription}
                      ></Textarea>
                    </Box>
                    <Box>
                      <FormLabel 
                        htmlFor="form" 
                        fontWeight="bold" 
                        mb={1}
                      >
                        Form
                      </FormLabel>
                      <Select 
                        id="form"
                        ref={editReadingClubFormRef as any}
                        defaultValue={defaultForm}
                      >
                          <option value="">None</option>
                          {forms && forms.length ? (
                            forms.map((q: ReadingClubForm,i: number)=>{
                              return (
                                <option key={i} value={q.id}>{q.name}</option>
                              )
                            })
                          ) : null}
                      </Select>
                    </Box>
                    <Box>
                      <FormLabel 
                        htmlFor="milestones" 
                        fontWeight="bold" 
                        mb={1}
                      >
                        Number of milestones
                      </FormLabel>
                      <Input
                        type="number"
                        id="milestones"
                        defaultValue={editMilestones}
                        ref={editReadingClubMilestonesRef}
                      />
                    </Box>
                    <Checkbox 
                      defaultChecked={editHidden.includes("1")}
                      ref={editReadingClubHiddenRef}
                      mt={2}
                      fontWeight="bold"
                    >
                      Hide?
                    </Checkbox>
                    <Text color="red" width="100%">
                      {editReadingClubError}
                    </Text>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Button  
                    mr={3}
                    type="submit"
                    colorScheme="blue"
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
            </Modal>

            <Modal isOpen={isOpenEditBgModal} onClose={closeEditBgModal} size="xl" isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Heading as="h3" size="lg">
                  Edit Background
                </Heading>
              </ModalHeader>
              <ModalCloseButton />
                <ModalBody>
                  <Flex direction="column" gap={2}>
                    <Flex align="center" justify="flex-start" gap={0}>
                      <FormLabel 
                        htmlFor="textColor" 
                        fontWeight="bold" 
                        mb={0}
                      >
                        Text Color
                      </FormLabel>
                      <Input 
                        id="textColor" 
                        type="color" 
                        w="35px" 
                        border="none"
                        p={0} 
                        ref={textColorRef}
                        value={textColor}
                        onChange={e=>setTextColor(e.target.value)}
                      />
                    </Flex>
                    <Box>
                      <FormLabel 
                        htmlFor="bgPhoto" 
                        fontWeight="bold" 
                        mb={1}
                      >
                        Background Image
                      </FormLabel>
                      <Input 
                        id="bgPhoto" 
                        type="file" 
                        accept="image/png, image/jpeg"
                        display="none"
                        ref={bgUploadRef}
                        // isRequired={true} 
                        onChange={e=>bgImageChange(e)}
                      />
                      <Button
                        onClick={e=>bgUploadRef.current.click()}
                        mb={2}
                      >
                        Browse
                      </Button>
                      {previewImage ? (
                        <Box>
                          <Image
                            src={previewImage ? previewImage : ""} 
                            objectFit="cover"
                            boxSize="100%" 
                            p={5}
                            maxW="100%"
                            width="100%"
                            height="100%"
                            maxH="200px"
                            mb={2}
                          />
                          <Flex justify="flex-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={e=>handleDeleteBgImage()}
                            >
                              <FiTrash2/>
                            </Button>
                          </Flex>
                        </Box>
                      ) : null}
                    </Box>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Button  
                    mr={3}
                    colorScheme="blue"
                    onClick={e=>updateBgPhoto()}
                    isLoading={updateBgPhotoMutation.isLoading}
                  >
                    Submit
                  </Button>
                </ModalFooter>
            </ModalContent>
            </Modal>

            <Modal isOpen={isOpenDeleteFormModal} onClose={closeDeleteFormModal} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading as="h3" size="lg">
                    Delete Reading Form
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                  <ModalBody>
                    <Flex direction="column" gap={2}>
                      <Flex gap={2}>
                        <Select
                          ref={deleteFormRef}
                        >
                          {forms.length ? forms.map((form: ReadingClubForm,i: number)=>{
                            return (
                              <option key={i} value={form.id}>{form.name}</option>
                            )
                          }) : null}
                        </Select>
                        <Button
                          colorScheme="red"
                          onClick={deleteForm}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Flex>
                  </ModalBody>
                  <ModalFooter>

                  </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal isOpen={isOpenSchoolsModal} onClose={closeSchoolsModal} size="md">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <Heading as="h3" size="lg">
                    Schools
                  </Heading>
                </ModalHeader>
                <ModalCloseButton />
                  <ModalBody>
                    <Flex direction="column" gap={5}>
                      <form
                        onSubmit={e=>addSchool(e as any)}
                      >
                        <Flex gap={2}>
                          <Input
                            type="text"
                            ref={schoolTextRef}
                            isRequired={true}
                          />
                          <Button
                            type="submit"
                          >
                            Add
                          </Button>
                        </Flex>
                      </form>
                      <Flex gap={2}>
                        <Select
                          ref={schoolDeleteRef}
                        >
                          {schools.length ? schools.map((school: School,i: number)=>{
                            return (
                              <option key={i} value={school.id}>{school.name}</option>
                            )
                          }) : null}
                        </Select>
                        <Button
                          colorScheme="red"
                          onClick={deleteSchool}
                        >
                          Delete
                        </Button>
                      </Flex>
                      {addSchoolMutation.isError && (
                        <Text color="red">{(addSchoolMutation.error as Error).message}</Text>
                      )}
                      {deleteSchoolMutation.isError && (
                        <Text color="red">{(deleteSchoolMutation.error as Error).message}</Text>
                      )}
                    </Flex>
                  </ModalBody>
                  <ModalFooter>

                  </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        ) : null}

          <Modal isOpen={isOpenFillFormModal} onClose={closeFillFormModal} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Heading as="h3" size="lg">
                  {fillForm.name}
                </Heading>
              </ModalHeader>
              <ModalCloseButton />
              <form
                data-readingclubid={formReadingClubId}
                data-formname={fillForm.name}
                onSubmit={e=>{submitReadingClubEntry(e)}}
              >
                <ModalBody>
                  <Flex direction="column" gap={2}>
                  {fillForm.form_fields && 
                    JSON.parse(fillForm.form_fields).length ? (
                      JSON.parse(fillForm.form_fields).map((field: FormType,i: number)=>{
                        return (
                          <Box key={i}>
                            {field.type === "short-text" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="text" 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                  data-fieldtype={field.type}
                                />
                              </>
                            ) : field.type === "long-text" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Textarea 
                                  id={field.id} 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                  data-fieldtype={field.type}
                                ></Textarea>
                              </>
                            ) : field.type === "number" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="number" 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                  data-fieldtype={field.type}
                                />
                              </>
                            ) : field.type === "checkbox" ? (
                              <>
                                <Checkbox 
                                  id={field.id}
                                  data-question={field.label}
                                  data-fieldtype={field.type}
                                >
                                  {field.label}
                                </Checkbox>
                              </>
                            ) : field.type === "telephone" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="tel" 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                  data-fieldtype={field.type}
                                />
                              </>
                            ) : field.type === "email" ? (
                              <>
                                <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="email" 
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                  data-fieldtype={field.type}
                                />
                              </>
                            ) : field.type === "date" ? (
                              <>
                                <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                <Input 
                                  id={field.id} 
                                  type="date"
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                  data-fieldtype={field.type}
                                />
                              </>
                            ) : field.type === "school" ? (
                              <>
                                <FormLabel 
                                  htmlFor={field.id}
                                >
                                  {field.label}
                                </FormLabel>
                                <Select
                                  id={field.id}
                                  isRequired={field.required ? true : false}
                                  data-question={field.label}
                                  data-fieldtype={field.type}
                                >
                                  {schools?.length ? (
                                    schools.map((school: School,i: number)=>{
                                      return (
                                        <option 
                                          key={i} 
                                          value={school.id}
                                        >
                                          {school.name}
                                        </option>
                                      )
                                    })
                                  ) : null}
                                </Select>
                              </>
                            ) : null}
                          </Box>
                        )
                      })
                    ): null}
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Flex width="100%" justify="flex-end">
                    {submitReadingClubEntryMutation.isError && (
                      <Text color="red">
                        {(submitReadingClubEntryMutation.error as Error).message}
                      </Text>
                    )}
                    <Button  
                      mr={3}
                      type="submit"
                      colorScheme="green"
                    >
                      Submit
                    </Button>
                  </Flex>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>

          <Modal isOpen={isOpenUserEditEntryModal} onClose={closeUserEditEntryModal} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Heading as="h3" size="lg">
                  Edit Form Entry
                </Heading>
              </ModalHeader>
              <ModalCloseButton />
              <form
                data-userentryid={userEntryFormDataId}
                onSubmit={e=>{updateReadingClubEntry(e)}}
              >
                <ModalBody>
                  <Flex gap={2} align="center" flexWrap="wrap" mb={3} rowGap={1}>
                    <Heading as="h2" size="md">
                      {userEntryFormName}
                    </Heading>
                    <Text fontStyle="italic">
                      {dayjs(userEntryDate).local().format('MMM DD, hh:mm a')}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap={2}>
                  {userEntryFormData && (userEntryFormData as EntryData[]).length ? (
                    (userEntryFormData as EntryData[]).map((field: EntryData,i: number)=>{
                      return (
                        <Box key={i}>
                          {field.type === "short-text" ? (
                            <>
                              <FormLabel htmlFor={field.id} mb={1}>{field.question}</FormLabel>
                              <Input 
                                id={field.id} 
                                type="text" 
                                isRequired={field.required === "true" ? true : false}
                                defaultValue={field.answer}
                                data-question={field.question}
                                data-fieldtype={field.type}
                              />
                            </>
                          ) : field.type === "long-text" ? (
                            <>
                              <FormLabel htmlFor={field.id} mb={1}>{field.question}</FormLabel>
                              <Textarea 
                                id={field.id} 
                                isRequired={field.required === "true" ? true : false}
                                defaultValue={field.answer}
                                data-question={field.question}
                                data-fieldtype={field.type}
                              ></Textarea>
                            </>
                          ) : field.type === "number" ? (
                            <>
                              <FormLabel htmlFor={field.id} mb={1}>{field.question}</FormLabel>
                              <Input 
                                id={field.id} 
                                type="number" 
                                isRequired={field.required === "true" ? true : false}
                                defaultValue={field.answer}
                                data-question={field.question}
                                data-fieldtype={field.type}
                              />
                            </>
                          ) : field.type === "checkbox" ? (
                            <>
                              <Checkbox 
                                id={field.id}
                                defaultChecked={Boolean(field.answer)}
                                data-question={field.question}
                                data-fieldtype={field.type}
                              >
                                {field.question}
                              </Checkbox>
                            </>
                          ) : field.type === "telephone" ? (
                            <>
                              <FormLabel htmlFor={field.id} mb={1}>{field.question}</FormLabel>
                              <Input 
                                id={field.id} 
                                type="tel" 
                                isRequired={field.required === "true" ? true : false}
                                defaultValue={field.answer}
                                data-question={field.question}
                                data-fieldtype={field.type}
                              />
                            </>
                          ) : field.type === "email" ? (
                            <>
                              <FormLabel htmlFor={field.id} mb={1}>{field.question}</FormLabel>
                              <Input 
                                id={field.id} 
                                type="email" 
                                isRequired={field.required === "true" ? true : false}
                                defaultValue={field.answer}
                                data-question={field.question}
                                data-fieldtype={field.type}
                              />
                            </>
                          ) : field.type === "date" ? (
                            <>
                              <FormLabel htmlFor={field.id}>{field.question}</FormLabel>
                              <Input 
                                id={field.id} 
                                type="date"
                                isRequired={field.required === "true" ? true : false}
                                defaultValue={field.answer}
                                data-question={field.question}
                                data-fieldtype={field.type}
                              />
                            </>
                          ) : field.type === "school" ? (
                            <>
                              <FormLabel 
                                htmlFor={field.id}
                              >
                                {field.question}
                              </FormLabel>
                              <Select
                                id={field.id}
                                isRequired={field.required === "true" ? true : false}
                                defaultValue={field.answer}
                                data-question={field.question}
                                data-fieldtype={field.type}
                              >
                                {schools?.length ? (
                                  schools.map((school: School,i: number)=>{
                                    return (
                                      <option 
                                        key={i} 
                                        value={school.id}
                                      >
                                        {school.name}
                                      </option>
                                    )
                                  })
                                ) : null}
                              </Select>
                            </>
                          ) : null}
                        </Box>
                      )
                    })
                  ) :null}
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Flex width="100%" justify="space-between">
                    {/* {submitReadingClubEntryMutation.isError && (
                      <Text color="red">
                        {(submitReadingClubEntryMutation.error as Error).message}
                      </Text>
                    )} */}
                    <Button
                      data-userentryid={userEntryFormDataId}
                      onClick={e=>deleteUserEntry(e as any)}
                      colorScheme="red"
                    >
                      Delete
                    </Button>
                    <Button  
                      mr={3}
                      type="submit"
                      colorScheme="green"
                    >
                      Update
                    </Button>
                  </Flex>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>

          <Modal isOpen={isOpenManualEntryModal} onClose={closeManualEntryModal} size="xl" isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Heading as="h3" size="lg">
                  Manual Entry
                </Heading>
              </ModalHeader>
              <ModalCloseButton />
              <Flex direction="column" gap={2} px={5}>
                <Box>
                  <FormLabel htmlFor="reader" mb={1}>Reader</FormLabel>
                  <Select 
                    id="reader"
                    ref={manualEntryReaderRef}
                  >
                    <option value=""></option>
                    {manualEntryReaders && manualEntryReaders.length ? (
                      manualEntryReaders.map((reader: ProfileType,i: number)=>{
                        return (
                          <option 
                            key={i}
                            value={reader.id}
                          >
                            {reader.User.last_name + ", " + reader.User.first_name}
                          </option>
                        )
                      })
                    ) : null}
                  </Select>
                </Box>
                <Box>
                  <FormLabel htmlFor="reading-clubs" mb={1}>Reading Clubs</FormLabel>
                  <Select 
                    id="reading-clubs"
                    ref={manualEntryReadingClubRef}
                  >
                    <option value=""></option>
                    {manualEntryReadingClubs && manualEntryReadingClubs.length ? (
                      manualEntryReadingClubs.map((club: ReadingClub,i: number)=>{
                        return (
                          <option 
                            key={i}
                            value={club.id}
                          >
                            {club.name}
                          </option>
                        )
                      })
                    ) : null}
                  </Select>
                </Box>
                <Box>
                  <FormLabel htmlFor="form" mb={1}>Form</FormLabel>
                  <Select 
                    id="form"
                    onChange={e=>selectManualEntryFormCallback(e)}
                  >
                    <option value=""></option>
                    {manualEntryForms && manualEntryForms.length ? (
                      manualEntryForms.map((form,i)=>{
                        return (
                          <option 
                            key={i}
                            value={form.id}
                            data-formfields={form.form_fields}
                            data-formname={form.name}
                          >
                            {form.name}
                          </option>
                        )
                      })
                    ) : null}
                  </Select>
                </Box>
              </Flex>
              <Divider mt={3} />
              <form
                onSubmit={e=>{submitManualReadingClubEntry(e)}}
              >
                <ModalBody>
                 <> 
                  {manualEntryIsLoading ? (
                    <Flex justify="center">
                      <Spinner/>
                    </Flex>
                  ) : (
                  <>
                    <Flex direction="column" gap={2}>
                      {manualEntrySelectedForm ? (
                        (manualEntrySelectedForm as any[]).map((field: any,i: number)=>{
                          return (
                            <Box key={i}>
                              {field.type === "short-text" ? (
                                <>
                                  <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                  <Input 
                                    id={field.id} 
                                    type="text" 
                                    isRequired={field.required ? true : false}
                                    data-question={field.label}
                                    data-fieldtype={field.type}
                                  />
                                </>
                              ) : field.type === "long-text" ? (
                                <>
                                  <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                  <Textarea 
                                    id={field.id} 
                                    isRequired={field.required ? true : false}
                                    data-question={field.label}
                                    data-fieldtype={field.type}
                                  ></Textarea>
                                </>
                              ) : field.type === "number" ? (
                                <>
                                  <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                  <Input 
                                    id={field.id} 
                                    type="number" 
                                    isRequired={field.required ? true : false}
                                    data-question={field.label}
                                    data-fieldtype={field.type}
                                  />
                                </>
                              ) : field.type === "checkbox" ? (
                                <>
                                  <Checkbox 
                                    id={field.id}
                                    data-question={field.label}
                                    data-fieldtype={field.type}
                                  >
                                    {field.label}
                                  </Checkbox>
                                </>
                              ) : field.type === "telephone" ? (
                                <>
                                  <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                  <Input 
                                    id={field.id} 
                                    type="tel" 
                                    isRequired={field.required ? true : false}
                                    data-question={field.label}
                                    data-fieldtype={field.type}
                                  />
                                </>
                              ) : field.type === "email" ? (
                                <>
                                  <FormLabel htmlFor={field.id} mb={1}>{field.label}</FormLabel>
                                  <Input 
                                    id={field.id} 
                                    type="email" 
                                    isRequired={field.required ? true : false}
                                    data-question={field.label}
                                    data-fieldtype={field.type}
                                  />
                                </>
                              ) : field.type === "date" ? (
                                <>
                                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                                  <Input 
                                    id={field.id} 
                                    type="date"
                                    isRequired={field.required ? true : false}
                                    data-question={field.label}
                                    data-fieldtype={field.type}
                                  />
                                </>
                              ) : field.type === "school" ? (
                                <>
                                  <FormLabel 
                                    htmlFor={field.id}
                                  >
                                    {field.label}
                                  </FormLabel>
                                  <Select
                                    id={field.id}
                                    isRequired={field.required ? true : false}
                                    data-question={field.label}
                                    data-fieldtype={field.type}
                                  >
                                    {schools?.length ? (
                                      schools.map((school: School,i: number)=>{
                                        return (
                                          <option 
                                            key={i} 
                                            value={school.id}
                                          >
                                            {school.name}
                                          </option>
                                        )
                                      })
                                    ) : null}
                                  </Select>
                                </>
                              ) : null}
                            </Box>
                          )
                        })
                      ) : null}
                    </Flex>
                  </>
                  )}
                </>
                </ModalBody>
                <ModalFooter>
                  <Button  
                    mr={3}
                    type="submit"
                    colorScheme="green"
                    isLoading={submitManualReadingClubEntryMutation.isLoading}
                  >
                    Submit
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
      </Skeleton>
    </Box>
  );
};
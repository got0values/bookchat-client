import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookshelfCategory, BookshelfBook, SelectedBook } from "../types/types";
import { 
  Box,
  Tag,
  TagCloseButton,
  Heading,
  Text,
  Image,
  Spinner,
  Stack,
  Button,
  Input,
  Flex,
  Skeleton,
  useToast,
  CloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Popover,
  PopoverTrigger,
  PopoverCloseButton,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Progress,
  useDisclosure,
  Divider,
  Switch,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Checkbox,
  CheckboxGroup,
  useColorMode
} from "@chakra-ui/react";
import GooglePreviewLink from "../shared/GooglePreviewLink";
import BooksSearch from "../shared/BooksSearch";
import { IoIosAdd, IoIosRemove } from 'react-icons/io';
import { MdOutlineChat, MdEdit } from 'react-icons/md';
import { BiDotsHorizontalRounded, BiTrash, BiPlus, BiHide } from 'react-icons/bi';
import { FaShoppingCart } from 'react-icons/fa';
import { ImInfo } from 'react-icons/im';
import ReactQuill from 'react-quill';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Cookies from "js-cookie";
import axios from "axios";
import StarRating from "../shared/StarRating";
import googleWatermark from "/src/assets/google_watermark.gif";


export default function Bookshelf({server, gbooksapi}: {server: string; gbooksapi: string;}) {
  const toast = useToast();
  const navigate = useNavigate();
  const {colorMode} = useColorMode();
  dayjs.extend(utc);
  const queryClient = useQueryClient();

  const [bookshelfBooks,setBookshelfBooks] = useState([] as BookshelfBook[])
  const [bookshelfBooksOriginal,setBookshelfBooksOriginal] = useState([] as BookshelfBook[])
  const [showAddCategory,setShowAddCategory] = useState(false)
  const [allowSuggestions,setAllowSuggestions] = useState(false);

  async function getBookshelf() {
    const tokenCookie: string | null = Cookies.get().token;
    const bookshelfData = await axios
      .get(server + "/api/bookshelf",
      {
        headers: {
          Authorization: tokenCookie
        }
      })
      .then((response)=>{
        const responseMessage = response.data.message;
        setBookshelfBooks(prev=>{
          return responseMessage.BookshelfBook.sort((a: BookshelfBook,b: BookshelfBook)=>{
            return (new Date(a.created_on) as any) - (new Date(b.created_on) as any)
          }).reverse()
        });
        setBookshelfBooksOriginal(prev=>{
          return responseMessage.BookshelfBook.sort((a: BookshelfBook,b: BookshelfBook)=>{
            return (new Date(a.created_on) as any) - (new Date(b.created_on) as any)
          }).reverse()
        });
        setAllowSuggestions(responseMessage.allow_suggestions === 1 ? true : false);
        return responseMessage
      })
      .catch(({response})=>{
        console.log(response)
        throw new Error("An error has occurred")
      })
    return bookshelfData
  }

  const createCategoryInputRef = useRef<HTMLInputElement>({} as HTMLInputElement);
  const createCategoryButtonRef = useRef<HTMLButtonElement>({} as HTMLButtonElement);
  const [createCategoryError,setCreateCategoryError] = useState<string>("");
  const createCategoryMutation = useMutation({
    mutationFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      const createCategoryInput = createCategoryInputRef.current.value;
      if (createCategoryInput !== "") {
        await axios
          .post(server + "/api/createbookshelfcategory", 
          {
            name: createCategoryInput
          },
          {headers: {
            'authorization': tokenCookie
          }}
          )
          .then((response)=> {
            toast({
              description: "Bookshelf Category created",
              status: "success",
              duration: 9000,
              isClosable: true
            })
            setCreateCategoryError("")
          })
          .catch(({response})=>{
            console.log(response)
            if (response.data) {
              setCreateCategoryError(response.data.message)
            }
          })
      }
      else {
        setCreateCategoryError("Please enter a book club name")
      }
      return getBookshelf()
    },
    onSuccess: (data,variables)=>{
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
        queryClient.resetQueries({queryKey: ['bookshelfKey']})
        queryClient.setQueryData(["bookshelfKey"],data)
      }
      else {
        setCreateCategoryError("Please enter category name")
      }
    }
  })
  async function createCategory() {
    createCategoryMutation.mutate();
  }

  const removeCategoryMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const id = e.target.dataset.id;
        await axios
        .delete(server + "/api/removebookshelfcategory", 
          {
            headers: {
              'authorization': tokenCookie
            },
            data: {
              id: parseInt(id)
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            setCreateCategoryError(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
      toast({
        description: "Bookshelf Category removed",
        status: "success",
        duration: 9000,
        isClosable: true
      })
    }
  })
  async function removeCategory(e: any) {
    removeCategoryMutation.mutate(e);
  }

  const { 
    isOpen: isOpenBookSearchModal, 
    onOpen: onOpenBookSearchModal, 
    onClose: onCloseBookSearchModal 
  } = useDisclosure()
  
  const [bookToAdd,setBookToAdd] = useState<any | null>(null);
  function selectBookToAdd(book: SelectedBook) {
    setBookToAdd(book)
    onCloseBookSearchModal();
  }
  const [bookToAddCategories,setBookToAddCategories] = useState([] as any);
  const reviewRef = useRef({} as HTMLTextAreaElement)
  const notesRef = useRef({} as HTMLTextAreaElement)
  const imageRef = useRef({} as HTMLInputElement);
  const titleRef = useRef({} as HTMLInputElement);
  const authorRef = useRef({} as HTMLInputElement);
  const yearRef = useRef({} as HTMLInputElement);
  const pagesRef = useRef({} as HTMLInputElement);
  const dateRef = useRef({} as HTMLInputElement);
  const addBookshelfBookMutation = useMutation({
    mutationFn: async ()=>{
      let tokenCookie: string | null = Cookies.get().token;
      const bookshelfBookToAdd = {
        google_books_id: bookToAdd.google_books_id,
        image: imageRef.current.value,
        title: titleRef.current.value,
        author: authorRef.current.value,
        description: bookToAdd.description,
        isbn: bookToAdd.isbn,
        page_count: parseInt(pagesRef.current.value),
        published_date: yearRef.current.value
      }
      await axios
        .post(server + "/api/addbookshelfbook", 
          {
            book: bookshelfBookToAdd,
            categories: bookToAddCategories,
            notes: notesRef.current.value,
            review: reviewRef.current.value,
            rating: null,
            dateAdded: dayjs(dateRef.current.value).utc().format('YYYY-MM-DD mm:HH:ss')
          },
          {headers: {
            'authorization': tokenCookie
          }}
        )
        .then((response)=>{
          setBookToAdd(null);
          getImportLimit();
          if (response.data.success === false) {
            toast({
              description: response.data?.message ? response.data.message : "An error has occurred",
              status: "error",
              duration: 9000,
              isClosable: true
            })
          }
          else {
            toast({
              description: "Book added to bookshelf",
              status: "success",
              duration: 9000,
              isClosable: true
            })
          }
        })
        .catch(({response})=>{
          console.log(response)
          toast({
            description: "An error has occurred",
            status: "error",
            duration: 9000,
            isClosable: true
          })
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
      setBookToAdd(null)
    }
  })
  async function addBookshelfBook() {
    addBookshelfBookMutation.mutate();
  }

  const deleteBookshelfBookMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const id = e.target.dataset.id;
        await axios
        .delete(server + "/api/deletebookshelfbook", 
          {
            headers: {
              'authorization': tokenCookie
            },
            data: {
              id: parseInt(id)
            }
          }
        )
        .then((response)=>{
          toast({
            description: "Bookshelf Book removed",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: "An error has occurred",
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function deleteBookshelfBook(e: any) {
    deleteBookshelfBookMutation.mutate(e);
  }

  const addCategoryToBookMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const categoryid = e.target.dataset.categoryid;
      const bookid = e.target.dataset.bookid;
      await axios
        .put(server + "/api/addcategorytobook", 
          {
            categoryid: parseInt(categoryid),
            bookid: parseInt(bookid)
          },
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function addCategoryToBook(e: any) {
    addCategoryToBookMutation.mutate(e);
  }

  const removeCategoryFromBookMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const categoryid = e.target.dataset.categoryid;
      const bookid = e.target.dataset.bookid;
      await axios
        .delete(server + "/api/removecategoryfrombook", 
          {
            headers: {
              'authorization': tokenCookie
            },
            data: {
              bookid: parseInt(bookid),
              categoryid: parseInt(categoryid)
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function removeCategoryFromBook(e: any) {
    removeCategoryFromBookMutation.mutate(e);
  }

  const updateNotesMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const bookid = e.target.dataset.bookid;
      const notesInput = (document.getElementById(`notes-input-${bookid}`) as HTMLInputElement);
      const notes = notesInput.value
      await axios
        .put(server + "/api/updatenotes", 
          {
            bookid: parseInt(bookid),
            notes: notes
          },
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          toast({
            description: "Notes updated!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function updateNotes(e: any) {
    updateNotesMutation.mutate(e);
  }

  const updateReviewMutation = useMutation({
    mutationFn: async (e: any)=>{
      let tokenCookie: string | null = Cookies.get().token;
      const bookid = e.target.dataset.bookid;
      const reviewInput = (document.getElementById(`review-input-${bookid}`) as HTMLInputElement);
      const review = reviewInput.value
      await axios
        .put(server + "/api/updatereview", 
          {
            bookid: parseInt(bookid),
            review: review
          },
          {
            headers: {
              'authorization': tokenCookie
            }
          }
        )
        .then((response)=>{
          toast({
            description: "Review updated!",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data) {
            toast({
              description: response.data.message,
              status: "error",
              duration: 9000,
              isClosable: true
            })
            throw new Error(response.data.message)
          }
        })
      return getBookshelf();
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  async function updateReview(e: any) {
    updateReviewMutation.mutate(e);
  }

  function filterByCategory(checkedValues: string[]) {
    if (!checkedValues.length) {
      setBookshelfBooks(books);
    }
    else {
      setBookshelfBooks(prev=>{
        return (
          books.filter((book: BookshelfBook)=>{
            if (book.BookshelfBookCategory.length) {
              const categories = book.BookshelfBookCategory.map((bsbc)=>bsbc.BookshelfCategory.id)
              return !checkedValues.some((cV)=>categories.indexOf(parseInt(cV)) == -1)
            }
            else {
              return false;
            }
          })
        )
      })
    }
  }

  const searchInputRef = useRef({} as any);
  function searchFilter() {
    const searchInput = searchInputRef.current.value.toLowerCase();
    setBookshelfBooks(prev=>{
      return prev.filter((book)=>{
        return book.title.toLowerCase().includes(searchInput) || book.author?.toLowerCase().includes(searchInput) || book.isbn?.toLowerCase().includes(searchInput);
      })
    })
  }
  function resetSearchFilter() {
    searchInputRef.current.value = "";
    setBookshelfBooks(bookshelfBooksOriginal);
  }

  const ratingCallbackMutation = useMutation({
    mutationFn: async ([rating,starRatingId]:[rating: number,starRatingId: number]) => {
      let tokenCookie: string | null = Cookies.get().token;
      if (tokenCookie) {
        await axios
        .put(server + "/api/ratebookshelfbook",
          {
            rating: rating,
            id: starRatingId
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      }
      else {
        throw new Error("An error has occured")
      }
      return getBookshelf()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  function ratingCallback([rating,starRatingId]: [rating:number,starRatingId:number]) {
    ratingCallbackMutation.mutate([rating,starRatingId])
  }

  const suggestionsNotesRef = useRef({} as HTMLTextAreaElement);
  async function saveSuggestionNotes() {
    let tokenCookie: string | null = Cookies.get().token;
    const suggestionsNotes = suggestionsNotesRef.current.value;
    if (tokenCookie) {
      await axios
      .put(server + "/api/savesuggestionsnotes",
        {
          suggestionsNotes: suggestionsNotes
        },
        {
          headers: {
            authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        toast({
          description: "Notes saved",
          status: "success",
          duration: 9000,
          isClosable: true
        })
      })
      .catch((response)=>{
        console.log(response)
        toast({
          description: "Error: BSN101",
          status: "error",
          duration: 9000,
          isClosable: true
        })
        if (response.data?.message) {
          throw new Error(response.data?.message)
        }
      })
    }
    else {
      throw new Error("An error has occured")
    }
  }

  const allowSuggestionsRef = useRef({} as HTMLInputElement);
  async function allowSuggestionsToggle(){
    const isChecked = allowSuggestionsRef.current.checked;
    let tokenCookie: string | null = Cookies.get().token;
    if (tokenCookie) {
      await axios
      .put(server + "/api/bookshelfallowsuggestions",
        {
          allowSuggestions: isChecked ? 1 : 0
        },
        {
          headers: {
            authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        setAllowSuggestions(prev=>!prev)
      })
      .catch(({response})=>{
        console.log(response)
        if (response.data?.message) {
          throw new Error(response.data?.message)
        }
      })
    }
    else {
      throw new Error("An error has occured")
    }
  }

  const { 
    isOpen: isOpenImportBookshelfModal, 
    onOpen: onOpenImportBookshelfModal, 
    onClose: onCloseImportBookshelfModal 
  } = useDisclosure()

  const [importLimit,setImportLimit] = useState(7500);
  async function getImportLimit() {
    const tokenCookie = Cookies.get().token;
    await axios
      .get(server + "/api/bookshelfimportlimit",
        {
          headers: {
            Authorization: tokenCookie
          }
        }
      )
      .then((response)=>{
        setImportLimit(response.data.message)
      })
      .catch(({response})=>{
        console.log(response)
      })
  }
  useEffect(()=>{
    getImportLimit();
  },[importLimit])

  const importBookshelfRef = useRef({} as HTMLInputElement);
  const [importBookshelfError,setImportBookshelfError] = useState("");
  const [importProgressValue,setImportProgressValue] = useState(0);
  async function importBookshelf() {
    const files = importBookshelfRef.current.files;
    const reader = new FileReader();
    if (files && files.length > 0) {
      reader.readAsText(files[0])
      reader.onload = async (e)=>{
        setImportProgressValue(1);
        const csvdata = e.target!.result;
        const rowData = (csvdata as string).split('\n');
        if (rowData.length > importLimit) {
          setImportBookshelfError(`File (${rowData.length} rows) exceeds today's limit (${importLimit}).`);
          return
        }
        else {
          for (let i=1;i<rowData.length;i++){
            if (rowData[i] !== '') {
              const cellData = rowData[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/g);
              const title = cellData[1]?.replace(/\s/g,'+').replace(/[="]/g,"");
              const title1 = cellData[1]?.replace(/[="]/g,"")
              const author = cellData[2]?.replace(/\s/g,'+').replace(/[="]/g,"");
              const author1 = cellData[2]?.replace(/[="]/g,"");
              const isbn = cellData[5].replace(/[="]/g,"");
              const rating = parseInt(cellData[7]);
              const dateAdded = dayjs(cellData[15]).utc().format('YYYY-MM-DD mm:HH:ss');
              await axios
                .get(`https://openlibrary.org/search.json?q=${title}+${author}+${isbn}`)
                .then(async (result)=>{
                  if (result?.data?.docs?.length) {
                    const bookResult = result.data.docs[0];
                    const book = {
                      google_books_id: null,
                      title: title1,
                      author: author1,
                      image: bookResult.cover_i ? (
                        `https://covers.openlibrary.org/b/id/${bookResult.cover_i}-M.jpg?default=false`
                      ) : (
                        bookResult.lccn ? (
                          `https://covers.openlibrary.org/b/lccn/${bookResult.lccn[0]}-M.jpg?default=false`
                        ) : (
                          "https://via.placeholder.com/165x215"
                        )
                      ),
                      isbn: isbn,
                      page_count: bookResult.number_of_pages_median,
                      published_date: bookResult.publish_date?.length ? dayjs(bookResult.publish_date[0]).format('YYYY') : ""
                    }
                    let tokenCookie: string | null = Cookies.get().token;
                    await axios
                      .post(server + "/api/addbookshelfbook", 
                        {
                          book: book,
                          categories: [],
                          rating: rating,
                          dateAdded: dateAdded,
                          notes: null
                        },
                        {headers: {
                          'authorization': tokenCookie
                        }}
                      )
                      .then((response)=>{
                        if (response.data.success) {
                          setImportProgressValue(((i+2) / rowData.length) * 100)
                        }
                        else {
                          setImportBookshelfError(response.data?.message ? response.data.message : "")
                          return;
                        }
                      })
                      .catch(({response})=>{
                        console.log(response)
                        return;
                      })
                  }
                })
                .catch((response)=>{
                  console.log(response);
                  toast({
                    description: "An error has occurred",
                    status: "error",
                    duration: 9000,
                    isClosable: true
                  })
                })
            }
          }
          setTimeout(()=>{
            setImportProgressValue(100)
            setImportProgressValue(0)
            onCloseImportBookshelfModal();
            getImportLimit();
            getBookshelf()
          },1000)
        }
      }
    }
  }
  
  function editDate(id: number) {
    const dateText = document.getElementById(`date-text-${id}`);
    const dateInputBlock = document.getElementById(`date-input-block-${id}`)
    dateText!.style.display = "none";
    dateInputBlock!.style.display = "flex";
  }
  function hideInputBlock(id: number) {
    const dateText = document.getElementById(`date-text-${id}`);
    const dateInputBlock = document.getElementById(`date-input-block-${id}`);
    dateText!.style.display = "flex";
    dateInputBlock!.style.display = "none";
  }
  const saveDateMutation = useMutation({
    mutationFn: async (id: number) => {
      const dateInput = document.getElementById(`date-input-${id}`);
      const date = dayjs((dateInput as HTMLInputElement)!.value).utc().format('YYYY-MM-DD mm:HH:ss');
      let tokenCookie: string | null = Cookies.get().token;
        await axios
        .put(server + "/api/savebookshelfbookdate",
          {
            id: id,
            date: date
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          const dateText = document.getElementById(`date-text-${id}`);
          const dateInputBlock = document.getElementById(`date-input-block-${id}`);
          dateInputBlock!.style.display = "none";
          dateText!.style.display = "flex";
          toast({
            description: "Date saved",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      return getBookshelf()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  function saveDate(id: number) {
    saveDateMutation.mutate(id)
  }

  const hideOrShowBookshelfBookMutation = useMutation({
    mutationFn: async ([id,hideOrShow]: [number,string]) => {
      let tokenCookie: string | null = Cookies.get().token;
        await axios
        .put(server + "/api/hideorshowbookshelfbook",
          {
            id: id,
            hideOrShow: hideOrShow
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          toast({
            description: "Sucess",
            status: "success",
            duration: 9000,
            isClosable: true
          })
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      return getBookshelf()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  function hideOrShowBookshelfBook([id,hideOrShow]:[number,string]) {
    hideOrShowBookshelfBookMutation.mutate([id,hideOrShow])
  }

  function showEditBookshelfBook(id: number) {
    document.getElementById(`edit-bookshelf-book-${id}`)!.style.display = "block";
    document.getElementById(`bookshelf-book-${id}`)!.style.display = "none";
  }
  function cancelShowEditBookshelfBook(id: number) {
    document.getElementById(`edit-bookshelf-book-${id}`)!.style.display = "none";
    document.getElementById(`bookshelf-book-${id}`)!.style.display = "block";
  }

  const updateBookshelfBookMutation = useMutation({
    mutationFn: async (id: number) => {
      let tokenCookie: string | null = Cookies.get().token;
      const title = document.getElementById(`title-${id}`) as HTMLInputElement;
      const author = document.getElementById(`author-${id}`) as HTMLInputElement;
      const publishedDate = document.getElementById(`year-${id}`) as HTMLInputElement;
      const pageCount = document.getElementById(`pages-${id}`) as HTMLInputElement;
      await axios
        .put(server + "/api/updatebookshelfbook",
          {
            id: id,
            title: title!.value,
            author: author!.value,
            published_date: publishedDate!.value,
            page_count: parseInt(pageCount!.value)
          },
          {
            headers: {
              authorization: tokenCookie
            }
          }
        )
        .then((response)=>{
          toast({
            description: "Updated bookshelf book",
            status: "success",
            duration: 9000,
            isClosable: true
          })
          document.getElementById(`edit-bookshelf-book-${id}`)!.style.display = "none";
          document.getElementById(`bookshelf-book-${id}`)!.style.display = "block";
        })
        .catch(({response})=>{
          console.log(response)
          if (response.data?.message) {
            throw new Error(response.data?.message)
          }
        })
      return getBookshelf()
    },
    onSuccess: (data,variables)=>{
      queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
      queryClient.resetQueries({queryKey: ['bookshelfKey']})
      queryClient.setQueryData(["bookshelfKey"],data)
    }
  })
  function updateBookshelfBook(id: number) {
    updateBookshelfBookMutation.mutate(id)
  }

  const { isLoading, isError, data, error } = useQuery({ 
    queryKey: ['bookshelfKey'], 
    queryFn: getBookshelf
  });
  const bookshelf = data ? data : null;
  const suggestionsNotesDefaultValue = bookshelf?.suggestions_notes;
  const categories = bookshelf?.BookshelfCategory;
  const books = bookshelf?.BookshelfBook;
  
  if (isError) {
    return <Flex align="center" justify="center" minH="90vh">
      <Heading as="h2" size="xl">Error: {(error as Error).message}</Heading>
    </Flex>
  }
  
  return (
    <Box className="main-content">
      <Skeleton 
        isLoaded={!isLoading}
      >
        <Heading as="h1" className="visually-hidden">Bookshelf</Heading>
        <Flex flexWrap="wrap" align="flex-start">
          <Box flex="1 1 30%">
            <Box
              className="well"
            >
              <Flex
                align="center"
                justify="space-between"
                className="non-well"
              >
                <FormLabel 
                  htmlFor="allow-suggestions"
                  mb={0}
                  fontWeight="bold"
                >
                  Allow suggestions?
                </FormLabel>
                <Switch
                  id="allow-suggestions"
                  isChecked={allowSuggestions}
                  ref={allowSuggestionsRef}
                  onChange={e=>allowSuggestionsToggle()}
                />
              </Flex>
              {allowSuggestions ? (
                <Flex
                  direction="column"
                  align="center"
                  gap={1}
                  mx={1}
                >
                  <Textarea
                    placeholder="Suggestion notes"
                    defaultValue={suggestionsNotesDefaultValue}
                    ref={suggestionsNotesRef}
                    maxLength={500}
                    borderColor="black"
                  >
                  </Textarea>
                  <Flex
                    justify="space-between"
                    w="100%"
                  >
                    <Popover isLazy>
                      <PopoverTrigger>
                        <Flex 
                          align="center" 
                          justify="center" 
                          me={2}
                          _hover={{
                            cursor: "pointer"
                          }}
                        >
                          <ImInfo size={20} color="gray" />
                        </Flex>
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverBody 
                          fontSize="sm"
                          _dark={{
                            bg: "black"
                          }}
                        >
                          To receive more suggestions, try suggesting books to other users. Also, in your suggestion notes, be descriptive about what you're looking for. Bookshelves without any books and no suggestion notes will not be listed.
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    <Button
                      onClick={e=>saveSuggestionNotes()}
                      colorScheme="black"
                      variant="outline"
                      size="sm"
                    >
                      Save
                    </Button>  
                  </Flex>
                </Flex>
              ) : (
                null
              )}
            </Box>
            <Stack className="well">
              <Box>
                <Flex align="center" flexWrap="wrap" justify="space-between" mb={2}>
                  <Heading as="h2" size="md">
                    Filter by Tags
                  </Heading>

                  {!showAddCategory && (
                    <Box
                      onClick={e=>setShowAddCategory(true)}
                      rounded="md"
                      _hover={{
                        cursor: "pointer",
                        bg: "grey"
                      }}
                    >
                      <IoIosAdd size={25} />
                    </Box>
                  )}

                </Flex>

                {showAddCategory && (
                  <>
                    <Flex
                      align="center"
                      justify="space-between"
                      gap={1}
                      mb={2}
                    >
                      <Input
                        type="text"
                        ref={createCategoryInputRef}
                        onKeyUp={e=>e.key === 'Enter' ? createCategoryButtonRef.current.click() : null}
                        maxLength={40}
                        borderColor="black"
                      />
                      <Button
                        ref={createCategoryButtonRef}
                        onClick={e=>createCategory()}
                        backgroundColor="black"
                        color="white"
                      >
                        Add
                      </Button>
                      <Button
                        onClick={e=>setShowAddCategory(false)}
                        variant="outline"
                        borderColor="black"
                      >
                        Cancel
                      </Button>
                    </Flex>
                    {createCategoryError && (
                      <Text color="red">{createCategoryError}</Text>
                    )}
                  </>
                )}
              </Box>

              <CheckboxGroup
                onChange={e=>filterByCategory(e as string[])}
              >         
                <Stack>
                  {categories ? (
                    categories.map((category: BookshelfCategory,i: number)=>{
                      return (
                        <Flex
                          align="center"
                          justify="space-between"
                          key={i}
                        >
                          <Checkbox 
                            me={1}
                            value={category.id.toString()}
                          >
                            <Text>
                              {category.name}
                            </Text>
                          </Checkbox>
                          <Button 
                            size="xs" 
                            p={0}
                            colorScheme="red"
                            variant="ghost"
                            rounded="xl"
                            data-id={category.id}
                            onClick={e=>removeCategory(e)}
                          >
                            <Box
                              as={IoIosRemove} 
                              size={20} 
                              pointerEvents="none"
                            />
                          </Button>
                        </Flex>
                      )
                    })
                  ): null}
                </Stack>
              </CheckboxGroup>
              <Divider/>
              <Heading as="h2" size="md">
                Search Bookshelf
              </Heading>
              <Flex
                justify="space-between"
                align="center"
                gap={1}
              >
                <Input
                  type="search"
                  ref={searchInputRef}
                  onKeyDown={e=> e.key === "Enter" ? searchFilter() : null}
                  aria-label="search"
                />
                <Button
                  onClick={e=>resetSearchFilter()}
                >
                  Reset
                </Button>
                <Button
                  onClick={e=>searchFilter()}
                  backgroundColor="black"
                  color="white"
                >
                  Search
                </Button>
              </Flex>
            </Stack>
          </Box>
          <Stack flex="1 1 65%" maxW="100%" className="well">
            <Box>
              <Flex align="center" justify="space-between">
                <Heading as="h2" size="md">
                  Bookshelf
                </Heading>
                <Menu>
                  <MenuButton 
                    as={Button}
                    variant="ghost"
                    rounded="full"
                    height="20px"
                    minWidth="auto"
                    px={0}
                    title="add"
                  >
                    <IoIosAdd size={25} />
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={onOpenBookSearchModal}
                    >
                      Add New
                    </MenuItem>
                    <MenuItem
                      onClick={onOpenImportBookshelfModal}
                    >
                      Import
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
              {bookToAdd && (
                <Stack className="well-card" position="relative">
                  <CloseButton
                    position="absolute"
                    top={0}
                    right={0}
                    onClick={e=>setBookToAdd(null)}
                  />
                  <FormControl variant="floatingstatic">
                    <FormLabel>
                      Date
                    </FormLabel>
                    <Input
                      type="date"
                      defaultValue={dayjs(new Date()).local().format("YYYY-MM-DD")}
                      ref={dateRef}
                      maxW="150px"
                      mb={1}
                    />
                  </FormControl>
                  <Flex>
                    <Image
                      src={bookToAdd.image}
                      onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                      maxH="125px"
                      // minW="60px"
                      boxShadow="1px 1px 1px 1px darkgrey"
                      alt={bookToAdd.title}
                    />
                    <Input
                      type="hidden"
                      defaultValue={bookToAdd.image ? bookToAdd.image : "https://via.placeholder.com/165x215"}
                      ref={imageRef}
                    />
                    <Box mx={2} w="100%">
                      <Stack spacing={3} lineHeight={1.4}>
                        <FormControl variant="floatingstatic">
                          <FormLabel>
                            Title
                          </FormLabel>
                          <Input
                            type="text"
                            defaultValue={bookToAdd.title}
                            ref={titleRef}
                            maxLength={200}
                          />
                        </FormControl>
                        <FormControl variant="floatingstatic">
                          <FormLabel>
                            Author
                          </FormLabel>
                          <Input
                            type="text"
                            defaultValue={bookToAdd.author}
                            ref={authorRef}
                            maxLength={150}
                          />
                        </FormControl>
                        <FormControl variant="floatingstatic">
                          <FormLabel>
                            Year
                          </FormLabel>
                          <Input
                            type="text"
                            defaultValue={bookToAdd.published_date ? dayjs(bookToAdd.published_date).format("YYYY") : ""}
                            maxW="125px"
                            ref={yearRef}
                            maxLength={4}
                          />
                        </FormControl>
                        <FormControl variant="floatingstatic">
                          <FormLabel>
                            Pages
                          </FormLabel>
                          <NumberInput
                            defaultValue={bookToAdd.page_count ? bookToAdd.page_count : ""}
                            maxW="125px"
                          >
                            <NumberInputField 
                              ref={pagesRef} 
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </Stack>
                    </Box>
                  </Flex>
                  <Flex
                    align="center"
                    gap={1}
                    wrap="wrap"
                    justify="flex-end"
                  >
                    {bookToAddCategories ? (
                      bookToAddCategories.map((category: BookshelfCategory)=>{
                        return (
                          <Tag
                            size="xs"
                            rounded="lg"
                            p={1}
                            px={2}
                            fontSize="xs"
                            key={category.id}
                          >
                            {category.name}
                          </Tag>
                        )
                      })
                    ): null}
                    {categories.length ? (
                      <Menu>
                        <MenuButton 
                          as={Button}
                          variant="ghost"
                          rounded="full"
                          height="20px"
                          minWidth="auto"
                          px={0}
                          title="add"
                        >
                          <BiPlus size={20} />
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            onClick={e=>setBookToAddCategories([])}
                          >
                            None
                          </MenuItem>
                          {categories ? (
                            categories.map((category: BookshelfCategory)=>{
                              return (
                                <MenuItem
                                  key={category.id}
                                  data-id={category.id}
                                  data-name={category.name}
                                  onClick={(e)=>{
                                    setBookToAddCategories((prev: BookshelfCategory[])=>{
                                      const id = (e as any).target.dataset.id;
                                      const name = (e as any).target.dataset.name;
                                      const alreadyIn = prev.filter((cat)=>cat.id===id).length;
                                      if (id !== "" && alreadyIn === 0) {
                                        return [...prev,{
                                          id: id,
                                          name: name
                                        }]
                                      }
                                      else {
                                        if (id === "") {
                                          return []
                                        }
                                        else {
                                          return [...prev]
                                        }
                                      }
                                    })
                                  }}
                                >
                                  {category.name}
                                </MenuItem>
                              )
                            })
                          ):null}

                        </MenuList>
                      </Menu>
                    ) : null}
                  </Flex>

                  <Accordion defaultIndex={[0,1]} allowMultiple>
                    <AccordionItem 
                      borderColor="black" 
                      borderLeft="1px solid black"
                      borderRight="1px solid black"
                      rounded="sm"
                      boxShadow="0"
                      py={1}
                      bg="white"
                      _dark={{
                        bg: "blackAlpha.300"
                      }}
                    >
                      <AccordionButton>
                        <Heading as="h3" size="sm">
                          Review
                        </Heading>
                        <AccordionIcon ml="auto" />
                      </AccordionButton>
                      <AccordionPanel>
                        <Flex
                          direction="column"
                          align="center"
                          gap={2}
                        >
                          <Textarea
                            rounded="md"
                            ref={reviewRef}
                            maxLength={9000}
                          />
                        </Flex>
                      </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem 
                      border="1px solid black"
                      borderLeft="1px solid black"
                      borderRight="1px solid black"
                      rounded="sm"
                      boxShadow="0"
                      py={1}
                      bg="white"
                      _dark={{
                        bg: "blackAlpha.300"
                      }}
                    >
                      <AccordionButton>
                        <Heading as="h3" size="sm">
                          Notes
                        </Heading>
                        <AccordionIcon ml="auto" />
                      </AccordionButton>
                      <AccordionPanel>
                        <Textarea
                          as={ReactQuill} 
                          // id="location" 
                          ref={notesRef}
                          mb={1}
                          theme="snow"
                          rounded="md"
                          sx={{
                            '.ql-toolbar': {
                              borderTopRadius: "5px",
                              borderColor: colorMode === "light" ? "#ccc" : "#222222"
                            },
                            '.ql-container': {
                              borderBottomRadius: "5px",
                              borderColor: colorMode === "light" ? "#ccc" : "#222222"
                            }
                          }}
                          modules={{
                            toolbar: [
                              [{ 'header': []}],
                              ['bold', 'italic', 'underline'],
                              [{'list': 'ordered'}, {'list': 'bullet'}],
                              ['link'],
                              [{'align': []}],
                              ['clean']
                            ]
                          }}
                          formats={[
                            'header','bold', 'italic', 'underline','list', 'bullet', 'align','link'
                          ]}
                        />
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                  <Flex
                    justify="flex-end"
                  >
                    <Button
                      backgroundColor="black"
                      color="white"
                      onClick={e=>addBookshelfBook()}
                    >
                      Save to Bookshelf
                    </Button>
                  </Flex>
                </Stack>
              )}
            </Box>

            <Box>
              {bookshelfBooks ? (
                bookshelfBooks.map((book: BookshelfBook)=>{
                  return (
                    <Flex 
                      direction="column" 
                      gap={2} 
                      className="well-card" 
                      key={book.id} 
                      position="relative"
                    >
                      <Flex
                        align="center"
                        justify="space-between"
                      >
                        <Box>
                          <Flex align="center" gap={1} wrap="wrap">
                            <Flex
                              align="center"
                              gap={1}
                              id={`date-text-${book.id}`}
                            >
                              <Text 
                                fontStyle="italic"
                              >
                                {dayjs(book.created_on).local().format('MMM DD, YYYY')}
                              </Text>
                              <Button
                                size="xs"
                                variant="ghost"
                                aria-label="edit date"
                                // px={0}
                                minW="35px"
                                onClick={e=>editDate(book.id)}
                              >
                                <MdEdit size={15} opacity={.9} />
                              </Button>
                            </Flex>
                            <Flex 
                              gap={1} 
                              align="center"
                              id={`date-input-block-${book.id}`}
                              display="none"
                            >
                              <Input
                                type="date"
                                defaultValue={dayjs(book.created_on).local().format("YYYY-MM-DD")}
                                id={`date-input-${book.id}`}
                                size="sm"
                              />
                              <Button
                                backgroundColor="black"
                                color="white"
                                size="sm"
                                onClick={e=>saveDate(book.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                onClick={e=>hideInputBlock(book.id)}
                                variant="outline"
                                borderColor="black"
                              >
                                Cancel
                              </Button>
                            </Flex>
                          </Flex>
                        </Box>
                        <Flex align="center" gap={1}>
                          {book.hidden ? (
                            <Text 
                              as="span"
                              fontStyle="italic"
                            >
                              {" "} hidden
                            </Text>
                          ): null}
                          <Menu>
                            <MenuButton 
                              as={Button}
                              size="md"
                              maxH="25px"
                              variant="ghost"
                              rounded="full"
                              // p={1}
                              title="menu"
                            >
                              <BiDotsHorizontalRounded size={20} />
                            </MenuButton>
                            <MenuList>
                              <MenuItem 
                                onClick={e=>navigate(`/chat/room?title=${book.title}&author=${book.author}`)}
                                fontWeight="bold"
                                icon={<MdOutlineChat size={20} />}
                              >
                                Chat Room
                              </MenuItem>
                              <MenuItem 
                                as={Link}
                                to={`https://bookshop.org/books?affiliate=95292&keywords=${encodeURIComponent(book.title + " " + book.author)}`}
                                target="blank"
                                fontWeight="bold"
                                icon={<FaShoppingCart size={20} />}
                              >
                                Shop
                              </MenuItem>
                              <MenuItem
                                data-id={book.id}
                                onClick={e=>hideOrShowBookshelfBook([book.id,book.hidden ? "show" : "hide"])}
                                fontWeight="bold"
                                icon={<BiHide size={20} />}
                              >
                                {book.hidden ? "Unhide" : "Hide"} From Suggestions
                              </MenuItem>

                              <MenuItem
                                color="tomato"
                                data-id={book.id}
                                onClick={e=>deleteBookshelfBook(e)}
                                fontWeight="bold"
                                icon={<BiTrash size={20} />}
                              >
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Flex>
                      </Flex>
                      <Flex>
                        <Image
                          src={book.image}
                          maxH="100px"
                          // minW="60px"
                          onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
                          boxShadow="1px 1px 1px 1px darkgrey"
                          alt={book.title}
                        />
                        <Box w="100%">
                          <Box
                            mx={2} 
                            w="100%" 
                            lineHeight={1.4}
                            id={`bookshelf-book-${book.id}`}
                          >
                            <Flex
                              align="center"
                              // justify="space-between"
                              gap={1}
                            >
                              <Heading 
                                as="h2" 
                                size="md"
                                // me={3}
                                noOfLines={2}
                              >
                                {book.title}
                              </Heading>
                              <Button
                                size="xs"
                                variant="ghost"
                                aria-label="edit"
                                // px={0}
                                minW="35px"
                                onClick={e=>showEditBookshelfBook(book.id)}
                              >
                                <MdEdit size={18} opacity={.9} />
                              </Button>
                            </Flex>
                            {/* <Popover isLazy>
                              <PopoverTrigger>

                              </PopoverTrigger>
                              <PopoverContent>
                                <PopoverArrow />
                                <PopoverCloseButton />
                                <PopoverBody 
                                _dark={{
                                  bg: "black"
                                }}
                                  fontSize="sm"
                                >
                                  {book.description}
                                </PopoverBody>
                              </PopoverContent>
                            </Popover> */}
                            <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                              {book.author}
                            </Text>
                            <Text fontStyle="italic">
                              {book.published_date ? dayjs(book.published_date).format("YYYY") : null}
                            </Text>
                            {book.page_count ? (
                              <Text noOfLines={1}>
                                {book.page_count} pages
                              </Text>
                            ): null}
                          </Box>
                          <Box
                            id={`edit-bookshelf-book-${book.id}`}
                            display="none"
                            mt={2}
                            ms={2}
                          >
                            <Stack spacing={3} lineHeight={1.4}>
                              <FormControl variant="floatingstatic">
                                <FormLabel>
                                  Title
                                </FormLabel>
                                <Input
                                  type="text"
                                  defaultValue={book.title}
                                  id={`title-${book.id}`}
                                  maxLength={200}
                                />
                              </FormControl>
                              <FormControl variant="floatingstatic">
                                <FormLabel>
                                  Author
                                </FormLabel>
                                <Input
                                  type="text"
                                  defaultValue={book.author}
                                  id={`author-${book.id}`}
                                  maxLength={150}
                                />
                              </FormControl>
                              <FormControl variant="floatingstatic">
                                <FormLabel>
                                  Year
                                </FormLabel>
                                <Input
                                  type="text"
                                  defaultValue={book.published_date ? dayjs(book.published_date).format("YYYY") : ""}
                                  maxW="125px"
                                  id={`year-${book.id}`}
                                  maxLength={4}
                                />
                              </FormControl>
                              <Flex
                                justify="space-between"
                              >
                                <FormControl variant="floatingstatic">
                                  <FormLabel>
                                    Pages
                                  </FormLabel>
                                  <NumberInput
                                    defaultValue={book.page_count ? book.page_count : ""}
                                    maxW="125px"
                                  >
                                    <NumberInputField 
                                      id={`pages-${book.id}`} 
                                    />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                </FormControl>
                                <Flex
                                  align="center"
                                  gap={1}
                                >
                                  <Button
                                    variant="outline"
                                    borderColor="black"
                                    color="black"
                                    onClick={e=>cancelShowEditBookshelfBook(book.id)}
                                    aria-label="cancel"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    backgroundColor="black"
                                    color="white"
                                    onClick={e=>updateBookshelfBook(book.id)}
                                    aria-label="save"
                                  >
                                    Save
                                  </Button>
                                </Flex>
                              </Flex>
                            </Stack>
                          </Box>
                          <Box ms={2}>
                            <StarRating
                              ratingCallback={ratingCallback} 
                              starRatingId={book.id}
                              defaultRating={book.rating ? book.rating : 0}
                            />
                          </Box>
                        </Box>
                      </Flex>

                      <Flex align="center" gap={1} wrap="wrap" justify="flex-end">
                        {book.BookshelfBookCategory.length ? (
                          book.BookshelfBookCategory.map((category,i)=>{
                            return (
                              <Tag
                                size="xs"
                                rounded="lg"
                                p={1}
                                pl={4}
                                fontSize="sm"
                                display="flex"
                                alignItems="center"
                                gap={2}
                                key={i}
                                onClick={e=>{
                                  const closeButton = document.getElementById(`close-button-${book.id}-${category.BookshelfCategory.id}`)
                                  if(closeButton?.style.visibility === "hidden") {
                                    closeButton.style.visibility = "visible"
                                  }
                                  else if (closeButton?.style.visibility === "visible") {
                                    closeButton.style.visibility = "hidden"
                                  }
                                }}
                                _hover={{
                                  cursor: "pointer"
                                }}
                              >
                                <Text pointerEvents="none">
                                  {category.BookshelfCategory.name}
                                </Text>
                                <Box 
                                  id={`close-button-${book.id}-${category.BookshelfCategory.id}`}
                                  style={{visibility: "hidden"}}
                                  data-bookid={book.id}
                                  data-categoryid={category.BookshelfCategory.id}
                                  onClick={e=>removeCategoryFromBook(e)}
                                  _hover={{
                                    cursor: "pointer"
                                  }}
                                >
                                  <TagCloseButton 
                                    color="red"
                                    pointerEvents="none"
                                  />
                                </Box>
                                {removeCategoryFromBookMutation.isLoading && (
                                  <Spinner size="xs"/>
                                )}
                              </Tag>
                            )
                          })
                        ): null}
                        {categories?.length ? (
                          <Menu>
                            <MenuButton 
                              as={Button}
                              variant="ghost"
                              rounded="full"
                              height="20px"
                              minWidth="auto"
                              px={0}
                              title="menu"
                            >
                              <BiPlus size={20} />
                            </MenuButton>
                            <MenuList>
                              {categories ? (
                                categories.map((category: BookshelfCategory)=>{
                                  return (
                                    <MenuItem
                                      data-categoryid={category.id}
                                      data-bookid={book.id}
                                      key={category.id}
                                      onClick={e=>addCategoryToBook(e)}
                                    >
                                      {category.name}
                                    </MenuItem>
                                  )
                                })
                              ):null}

                            </MenuList>
                          </Menu>
                        ) : null}
                      </Flex>
                      <Accordion defaultIndex={[2]} allowMultiple>
                        <AccordionItem 
                          borderColor="black" 
                          borderLeft="1px solid black"
                          borderRight="1px solid black"
                          rounded="sm"
                          boxShadow="0"
                          py={1}
                          bg="white"
                          _dark={{
                            bg: "blackAlpha.300"
                          }}
                        >
                          <AccordionButton>
                            <Heading as="h3" size="sm">
                              Review
                            </Heading>
                            <AccordionIcon ml="auto" />
                          </AccordionButton>
                          <AccordionPanel>
                            <Flex
                              direction="column"
                              align="center"
                              gap={2}
                            >
                              <Textarea
                                rounded="md"
                                defaultValue={book.review}
                                id={`review-input-${book.id}`}
                                maxLength={9000}
                              />
                              <Flex
                                justify="flex-end"
                                w="100%"
                              >
                                <Button
                                  w="auto"
                                  alignSelf="flex-end"
                                  data-bookid={book.id}
                                  onClick={e=>updateReview(e)}
                                  size="sm"
                                  backgroundColor="black"
                                  color="white"
                                >
                                  Save Review
                                </Button>
                              </Flex>
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                        <AccordionItem 
                          borderColor="black" 
                          borderLeft="1px solid black"
                          borderRight="1px solid black"
                          rounded="sm"
                          boxShadow="0"
                          py={1}
                          bg="white"
                          _dark={{
                            bg: "blackAlpha.300"
                          }}
                        >
                          <AccordionButton>
                            <Heading as="h3" size="sm">
                              Private Notes
                            </Heading>
                            <AccordionIcon ml="auto" />
                          </AccordionButton>
                          <AccordionPanel>
                            <Flex
                              direction="column"
                              align="center"
                              gap={2}
                            >
                              <Textarea
                                as={ReactQuill}
                                border="0" 
                                rounded="md"
                                theme="snow"
                                sx={{
                                  '.ql-toolbar': {
                                    borderTopRadius: "5px",
                                    borderColor: colorMode === "light" ? "#ccc" : "#222222"
                                  },
                                  '.ql-container': {
                                    borderBottomRadius: "5px",
                                    borderColor: colorMode === "light" ? "#ccc" : "#222222"
                                  }
                                }}
                                modules={{
                                  toolbar: [
                                    [{ 'header': []}],
                                    ['bold', 'italic', 'underline'],
                                    [{'list': 'ordered'}, {'list': 'bullet'}],
                                    ['link'],
                                    [{'align': []}],
                                    ['clean']
                                  ]
                                }}
                                formats={[
                                  'header','bold', 'italic', 'underline','list', 'bullet', 'align','link'
                                ]}
                                defaultValue={book.notes}
                                onChange={e=>{ 
                                    const notesInput: any = document.getElementById(`notes-input-${book.id}`);
                                    notesInput!.value = e;
                                  }
                                }
                                id={`notes-input-${book.id}`}
                              />
                              <Flex
                                justify="space-between"
                                w="100%"
                              >
                                <Popover isLazy>
                                  <PopoverTrigger>
                                    <Flex 
                                      align="center" 
                                      justify="center" 
                                      me={2}
                                      _hover={{
                                        cursor: "pointer"
                                      }}
                                    >
                                      <ImInfo size={20} color="gray" />
                                    </Flex>
                                  </PopoverTrigger>
                                  <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverCloseButton />
                                    <PopoverBody 
                                      fontSize="sm"
                                      _dark={{
                                        bg: "black"
                                      }}
                                    >
                                      Private notes are only visible to you.
                                    </PopoverBody>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  w="auto"
                                  alignSelf="flex-end"
                                  data-bookid={book.id}
                                  onClick={e=>updateNotes(e)}
                                  size="sm"
                                  backgroundColor="black"
                                  color="white"
                                >
                                  Save Notes
                                </Button>
                              </Flex>
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  )
                })
              ): null}
            </Box>
          </Stack>

        </Flex>

        <Modal 
          isOpen={isOpenBookSearchModal} 
          onClose={onCloseBookSearchModal}
          // maxW="90vw"
          isCentered
        >
          <ModalOverlay />
          <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
            <ModalHeader>
              New Bookshelf Book
            </ModalHeader>
            <ModalCloseButton />
              <ModalBody minH="150px" h="auto" maxH="75vh" overflow="auto">
                <BooksSearch selectText="Add" selectCallback={selectBookToAdd as any} gBooksApi={gbooksapi}/>
              </ModalBody>
              <ModalFooter flexDirection="column">
              </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal 
          isOpen={isOpenImportBookshelfModal} 
          onClose={onCloseImportBookshelfModal}
          isCentered
        >
          <ModalOverlay />
          <ModalContent rounded="sm" boxShadow="1px 1px 2px 1px black">
            <ModalHeader>
              Import Goodreads Library (Beta)
            </ModalHeader>
            <ModalCloseButton />
              <ModalBody>
                <Flex
                  direction="column"
                  gap={3}
                >
                  <Text fontStyle="italic">
                    Today's remaining imports: {importLimit}.
                  </Text>
                  <Box>
                    <Heading as="h3" size="xs">
                      Step 1
                    </Heading>
                    <Text>
                      Export your Goodreads library
                    </Text>
                    <Button
                      as="a"
                      href="http://www.goodreads.com/review/import"
                      target="blank"
                      size="xs"
                      borderColor="black"
                      variant="outline"
                    >
                      Goodreads Export
                    </Button>
                  </Box>
                  <Box>
                    <Heading as="h3" size="xs">
                      Step 2
                    </Heading>
                    <Text>
                      Select the Goodreads .csv file
                    </Text>
                    <Input
                      type="file"
                      accept=".csv"
                      border={0}
                      p={0}
                      rounded="xs"
                      height="auto"
                      ref={importBookshelfRef}
                    />
                    {importProgressValue > 0 ? (
                      <Progress value={importProgressValue}/>
                    ): null}
                  </Box>
                  <Box>
                    <Heading as="h3" size="xs">
                      Step 3
                    </Heading>
                    <Text>
                      Click the button below
                    </Text>
                    <Button
                      backgroundColor="black"
                      color="white"
                      size="sm"
                      onClick={e=>importBookshelf()}
                    >
                      Import
                    </Button>
                    <Text color="red" fontStyle="italic">
                      {importBookshelfError}
                    </Text>
                  </Box>
                </Flex>
              </ModalBody>
              <ModalFooter>

              </ModalFooter>
          </ModalContent>
        </Modal>

      </Skeleton>
    </Box>
  );
};

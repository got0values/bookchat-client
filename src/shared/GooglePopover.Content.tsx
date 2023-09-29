import React, {useState, useEffect} from 'react';
import { 
  Box,
  Spinner
} from "@chakra-ui/react";
import axios from "axios";

export default function GooglePopoverContent({title,author,gBooksApi}: {title: string, author: string, gBooksApi: string}) {
  const [bookDescription,setBookDescription] = useState("")
  const [isLoading,setIsLoading] = useState(false)
  async function searchBook() {
    setIsLoading(true)
    await axios
      .get("https://www.googleapis.com/books/v1/volumes?q=" + title + " " + author + "&key=" + gBooksApi)
      .then((response)=>{
        if (response.data.items) {
          setBookDescription(response.data.items ? response.data.items[0].volumeInfo.description : "")
        }
        else {
          setBookDescription("")
        }
      })
      .catch((error)=>{
        setBookDescription("")
      })
    setIsLoading(false)
  }

  useEffect(()=>{
    searchBook()
  },[])

  return (
    <>
      {isLoading ? (
        <Spinner/>
      ): (
        <Box>
          {bookDescription}
        </Box>
      )}
    </>
  )
}
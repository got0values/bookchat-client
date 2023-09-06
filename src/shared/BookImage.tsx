import {useState,useEffect} from "react";
import { 
  Image,
  Spinner
} from "@chakra-ui/react";
import axios from "axios";

export default function BookImage({isbn,id,maxHeight="unset"}: {isbn?: string,id:string, maxHeight?: string}) {
  const RAPIDAPIKEY = import.meta.env.VITE_RAPID_API_KEY;
  const [bookImageSrc,setBookImageSrc] = useState("https://via.placeholder.com/165x215");
  const [bookImgIsLoading,setBookImgIsLoading] = useState(false);
  useEffect(()=>{
    async function getBookImage() {
      await axios
        .request({
          method: "GET",
          url: "https://book-cover-api2.p.rapidapi.com/api/public/books/v1/cover/url?languageCode=en&isbn=" + isbn,
          headers: {
            'X-RapidAPI-Key': RAPIDAPIKEY,
            'X-RapidAPI-Host': 'book-cover-api2.p.rapidapi.com'
          }
        })
        .then((response)=>{
          if(response.data.url) {
            setBookImageSrc(response.data.url)
          }
          else {
            setBookImageSrc("https://via.placeholder.com/165x215")
          }
        })
        .catch((error)=>{
          // console.log(error)
        })
    }
    if (isbn) {
      setBookImgIsLoading(true)
      getBookImage();
      setBookImgIsLoading(false)
    }
  },[isbn])

  return (
    <>
      {bookImgIsLoading ? (
        <Spinner/>
      ): (
        <Image
          // maxW="100%" 
          // w="100%"
          // h="auto"
          className="book-image"
          onError={(e)=>(e.target as HTMLImageElement).src = "https://via.placeholder.com/165x215"}
          src={bookImageSrc}
          maxHeight={maxHeight}
          alt="book image"
          boxShadow="1px 1px 1px 1px darkgrey"
          _hover={{
            cursor: "pointer"
          }}
          id={id}
        />
      )}
    </>
  )
}
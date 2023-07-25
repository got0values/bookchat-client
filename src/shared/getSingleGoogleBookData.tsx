import axios from "axios";

export default async function getSingleGoogleBookData(id: string) {
  let bookData = null;
  if (id) {
    const GBOOKSAPI = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    bookData = await axios
      .get("https://www.googleapis.com/books/v1/volumes/" + id + "?key=" + GBOOKSAPI)
      // .get("https://openlibrary.org/sear" + searchInputRef.current.value)
      .then((response)=>{
        if (response.data) {
          return response.data;
        }
        else {
          bookData = null;
        }
        // onOpenSearchModal();
      })
      .catch((error)=>{
        console.log(error)
      })
  }
  return bookData;
}
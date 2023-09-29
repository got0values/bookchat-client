import axios from "axios";
import Cookies from "js-cookie";

export default async function addToTbr(tbrBookToAdd: any, toast: any, queryClient: any) {
  const server = import.meta.env.VITE_SERVER;
  let tokenCookie: string | null = Cookies.get().token;
    await axios
      .post(server + "/api/addtbrbook", 
        {
          book: tbrBookToAdd
        },
        {headers: {
          'authorization': tokenCookie
        }}
      )
      .then((response)=>{
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
            description: "Book added to TBR",
            status: "success",
            duration: 9000,
            isClosable: true
          })
          queryClient.invalidateQueries({ queryKey: ['bookshelfKey'] })
          queryClient.resetQueries({queryKey: ['bookshelfKey']})
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
}
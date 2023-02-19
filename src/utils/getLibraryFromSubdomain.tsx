import React, {useState,useEffect} from 'react';
import axios from "axios";

export interface LibraryFromSubdomain {
  name: string;
  id: number;
  logo?: string;
}

type LibraryFromSubdomainArgs = {
  subdomain: string
  server: string
}

export const getLibraryFromSubdomain = ({subdomain,server}: LibraryFromSubdomainArgs): {libraryFromSubdomain: LibraryFromSubdomain | null} => {
  const [library,setLibrary] = useState<LibraryFromSubdomain | null>(null);

  const getLibrary = async () => {
    await axios
    .get(server + "/api/library?subdomain=" + subdomain)
    .then((response)=>{
      setLibrary(response.data.message)
    })
    .catch(({response})=>{
      console.log(response.data)
    })
  };

  useEffect(()=>{
    getLibrary();
  },[])
  return {libraryFromSubdomain: library};
}
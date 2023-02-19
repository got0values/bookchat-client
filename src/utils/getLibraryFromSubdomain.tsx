import React, {useState,useEffect} from 'react';
import { Library, LibraryFromSubdomainArgs } from '../types/types';
import axios from "axios";


export const getLibraryFromSubdomain = ({subdomain,server}: LibraryFromSubdomainArgs): {libraryFromSubdomain: Library} => {
  const [library,setLibrary] = useState<Library>({} as Library);

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
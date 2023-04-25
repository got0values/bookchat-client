import React, {createContext,useContext} from 'react';
import { useNavigate,  } from "react-router-dom"
import { AuthProviderProps, AuthContextProps } from '../types/types';
import { useLocalStorage } from './useLocalStorage';
import { useToast } from '@chakra-ui/react';
import Cookies from "js-cookie";
import axios from "axios";

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const server = import.meta.env.VITE_SERVER;
  
  const toast = useToast();

  const navigate = useNavigate();
  const [user,setUser] = useLocalStorage("user", null);
  
  async function getUser() {
    const tokenCookie = Cookies.get().token;
    const data = await axios
    .get(server + "/api/user", {
      headers: {
        authorization: tokenCookie
      }
    })
    .then((response)=>{
      const responseData = response.data;
      const responseUser = responseData.message;
      // change the subdomain if it doesn't match the user Library subdomain
      const subdomain = window.location.host.split(".")[0];
      const librarySubdomain = responseUser.Library.subdomain;
      if (subdomain !== librarySubdomain) {
        let protocol = window.location.protocol;
        let slicedHost = window.location.host.split(".").slice(1);
        let domain = slicedHost.join(".");
        const newLocation = `${librarySubdomain}.${domain}`;
        window.location.href = `${protocol}//${newLocation}/`;
      }
        return response;
    })
    .then((response)=>{
      const responseData = response.data;
      if (responseData.success) {
        const responseUser = responseData.message;
        setUser(responseUser);
        return responseUser;
      }
      else {
        setUser(null);
        return null;
      }
    })
    .catch(({response})=>{
      setUser(null)
      toast({
        description: response.data.message,
        status: "error",
        duration: 9000,
        isClosable: true
      })
      navigate("/login")
      throw new Error(response.message)
    })
    return data;
  }

  async function onLogin(token: string) {
    navigate("/");
    Cookies.set("token", token);
    await getUser();
    return
  }

  function onLogout(): void {
    Cookies.remove("token", { path: ' '});
    setUser(null)
    return navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, setUser, getUser, onLogin, onLogout}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
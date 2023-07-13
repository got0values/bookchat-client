import React, {createContext,useContext} from 'react';
import { useNavigate, useLocation  } from "react-router-dom"
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
  const {state: locationState} = useLocation();
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
      console.log(response)
      setUser(null)
      toast({
        description: response.data.message,
        status: "error",
        duration: 9000,
        isClosable: true
      })
      // navigate("/login")
      throw new Error(response.message)
    })
    return data;
  }

  async function onLogin(token: string) {
    Cookies.set("token", token);
    await getUser();
    setTimeout(async ()=>{
      if (locationState) {
        navigate(locationState.redirectTo)
      }
      else {
        navigate("/");
      }
    },100)
    return
  }

  function onLogout(): void {
    Cookies.remove("token", { path: ''});
    setUser(null)
    setTimeout(()=>{
      navigate("/login");
    },100)
    return
  }

  return (
    <AuthContext.Provider value={{ user, setUser, getUser, onLogin, onLogout}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
import React, {useState,createContext,useContext,useEffect,useCallback} from 'react';
import { Route, Routes, useNavigate, Navigate } from "react-router-dom"
import { User, AuthProviderProps, AuthContextProps } from '../types/types';
import { useLocalStorage } from './useLocalStorage';
import Cookies from "js-cookie";
import axios from "axios";

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const server = import.meta.env.VITE_SERVER;

  const navigate = useNavigate();
  const [user,setUser] = useLocalStorage("user", null);
  
  async function getUser() {
    const tokenCookie = Cookies.get().token;
    await axios
    .get(server + "/api/user", {
      headers: {
        authorization: tokenCookie
      }
    })
    .then((response)=>{
      return response;
    }).then((response)=>{
      const responseData = response.data;
      if (responseData.success) {
        setUser(responseData.message);
      }
      else {
        setUser(null);
      }
    })
    .catch(({response})=>{
      console.log(response.data) 
    })
  }

  async function onLogin(token: string) {
    Cookies.set("token", token);
    await getUser();
    return navigate("/");
  }

  function onLogout(): void {
    Cookies.remove("token");
    setUser(null)
    return navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, setUser, onLogin, onLogout}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
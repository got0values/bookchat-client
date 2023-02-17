import React, {useState,createContext,useContext,useEffect} from 'react';
import { Route, Routes, useNavigate, Navigate } from "react-router-dom"
import Cookies from "js-cookie";
import axios from "axios";

interface User {
  created_at: string;
  email: string;
  id: number;
  library: string | null;
  password: string;
  role: string;
  updated_at: string;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthContextProps {
  user: User | null;
  getUser: ()=>void;
  onLogin: (token: string) => Promise<void>;
  onLogout: ()=>void;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const server = import.meta.env.VITE_SERVER;

  const navigate = useNavigate();
  const [user,setUser] = useState<User | null>(null);
  
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

  useEffect(()=>{
    getUser();
  },[])

  async function onLogin(token: string) {
    Cookies.set("token", token);
    getUser();
    return navigate("/");
  }

  function onLogout(): void {
    Cookies.remove("token");
    return navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, getUser, onLogin, onLogout}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
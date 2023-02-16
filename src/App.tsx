import { useState, useEffect } from 'react'
import { Route, Routes, useNavigate, Navigate } from "react-router-dom"
import {
  Flex,
  Box,
  Button
} from "@chakra-ui/react"
import Login from './Login';
import Register from './Register';
import SideNav from './SideNav';
import Dashboard from './Dashboard';
import Settings from './Settings';
import Cookies from "js-cookie";
import axios from "axios";

function App() {
  const server = import.meta.env.VITE_SERVER;
  const navigate = useNavigate();
  const [user,setUser] = useState<User | null>(null);

  interface User {
    created_at: string;
    email: string;
    id: number;
    library: string | null;
    password: string;
    role: string;
    updated_at: string;
  }

  interface ProtectedRouteProps {
    user: User | null;
    children: JSX.Element;
  }

  interface Response {
    data: object
  }

  const ProtectedRoute = ({user,children}: ProtectedRouteProps) => {
    const tokenCookie = Cookies.get().token;
    if (!tokenCookie) {
      return <Navigate to="/login" replace />
    }
    return children;
  }

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
      console.log(responseData)
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
    getUser();
    return navigate("/");
  }

  function onLogout(): void {
    Cookies.remove("token");
    return navigate("/login");
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} server={server} />} />
      <Route path="/register" element={<Register onLogin={onLogin} server={server} />} />
      <Route path="/" element={ 
        <ProtectedRoute user={user}>
          <SideNav onLogout={onLogout}/> 
        </ProtectedRoute>
      } >
        <Route index element={ <Dashboard server={server} onLogout={onLogout} /> } />
        <Route path="settings" element={ <Settings server={server} /> } />
      </Route>
    </Routes>
  )
}

export default App

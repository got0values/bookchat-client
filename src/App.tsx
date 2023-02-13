import { useState } from 'react'
import { Route, Routes, useNavigate } from "react-router-dom"
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

  async function onLogin(token: string) {
    Cookies.set("token", token);

    const tokenCookie = Cookies.get().token;

    await axios
      .get(server + "/api/user", {
        headers: {
          authorization: tokenCookie
        }
      })
      .then((response)=>{
        console.log(response.data)
      })
      .catch(({response})=>{
        console.log(response.data)
      })

    return navigate("/");
  }

  function onRegister(token: string) {
    console.log(token)
    return navigate("/");
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} server={server} />} />
      <Route path="/register" element={<Register onRegister={onRegister} server={server} />} />
      <Route path="/" element={ <SideNav/> } >
        <Route index element={ <Dashboard server={server} /> } />
        <Route path="settings" element={ <Settings server={server} /> } />
      </Route>
    </Routes>
  )
}

export default App

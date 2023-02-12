import { useState } from 'react'
import { Route, Routes } from "react-router-dom"
import {
  Flex,
  Box,
  Button
} from "@chakra-ui/react"
import Login from './Login';
import SideNav from './SideNav';
import Dashboard from './Dashboard';
import Settings from './Settings';

function App() {
  const server = import.meta.env.VITE_SERVER;

  function onLogin(token: string) {
    console.log(token)
    return token;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} server={server} />} />
      <Route path="/" element={ <SideNav/> } >
        <Route index element={ <Dashboard server={server} /> } />
        <Route path="settings" element={ <Settings server={server} /> } />
      </Route>
    </Routes>
  )
}

export default App

import React,{ useState, useEffect } from 'react'
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthContextProps, ProtectedRouteProps } from './types/types';
import Login from './Login';
import Register from './Register';
import SideNav from './SideNav';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Settings from './Settings';
import { getLibraryFromSubdomain } from './utils/getLibraryFromSubdomain';
import { useAuth } from './hooks/useAuth';

function App() {
  const server = import.meta.env.VITE_SERVER;
  const { user, onLogin, onLogout } = useAuth() as AuthContextProps;
  const subdomain = window.location.hostname.split(".")[0];
  const {libraryFromSubdomain} = getLibraryFromSubdomain({subdomain,server});

  const ProtectedRoute = ({children}: ProtectedRouteProps) => {
    console.log(user)
    if (!user) {
      return (
        <Navigate to="./login" replace/>
      )
    }
    return children;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} server={server} libraryFromSubdomain={libraryFromSubdomain} />} />
      <Route path="/register" element={<Register onLogin={onLogin} server={server} libraryFromSubdomain={libraryFromSubdomain} />} />
      <Route path="/" element={ 
        <ProtectedRoute>
          <SideNav onLogout={onLogout} />
        </ProtectedRoute>
      } >
        <Route index element={ <Dashboard server={server} /> } />
        <Route path="profile" element={ <Profile server={server} /> } />
        <Route path="settings" element={ <Settings server={server} /> } />
      </Route>
    </Routes>
  )
}

export default App

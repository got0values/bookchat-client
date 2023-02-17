import React,{ useState, useEffect } from 'react'
import { Route, Routes, Navigate } from "react-router-dom";
import Login from './Login';
import Register from './Register';
import SideNav from './SideNav';
import Dashboard from './Dashboard';
import Settings from './Settings';
import { useAuth, AuthContextProps } from './hooks/useAuth';

interface ProtectedRouteProps {
  children: JSX.Element;
}

function App() {
  const server = import.meta.env.VITE_SERVER;
  const { user, onLogin, onLogout } = useAuth() as AuthContextProps;

  const ProtectedRoute = ({children}: ProtectedRouteProps) => {
    if (!user) {
      return (
        <Navigate to="./login" replace/>
      )
    }
    return children;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={onLogin} server={server} />} />
      <Route path="/register" element={<Register onLogin={onLogin} server={server} />} />
      <Route path="/" element={ 
        <ProtectedRoute>
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

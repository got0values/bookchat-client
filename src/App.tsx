import React,{ useState, useEffect } from 'react'
import { Route, Routes } from "react-router-dom";
import { AuthContextProps } from './types/types';
import { ProtectedRoute } from './shared/ProtectedRoute';
import Login from './Login';
import Register from './Register';
// import SideNav from './SideNav';
import TopNav from './TopNav';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Settings from './Settings';
import { useAuth } from './hooks/useAuth';

function App() {
  const server = import.meta.env.VITE_SERVER;
  const { onLogin, onLogout } = useAuth() as AuthContextProps;

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <Login onLogin={onLogin} server={server} />
        } 
      />
      <Route 
        path="/register" 
        element={<Register onLogin={onLogin} server={server} />} 
      />
      <Route 
        path="/" 
        element={ 
          <ProtectedRoute>
            <TopNav onLogout={onLogout} />
          </ProtectedRoute>
        } 
      >
        <Route 
          index 
          element={ <Dashboard server={server} /> } 
        />
        <Route 
          path="profile" 
        >
          <Route 
            path=":username" 
            element={ <Profile server={server} /> }
          />
        </Route>
        <Route 
          path="settings" 
          element={ <Settings server={server} /> } 
        />
      </Route>
    </Routes>
  )
}

export default App

import React,{ useState, useEffect } from 'react'
import { isRouteErrorResponse, Route, Routes, useRouteError } from "react-router-dom";
import { Box } from '@chakra-ui/react';
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

  function RootBoundary() {
    const error = useRouteError();
    console.log("OHH NOO")
    if (isRouteErrorResponse(error)) {
      if (error.status === 404) {
        return <div>This page doesn't exist!</div>;
      }
  
      if (error.status === 401) {
        console.log("401")
        return <div>You aren't authorized to see this</div>;
      }
  
      if (error.status === 503) {
        return <div>Looks like our API is down</div>;
      }
  
      if (error.status === 418) {
        return <div>🫖</div>;
      }
    }
    return <Box>Something went wrong</Box>
  }

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
        errorElement={<RootBoundary/>}
      >
        <Route 
          index 
          element={ <Dashboard server={server} /> } 
          errorElement={<RootBoundary/>}
        />
        <Route 
          path="profile" 
          errorElement={<RootBoundary/>}
        >
          <Route 
            path=":username" 
            element={ <Profile server={server} /> }
            errorElement={<RootBoundary/>}
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

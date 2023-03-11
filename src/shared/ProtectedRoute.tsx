import { useEffect } from 'react';
import { ProtectedRouteProps } from '../types/types';
import { Navigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({children}: ProtectedRouteProps) => {
  const { user, getUser } = useAuth();
  console.log("FROM user VARIABLE:", user)

  useEffect(()=>{
    getUser();
  },[])

  if (!user) {
    return (
      <Navigate to="./login" replace/>
    )
  }
  else {
    return children;
  }
}
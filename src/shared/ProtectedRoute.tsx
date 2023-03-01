import { ProtectedRouteProps } from '../types/types';
import { Navigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({children}: ProtectedRouteProps) => {
  const { user } = useAuth();
  console.log("FROM user VARIABLE:", user)

  if (!user) {
    return (
      <Navigate to="./login" replace/>
    )
  }


  return children;
}
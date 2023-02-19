//SideNav
export interface SideNavProps {
  onLogout: () => void;
}

//User
export interface User {
  created_at: string;
  email: string;
  id: number;
  library: string | null;
  password: string;
  role: string;
  updated_at: string;
}


//Auth
export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthContextProps {
  user: User;
  getUser: ()=>void;
  onLogin: (token: string) => Promise<void>;
  onLogout: ()=>void;
}

export interface ProtectedRouteProps {
  children: JSX.Element;
}


//Dashboard
export interface DashboardProps {
  server: string;
}


//Profile
export interface ProfileProps {
  server: string;
}
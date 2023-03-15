import { SetStateAction, Dispatch } from "react";

//Generic
export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}


//SideNav
export interface SideNavProps {
  onLogout: () => void;
}


//TopNav
export interface TopNavProps {
  server: string;
  onLogout: () => void;
}


//User
export interface User {
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  id: number;
  library: string | null;
  password: string;
  role: string;
  updated_at: string;
  Library: Library;
  Profile: ProfileType
}

export interface UserNotificationsType {
  followRequests: FollowRequest[];
  bookClubRequests: BookClubMember[];
}

export interface FollowRequest {
  id: number;
  Profile_Following_self_profile_idToProfile: ProfileType;
}


//Profile
export interface ProfileProps {
  server: string;
}

export interface ProfileButtonProps extends ProfileProps {
  profileId: number;
  setProfileDataUpdated: Dispatch<SetStateAction<boolean>>;
  setProfileActionError: Dispatch<SetStateAction<string>>;
}

export interface ProfileType {
  id: number;
  user: number;
  profile_photo?: string;
  username: string;
  about?: string;
  Interests?: Interests[];
  User: User;
  Following_Following_self_profile_idToProfile?: Following_Following_self_profile_idToProfile[];
  Following_Following_following_profile_idToProfile?: Following_Following_following_profile_idToProfile[];
  BookClubMembers_BookClubMembers_book_club_creatorToProfile: BookClubMember[];
}

export interface Interests {
  interest: string;
}

export interface Following_Following_self_profile_idToProfile {
  id: number;
  self_profile_id: number;
  following_profile_id: number;
  status: string;
  Profile_Following_following_profile_idToProfile?: ProfileType;
}

export interface Following_Following_following_profile_idToProfile {
  id: number;
  self_profile_id: number;
  following_profile_id: number;
  status: string;
  Profile_Following_self_profile_idToProfile?: ProfileType;
}

//Library
export interface Library {
  id?: number;
  name: string;
  subdomain?: string;
  version?: string;
  logo?: string;
}

//Auth
export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthContextProps {
  user: User;
  setUser: (user: User)=>void;
  getUser: ()=>void;
  onLogin: (token: string) => Promise<void>;
  onLogout: ()=>void;
}

export interface ProtectedRouteProps {
  children: JSX.Element;
}


//LibraryFromSubdomain
export type LibraryFromSubdomainArgs = {
  subdomain: string
  server: string
}

//Login
export interface LoginFormProps {
  onLogin: (token: string) => void;
  server: string;
}


//Register
export interface RegisterFormProps {
  onLogin: (token: string) => void;
  server: string;
}


//BookClubs
export interface BookClubsType {
  id: number | string;
  creator: number;
  name: string;
  about: string;
  visibility: number;
  next_meeting_location: string;
  next_meeting_start: Date;
  next_meeting_end: Date;
  BookClubMembers: BookClubMember[];
  BookClubBook: BookClubBookType[];
}

export interface BookClubMember {
  id: number;
  Profile: ProfileType;
  book_club: number;
  status: number;
  BookClubs: BookClubsType;
}

export interface BookClubBookType {
  id: number;
  book_club: number;
  author: string;
  image: string;
  title: string;
  created_on: Date;
}


//Dashboard
export interface DashboardProps {
  server: string;
}



//Comments
export interface BookClubGeneralCommentsType {
  id: number | string;
  profile_id: number;
  book_club_id: number;
  library_id: number;
  uri: string;
  comment: string;
  datetime: string;
  Profile: ProfileType;
  BookClubGeneralReply: BookClubGeneralReply[];
}

export interface BookClubGeneralReply {
  id: number;
  comment_id: number;
  Profile: ProfileType;
  profile_id: number;
  reply: string;
  datetime: string;
}
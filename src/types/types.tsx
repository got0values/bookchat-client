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
  setProfileActionError: Dispatch<SetStateAction<string>>;
}

export interface ProfileType {
  id: number;
  user: number;
  profile_photo?: string;
  username: string;
  country: string;
  about?: string;
  Interests?: Interests[];
  User: User;
  BookClubs: BookClubsType[];
  CurrentlyReading: CurrentlyReading[];
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
  Profile_Following_following_profile_idToProfile: ProfileType;
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

//Reset Password
export interface ResetPasswordFormProps {
  server: string;
}


//BookClubs
export interface BookClubsType {
  id: number | string;
  creator: number;
  name: string;
  about: string;
  visibility: number;
  next_meeting_start: Date;
  next_meeting_end: Date;
  groups: string;
  Profile: ProfileType;
  BookClubMembers: BookClubMember[];
  BookClubBook: BookClubBookType[];
  BookClubBookPoll: BookClubBookPollType;
  BookClubMeetingRsvp: BookClubRsvpType[];
}

export interface BookClubMember {
  id: number;
  Profile: ProfileType;
  book_club: number;
  status: number;
  BookClubs: BookClubsType;
}

export interface BookClubBookType {
  id?: number;
  book_club?: number;
  author: string;
  image: string;
  title: string;
  description: string;
  link: string;
  created_on?: Date | string;
  topic?: string;
  BookClubs?: BookClubsType;
}

export interface BookClubBookPollType {
  id: number;
  book_club: number;
  book_one: string;
  book_two: string;
  book_three: string;
  BookClubBookPollVote: BookClubBookPollVoteType[];
}

export interface BookClubBookPollVoteType {
  id: number;
  book_club_poll_id: number;
  book: number;
  profile_id: number;
}

export interface BookClubRsvpType {
  id: number;
  book_club_id: number;
  profile_id: number;
  created_on: Date | string;
  Profile: ProfileType;
}


//Dashboard
export interface DashboardProps {
  server: string;
}

//Search
export interface SearchData {
  profiles: ProfileType[];
  bookClubs: BookClubsType[];
  books: any[];
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

export interface BookClubGeneralCommentsProps {
  server: string;
  bookClubId: string | null;
  bookClubBookId: string | null
  subdomain: string;
  uri: string;
  type: string;
  isBookClubCreator: boolean;
}

export interface BookClubGeneralReply {
  id: number;
  comment_id: number;
  Profile: ProfileType;
  profile_id: number;
  reply: string;
  datetime: string;
}

//Currently Reading
export interface CurrentlyReading {
  id: number;
  profile: number;
  thoughts: string;
  image: string;
  title: string;
  author: string;
  description: string;
  link: string;
  hidden: boolean;
  created_on: Date;
  Profile: ProfileType;
  CurrentlyReadingComment: CurrentlyReadingComment[];
  CurrentlyReadingLike: CurrentlyReadingLike[];
}

export interface CurrentlyReadingLike {
  id: number;
  profile: number;
  Profile: ProfileType;
  currently_reading: number;
  datetime: string;
}

export interface CurrentlyReadingComment {
  id: number;
  profile_id: number;
  currently_reading_id: number;
  library_id: number;
  uri: string;
  commenter_id: number;
  comment: string;
  datetime: string;
  Profile_CurrentlyReadingComment_profile_idToProfile: ProfileType;
  Profile_CurrentlyReadingComment_commenter_idToProfile: ProfileType;
}


//Notifications
export enum Notifications {
  Comment = 1,
  GeneralReply = 2
}

export interface UserNotificationsType {
  followRequests: FollowRequest[];
  bookClubRequests: BookClubMember[];
  comments: OtherNotificationsType[];
  replies: OtherNotificationsType[];
}

export interface OtherNotificationsType {
  id: number;
  profile_id: number;
  type: Notifications;
  from_data: ProfileType;
  subject: any;
  read: number | any;
  datetime: string;
}

//Chat Rooms
export interface ActiveRoom {
  roomId: string;
  bookTitle: string;
  bookAuthor: string;
  numberOfUsers?: number;
  typeOfRoom: string;
}

export interface ChatUser {
  roomId: string; 
  userName: string;
  profilePhoto: string;
  country: string;
  bookTitle: string;
  bookAuthor: string;
  typeOfRoom: string;
}
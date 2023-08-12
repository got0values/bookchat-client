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
  gbooksapi: string;
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
  gbooksapi: string;
}

export interface ProfileButtonProps {
  server: string;
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
  rating: number;
  hidden: number;
  PagesRead: PagesRead[];
  CurrentlyReading: CurrentlyReading[];
  Following_Following_self_profile_idToProfile?: Following_Following_self_profile_idToProfile[];
  Following_Following_following_profile_idToProfile?: Following_Following_following_profile_idToProfile[];
  BookClubMembers_BookClubMembers_book_club_creatorToProfile: BookClubMember[];
  BookSuggestion_BookSuggestion_suggestorToProfile: BookSuggestionType[];
  Bookshelf: BookshelfType;
  _count: any;
}

export interface Interests {
  interest: string;
}

export interface PagesRead {
  id: number;
  pages_read: number;
  profile: number;
  created_on: string;
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
  google_books_id?: string;
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
  gbooksapi: string;
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
  google_books_id: string;
  profile: number;
  thoughts: string;
  image: string;
  title: string;
  author: string;
  description: string;
  link: string;
  hidden: boolean;
  isbn: string;
  page_count: number;
  published_date: string;
  created_on: Date;
  quote_image: string;
  pages_read: number;
  subjects: string,
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
  GeneralReply = 2,
  Like = 3,
  RequestSuggestion = 4
}

export interface UserNotificationsType {
  followRequests: FollowRequest[];
  bookClubRequests: BookClubMember[];
  comments: OtherNotificationsType[];
  replies: OtherNotificationsType[];
  likes: OtherNotificationsType[];
  suggestionRequests: OtherNotificationsType[];
}

export interface OtherNotificationsType {
  id: number;
  profile_id: number;
  type: Notifications;
  from_data: ProfileType;
  subject: {
    id: string;
    profile_id: number;
    currenty_reading_id: number;
    uri: string;
    commenter_id: number;
    comment: string;
    datetime: string;
    title: string;
    author: string;
  };
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

//Bookshelf
export interface BookshelfType {
  id: number;
  profile: number;
  allow_suggestions: number;
  suggestions_notes: string;
  Profile: ProfileType;
  BookShelfCategory: BookshelfCategory[];
  BookshelfBook: BookshelfBook[];
  Flag?: any;
}
export interface BookshelfCategory {
  id: number;
  profile: number;
  name: string;
  BookshelfCategory: BookshelfCategory;
}

export interface BookshelfBook {
  id: number;
  profile: number;
  google_books_id: string;
  title: string;
  author: string;
  image: string;
  description: string;
  isbn: string;
  page_count: number;
  published_date: string;
  notes: string;
  review: string;
  rating: number;
  created_on: string;
  hidden: number;
  BookshelfBookCategory: BookshelfCategory[];
}

export interface BookSuggestionType {
  id: number;
  suggestor: number;
  suggestee: number;
  google_books_id: string;
  title: string;
  author: string;
  image: string;
  description: string;
  isbn: string;
  page_count: number;
  notes: string;
  rating: number;
  published_date: string;
  suggestorRating: number;
  created_on: string;
  Profile_BookSuggestion_suggestorToProfile: ProfileType;
  Profile_BookSuggestion_suggesteeToProfile: ProfileType;
}

export interface StarRatingType {
  ratingCallback: (([rating,starRatingId]: [rating: number, starRatingId: number])=>void) | null;
  starRatingId: number;
  defaultRating: number;
}

export interface GoogleBooksSearchType {
  selectText: string;
  selectCallback: (e: React.FormEvent<Element>)=>(Promise<void> | void);
  gBooksApi: string;
}

export interface BooksSearchType {
  selectText: string;
  selectCallback: (e: React.FormEvent<Element>)=>(Promise<void> | void);
  gBooksApi: string;
}


export interface SelectedBook {
  id: number,
  google_books_id: string;
  title: string;
  author: string;
  image: string;
  description: string;
  isbn: string;
  page_count: number;
  subjects: string[];
  published_date: string;
  pages_read: number;
  thoughts: string;
}

export interface EditCurrentlyReadingType {
  server: string;
  selectedBook: SelectedBook;
  setSelectedBook?: React.Dispatch<any> | null;
  setSharedTitle?: React.Dispatch<any> | null;
  setSharedAuthor?: React.Dispatch<any> | null;
  showQuoteDesigner?: boolean;
  getPageCallback: ()=>Promise<any>;
}
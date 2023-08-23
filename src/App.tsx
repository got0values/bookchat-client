import { Route, Routes } from "react-router-dom";
import { AuthContextProps } from './types/types';
import { ProtectedRoute } from './shared/ProtectedRoute';
import Login from './Login';
import Register from './Register';
import { RedirectPage } from './shared/RedirectPage';
import TopNav from './TopNav';
import Dashboard from './Dashboard';
import BookClubs from './BookClubs/BookClubs';
import BookClub from './BookClubs/BookClub';
import BookClubBook from './BookClubs/BookClubBook';
import Profile from './Profile/Profile';
import Chat from "./Chat/Chat";
import ChatRoom from './Chat/ChatRoom';
import Bookshelf from './Bookshelf/Bookshelf';
import BookSuggestions from "./Book Suggestions/BookSuggestions";
import BookSuggestionBookshelf from "./Book Suggestions/BookSuggestionBookshelf";
import Stats from "./Stats/Stats";
import Settings from './Settings';
import Confirm from './Confirm';
import ResetPassword from "./ResetPassword";
import Terms from "./Terms";
import { useAuth } from './hooks/useAuth';

function App() {
  const server = import.meta.env.VITE_SERVER;
  const GBOOKSAPI = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
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
        path="/terms" 
        element={<Terms/>} 
      />
      <Route 
        path="/confirm" 
        element={<Confirm server={server} />} 
      />
      <Route 
        path="/resetpassword" 
        element={<ResetPassword server={server} />} 
      />
      <Route 
        path="/" 
        element={ 
          <ProtectedRoute>
            <TopNav server={server} onLogout={onLogout} gbooksapi={GBOOKSAPI} />
          </ProtectedRoute>
        } 
      >
        <Route 
          index 
          element={ <Dashboard server={server} gbooksapi={GBOOKSAPI} /> } 
        />
        <Route 
          path="profile"
        >
          <Route 
            path=":paramsUsername" 
            element={ <Profile server={server} gbooksapi={GBOOKSAPI} /> }
          />
        </Route>
        <Route 
          path="bookclubs"
        >
          <Route
            index
            element={<BookClubs server={server} />}
          />
          <Route 
            path=":paramsBookClubId" 
          >
            <Route
              index
              element={ <BookClub server={server} gbooksapi={GBOOKSAPI} /> }
            />
            <Route
              path=":paramsBookClubBookId"
              element={ <BookClubBook server={server} /> }
            />
          </Route>
        </Route>
        <Route
          path="chat"
        >
          <Route
            index
            element={<Chat gbooksapi={GBOOKSAPI}/>}
          />
          <Route
            path="room"
            element={ <ChatRoom server={server} /> }
          />
        </Route>
        <Route
          path="bookshelf"
        >
          <Route
            index
            element={<Bookshelf server={server} gbooksapi={GBOOKSAPI} />}
          />
        </Route>
        <Route
          path="booksuggestions"
        >
          <Route
            index
            element={<BookSuggestions server={server} gbooksapi={GBOOKSAPI} />}
          />
          <Route
            path="bookshelf"
            element={<BookSuggestionBookshelf server={server} gbooksapi={GBOOKSAPI} />}
          />
        </Route>
        <Route
          path="stats"
        >
          <Route
            index
            element={<Stats server={server} />}
          />
        </Route>
        <Route 
          path="settings" 
          element={ <Settings server={server} /> } 
        />
        <Route 
          path="*" 
          element={ <RedirectPage /> } 
        />
      </Route>
    </Routes>
  )
}

export default App

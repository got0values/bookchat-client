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
import Settings from './Settings';
import ResetPassword from "./ResetPassword";
import Terms from "./Terms";
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
        path="/terms" 
        element={<Terms/>} 
      />
      <Route 
        path="/resetpassword" 
        element={<ResetPassword server={server} />} 
      />
      <Route 
        path="/" 
        element={ 
          <ProtectedRoute>
            <TopNav server={server} onLogout={onLogout} />
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
            path=":paramsUsername" 
            element={ <Profile server={server} /> }
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
              element={ <BookClub server={server} /> }
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
            element={<Chat/>}
          />
          <Route
            path="room"
            element={ <ChatRoom /> }
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

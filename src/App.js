import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./Components/Main";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Chat from "./Components/Main/Chat";
import LostItem from "./Components/Main/LostItem";
import FoundItem from "./Components/Main/FoundItem";
import ClaimFoundItem from "./Components/Main/ClaimFoundItem";
import Card from "./Components/Main/Card";
import FoundItemsList from "./Components/Main/FoundItemsList";
import Feed from "./Components/Main/Feed";
import Admin from "./Components/Admin"; // Import the Admin component

function App() {
  const user = localStorage.getItem("token");
  const email = "telrandhe@gmail.com";
  const password = "Manan@1234";

  return (
    <Routes>
      {user && user === email && password === "Manan@1234" ? (
        <Route path="/admin" element={<Admin />} />
      ) : user ? (
        <Route path="/" element={<Main />} />
      ) : (
        <Route path="/" element={<Navigate replace to="/login" />} />
      )}

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/post-lost-item" element={<LostItem />} />
      <Route path="/post-found-item" element={<FoundItem />} />
      <Route path="/claim-found-item" element={<ClaimFoundItem />} />
      <Route path="/found-items-list" element={<FoundItemsList />} />
      <Route path="/card" element={<Card />} />
      <Route path="/feed" element={<Feed />} />
    </Routes>
  );
}

export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./ChatPage";
import Login from "./user/Login";
import Register from "./user/Register";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Page de connexion */}
        <Route path="/register" element={<Register />} /> {/* Page d'inscription */}
        <Route path="/chat" element={<ChatPage />} /> {/* Page de chat */}
        <Route path="*" element={<Navigate to="/" />} /> {/* Redirige vers Login si URL inconnue */}
      </Routes>
    </Router>
  );
};

export default App;

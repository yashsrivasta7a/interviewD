import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import MainPage from "./Components/MainPage.jsx";
import ScrollToTop from "./Components/UI/ScrollToTop.jsx";
import AboutSection from "./Components/AboutSection.jsx";
import "./index.css";
import Mentor from "./Components/Mentor.jsx";
import Auth from "./Components/Auth.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import ResumeParser from "./Utils/ResumeParser.jsx";
import CodeEditor from "./Components/CodeEditor.jsx";

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-screen overflow-x-hidden bg-white">
      {/* Squares always in the background */}
      
      <Router>
           <ScrollToTop />
        <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<MainPage />} />
            <Route path="/ResumeParser" element={<ResumeParser />} />
            <Route path="/CodeEditor" element={<CodeEditor />} />
            <Route
      path="/interview"
      element={
        <ProtectedRoute>
          <Mentor />
        </ProtectedRoute>
      }
    />
          {/* Add other routes as needed */}
        </Routes>
      </Router>
      {/* Footer or additional sections can be added here */}
    </div>
  );
}

export default App;
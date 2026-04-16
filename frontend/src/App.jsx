import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Instructions from "./pages/Instructions";
import ActiveTest from "./pages/ActiveTest";
import Submit from "./pages/Submit";
import Report from "./pages/Report";
import GoogleCallback from "./pages/GoogleCallback";
import TeacherPanel from './pages/TeacherPanel';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/google-callback" element={<GoogleCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/instructions/:testId" element={<Instructions />} />
        <Route path="/test/:testId" element={<ActiveTest />} />
        <Route path="/submit/:testId" element={<Submit />} />
        <Route path="/report/:testId" element={<Report />} />
        <Route path="/teacher" element={<TeacherPanel />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

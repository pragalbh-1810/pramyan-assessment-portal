import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Instructions from "./pages/Instructions";
import ActiveTest from "./pages/ActiveTest";
import Submit from "./pages/Submit";
import Report from "./pages/Report";

function App() {
  return (
    <GoogleOAuthProvider clientId="419694141407-1d1llpbb3jipl0ci3vtg306marmftcdd.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Login />} />

          <Route path="/signup" element={<SignUp />} />

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/instructions/:testId" element={<Instructions />} />

          <Route path="/test/:testId" element={<ActiveTest />} />

          <Route path="/submit/:testId" element={<Submit />} />

          <Route path="/report/:testId" element={<Report />} />

        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;

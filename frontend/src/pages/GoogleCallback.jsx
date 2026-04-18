import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, setRole } from "../utils/auth";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (!token) {
      navigate("/signup", { replace: true });
      return;
    }

    // Save token
    setToken(token);
    setRole(role || "student");

    // Role based redirect
    if (role === "teacher") {
      navigate("/teacher", { replace: true });
      return;
    }
    if (role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    // Student — backend already redirects to /complete-profile or /instructions/:id
    // This callback only handles the token saving for existing students
    // New users are sent directly to /complete-profile by google-auth.php
    // so this page won't even be hit for them
    navigate("/instructions/1", { replace: true });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "Sora, sans-serif",
        color: "#185FA5",
        fontSize: "16px",
        background: "#EEF4FF",
      }}>
      ⏳ Signing you in with Google...
    </div>
  );
}

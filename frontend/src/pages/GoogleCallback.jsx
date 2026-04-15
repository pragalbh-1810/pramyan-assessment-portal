import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken, setRole } from "../utils/auth";

export default function GoogleCallback() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const role = params.get("role");
    if (token) {
      setToken(token);
      setRole(role);
      navigate("/instructions/1");
    } else {
      navigate("/");
    }
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

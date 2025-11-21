// src/routes/RequireAdmin.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function RequireAdmin({ children }) {
  const { auth } = useContext(AuthContext);

  // 로그인이 안되었거나 role이 ADMIN이 아님
  if (!auth || !auth.loggedIn || auth.role !== "ADMIN") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
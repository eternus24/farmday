// src/contexts/AuthContext.jsx
import { createContext } from "react";

export const AuthContext = createContext({
  auth: { loggedIn: false, name: "손님", photo: null },
  setAuth: () => {},
});
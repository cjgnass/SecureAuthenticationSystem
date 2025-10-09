import { SERVER_URL } from "../config";
import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);

  async function login(credentials) {
    const res = await axios.post(SERVER_URL + "/login", credentials, {
      withCredentials: true,
    });
    setAccessToken(res.data.accessToken);
  }

  async function refresh() {
    const res = await axios.post(
      SERVER_URL + "/refresh",
      {},
      { withCredentials: true },
    );
    setAccessToken(res.data.accessToken);
  }

  function logout() {
    setAccessToken(null);
    axios.post(SERVER_URL + "/logout", {}, { withCredentials: true });
  }

  return (
    <AuthContext.Provider value={{ accessToken, login, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

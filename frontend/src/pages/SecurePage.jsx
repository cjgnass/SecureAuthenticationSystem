import { SERVER_URL } from "../config";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import './SecurePage.css';

export default function SecurePage() {
  const { accessToken, refresh, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!accessToken) return;
      try {
        const res = await fetch(SERVER_URL + "/secure", {
          headers: { accessToken },
        });

        if (res.status === 401) {
          await refresh();
          return;
        }
      } catch (err) {
        console.log(err);
      }
    }

    fetchData();
  }, [accessToken]);

  return (
    <div className="secure-container">
      <div className="secure-card">
        <div className="secure-header">
          <h1>Secure Page</h1>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}

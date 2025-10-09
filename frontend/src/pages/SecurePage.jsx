import { SERVER_URL } from "../config";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function SecurePage() {
  const { accessToken, refresh, logout } = useAuth();
  const [secureData, setSecureData] = useState(null);
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
        const data = await res.json();
        setSecureData(data["secretData"]);
      } catch (err) {
        console.log(err);
      }
    }

    fetchData();
  }, [accessToken]);

  return (
    <div>
      <h1>Secure Page</h1>
      <button onClick={handleLogout}>Logout</button>
      <p>{secureData}</p>
    </div>
  );
}

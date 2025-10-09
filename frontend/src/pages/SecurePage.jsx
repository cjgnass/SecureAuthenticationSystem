import { SERVER_URL } from "../config";
import { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";

export default function SecurePage() {
  const { accessToken, refresh } = useAuth();
  const [secureData, setSecureData] = useState(null);

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
      <p>{secureData}</p>
    </div>
  );
}

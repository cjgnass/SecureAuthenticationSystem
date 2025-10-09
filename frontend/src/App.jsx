import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import LoginPage from "./pages/LoginPage";
import SecurePage from "./pages/SecurePage";

function SecureRoute({ children }) {
  const { accessToken, isInitializing } = useAuth();
  if (isInitializing) return <div>Loading...</div>;
  return accessToken ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/secure"
            element={
              <SecureRoute>
                <SecurePage />
              </SecureRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/secure" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

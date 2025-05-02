import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Verify from "./pages/Verify";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import LoginSuccess from "./pages/login_success";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login_success" element={<LoginSuccess />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
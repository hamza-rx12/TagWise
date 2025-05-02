import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  email: string | null;
  role: string | null;
  login: (token: string, email: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  const login = (token: string, email: string, role: string) => {
    setToken(token);
    setEmail(email);
    setRole(role);
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);
  };

  const logout = () => {
    setToken(null);
    setEmail(null);
    setRole(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, email, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
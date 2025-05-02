// filepath: c:\Users\hp\Desktop\TagWise1\frontend\src\pages\Verify.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Verify() {
  const [email, setEmail] = useState(""); // Ajout du champ email
  const [code, setCode] = useState(""); // Champ pour le code de vérification
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode: code }), // Correspond au backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
      }

      alert("Verification successful! You can now log in.");
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    }
  };

  return (
    <div>
      <h1>Verify Account</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleVerify}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}

export default Verify;
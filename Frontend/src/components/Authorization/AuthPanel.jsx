import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthContext from "../../Context/AuthContext";

// ✅ Only @onextel.com domain allowed
function validateOnextelEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@onextel\.com$/.test(email);
}

export default function AuthPanel() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ get login() from AuthContext

  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginEmailError("");
    setPasswordError("");

    // Validate email domain
    if (!validateOnextelEmail(loginEmail)) {
      setLoginEmailError("Only @onextel.com email addresses are allowed.");
      toast.error("Only @onextel.com email addresses are allowed!", { position: "top-center", autoClose: 2000 });
      return;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required.");
      toast.error("Password is required.", { position: "top-center", autoClose: 2000 });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        // ✅ Save role in context + localStorage
        login(data);

        toast.success(`Access granted as ${data.role},because your role is ${data.role}`, {
          position: "top-center",
          autoClose: 2000,
        });

        // ✅ Redirect based on role
        setTimeout(() => {
          if (data.role === "admin") {
            navigate("/dashboard");
          } else if (data.role === "auditor") {
            navigate("/auditplan");
          } else {
            navigate("/home");
          }
        }, 2000);
      } else {
        toast.error(data.message || "Sign In failed.", { position: "top-center", autoClose: 2000 });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { position: "top-center", autoClose: 2000 });
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-white p-4 pt-24">
      <div className="w-full max-w-md mx-auto">
        <form
          className="bg-white border-2 border-red-800 p-8 rounded-2xl shadow-xl w-full animate-fade-in relative"
          onSubmit={handleLoginSubmit}
          autoComplete="off"
        >
          <h2 className="text-3xl font-bold text-center mb-6 text-red-700">Sign In</h2>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="block text-red-700 mb-1 font-bold">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="off"
              className="w-full px-4 py-2 rounded text-black font-bold border border-red-700 focus:outline-none focus:border-red-700 transition bg-transparent"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            {loginEmailError && <div className="text-red-600 text-sm mt-1">{loginEmailError}</div>}
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="block text-red-700 mb-1 font-bold">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="off"
              className="w-full px-4 py-2 rounded text-black font-bold border border-red-700 focus:outline-none focus:border-red-700 transition bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {passwordError && <div className="text-red-600 text-sm mt-1">{passwordError}</div>}
          </div>

          {/* Role */}
          <div className="mb-3">
            <label htmlFor="role" className="block text-red-700 mb-1 font-bold">
              Select Role
            </label>
            <select
              id="role"
              className="w-full px-4 py-2 rounded text-black font-bold border border-red-700 focus:outline-none focus:border-red-700 transition bg-transparent"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled>
                Choose your role
              </option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-red-700 text-lg hover:bg-red-500 text-white font-bold py-2 rounded transition shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
          >
            Sign In
          </button>
        </form>
      </div>

      {/* Fade-in animation */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.6s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}

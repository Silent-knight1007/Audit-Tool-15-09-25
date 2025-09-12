import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate} from 'react-router-dom';

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New password and confirm password must match.", { position: "top-center", autoClose: 3000 });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword, confirmNewPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password reset successful. Please log in again.", {
          position: "top-center",
          autoClose: 3000,
        }); navigate('/home');
        // Clear form or redirect as needed
        // setEmail("");
        // setOldPassword("");
        // setNewPassword("");
        // setConfirmNewPassword("");
      } else {
        toast.error(data.message || "Password reset failed.", { position: "top-center", autoClose: 3000 });
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { position: "top-center", autoClose: 3000 });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-red-700 text-center">Reset Password</h2>
      <form onSubmit={handleResetSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="block text-red-700 mb-1 font-bold">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-red-700 rounded"
            autoComplete="off"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="oldPassword" className="block text-red-700 mb-1 font-bold">Old Password</label>
          <input
            id="oldPassword"
            type="password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-3 py-2 border border-red-700 rounded"
            autoComplete="off"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="newPassword" className="block text-red-700 mb-1 font-bold">New Password</label>
          <input
            id="newPassword"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-red-700 rounded"
            autoComplete="off"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="confirmNewPassword" className="block text-red-700 mb-1 font-bold">Confirm New Password</label>
          <input
            id="confirmNewPassword"
            type="password"
            required
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-red-700 rounded"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 text-white font-bold rounded ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-700 hover:bg-red-500'}`}
          disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

// src/components/auth/ResetPassword.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleReset = () => {
    if (!password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    toast.success("Password reset successfully!");
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#023047" }}>
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Reset Your Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-[#023047] text-white py-3 rounded-lg mb-4"
        >
          Reset Password
        </button>

        <div className="text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
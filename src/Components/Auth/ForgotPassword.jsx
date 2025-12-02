// src/components/auth/ForgotPassword.js
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendResetLink = () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    // Yahan aap backend API call karte (e.g., POST /api/auth/forgot-password)
    // Hum mock kar rahe hain
    toast.success(`Password reset link sent to ${email}!`);
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#023047" }}>
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Forgot Password?
        </h2>
        <p className="text-gray-600 mb-6 text-sm text-center">
          Enter your email to receive a password reset link.
        </p>

        <input
          type="email"
          placeholder="Your Email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleSendResetLink}
          className="w-full bg-[#023047] text-white py-3 rounded-lg mb-4"
        >
          Send Reset Link
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

export default ForgotPassword;
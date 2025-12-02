import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import right from "../../assets/account.jpg"; // Reuse same illustration
import BaseUrl from "../../Api/BaseUrl";
import newlogo from "../../assets/watheeq.jpeg";
const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    // Validation
    if (!fullName || !email || !username || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BaseUrl}adminuser/register`, {
        name: fullName,
        email,
        username,
        password,
      });

      if (response.data.success) {
        toast.success("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(response.data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#023047" }}
    >
      <div className="min-h-screen flex items-center justify-center px-4 py-8 md:py-16 bg-[#023047]">
        <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-xl flex flex-col md:flex-row">
          <ToastContainer position="top-right" autoClose={2000} />

          {/* Left Panel - Signup Form */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
            <div className="mb-6">
              {/* Logo */}
              <div className="flex items-center mb-8">
                <img src={newlogo} alt="ZirakBook Logo" className="max-h-12" />
              </div>

              <h6 className="text-xl font-semibold text-gray-800 mb-6">
                Create Your Account
              </h6>

              <div className="border-b border-gray-300 mb-4"></div>

              <div className="space-y-4">
                {/* Full Name */}
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                {/* Email */}
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />


                {/* Password */}
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {/* Confirm Password */}
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {/* Signup Button */}
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full text-white py-3 rounded-lg flex items-center justify-center text-base"
                  style={{ backgroundColor: "#023047" }}
                >
                  <span>{loading ? "Creating Account..." : "Sign Up"}</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>

                {/* Login Redirect */}
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Illustration (same as login) */}
          <div className="hidden md:flex md:w-1/2 p-6 md:p-10 relative items-center justify-center">
            <img
              src={right}
              alt="Signup Illustration"
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-200 rounded-full -mr-10 -mb-10 opacity-70"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
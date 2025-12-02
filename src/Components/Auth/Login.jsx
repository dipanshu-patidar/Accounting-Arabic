import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import right from "../../assets/account.jpg";
import BaseUrl from "../../Api/BaseUrl";
import newlogo from "../../assets/watheeq.jpeg";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BaseUrl}auth/login`, {
        email,
        password,
      });

      // ✅ Fixed response destructuring to match actual API response
      const { message, data } = response.data;
      const { user, token } = data;

      if (token && user && user.id) {
        // Save auth data
        localStorage.setItem("authToken", token);
        localStorage.setItem("CompanyId", user.id.toString()); // Ensure it's a string
        localStorage.setItem("role", user.role);

        toast.success(message || "Login successful!");

        // ✅ Fixed role comparison to match uppercase API response
        if (user.role === "SUPERADMIN") {
          navigate("/dashboard");
        } else {
          navigate("/company/dashboard");
        }
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
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

          {/* Left Panel - Login Form */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="flex items-center mb-8">
                <img src={newlogo} alt="ZirakBook Logo" className="max-h-12" />
              </div>

              <h6 className="text-xl font-semibold text-gray-800 mb-6">
                Welcome Back
              </h6>

              <div className="border-b border-gray-300 mb-4"></div>

              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <input
                  type="password"
                  placeholder="Your Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600 rounded mr-2"
                    checked={keepLoggedIn}
                    onChange={() => setKeepLoggedIn(!keepLoggedIn)}
                  />
                  Keep me logged in
                </label>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full text-white py-3 rounded-lg flex items-center justify-center text-base font-medium"
                  style={{ backgroundColor: "#023047" }}
                >
                  {loading ? "Logging in..." : "Log in"}
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Illustration */}
          <div className="hidden md:flex md:w-1/2 p-6 md:p-10 relative items-center justify-center bg-gray-50">
            <img
              src={right}
              alt="Digital Connection"
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-200 rounded-full -mr-10 -mb-10 opacity-70"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const authToken = localStorage.getItem("authToken");
  const companyId = localStorage.getItem("CompanyId");
  const role = localStorage.getItem("role");

  // If no token, redirect to login
  if (!authToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If token exists but no companyId and not superadmin, redirect to login
  if (!companyId && role !== "SUPERADMIN") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;


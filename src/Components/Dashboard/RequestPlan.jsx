// RequestPlan.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FaEnvelopeOpenText,
  FaCheck,
  FaTimes,
  FaEnvelope,
} from "react-icons/fa";
import "./RequestPlan.css";
import axiosInstance from "../../Api/axiosInstance"; // ✅ Use your shared axios instance

const initialPlans = [];

const planMapping = {
  "Legacy Plan": { display: "Legacy", bgColor: "#b2dfdb" },
  Basic: { display: "Basic", bgColor: "#b2dfdb" },
  Silver: { display: "Silver", bgColor: "#c0c0c0" },
  Golden: { display: "Gold", bgColor: "#ffd700" },
  Gold: { display: "Gold", bgColor: "#ffd700" },
  Platinum: { display: "Platinum", bgColor: "#e5e4e2" },
};

const RequestPlan = () => {
  const [plans, setPlans] = useState(initialPlans);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Fetch all plan requests
  useEffect(() => {
    const controller = new AbortController(); // ✅ 1. Create a controller for this effect

    const fetchPlans = async () => {
      try {
        const response = await axiosInstance.get("planreq", {
          signal: controller.signal, // ✅ 2. Pass the signal to the axios request
        });

        // ✅ 3. Properly check the response structure before updating state
        if (response.data?.success && Array.isArray(response.data.data)) {
          const formattedPlans = response.data.data.map((item) => ({
            id: item.id,
            company: item.company?.name || "Unknown Company",
            email: item.company?.email || "N/A",
            plan: item.plan?.plan_name || "—",
            billing: item.billing_cycle || "—",
            date: new Date(item.request_date).toISOString().split("T")[0],
            status: item.status || "Pending",
          }));
          setPlans(formattedPlans);
        } else {
          // ✅ 4. If the response is not what we expect, throw a specific error
          throw new Error("Invalid response structure from API. Expected an object with a 'data' array.");
        }
      } catch (err) {
        console.error("Failed to fetch plan requests:", err);
        // ✅ 5. Check if the error is due to an abort
        if (axiosInstance.isCancel(err) || err.name === 'CanceledError') {
          console.log("Fetch request was canceled.");
          return; // Don't set an error state for a cancelled request
        }
        // ✅ 6. Only set error state if the request was a genuine error
        setApiError(true);
      } finally {
        // ✅ 7. Always set loading to false
        setLoading(false);
      }
    };

    fetchPlans();

    // ✅ 8. This is the cleanup function for useEffect
    // It runs when the component is unmounted
    return () => {
      console.log("RequestPlan component is unmounting. Aborting any pending request.");
      // Abort the request if it's still pending
      controller.abort();
    };
  }, []);

  // ✅ PATCH status update (Approved / Rejected)
  const handleAction = async (index, newStatus) => {
    const planToUpdate = plans[index];
    const planId = planToUpdate.id;

    // Optimistic UI update
    const updatedPlans = [...plans];
    updatedPlans[index].status = newStatus;
    setPlans(updatedPlans);

    try {
      // ✅ 9. Create a new AbortController for this specific request
      const controller = new AbortController();

      // ✅ 10. Use PATCH as per your API spec
      await axiosInstance.patch(`planreq/${planId}`, {
        status: newStatus,
      });
      
      // Success: keep optimistic update
      console.log(`Plan ${planId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update plan status:", err);
      // Revert on error
      updatedPlans[index].status = planToUpdate.status;
      setPlans(updatedPlans);
      console.error(`Error updating plan ${planId}. Reverted status.`);
    }
  };

  // ✅ Send email (client-side mailto link)
  const handleSendEmail = (plan) => {
    const subject = `Your ${plan.plan} Plan Request has been Approved`;
    const body = `Dear ${plan.company},\n\nWe are pleased to inform you that your request for the ${plan.plan} plan has been approved.\n\nPlan Details:\n- Plan: ${plan.plan}\n- Billing Cycle: ${plan.billing}\n- Request Date: ${plan.date}\n\nPlease contact us if you have any questions.\n\nThank you,\nYour Company Name`;
    window.location.href = `mailto:${plan.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="badge bg-success px-1 px-sm-2 py-1 rounded-pill">
            Approved
          </span>
        );
      case "Pending":
        return (
          <span className="badge bg-warning text-dark px-1 px-sm-2 py-1 rounded-pill">
            Pending
          </span>
        );
      case "Rejected":
        return (
          <span className="badge bg-danger px-1 px-sm-2 py-1 rounded-pill">
            Rejected
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary px-1 px-sm-2 py-1 rounded-pill">
            {status}
          </span>
        );
    }
  };

  const renderActionButtons = (status, index, id) => {
    // ✅ Removed the actionLoading state. We don't need it anymore.
    // The UI updates are instant and optimistic.
    return (
      <div className="d-flex gap-2 justify-content-center flex-nowrap">
        <button
          className={`btn ${
            status === "Approved" ? "btn-success" : "btn-outline-success"
          } btn-sm rounded-pill px-3 d-flex align-items-center justify-content-center`}
          disabled={status === "Approved"} // Disable button if already approved
          onClick={() => handleAction(index, "Approved")}
          style={{ minWidth: "90px", height: "32px" }}
        >
          <FaCheck className="me-1" size={12} /> Approve
        </button>
        <button
          className={`btn ${
            status === "Rejected" ? "btn-danger" : "btn-outline-danger"
          } btn-sm rounded-pill px-3 d-flex align-items-center justify-content-center`}
          disabled={status === "Rejected"} // Disable button if already rejected
          onClick={() => handleAction(index, "Rejected")}
          style={{ minWidth: "90px", height: "32px" }}
        >
          <FaTimes className="me-1" size={12} /> Reject
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className="container-fluid p-3 p-md-4 bg-light d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading requested plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-3 p-md-4">
      <div className="mb-4">
        <div className="d-flex align-items-center mb-3">
          <FaEnvelopeOpenText size={24} className="text-primary me-2" />
          <h4 className="fw-bold m-0">Requested Plans</h4>
        </div>

        {/* ✅ Show a more specific error message */}
        {apiError && (
          <div
            className="alert alert-danger alert-dismissible fade show mb-4"
            role="alert"
          >
            There was a problem fetching your plan requests from the server. Please try refreshing the page or contact support if the issue persists.
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="alert"
              aria-label="Close"
            ></button>
          </div>
        )}

        <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="">
                <tr>
                  <th className="px-2 px-sm-3 py-3 d-none d-sm-table-cell">
                    Company
                  </th>
                  <th className="px-2 px-sm-3 py-3 d-none d-md-table-cell">
                    Email
                  </th>
                  <th className="px-2 px-sm-3 py-3">Plan</th>
                  <th className="px-2 px-sm-3 py-3 d-none d-lg-table-cell">
                    Billing
                  </th>
                  <th className="px-2 px-sm-3 py-3 d-none d-lg-table-cell">
                    Date
                  </th>
                  <th className="px-2 px-sm-3 py-3">Status</th>
                  <th className="px-2 px-sm-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.length > 0 ? (
                  plans.map((user, idx) => (
                    <tr key={user.id || idx}>
                      <td className="px-2 px-sm-3 py-3 d-none d-sm-table-cell">
                        {user.company}
                      </td>
                      <td className="d-none d-md-table-cell">{user.email}</td>
                      <td>
                        <span
                          className="px-2 px-sm-3 py-1 rounded-pill d-inline-block text-dark fw-semibold"
                          style={{
                            backgroundColor:
                              planMapping[user.plan]?.bgColor || "#dee2e6",
                            minWidth: "70px",
                            fontSize: "0.85rem",
                          }}
                        >
                          {planMapping[user.plan]?.display || user.plan}
                        </span>
                      </td>
                      <td className="d-none d-lg-table-cell">{user.billing}</td>
                      <td className="px-2 px-sm-3 py-3">{user.date}</td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>
                        <div className="d-flex gap-2 align-items-center">
                          {/* ✅ Use the new renderActionButtons function */}
                          {renderActionButtons(user.status, idx, user.id)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No requested plans found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestPlan;
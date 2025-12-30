// RequestPlan.js
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Card,
  Table,
  Button,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaEnvelopeOpenText,
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaFileAlt,
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
          <Badge className="status-badge badge-success">
            Approved
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="status-badge badge-warning">
            Pending
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="status-badge badge-danger">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="status-badge badge-secondary">
            {status}
          </Badge>
        );
    }
  };

  const renderActionButtons = (status, index, id) => {
    return (
      <div className="d-flex gap-2 justify-content-center flex-nowrap">
        <Button
          className={`btn-approve-action ${
            status === "Approved" ? "approved" : ""
          }`}
          size="sm"
          disabled={status === "Approved"}
          onClick={() => handleAction(index, "Approved")}
        >
          <FaCheck className="me-1" /> Approve
        </Button>
        <Button
          className={`btn-reject-action ${
            status === "Rejected" ? "rejected" : ""
          }`}
          variant="danger"
          size="sm"
          disabled={status === "Rejected"}
          onClick={() => handleAction(index, "Rejected")}
        >
          <FaTimes className="me-1" /> Reject
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <Container fluid className="request-plan-container py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="spinner-custom" />
          <p className="mt-3 text-muted">Loading requested plans...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="request-plan-container py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div className="request-plan-header mb-4">
        <h4 className="fw-bold d-flex align-items-center gap-2 request-plan-title">
          <FaEnvelopeOpenText style={{ color: '#505ece' }} /> Requested Plans
        </h4>
        <p className="text-muted mb-0">Review and manage plan requests from companies</p>
      </div>

      {/* Error Alert */}
      {apiError && (
        <Alert variant="danger" dismissible className="mb-4">
          There was a problem fetching your plan requests from the server. Please try refreshing the page or contact support if the issue persists.
        </Alert>
      )}

      {/* Table Card */}
      <Card className="request-plan-table-card">
        <Card.Header className="request-plan-table-header">
          <h6 className="mb-0 fw-bold">Plan Requests</h6>
        </Card.Header>
        <Card.Body>
          {plans.length > 0 ? (
            <div className="table-responsive">
              <Table className="request-plan-table" hover responsive>
                <thead className="request-plan-table-thead">
                  <tr>
                    <th className="d-none d-sm-table-cell">Company</th>
                    <th className="d-none d-md-table-cell">Email</th>
                    <th>Plan</th>
                    <th className="d-none d-lg-table-cell">Billing</th>
                    <th className="d-none d-lg-table-cell">Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((user, idx) => (
                    <tr key={user.id || idx}>
                      <td className="d-none d-sm-table-cell">
                        <strong>{user.company}</strong>
                      </td>
                      <td className="d-none d-md-table-cell">{user.email}</td>
                      <td>
                        <span
                          className="plan-badge rounded-pill d-inline-block text-dark fw-semibold"
                          style={{
                            backgroundColor:
                              planMapping[user.plan]?.bgColor || "#dee2e6",
                            minWidth: "70px",
                            fontSize: "0.85rem",
                            padding: "6px 12px",
                          }}
                        >
                          {planMapping[user.plan]?.display || user.plan}
                        </span>
                      </td>
                      <td className="d-none d-lg-table-cell">{user.billing}</td>
                      <td>{user.date}</td>
                      <td>{getStatusBadge(user.status)}</td>
                      <td>
                        {renderActionButtons(user.status, idx, user.id)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5 empty-state">
              <FaFileAlt style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
              <p className="text-muted mb-0">No requested plans found.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RequestPlan;
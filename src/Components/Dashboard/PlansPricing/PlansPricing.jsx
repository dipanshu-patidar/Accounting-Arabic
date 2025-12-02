// PlanPricing.jsx
import React, { useState, useEffect } from "react";
import { BsListUl, BsPencilSquare, BsEye, BsChevronLeft, BsChevronRight, BsTrash } from "react-icons/bs";
import { Button, Card, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./PlansPricing.css";
import Swal from "sweetalert2";
import axios from "axios";
import EditPlanModal from "./EditPlanModal";
import ViewPlanModal from "./ViewPlanModal";
import AddPlanModal from "./AddPlanModal";
import BaseUrl from "../../../Api/BaseUrl";

// Available currencies
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
];

const badgeStyles = {
  Bronze: { backgroundImage: "linear-gradient(to right, #ad7c59, #cd7f32, #a97142)", color: "#fff", boxShadow: "0 0 6px rgba(173, 124, 89, 0.5)" },
  Silver: { backgroundImage: "linear-gradient(to right, #c0c0c0, #d8d8d8, #b0b0b0)", color: "#000", boxShadow: "0 0 6px rgba(192, 192, 192, 0.6)" },
  Gold: { backgroundImage: "linear-gradient(to right, #f5d76e, #ffd700, #e6be8a)", color: "#000", boxShadow: "0 0 6px rgba(255, 215, 0, 0.5)" },
  Platinum: { backgroundImage: "linear-gradient(to right, #e5e4e2, #f9f9fb, #cfd8dc)", color: "#000", boxShadow: "0 0 6px rgba(180, 200, 220, 0.5)" },
  Premium: { backgroundImage: "linear-gradient(to right, #FFD700, #FFA500, #FF8C00)", color: "#fff", boxShadow: "0 0 6px rgba(255, 140, 0, 0.5)" },
};

const getCurrencySymbol = (currencyCode) => {
  if (!currencyCode) return "$";
  const currency = currencies.find(c => c.code === currencyCode);
  return currency ? currency.symbol : "$";
};

// Convert bytes to GB for display (1 GB = 1024^3 bytes)
const bytesToGB = (bytes) => {
  if (bytes === -1 || bytes === "unlimited") return "unlimited";
  return Math.round(bytes / (1024 * 1024 * 1024));
};

const calculateTotalPrice = (basePrice, selectedModules, currencyCode) => {
  try {
    let total = parseFloat(basePrice) || 0;
    if (selectedModules && Array.isArray(selectedModules)) {
      selectedModules.forEach(module => {
        total += parseFloat(module.module_price || 0);
      });
    }
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${total.toFixed(2)}`;
  } catch (error) {
    console.error("Error calculating total price:", error);
    return "$0.00";
  }
};

const formatModulesForDisplay = (modules, currencyCode) => {
  try {
    if (!modules || !Array.isArray(modules) || modules.length === 0) {
      return <span className="text-muted">—</span>;
    }
    const symbol = getCurrencySymbol(currencyCode);
    const maxDisplay = 3;
    if (modules.length <= maxDisplay) {
      return (
        <div className="d-flex flex-wrap gap-1">
          {modules.map((module, index) => (
            <Badge key={index} bg="secondary" className="me-1">
              {module.module_name} ({symbol}{parseFloat(module.module_price).toFixed(2)})
            </Badge>
          ))}
        </div>
      );
    }
    const displayedModules = modules.slice(0, 2);
    const remainingCount = modules.length - 2;
    return (
      <div className="d-flex flex-wrap gap-1">
        {displayedModules.map((module, index) => (
          <Badge key={index} bg="secondary" className="me-1">
            {module.module_name} ({symbol}{parseFloat(module.module_price).toFixed(2)})
          </Badge>
        ))}
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={`tooltip-modules`}>
              {modules.slice(2).map((module, index) => (
                <div key={index}>{module.module_name} ({symbol}{parseFloat(module.module_price).toFixed(2)})</div>
              ))}
            </Tooltip>
          }
        >
          <Badge bg="secondary" className="me-1">
            +{remainingCount} more
          </Badge>
        </OverlayTrigger>
      </div>
    );
  } catch (error) {
    console.error("Error formatting modules:", error);
    return <span className="text-muted">—</span>;
  }
};

const formatInvoiceLimit = (limit) => {
  if (limit === -1 || limit === "unlimited") return "Unlimited";
  return `${limit} invoices`;
};

const formatUserLimit = (limit) => {
  if (limit === -1 || limit === "unlimited") return "Unlimited";
  return `${limit} users`;
};

const formatStorageCapacity = (capacity) => {
  if (capacity === -1 || capacity === "unlimited") return "Unlimited";
  // Assume capacity is in bytes → convert to GB
  const gb = Math.round(capacity / (1024 * 1024 * 1024));
  return `${gb} GB`;
};

const PlanPricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [viewPlan, setViewPlan] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!BaseUrl) {
          throw new Error("Base URL is not configured.");
        }

        const response = await axios.get(`${BaseUrl}plans`);

        if (response.data && Array.isArray(response.data.data)) {
          setPlans(response.data.data);
        } else {
          setError("Invalid data format from server");
          setPlans([]);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        const msg = error.response?.data?.message || error.message || "Failed to load plans.";
        setError(msg);
        Swal.fire("Error", msg, "error");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPlans = plans.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(plans.length / itemsPerPage));

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // ✅ FIX: Map API fields to component format
  const handleEditClick = (plan) => {
    try {
      const formattedPlan = {
        id: plan.id,
        name: plan.plan_name || "",
        basePrice: plan.base_price || "0",
        billing: plan.billing_cycle || "Monthly",
        selectedModules: (plan.plan_modules || []).map(m => ({
          id: m.id,
          name: m.module_name,
          price: m.module_price || "0"
        })),
        descriptions: plan.description ? [plan.description] : [""],
        invoiceLimit: plan.invoice_limit === -1 ? "unlimited" : plan.invoice_limit,
        additionalInvoicePrice: plan.additional_invoice_price || "0",
        userLimit: plan.user_limit === -1 ? "unlimited" : plan.user_limit,
        // ✅ Convert bytes → GB for UI
        storageCapacity: plan.storage_capacity === -1 ? "unlimited" : bytesToGB(plan.storage_capacity),
        currency: plan.currency || "USD",
        status: plan.status || "Active"
      };
      setSelectedPlan(formattedPlan);
      setShowModal(true);
    } catch (error) {
      console.error("Error formatting plan for edit:", error);
      Swal.fire("Error", "Failed to load plan data.", "error");
    }
  };

  const handleDeleteClick = async (planId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This plan will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        await axios.delete(`${BaseUrl}plans/${planId}`);
        setPlans(plans.filter(p => p.id !== planId));
        if (currentPlans.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        Swal.fire("Deleted!", "The plan has been deleted.", "success");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to delete plan.";
      Swal.fire("Error", msg, "error");
    }
  };

  const handleViewClick = (plan) => {
    try {
      const formattedPlan = {
        id: plan.id,
        name: plan.plan_name || "",
        basePrice: plan.base_price || "0",
        billing: plan.billing_cycle || "Monthly",
        selectedModules: (plan.plan_modules || []).map(m => ({
          id: m.id,
          name: m.module_name,
          price: m.module_price || "0"
        })),
        descriptions: plan.description ? [plan.description] : [""],
        invoiceLimit: plan.invoice_limit === -1 ? "unlimited" : plan.invoice_limit,
        additionalInvoicePrice: plan.additional_invoice_price || "0",
        userLimit: plan.user_limit === -1 ? "unlimited" : plan.user_limit,
        storageCapacity: plan.storage_capacity === -1 ? "unlimited" : bytesToGB(plan.storage_capacity),
        currency: plan.currency || "USD",
        status: plan.status || "Active"
      };
      setViewPlan(formattedPlan);
      setViewModal(true);
    } catch (error) {
      console.error("Error formatting plan for view:", error);
      Swal.fire("Error", "Failed to load plan data.", "error");
    }
  };

  const handleAddPlan = (newPlan) => {
    // Assuming newPlan matches API response structure
    setPlans([newPlan, ...plans]);
    setShowAddModal(false);
    setCurrentPage(1);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  return (
    <div className=" p-4">
      <div className="header-section mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold d-flex align-items-center gap-2">
            <span role="img" aria-label="coin">💰</span> Plans & Pricing
          </h4>
          <p className="text-muted">Manage your subscription plans, pricing options.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)} style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }}>
          + Add Plan
        </Button>
      </div>

      <div className="card">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">View All Plans</h6>
          <div className="table-responsive">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading plans...</p>
              </div>
            ) : (
              <table className="table table-hover plans-table">
                <thead className="">
                  <tr>
                    <th>Plan Name</th>
                    <th>Currency</th>
                    <th>Base Price</th>
                    <th>Total Price</th>
                    <th>Invoice Limit</th>
                    <th>Additional Invoice Price</th>
                    <th>User Limit</th>
                    <th>Storage Capacity</th>
                    <th>Billing Cycle</th>
                    <th>Status</th>
                    <th>Modules</th>
                    <th>Subscribers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPlans.length === 0 ? (
                    <tr>
                      <td colSpan="13" className="text-center py-4">
                        {error ? "No plans available due to an error." : "No plans found. Click 'Add Plan' to create a new plan."}
                      </td>
                    </tr>
                  ) : (
                    currentPlans.map((plan) => (
                      <tr key={plan.id}>
                        <td>
                          <span
                            className="badge px-3 py-2 rounded-pill fw-semibold"
                            style={{
                              ...(badgeStyles[plan.plan_name] || {
                                backgroundColor: "#2db173ff",
                               
                              }),
                            }}
                          >
                            {plan.plan_name || "Unnamed Plan"}
                          </span>
                        </td>
                        <td>{plan.currency || "USD"}</td>
                        <td>{getCurrencySymbol(plan.currency)}{plan.base_price || 0}</td>
                        <td><strong>{calculateTotalPrice(plan.base_price, plan.plan_modules, plan.currency)}</strong></td>
                        <td>{formatInvoiceLimit(plan.invoice_limit)}</td>
                        <td>
                          {plan.invoice_limit === -1
                            ? "Not applicable"
                            : `${getCurrencySymbol(plan.currency)}${plan.additional_invoice_price || 0}/invoice`}
                        </td>
                        <td>{formatUserLimit(plan.user_limit)}</td>
                        <td>{formatStorageCapacity(plan.storage_capacity)}</td>
                        <td>{plan.billing_cycle || "Monthly"}</td>
                        <td>
                          <span className={`badge ${plan.status === "Inactive" ? "bg-warning text-dark" : "bg-success"}`}>
                            {plan.status || "Active"}
                          </span>
                        </td>
                        <td>{formatModulesForDisplay(plan.plan_modules, plan.currency)}</td>
                        <td>{plan.subscribers || 0}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm text-warning p-0" onClick={() => handleEditClick(plan)} title="Edit">
                              <BsPencilSquare size={18} />
                            </button>
                            <button className="btn btn-sm text-info p-0" onClick={() => handleViewClick(plan)} title="View">
                              <BsEye size={18} />
                            </button>
                            <button className="btn btn-sm text-danger p-0" onClick={() => handleDeleteClick(plan.id)} title="Delete">
                              <BsTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!loading && plans.length > 0 && (
            <div className="d-flex justify-content-between align-items-center px-2 py-2">
              <div className="text-muted small">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, plans.length)} of {plans.length} results
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#f8f9fa", color: "#6c757d", borderColor: "#53b2a5" }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <BsChevronLeft />
                </button>
                <div className="d-flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`btn btn-sm ${currentPage === page ? 'active' : ''}`}
                      style={{
                        backgroundColor: currentPage === page ? "#53b2a5" : "white",
                        color: currentPage === page ? "white" : "#53b2a5",
                        borderColor: "#53b2a5",
                      }}
                      onClick={() => paginate(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-sm rounded"
                  style={{ backgroundColor: "#53b2a5", color: "white", borderColor: "#53b2a5" }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <BsChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedPlan && (
        <EditPlanModal
          show={showModal}
          handleClose={handleModalClose}
          plan={selectedPlan}
          handleSave={async (updatedPlan) => {
            // This will be handled by EditPlanModal — no change needed here
            // Just ensure EditPlanModal sends correct payload (as per your AddPlanModal fix)
          }}
        />
      )}

      {viewPlan && (
        <ViewPlanModal
          show={viewModal}
          handleClose={() => setViewModal(false)}
          plan={viewPlan}
        />
      )}

      {showAddModal && (
        <AddPlanModal
          show={showAddModal}
          handleClose={() => setShowAddModal(false)}
          handleAdd={handleAddPlan}
        />
      )}
    </div>
  );
};

export default PlanPricing;
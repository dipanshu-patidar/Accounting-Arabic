import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Form,
  InputGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FaCheck, FaCrown, FaPhoneAlt } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Pages.css";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";

const Pricing = () => {
  const companyId = GetCompanyId(); // Get the company ID
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false); // New state for form submission

  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingDuration, setBillingDuration] = useState("Yearly");
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    startDate: "",
  });

  // ✅ Helper: Calculate total monthly price (base + modules)
  const calculateTotalMonthlyPrice = (basePrice, modules = []) => {
    const base = parseFloat(basePrice) || 0;
    const moduleTotal = (modules || []).reduce((sum, mod) => {
      return sum + (parseFloat(mod.module_price) || 0); // Fixed: use module_price instead of price
    }, 0);
    return base + moduleTotal;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setError(null);
        const response = await axiosInstance.get('plans');

        // Fixed: Properly handle the API response structure
        const apiPlans = response.data.success && response.data.data ? response.data.data : [];

        const mappedPlans = apiPlans.map((plan) => {
          // ✅ Calculate total monthly price including modules
          const totalMonthlyUsd = calculateTotalMonthlyPrice(plan.base_price, plan.plan_modules); // Fixed: use plan_modules
          
          // Convert to yearly INR
          const usdToInr = 83;
          const totalYearlyInr = Math.round(totalMonthlyUsd * 12 * usdToInr);

          const nameLower = plan.plan_name.toLowerCase(); // Fixed: use plan_name instead of name
          let buttonColor = "#007bff";
          if (nameLower.includes("basic")) buttonColor = "#b87333"; // Fixed: match "basic" instead of "bronze"
          else if (nameLower.includes("silver")) buttonColor = "var(--brand)";
          else if (nameLower.includes("golden")) buttonColor = "#ffc107"; // Fixed: match "golden" instead of "gold"
          else if (nameLower.includes("platinum") || nameLower.includes("enterprise"))
            buttonColor = "#6f42c1";

          // Build features
          const features = [];
          
          features.push({ text: `Base Price: $${parseFloat(plan.base_price).toFixed(2)}/month`, included: true });
          features.push({ text: `Total Yearly Price: $${totalMonthlyUsd}`, included: true }); // ✅ Dynamic total with modules

          features.push({
            text: `Invoice Limit: ${plan.invoice_limit === -1 ? "Unlimited" : plan.invoice_limit}`,
            included: true,
          });
          features.push({
            text: `User Limit: ${plan.user_limit === -1 ? "Unlimited" : plan.user_limit}`,
            included: true,
          });
          
          // Convert storage capacity from bytes to GB
          const storageGB = Math.round(plan.storage_capacity / (1024 * 1024 * 1024));
          features.push({
            text: `${storageGB}GB Storage`,
            included: true,
          });

          // Description (if not empty)
          if (plan.description && plan.description.trim()) {
            features.push({ text: plan.description, included: true });
          }

          // Modules — use `module_name` and `module_price` from API
          if (Array.isArray(plan.plan_modules)) {
            plan.plan_modules.forEach((mod) => {
              const label = mod.module_name || `Module ${mod.id}`;
              const price = parseFloat(mod.module_price);
              features.push({
                text: `${label} (${price > 0 ? `+$${price.toFixed(2)}` : "Included"})`,
                included: price === 0,
              });
            });
          }

          return {
            id: plan.id, // Add plan ID for API call
            name: plan.plan_name, // Fixed: use plan_name
            price: totalYearlyInr, // ✅ For modal
            duration: plan.billing_cycle,
            buttonColor,
            btnText: `Buy ${plan.plan_name.split(" ")[0]}`, // Fixed: use plan_name
            features,
          };
        });

        setPlans(mappedPlans);
      } catch (err) {
        console.error("API Error:", err);
        setError("Failed to load pricing plans.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
    AOS.init({ duration: 1000 });
  }, []);

  // --- Helper Functions ---
  const calculatePrice = () => {
    if (!selectedPlan) return 0;
    return billingDuration === "Monthly"
      ? Math.round(selectedPlan.price / 12)
      : selectedPlan.price;
  };

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setBillingDuration("Yearly");
    setShowModal(true);
  }; 

  const handleDurationChange = (e) => setBillingDuration(e.target.value);
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Updated handleSubmit function to make API call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Prepare data for API call - Updated to match the expected response format
      const requestData = {
        company_name: formData.companyName, // Send company name from form
        company_email: formData.email, // Send email from form
        plan_id: selectedPlan.id,
        billing_cycle: billingDuration,
        request_date: formData.startDate, // Use the selected start date
        status: "Pending" // Default status
      };
      
      // Make API call to request plan - Updated endpoint
      const response = await axiosInstance.post('/planreq', requestData);
      
      if (response.data) {
        alert("Plan request submitted successfully! We'll contact you shortly.");
        handleCloseModal();
      } else {
        alert("Failed to submit plan request. Please try again.");
      }
    } catch (err) {
      console.error("API Error:", err);
      alert("An error occurred while submitting your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setFormData({ companyName: "", email: "", startDate: "" });
  };

  // --- UI Rendering ---
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading pricing plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <div className="py-3" style={{ background: "#fff" }}>
      <Container>
        <Row className="justify-content-center my-4">
          {plans.map((plan, idx) => (
            <Col
              md={6}
              lg={4}
              key={idx}
              className="mb-4"
              data-aos="zoom-in"
              data-aos-delay={idx * 150}
            >
              <div
                className="border rounded p-4 h-100 shadow-sm position-relative"
                style={{
                  backgroundColor: "#fff",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                }}
              >
                {/* Crown + Plan Name */}
                <div className="text-center mb-3">
                  <FaCrown size={24} className="text-dark mb-2" />
                  <h5 className="fw-bold mb-1">{plan.name}</h5>
                  <small className="text-muted">Monthly/Yearly</small>
                </div>

                {/* Buy Button */}
                <div className="d-grid gap-2 mb-4">
                  <Button
                    style={{
                      backgroundColor: plan.buttonColor,
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      padding: "0.75rem 1rem",
                      fontSize: "16px",
                    }}
                    onClick={() => handleBuyClick(plan)}
                  >
                    {plan.btnText}
                  </Button>
                </div>

                {/* Features List */}
                <ul className="list-unstyled">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="d-flex align-items-start mb-2">
                      <FaCheck className="text-success me-2 mt-1" />
                      <span>{feat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          ))}

          {/* Enterprise Plan */}
          {/* <Col md={12} lg={4} className="mb-4" data-aos="fade-left" data-aos-delay="650">
            <div
              className="border rounded p-4 h-100 shadow-lg position-relative"
              style={{
                backgroundColor: "#ffffff",
                borderLeft: "8px solid #2b2e4a",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
              }}
            >
              <div className="text-center mb-3">
                <FaPhoneAlt size={20} className="text-dark mb-2" />
                <h5 className="fw-bold text-dark mt-2 mb-1">Enterprise Version</h5>
                <p className="text-muted mb-2" style={{ fontSize: "0.95rem" }}>
                  Tailored solutions. High volume access. Premium support.
                </p>
              </div>
              <div className="d-grid">
                <a
                  href="tel:+919999999999"
                  className="btn btn-sm"
                  style={{
                    backgroundColor: "#2b2e4a",
                    color: "#ffffff",
                    fontWeight: "600",
                    padding: "0.5rem 1.2rem",
                    fontSize: "14px",
                    borderRadius: "30px",
                    textAlign: "center",
                  }}
                >
                  <FaPhoneAlt className="me-2" /> Contact Sales
                </a>
              </div>
            </div>
          </Col> */}
        </Row>

        <hr data-aos="fade-in" />
        <div className="mt-4 text-center" data-aos="fade-right">
          <p className="text-muted">
            For custom plans, call:{" "}
            <a href="tel:+919999999999" className="text-primary">
              +91-99999-99999
            </a>
          </p>
        </div>
      </Container>

      {/* Purchase Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Complete Your Purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPlan && (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Selected Plan</Form.Label>
                <Form.Control value={selectedPlan.name} disabled />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Billing Duration</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    label="Monthly"
                    name="billingDuration"
                    value="Monthly"
                    checked={billingDuration === "Monthly"}
                    onChange={handleDurationChange}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    label="Yearly"
                    name="billingDuration"
                    value="Yearly"
                    checked={billingDuration === "Yearly"}
                    onChange={handleDurationChange}
                  />
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                style={{
                  backgroundColor: selectedPlan.buttonColor,
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  width: "100%",
                  padding: "0.75rem 1rem",
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Submitting...
                  </>
                ) : (
                  "Confirm Purchase"
                )}
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Pricing;
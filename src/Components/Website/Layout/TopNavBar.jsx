import React from "react";
import { Container, Button, Dropdown } from "react-bootstrap";
import { FaChevronDown } from "react-icons/fa";
import quickBooksLogo from "../assets/logozirakbooks.png";
import './TopNavBar.css';

const TopNavBar = () => {
  return (
    <div className="border-bottom py-2 px-3 px-md-5 bg-white top-navbar-wrapper">
      <Container fluid className="d-flex align-items-center justify-content-between">
        {/* Left: Logo */}
        <div className="d-flex align-items-center gap-2">
          <div className="fw-bold" style={{ fontSize: "18px", lineHeight: "1.2" }}>
            <div style={{ fontSize: "12px" }}>INTUIT</div>
            <img src={quickBooksLogo} alt="QuickBooks Logo" width="80" />
          </div>
        </div>

        {/* Center: Support & Download */}
        <div className="d-none d-md-flex align-items-center gap-4 position-relative">
          {/* Support Dropdown */}
          <Dropdown className="support-dropdown">
            <Dropdown.Toggle
              variant="link"
              className="fw-medium text-dark text-decoration-none d-flex align-items-center"
              style={{ cursor: "pointer" }}
            >
              Support 
            </Dropdown.Toggle>

            <Dropdown.Menu className="mt-2 shadow">
              <Dropdown.Item href="#enterprise">Enterprise Support Directory</Dropdown.Item>
              <Dropdown.Item href="#priority">Priority Circle</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* Download Link */}
          <div className="fw-medium text-dark" style={{ cursor: "pointer" }}>
            Download
          </div>
        </div>

        {/* Right: Talk to Sales & Sign In Dropdown */}
        <div className="d-flex align-items-center gap-3">
          <div className="fw-medium text-dark d-none d-md-flex align-items-center" style={{ cursor: "pointer" }}>
            Talk to Sales: 1-833-925-5657 
          </div>

          {/* Sign In Dropdown */}
          {/* <Dropdown className="signin-dropdown">
            <Dropdown.Toggle
              variant="dark"
              size="sm"
              className="rounded-1 d-flex align-items-center gap-1"
            >
              Sign in 
            </Dropdown.Toggle>

            <Dropdown.Menu className="mt-2 shadow">
              <Dropdown.Item href="#online">ZirakBooks Online</Dropdown.Item>
              <Dropdown.Item href="#self-employed">ZirakBooks Self-Employed</Dropdown.Item>
              <Dropdown.Item href="#proadvisor">ZirakBooks ProAdvisor Program</Dropdown.Item>
              <Dropdown.Item href="#accountant">ZirakBooks Online Accountant</Dropdown.Item>
              <Dropdown.Item href="#desktop">ZirakBooks Desktop Account</Dropdown.Item>
              <Dropdown.Item href="#payroll">ZirakBooks Online Payroll</Dropdown.Item>
              <Dropdown.Item href="#payments">ZirakBooks Payments</Dropdown.Item>
              <Dropdown.Item href="#time">ZirakBooks Time</Dropdown.Item>
              <Dropdown.Item href="#other">Other Intuit Services</Dropdown.Item>
              <Dropdown.Item href="#help">Need help signing in?</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown> */}
        </div>
      </Container>
    </div>
  );
};

export default TopNavBar;

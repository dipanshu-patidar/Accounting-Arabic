import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import BaseUrl from "../../../Api/BaseUrl";
import "./BalanceSheet.css";

const BalanceSheet = () => {
  const companyId = GetCompanyId();
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBalanceSheet = async () => {
      if (!companyId) {
        setError("Company ID not found");
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get(`${BaseUrl}balance-sheet/${companyId}`);
        if (res.data.success) {
          setBalanceData(res.data);
        } else {
          setError("Failed to load balance sheet");
        }
      } catch (err) {
        console.error(err);
        setError("Network error while fetching balance sheet");
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceSheet();
  }, [companyId]);

  if (loading) {
    return (
      <div className="p-4 balance-sheet-container">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <Spinner animation="border" style={{ color: "#505ece" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 balance-sheet-container">
        <Alert variant="danger" className="text-center">
          <h5>{error}</h5>
        </Alert>
      </div>
    );
  }

  const {
    assets,
    liabilities,
    capital,
    totalLiabilitiesAndCapital
  } = balanceData;

  return (
    <div className="p-4 balance-sheet-container">
      <Container fluid>
        {/* Header Section */}
        <div className="mb-4">
          <h3 className="balance-sheet-title">
            <i className="fas fa-balance-scale me-2"></i>
            Balance Sheet
          </h3>
          <p className="balance-sheet-date">
            As on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Row className="g-4 justify-content-center">
          {/* Assets */}
          <Col xs={12} md={6}>
            <Card className="balance-sheet-card">
              <Card.Body>
                <Row className="align-items-center mb-3">
                  <Col xs={12} md={6}>
                    <div className="balance-sheet-card-header">ASSETS</div>
                  </Col>
                  <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
                    <Link to="/company/balancesheet/asstedetails" style={{ textDecoration: "none" }}>
                      <Button
                        className="btn-view-details"
                        size="sm"
                      >
                        View All Asset Details
                      </Button>
                    </Link>
                  </Col>
                </Row>

                <div className="section-header">Current Assets</div>
                {[
                  ["Cash", assets.cash],
                  ["Bank", assets.bank],
                  ["Stock", assets.stock],
                  ["Accounts Receivable", assets.accountsReceivable],
                  ["Total Current Assets", assets.totalCurrentAssets, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className={`balance-row ${isTotal ? 'balance-total-row' : ''}`} key={idx}>
                    <Col xs={7} className={isTotal ? "balance-total-label" : "balance-label"}>
                      {label}
                    </Col>
                    <Col xs={5} className={`text-end ${isTotal ? "balance-total-value" : "balance-value"}`}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <div className="section-header">Fixed Assets</div>
                {[
                  ["Land & Building", assets.landBuilding],
                  ["Plant & Machinery", assets.plantMachinery],
                  ["Furniture & Fixtures", assets.furnitureFixtures],
                  ["Total Fixed Assets", assets.totalFixedAssets, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className={`balance-row ${isTotal ? 'balance-total-row' : ''}`} key={idx}>
                    <Col xs={7} className={isTotal ? "balance-total-label" : "balance-label"}>
                      {label}
                    </Col>
                    <Col xs={5} className={`text-end ${isTotal ? "balance-total-value" : "balance-value"}`}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <hr className="balance-divider" />
                <Row className="balance-row">
                  <Col xs={7} className="balance-total-label">Total Assets</Col>
                  <Col xs={5} className="text-end balance-total-value">
                    {assets.totalAssets.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Liabilities & Capital */}
          <Col xs={12} md={6}>
            <Card className="balance-sheet-card">
              <Card.Body>
                <Row className="align-items-center mb-3">
                  <Col xs={12} md={6}>
                    <div className="balance-sheet-card-header">LIABILITIES & CAPITAL</div>
                  </Col>
                  <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
                    <Link to="/company/balancesheet/liabilitydetails" style={{ textDecoration: "none" }}>
                      <Button
                        className="btn-view-details"
                        size="sm"
                      >
                        View All Liability Details
                      </Button>
                    </Link>
                  </Col>
                </Row>

                <div className="section-header">Current Liabilities</div>
                {[
                  ["Accounts Payable", liabilities.accountsPayable],
                  ["Short-term Loans", liabilities.shortTermLoans],
                  ["Outstanding Expenses", liabilities.outstandingExpenses],
                  ["Total Current Liabilities", liabilities.totalCurrentLiabilities, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className={`balance-row ${isTotal ? 'balance-total-row' : ''}`} key={idx}>
                    <Col xs={7} className={isTotal ? "balance-total-label" : "balance-label"}>{label}</Col>
                    <Col xs={5} className={`text-end ${isTotal ? "balance-total-value" : "balance-value"}`}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <div className="section-header">Long-term Liabilities</div>
                {[
                  ["Term Loan", liabilities.termLoan],
                  ["Mortgage Loan", liabilities.mortgageLoan],
                  ["Total Long-term Liabilities", liabilities.totalLongTermLiabilities, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className={`balance-row ${isTotal ? 'balance-total-row' : ''}`} key={idx}>
                    <Col xs={7} className={isTotal ? "balance-total-label" : "balance-label"}>{label}</Col>
                    <Col xs={5} className={`text-end ${isTotal ? "balance-total-value" : "balance-value"}`}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <div className="section-header">Owner's Capital</div>
                {[
                  ["Capital", capital.capital],
                  ["Retained Earnings", capital.retainedEarnings],
                  ["Total Owner's Capital", capital.totalOwnerCapital, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className={`balance-row ${isTotal ? 'balance-total-row' : ''}`} key={idx}>
                    <Col xs={7} className={isTotal ? "balance-total-label" : "balance-label"}>{label}</Col>
                    <Col xs={5} className={`text-end ${isTotal ? "balance-total-value" : "balance-value"}`}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <hr className="balance-divider" />
                <Row className="balance-row">
                  <Col xs={7} className="balance-total-label">Total Liabilities & Capital</Col>
                  <Col xs={5} className="text-end balance-total-value">
                    {totalLiabilitiesAndCapital.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <div className="balance-sheet-info mt-4">
        Balance Sheet shows your business's financial position on a specific date by listing all assets, liabilities, and owner's capital, ensuring that Assets = Liabilities + Capital.
      </div>
    </div>
  );
};

export default BalanceSheet;
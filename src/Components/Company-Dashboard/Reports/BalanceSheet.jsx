import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import BaseUrl from "../../../Api/BaseUrl";

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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger py-5">
        <h5>{error}</h5>
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
    <div >
      <Container fluid className="py-4">
        <div className="text-center mb-2" style={{ fontSize: 36, color: "#002d4d", fontWeight: 500 }}>
          Balance Sheet
        </div>
        <div className="text-center mb-4" style={{ color: "#6c757d", fontSize: 18 }}>
          As on {new Date().toLocaleDateString()}
        </div>

        <Row className="g-4 justify-content-center">
          {/* Assets */}
          <Col xs={12} md={6}>
            <Card style={{ borderRadius: 12, backgroundColor: "#fff", border: "1px solid #dee2e6" }}>
              <Card.Body>
                <Row className="align-items-center mb-3">
                  <Col xs={6} style={{ fontWeight: 500, fontSize: 24, color: "#000" }}>
                    ASSETS
                  </Col>
                  <Col xs={6} className="text-end">
                    <Link to="/company/balancesheet/asstedetails" style={{ textDecoration: "none" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        style={{
                          backgroundColor: "#53b2a5",
                          borderColor: "#53b2a5",
                          padding: "6px 12px",
                          fontSize: "14px",
                          fontWeight: 500,
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        View All Asset Details
                      </Button>
                    </Link>
                  </Col>
                </Row>

                <div style={{ color: "#002d4d", fontWeight: 400, fontSize: 16, marginBottom: 8 }}>
                  Current Assets
                </div>
                {[
                  ["Cash", assets.cash],
                  ["Bank", assets.bank],
                  ["Stock", assets.stock],
                  ["Accounts Receivable", assets.accountsReceivable],
                  ["Total Current Assets", assets.totalCurrentAssets, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className="mb-2" key={idx}>
                    <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>
                      {label}
                    </Col>
                    <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <div style={{ color: "#002d4d", fontWeight: 500, fontSize: 16, marginTop: 24, marginBottom: 8 }}>
                  Fixed Assets
                </div>
                {[
                  ["Land & Building", assets.landBuilding],
                  ["Plant & Machinery", assets.plantMachinery],
                  ["Furniture & Fixtures", assets.furnitureFixtures],
                  ["Total Fixed Assets", assets.totalFixedAssets, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className="mb-2" key={idx}>
                    <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>
                      {label}
                    </Col>
                    <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <hr className="my-3" />
                <Row>
                  <Col xs={7} style={{ fontWeight: 600, fontSize: 18 }}>Total Assets</Col>
                  <Col xs={5} className="text-end" style={{ fontWeight: 600, fontSize: 18 }}>
                    {assets.totalAssets.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Liabilities & Capital */}
          <Col xs={12} md={6}>
            <Card style={{ borderRadius: 12, backgroundColor: "#fff", border: "1px solid #dee2e6" }}>
              <Card.Body>
                <Row className="align-items-center mb-3">
                  <Col xs={6} style={{ fontWeight: 500, fontSize: 24, color: "#000" }}>
                    LIABILITIES & CAPITAL
                  </Col>
                  <Col xs={6} className="text-end">
                    <Link to="/company/balancesheet/liabilitydetails" style={{ textDecoration: "none" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        style={{
                          backgroundColor: "#53b2a5",
                          borderColor: "#53b2a5",
                          padding: "6px 12px",
                          fontSize: "14px",
                          fontWeight: 500,
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        View All Liability Details
                      </Button>
                    </Link>
                  </Col>
                </Row>

                <div style={{ color: "#002d4d", fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
                  Current Liabilities
                </div>
                {[
                  ["Accounts Payable", liabilities.accountsPayable],
                  ["Short-term Loans", liabilities.shortTermLoans],
                  ["Outstanding Expenses", liabilities.outstandingExpenses],
                  ["Total Current Liabilities", liabilities.totalCurrentLiabilities, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className="mb-2" key={idx}>
                    <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>{label}</Col>
                    <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <div style={{ color: "#002d4d", fontWeight: 600, fontSize: 16, marginTop: 24, marginBottom: 8 }}>
                  Long-term Liabilities
                </div>
                {[
                  ["Term Loan", liabilities.termLoan],
                  ["Mortgage Loan", liabilities.mortgageLoan],
                  ["Total Long-term Liabilities", liabilities.totalLongTermLiabilities, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className="mb-2" key={idx}>
                    <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>{label}</Col>
                    <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <div style={{ color: "#002d4d", fontWeight: 500, fontSize: 16, marginTop: 24, marginBottom: 8 }}>
                  Owner’s Capital
                </div>
                {[
                  ["Capital", capital.capital],
                  ["Retained Earnings", capital.retainedEarnings],
                  ["Total Owner’s Capital", capital.totalOwnerCapital, true],
                ].map(([label, value, isTotal], idx) => (
                  <Row className="mb-2" key={idx}>
                    <Col xs={7} style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500, color: isTotal ? "#000" : "#6c757d" }}>{label}</Col>
                    <Col xs={5} className="text-end" style={{ fontSize: 16, fontWeight: isTotal ? 600 : 500 }}>
                      {value.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                    </Col>
                  </Row>
                ))}

                <hr className="my-3" />
                <Row>
                  <Col xs={7} style={{ fontWeight: 500, fontSize: 18 }}>Total Liabilities & Capital</Col>
                  <Col xs={5} className="text-end" style={{ fontWeight: 600, fontSize: 18 }}>
                    {totalLiabilitiesAndCapital.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <small className="text-dark px-3">
        Balance Sheet shows your business’s financial position on a specific date by listing all assets, liabilities, and owner’s capital, ensuring that Assets = Liabilities + Capital.
      </small>
    </div>
  );
};

export default BalanceSheet;
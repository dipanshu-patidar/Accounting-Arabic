import React, { useState } from "react";
import { Card, Table, InputGroup, FormControl, Button, Container, Spinner } from "react-bootstrap";
import { FaListAlt, FaSearch, FaDownload, FaShieldAlt } from "react-icons/fa";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import './AuditLogs.css';
const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const companyId = GetCompanyId();
  const logs = [
    {
      id: 1,
      user: "admin@company.com",
      action: "Login Successful",
      timestamp: "2025-11-04 10:30 AM",
      ip: "192.168.0.12",
    },
    {
      id: 2,
      user: "john@company.com",
      action: "Updated financial records",
      timestamp: "2025-11-04 09:15 AM",
      ip: "192.168.0.45",
    },
    {
      id: 3,
      user: "sara@company.com",
      action: "Accessed Payroll Data",
      timestamp: "2025-11-03 04:10 PM",
      ip: "192.168.0.21",
    },
    {
      id: 4,
      user: "admin@company.com",
      action: "Created new user account",
      timestamp: "2025-11-03 03:25 PM",
      ip: "192.168.0.12",
    },
  ];

  const filteredLogs = logs.filter(
    (log) =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const csv = logs
      .map(
        (l) =>
          `${l.id},"${l.user}","${l.action}",${l.timestamp},${l.ip}`
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "audit_logs.csv";
    link.click();
  };

  return (
    <Container fluid className="p-4 audit-logs-container">
      {/* Header Section */}
      <div className="mb-4">
        <h3 className="audit-logs-title">
          <i className="fas fa-list-alt me-2"></i>
          Audit Logs
        </h3>
        <p className="audit-logs-subtitle">
          Monitor and track all system activities and user actions
        </p>
      </div>

      {/* Filter Card */}
      <Card className="filter-card">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <InputGroup className="search-input-group">
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <FormControl
              placeholder="Search user or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Button
            onClick={handleExport}
            className="btn-export"
          >
            <FaDownload /> Export
          </Button>
        </div>
      </Card>

      {/* Security Info Banner */}
      <div className="security-banner">
        <FaShieldAlt />
        <p>
          All actions are securely logged and encrypted. Access restricted to
          authorized users only.
        </p>
      </div>

      {/* Table Card */}
      <Card className="audit-logs-table-card border-0 shadow-lg">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover responsive className="audit-logs-table">
              <thead className="table-header">
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      <div className="empty-state">
                        <i className="fas fa-search"></i>
                        <p>No matching records found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td className="user-cell">{log.user}</td>
                      <td className="action-cell">{log.action}</td>
                      <td className="timestamp-cell">{log.timestamp}</td>
                      <td className="ip-cell">{log.ip}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AuditLogs;

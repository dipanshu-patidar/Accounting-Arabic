import React, { useState } from "react";
import { Card, Table, InputGroup, FormControl, Button } from "react-bootstrap";
import { FaListAlt, FaSearch, FaDownload, FaShieldAlt } from "react-icons/fa";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
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
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: "#f0f7f8" }}
    >
      <Card
        className="shadow-lg rounded-2xl p-4 border-0"
        style={{
          backgroundColor: "#e6f3f5",
          borderLeft: `6px solid #2a8e9c`,
        }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <h2
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "#023347" }}
          >
            <FaListAlt className="text-2xl" style={{ color: "#2a8e9c" }} />
            Audit Logs
          </h2>

          {/* Search bar */}
          <div className="flex flex-col md:flex-row gap-2 items-center">
            <InputGroup className="w-full md:w-64">
              <InputGroup.Text
                style={{
                  backgroundColor: "#2a8e9c",
                  color: "white",
                  border: "none",
                }}
              >
                <FaSearch />
              </InputGroup.Text>
              <FormControl
                placeholder="Search user or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "1px solid #2a8e9c",
                }}
              />
            </InputGroup>

            <Button
              onClick={handleExport}
              className="d-flex align-items-center justify-content-center gap-2"
              style={{
                backgroundColor: "#2a8e9c",
                border: "none",
                fontWeight: 600,
              }}
            >
              <FaDownload /> Export
            </Button>
          </div>
        </div>

        {/* Security Info Banner */}
        <div
          className="rounded-xl p-3 mb-4 flex items-center gap-3 text-sm"
          style={{
            backgroundColor: "#023347",
            color: "white",
          }}
        >
          <FaShieldAlt className="text-lg" />
          <p className="m-0">
            All actions are securely logged and encrypted. Access restricted to
            authorized users only.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table
            bordered
            hover
            responsive
            className="text-sm rounded-lg"
            style={{ backgroundColor: "#f0f7f8" }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Timestamp</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="text-center hover:bg-[#e6f3f5] transition-all"
                  >
                    <td>{log.id}</td>
                    <td className="font-semibold">{log.user}</td>
                    <td>{log.action}</td>
                    <td>{log.timestamp}</td>
                    <td>{log.ip}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-3">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogs;

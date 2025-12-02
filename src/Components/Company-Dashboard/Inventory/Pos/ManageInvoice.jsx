import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEye, FaPenSquare, FaTrash } from "react-icons/fa";

// Dummy invoice data
const dummyInvoices = [
  {
    _id: "1",
    invoiceNumber: "INV-1001",
    created_at: new Date().toISOString(),
    total: 250,
    customer_id: {
      first_name: "Amit",
      last_name: "Sharma",
      email: "amit@example.com",
    },
  },
  {
    _id: "2",
    invoiceNumber: "INV-1002",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    total: 180,
    customer_id: {
      first_name: "Neha",
      last_name: "Verma",
      email: "neha@example.com",
    },
  },
  {
    _id: "3",
    invoiceNumber: "INV-1003",
    created_at: new Date().toISOString(),
    total: 320,
    customer_id: {
      first_name: "Rahul",
      last_name: "Kumar",
      email: "rahul@example.com",
    },
  },
];

const ManageInvoices = () => {
  const [invoices, setInvoices] = useState(dummyInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const invoicesPerPage = 5;

  const formatDateAEST = (date) => {
    return new Date(
      new Date(date).toLocaleString("en-US", { timeZone: "Australia/Sydney" })
    )
      .toISOString()
      .split("T")[0];
  };

  const todayAEST = formatDateAEST(new Date());
  const yesterdayAEST = formatDateAEST(
    new Date(new Date().setDate(new Date().getDate() - 1))
  );

  const filteredInvoices = invoices.filter((invoice) => {
    const customer = invoice.customer_id;
    const createdDateAEST = formatDateAEST(invoice.created_at);

    const matchesSearch =
      !searchTerm ||
      (customer &&
        (customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesSelectedDate = !selectedDate || createdDateAEST === selectedDate;

    const matchesDayFilter =
      dayFilter === "all" ||
      (dayFilter === "today" && createdDateAEST === todayAEST) ||
      (dayFilter === "yesterday" && createdDateAEST === yesterdayAEST);

    return matchesSearch && matchesSelectedDate && matchesDayFilter;
  });

  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    }
  };

  return (
    <div  className="mt-3 px-4">
      <div className="shadow p-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h4 className="fw-semibold mb-0">Manage Invoices</h4>

        <Form.Control
          type="text"
          placeholder="Search by customer"
          className="w-auto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="d-flex flex-column">
          <Form.Label className="fw-semibold mb-1">Search by Date</Form.Label>
          <Form.Control
            type="date"
            className="w-auto"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => {
            setSearchTerm("");
            setSelectedDate("");
            setDayFilter("all");
          }}
        >
          Clear Filters
        </Button>
      </div>

      <div className="mt-3 d-flex gap-2 flex-wrap justify-content-center">
        {["all", "today", "yesterday"].map((filter) => (
          <Button
            key={filter}
            size="sm"
            onClick={() => setDayFilter(filter)}
            style={{
              backgroundColor: dayFilter === filter ? "#6ebd95" : "transparent",
              color: dayFilter === filter ? "#fff" : "#6ebd95",
              border: "1px solid #6ebd95",
              fontWeight: 500,
            }}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      <div className="table-responsive mt-2 shadow p-3">
        <table className="table align-middle table-bordered table-striped table-light">
          <thead style={{ whiteSpace: "nowrap" }}>
            <tr>
              <th className="px-3 py-3">#</th>
              <th>Invoice Number</th>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody style={{ whiteSpace: "nowrap" }}>
            {currentInvoices.length > 0 ? (
              currentInvoices.map((invoice, index) => (
                <tr key={invoice._id}>
                  <td className="px-3 py-3">{indexOfFirstInvoice + index + 1}</td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>
                    {invoice.created_at
                      ? new Date(invoice.created_at).toLocaleString("en-AU", {
                          timeZone: "Australia/Sydney",
                        })
                      : "N/A"}
                  </td>
                  <td>
                    {invoice.customer_id.first_name}{" "}
                    {invoice.customer_id.last_name}
                  </td>
                  <td>{invoice.customer_id.email}</td>
                  <td>A${invoice.total}</td>
                  <td>
                    <Link to="/company/viewinvoice">
                      <Button variant="primary" size="sm" className="me-2">
                        <FaEye />
                      </Button>
                    </Link>

                    <Link to="/company/editinvoice">
                      <Button variant="primary" size="sm" className="me-2">
                        <FaPenSquare />
                      </Button>
                    </Link>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(invoice._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <span>
            Showing {indexOfFirstInvoice + 1} -{" "}
            {Math.min(indexOfLastInvoice, filteredInvoices.length)} of{" "}
            {filteredInvoices.length} invoices
          </span>
          <div>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="mx-3">Page {currentPage}</span>
            <Button
              variant="secondary"
              size="sm"
              disabled={indexOfLastInvoice >= filteredInvoices.length}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageInvoices;

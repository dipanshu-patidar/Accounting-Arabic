import React, { useState } from "react";
import {
  FaFilePdf,
  FaFileExcel,
  FaPlusCircle,
  FaDownload,
  FaEye,
  FaEdit,
  FaTrash,
  FaSearch,
  FaComment,
  FaPrint,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const DeliveryChallans = () => {
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteCoupon, setDeleteCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const challans = [
    {
      challanNumber: "DC-2025-001",
      customer: "Sharma Enterprises",
      date: "2025-06-26",
      orderRef: "SO-2025-001",
      status: "Pending",
    },
    {
      challanNumber: "DC-2025-002",
      customer: "Patel Industries",
      date: "2025-06-25",
      orderRef: "SO-2025-002",
      status: "In Transit",
    },
    {
      challanNumber: "DC-2025-003",
      customer: "Kumar Retailers",
      date: "2025-06-24",
      orderRef: "SO-2025-003",
      status: "Delivered",
    },
    {
      challanNumber: "DC-2025-004",
      customer: "Singh Distributors",
      date: "2025-06-23",
      orderRef: "SO-2025-004",
      status: "Delivered",
    },
  ];
  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "badge bg-warning text-dark"; // Yellow for Pending
      case "In Transit":
        return "badge bg-info text-dark";    // Blue for In Transit
      case "Delivered":
        return "badge bg-success";           // Green for Delivered
      default:
        return "badge bg-secondary";         // Grey for other statuses
    }
  };

  const filteredChallans = challans.filter((challan) =>
    Object.values(challan).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Show Edit Modal
  const handleEdit = (coupon) => {
    setEditCoupon(coupon);
  };

  // Show Delete Modal
  const handleDelete = (coupon) => {
    setDeleteCoupon(coupon);
  };

  // Confirm Delete
  const confirmDelete = () => {
    // ...delete logic here (e.g. API call or state update)
    setDeleteCoupon(null);
  };

  return (
    <div className=" bg-light py-2 mt-1 product-header">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-4 mb-4">
        <div>
          <h5 className="fw-bold mb-1">DeliveryChallan</h5>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button className="btn btn-light border text-danger coupon-btn-icon">
            <FaFilePdf />
          </button>
          <button className="btn btn-light border text-success coupon-btn-icon">
            <FaFileExcel />
          </button>
          <button
            className="btn text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: "#3daaaa" }}
            data-bs-toggle="modal"
            data-bs-target="#addCouponModal"
          >
            <FaPlusCircle />
            New Challan
          </button>
          {/* <button className="btn text-white d-flex align-items-center gap-2" style={{ backgroundColor: "#FFA646" }}>
            <FaDownload />
            Import Coupons
          </button> */}
        </div>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-3">
        {/* Search Input - Full width on mobile, auto width on larger screens */}
        <div className="input-group flex-grow-1 flex-md-grow-0" style={{ minWidth: "250px" }}>

          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search"
          />
        </div>

        {/* Dropdowns - Stack vertically on small screens, horizontally on larger ones */}
        <div className="d-flex flex-column flex-sm-row gap-2 flex-grow-1 flex-md-grow-0 w-100 w-md-auto">


          {/* Status Dropdown */}
          <div className="dropdown flex-grow-1 mb-2 mb-sm-0">
            <button
              className="btn text-white border dropdown-toggle w-100"
              type="button"
              id="statusDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ backgroundColor: "#3daaaa", color: "white" }}
            >
              Status
            </button>
            <ul className="dropdown-menu w-100" aria-labelledby="statusDropdown">
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  style={{ color: "#3daaaa" }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#3daaaa";
                    e.target.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "";
                    e.target.style.color = "#3daaaa";
                  }}
                >
                  Active
                </a>
              </li>
              <li>
                <a
                  className="dropdown-item"
                  href="#"
                  style={{ color: "#3daaaa" }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#3daaaa";
                    e.target.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "";
                    e.target.style.color = "#3daaaa";
                  }}
                >
                  Inactive
                </a>
              </li>
            </ul>
          </div>

          {/* Sort By Dropdown */}
          <div className="dropdown flex-grow-1 mb-2 mb-sm-0">
            <button
              className="btn text-white border dropdown-toggle w-100"
              type="button"
              id="sortDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ backgroundColor: "#3daaaa", color: "white" }}
              >
                Sort By: Last 7 Days
            </button>
            <ul className="dropdown-menu w-100" aria-labelledby="sortDropdown">
              {["Recently Added", "Ascending", "Desending", "Last Month", "Last 7 days"].map((item, index) => (
                <li key={index}>
                  <a
                    className="dropdown-item"
                    href="#"
                    style={{ color: "#3daaaa" }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#3daaaa";
                      e.target.style.color = "white";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "";
                      e.target.style.color = "#3daaaa";
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered align-middle mb-0">
          <thead className="table-light text-white">
            <tr>
              <th className="py-3">Challan #</th>
              <th className="py-3">Customer</th>
              <th className="py-3">Date</th>
              <th className="py-3">Order Ref</th>
              <th className="py-3">Status</th>
              <th className="py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredChallans.map((challan, idx) => (
              <tr key={idx}>
                <td>{challan.challanNumber}</td>
                <td>{challan.customer}</td>
                <td>{challan.date}</td>
                <td>{challan.orderRef}</td>
                <td>
                  <span className={getStatusBadge(challan.status)}>
                    {challan.status}
                  </span>
                </td>
                <td className="d-flex justify-content-center gap-1">
                  <button
                    className="btn outlin-info btn-sm  text-info"
                    data-bs-toggle="modal"
                    data-bs-target="#couponDetailModal"
                    onClick={() => setSelectedCoupon(challan)}
                  >
                    <FaEye size={16} />
                  </button>
                  <button
                    className="btn outlin-warning btn-sm text-warning"
                  //   data-bs-toggle="modal"
                  //   data-bs-target="#editCouponModal"
                  //   onClick={() => handleEdit(coupon)}
                  >
                    <FaPrint size={16} />
                  </button>
                  <button
                    className="btn outline-danger btn-sm text-danger"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteCouponModal"
                  //   onClick={() => handleDelete(coupon)}
                  >
                    <FaTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      <div className="d-flex justify-content-between align-items-center mt-3 px-3">
        <span className="small text-muted">Showing 1 to 5 of 10 results</span>
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className="page-item disabled">
              <button className="page-link rounded-start">&laquo;</button>
            </li>
            <li className="page-item active">
              <button
                className="page-link"
                style={{ backgroundColor: '#3daaaa', borderColor: '#3daaaa' }}
              >
                1
              </button>
            </li>
            <li className="page-item">
              <button className="page-link">2</button>
            </li>
            <li className="page-item">
              <button className="page-link rounded-end">&raquo;</button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Add Delivery Challan Modal */}
      <div
        className="modal fade"
        id="addCouponModal"
        tabIndex="-1"
        aria-labelledby="addCouponModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold" id="addCouponModalLabel">
                Create New Delivery Challan
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Challan Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="DC-YYYY-XXX"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Customer <span className="text-danger">*</span>
                    </label>
                    <select className="form-select" required>
                      <option value="">Select Customer</option>
                      <option value="Sharma Enterprises">Sharma Enterprises</option>
                      <option value="Patel Industries">Patel Industries</option>
                      <option value="Kumar Retailers">Kumar Retailers</option>
                      <option value="Singh Distributors">Singh Distributors</option>
                    </select>
                  </div>
                  {/* <div className="col-md-6">
              <label className="form-label fw-semibold">
                Order Reference <span className="text-danger">*</span>
              </label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="SO-YYYY-XXX"
                required
              />
            </div> */}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Delivery Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter delivery address"
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Items <span className="text-danger">*</span>
                  </label>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Quantity</th>
                          <th>Unit</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <input type="text" className="form-control" placeholder="Item name" required />
                          </td>
                          <td>
                            <input type="number" className="form-control" placeholder="Qty" required />
                          </td>
                          <td>
                            <select className="form-select" required>
                              <option value="">Select</option>
                              <option value="PCS">PCS</option>
                              <option value="KG">KG</option>
                              <option value="LTR">LTR</option>
                              <option value="BOX">BOX</option>
                            </select>
                          </td>
                          <td>
                            <button type="button" className="btn btn-danger btn-sm">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <button type="button" className="btn btn-sm btn-primary " style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}>
                      + Add Item
                    </button>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Delivery Vehicle <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Vehicle number"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Driver Details <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Driver name & contact"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Notes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Additional notes (optional)"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select className="form-select" defaultValue="Pending">
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-warning text-white px-4"
                    style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
                  >
                    Create Challan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Delivery Challan Details Modal */}
      <div
        className="modal fade"
        id="couponDetailModal"
        tabIndex="-1"
        aria-labelledby="couponDetailModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="couponDetailModalLabel">
                Delivery Challan Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setSelectedCoupon(null)}
              ></button>
            </div>
            <div className="modal-body">
              {selectedCoupon && (
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-semibold">Challan Number</td>
                        <td>{selectedCoupon.challanNumber}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Customer</td>
                        <td>{selectedCoupon.customer}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Date</td>
                        <td>{selectedCoupon.date}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Order Reference</td>
                        <td>{selectedCoupon.orderRef}</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Status</td>
                        <td>
                          <span className={getStatusBadge(selectedCoupon.status)}>
                            {selectedCoupon.status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Delivery Address</td>
                        <td>123 Main Street, Mumbai, India</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Items</td>
                        <td>
                          <table className="table table-bordered">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Unit</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>Product A</td>
                                <td>10</td>
                                <td>PCS</td>
                              </tr>
                              <tr>
                                <td>Product B</td>
                                <td>5</td>
                                <td>BOX</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Delivery Vehicle</td>
                        <td>MH01 AB 1234</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Driver Details</td>
                        <td>Rajesh Kumar (9876543210)</td>
                      </tr>
                      <tr>
                        <td className="fw-semibold">Notes</td>
                        <td>Fragile items, handle with care</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
              >
                Print Challan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Coupon Modal */}
      <div
        className="modal fade"
        id="editCouponModal"
        tabIndex="-1"
        aria-labelledby="editCouponModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold" id="editCouponModalLabel">
                Edit Coupon
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setEditCoupon(null)}
              ></button>
            </div>
            <div className="modal-body">
              {editCoupon && (
                <form>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Coupon Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={editCoupon.name}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Coupon Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      defaultValue={editCoupon.code}
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Type <span className="text-danger">*</span>
                      </label>
                      <select className="form-select" defaultValue={editCoupon.type}>
                        <option>Percentage</option>
                        <option>Fixed Amount</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Discount <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={editCoupon.discount.replace('%', '')}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Limit <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={editCoupon.limit}
                      placeholder="Enter 0 for Unlimited"
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Start Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        defaultValue="2024-12-31"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        End Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        defaultValue="2025-01-04"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Product <span className="text-danger">*</span>
                    </label>
                    <select className="form-select mb-2" defaultValue="All">
                      <option>All</option>
                      <option>Specific Products</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      defaultValue={editCoupon.description}
                      maxLength="300"
                    ></textarea>
                    <div className="d-flex justify-content-between mt-1">
                      <div>
                        <button type="button" className="btn btn-sm btn-light me-1">
                          <strong>B</strong>
                        </button>
                        <button type="button" className="btn btn-sm btn-light">
                          <em>U</em>
                        </button>
                      </div>
                      <small className="text-muted">Nunito *</small>
                    </div>
                    <small className="text-muted">Maximum 60 Words</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Status</label>
                    <select className="form-select" defaultValue={editCoupon.status}>
                      <option>Active</option>
                      <option>Better</option>
                      <option>Expired</option>
                    </select>
                  </div>

                  <div className="d-flex justify-content-end gap-3 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning text-white px-4"
                      style={{ backgroundColor: "#FFA646" }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Coupon Modal */}
      <div
        className="modal fade"
        id="deleteCouponModal"
        tabIndex="-1"
        aria-labelledby="deleteCouponModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0" style={{ borderRadius: 16 }}>
            <div className="modal-body text-center py-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 70,
                  height: 70,
                  background: "#FFF5F2",
                  borderRadius: "50%",
                }}
              >
                <FaTrash size={32} color="#F04438" />
              </div>
              <h4 className="fw-bold mb-2">Delete Challan</h4>
              <p className="mb-4" style={{ color: "#555", fontSize: "1.08rem" }}>
                Are you sure you want to delete this Challan?
              </p>
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn btn-dark px-4 py-2"
                  data-bs-dismiss="modal"
                  onClick={() => setDeleteCoupon(null)}
                >
                  No, Cancel
                </button>
                <button
                  className="btn"
                  style={{ background: "#FFA646", color: "#fff", fontWeight: 600, padding: "0.5rem 2rem" }}
                  data-bs-dismiss="modal"
                  onClick={confirmDelete}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallans;
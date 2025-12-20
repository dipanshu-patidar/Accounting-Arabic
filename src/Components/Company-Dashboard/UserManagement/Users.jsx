import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Modal,
  Badge,
} from "react-bootstrap";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFilePdf, FaEdit, FaTrash, FaPlus, FaFilter, FaTimes, FaKey } from "react-icons/fa";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";

const emptyUser = {
  id: null,
  name: "",
  phone: "",
  email: "",
  role: "",
  user_role: "",
  status: "Active",
  img: "",
  password: "",
  confirmPassword: "",
  company_id: null,
};

const statusBadge = (status) => {
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  return (
    <Badge
      style={{
        background: normalized === "Active" ? "#27ae60" : "#e74c3c",
        color: "#fff",
        fontWeight: 500,
        fontSize: 15,
        borderRadius: 8,
        padding: "5px 18px",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#fff",
          marginRight: 6,
        }}
      ></span>
      {normalized}
    </Badge>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [form, setForm] = useState(emptyUser);
  const [previewImg, setPreviewImg] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showResetModal, setShowResetModal] = useState(false);
  const [userToReset, setUserToReset] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showFilters, setShowFilters] = useState(true);
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterPhone, setFilterPhone] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole, setFilterRole] = useState("All");

  const companyId = GetCompanyId();
  const blobUrlRef = useRef(null); // Track blob URLs for cleanup
  const isCleaningUpRef = useRef(false); // Prevent multiple cleanup calls
  const modalKeyRef = useRef(0); // Force modal remount

  // Fetch roles dynamically
  useEffect(() => {
    const fetchRoles = async () => {
      if (!companyId) return;

      try {
        const response = await axiosInstance.get(`/user-roles?company_id=${companyId}`);
        if (response.data.success && Array.isArray(response.data.data)) {
          setRoles(response.data.data);
        }
      } catch (err) {
        console.error("Fetch Roles Error:", err);
      }
    };

    fetchRoles();
  }, [companyId]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyId) {
        setError("Company ID not found.");
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(`/auth/User/company/${companyId}`);

        if (response.data.success && Array.isArray(response.data.data)) {
          const companyUsers = response.data.data.map(user => {
            const roleId = user.user_role?.toString() || "17"; // Default to staff role ID
            const roleObj = roles.find(r => r.role_id.toString() === roleId);
            const roleName = roleObj ? roleObj.role_name : "staff";

            return {
              id: user.id,
              name: user.name,
              phone: user.phone,
              email: user.email,
              role: roleName,
              user_role: roleId,
              status: user.UserStatus || user.status || "Active",
              img: user.profile || "",
              company_id: user.company_id,
            };
          });

          setUsers(companyUsers);
        } else {
          setError("Unexpected API response format.");
        }
      } catch (err) {
        console.error("Fetch Users Error:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (roles.length > 0) {
      fetchUsers();
    }
  }, [companyId, roles]);

  const uniqueRoles = ["All", ...new Set(roles.map(role => role.role_name))];

  const filtered = users.filter((u) => {
    const toLower = (str) => (str == null ? '' : String(str).toLowerCase());

    const searchLower = toLower(search);
    const filterNameLower = toLower(filterName);
    const filterEmailLower = toLower(filterEmail);
    const filterPhoneLower = toLower(filterPhone);
    const filterStatusLower = toLower(filterStatus);

    const uName = toLower(u.name);
    const uPhone = toLower(u.phone);
    const uEmail = toLower(u.email);
    const uRole = toLower(u.role);
    const uStatus = toLower(u.status);

    const matchesSearch =
      uName.includes(searchLower) ||
      uPhone.includes(searchLower) ||
      uEmail.includes(searchLower) ||
      uRole.includes(searchLower);

    const matchesName = filterName === "" || uName.includes(filterNameLower);
    const matchesEmail = filterEmail === "" || uEmail.includes(filterEmailLower);
    const matchesPhone = filterPhone === "" || uPhone.includes(filterPhoneLower);
    const matchesStatus = filterStatus === "All" || uStatus === filterStatusLower;
    const matchesRole = filterRole === "All" || u.role === filterRole;

    return matchesSearch && matchesName && matchesEmail && matchesPhone && matchesStatus && matchesRole;
  });

  const handleSave = async () => {
    if (modalType === "add" && form.password !== form.confirmPassword) {
      alert("Password and Confirm Password do not match!");
      return;
    }

    const formData = new FormData();
    formData.append('company_id', companyId);
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('user_role', form.user_role);
    formData.append('status', form.status);

    if (modalType === "add") {
      formData.append('password', form.password);
    }

    if (previewImg && previewImg.startsWith('blob:')) {
      const response = await fetch(previewImg);
      const blob = await response.blob();
      formData.append('profile', blob, 'profile.jpg');
    }

    try {
      let response;
      if (modalType === "add") {
        response = await axiosInstance.post('/auth/User', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const newUser = {
          ...form,
          id: response.data.id || Date.now(),
          img: previewImg,
          company_id: companyId,
          role: roles.find(r => r.role_id.toString() === form.user_role)?.role_name || "staff"
        };
        setUsers(prev => [...prev, newUser]);
        alert('User created successfully!');
      } else if (modalType === "edit") {
        response = await axiosInstance.put(`/auth/User/${form.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const updatedRoleName = roles.find(r => r.role_id.toString() === form.user_role)?.role_name || "staff";
        setUsers(prev =>
          prev.map(u =>
            u.id === form.id
              ? { ...form, img: previewImg, company_id: companyId, role: updatedRoleName }
              : u
          )
        );
        alert('User updated successfully!');
      }
      // Clean up blob URL after successful save
      if (blobUrlRef.current) {
        try {
          URL.revokeObjectURL(blobUrlRef.current);
        } catch (err) {
          // Silently handle
        }
        blobUrlRef.current = null;
      }
      setShowModal(false);
      setForm({ ...emptyUser, company_id: companyId });
      setPreviewImg("");
    } catch (err) {
      console.error('Save Error:', err);
      const msg = err.response?.data?.message || 'Operation failed. Please try again.';
      alert(msg);
    }
  };


  const handleEdit = (user) => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Clean up any existing blob URL before opening
    if (blobUrlRef.current) {
      try {
        URL.revokeObjectURL(blobUrlRef.current);
      } catch (err) {
        // Silently handle
      }
      blobUrlRef.current = null;
    }
    // Force modal remount
    modalKeyRef.current += 1;
    setForm({
      ...user,
      user_role: user.user_role?.toString() || "",
      confirmPassword: "",
      company_id: user.company_id || companyId,
    });
    setPreviewImg(user.img || "");
    setModalType("edit");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    // Prevent multiple calls
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    
    // Store blob URL reference before closing
    const currentBlobUrl = blobUrlRef.current;
    
    // Close modal immediately
    setShowModal(false);
    
    // Clean up blob URL immediately (synchronously) to prevent memory leak
    if (currentBlobUrl) {
      try {
        URL.revokeObjectURL(currentBlobUrl);
      } catch (err) {
        // Silently handle
      }
      blobUrlRef.current = null;
    }
    
    // Force modal remount on next open
    modalKeyRef.current += 1;
  };

  // Handle modal exit - cleanup after animation
  const handleModalExited = () => {
    // Reset form state after modal fully closed
    setForm({ ...emptyUser, company_id: companyId });
    setPreviewImg("");
    isCleaningUpRef.current = false;
  };

  const handleAdd = () => {
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    
    // Clean up any existing blob URL before opening
    if (blobUrlRef.current) {
      try {
        URL.revokeObjectURL(blobUrlRef.current);
      } catch (err) {
        // Silently handle
      }
      blobUrlRef.current = null;
    }
    // Force modal remount
    modalKeyRef.current += 1;
    setForm({ ...emptyUser, company_id: companyId });
    setPreviewImg("");
    setModalType("add");
    setShowModal(true);
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/auth/User/${userToDelete.id}`, {
        params: { company_id: companyId }
      });
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      alert('User deleted successfully!');
    } catch (err) {
      console.error('Delete Error:', err);
      const msg = err.response?.data?.message || 'Failed to delete user. Please try again.';
      alert(msg);
    }
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handlePDF = () => {
    const doc = new jsPDF();
    doc.text("Users", 14, 16);
    doc.autoTable({
      startY: 22,
      head: [["User Name", "Phone", "Email", "Role", "Status"]],
      body: filtered.map((u) => [
        u.name,
        u.phone,
        u.email,
        u.role,
        u.status,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [245, 246, 250], textColor: 60 },
    });
    doc.save("users.pdf");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke previous blob URL if exists to prevent memory leak
      if (blobUrlRef.current) {
        try {
          URL.revokeObjectURL(blobUrlRef.current);
        } catch (err) {
          // Silently handle - blob might already be revoked
        }
      }
      const imageUrl = URL.createObjectURL(file);
      blobUrlRef.current = imageUrl; // Track the blob URL
      setPreviewImg(imageUrl);
    }
  };

  const clearFilters = () => {
    setFilterName("");
    setFilterEmail("");
    setFilterPhone("");
    setFilterStatus("All");
    setFilterRole("All");
  };

  const openResetModal = (user) => {
    setUserToReset(user);
    setNewPassword("");
    setConfirmNewPassword("");
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("New Password and Confirm Password do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    if (!userToReset?.id) {
      alert("Invalid user selected.");
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/password/requests/${userToReset.id}/approve`,
        {
          new_password: newPassword,
        }
      );

      if (response.data.success) {
        setShowResetModal(false);
        alert(`Password for ${userToReset.name} has been reset successfully!`);
      } else {
        alert(response.data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      const msg = err.response?.data?.message || "Failed to reset password. Please try again.";
      alert(msg);
    }
  };

  return (
    <div className="p-3">
      <div className="">
        <h3 className="fw-bold">Users</h3>
        <p className="text-muted mb-4">Manage your users</p>

        <Row className="g-2 mb-3 align-items-center">
          <Col xs={12} md={6}>
            <Form.Control
              placeholder="Search by name, email, phone, or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-md-end justify-content-start gap-2">
            <Button
              className="d-flex align-items-center"
              style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
              onClick={handleAdd}
            >
              <FaPlus className="me-2" />
              Add User
            </Button>
          </Col>
        </Row>

        {showFilters && (
          <Card className="mb-4 border">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Filter Users</h5>
                <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
                  <FaTimes className="me-1" /> Clear All
                </Button>
              </div>

              <Row className="g-3">
                <Col xs={12} md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      placeholder="Filter by name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      placeholder="Filter by email"
                      value={filterEmail}
                      onChange={(e) => setFilterEmail(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      placeholder="Filter by phone"
                      value={filterPhone}
                      onChange={(e) => setFilterPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col xs={12} md={6} lg={3}>
                  <Form.Group>
                    <Form.Label>Role</Form.Label>
                    <Form.Select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      {uniqueRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Card className="mb-4">
          <Card.Body style={{ padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <Table responsive className="align-middle mb-0" style={{ fontSize: 16 }}>
                <thead className="">
                  <tr>
                    <th className="py-3">#</th>
                    <th className="py-3">User Name</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Email</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Status</th>
                    <th className="py-3" style={{ minWidth: 180 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <Form.Check type="checkbox" />
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#eee",
                              }}
                            >
                              {user.img ? (
                                <img
                                  src={user.img.trim()}
                                  alt={user.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <span className="text-muted">No Img</span>
                              )}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </td>
                        <td>{user.phone}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{statusBadge(user.status)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="outline-secondary" size="sm" onClick={() => handleEdit(user)}>
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-secondary" size="sm"
                              onClick={() => openResetModal(user)}
                              title="Reset Password"
                            >
                              <FaKey />
                            </Button>
                            <Button variant="outline-secondary" size="sm" onClick={() => confirmDelete(user)}>
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center text-muted">
                        No users found for your company.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        key={modalKeyRef.current}
        show={showModal} 
        onHide={handleCloseModal}
        onExited={handleModalExited}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{modalType === "add" ? "Add User" : "Edit User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>User Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={form.user_role || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedRole = roles.find(r => r.role_id.toString() === selectedId.toString());
                  setForm({
                    ...form,
                    user_role: selectedId,
                    role: selectedRole ? selectedRole.role_name : ""
                  });
                }}
                required
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id.toString()}>
                    {role.role_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </Form.Group>

            {modalType === "add" && (
              <>
                <Form.Group className="mb-2">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    required
                  />
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Image Preview</Form.Label>
              {previewImg ? (
                <div className="mb-2">
                  <img src={previewImg} alt="preview" style={{ height: 60, borderRadius: 6 }} />
                </div>
              ) : (
                <div className="text-muted small mb-2">No Image</div>
              )}
              <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
              <Form.Text muted>Upload to replace image</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={
              !form.name ||
              !form.email ||
              !form.phone ||
              !form.user_role ||
              (modalType === "add" && (!form.password || !form.confirmPassword))
            }
            style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{userToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Yes, Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Reset password for <strong>{userToReset?.name}</strong></p>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleResetPassword}
            disabled={!newPassword || !confirmNewPassword}
            style={{ backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
          >
            Reset Password
          </Button>
        </Modal.Footer>
      </Modal>

      <p className="text-muted text-center mt-2">
        This page allows you to manage user records with add, edit, delete, search, filters, and PDF export functionality.
      </p>
    </div>
  );
};

export default Users;
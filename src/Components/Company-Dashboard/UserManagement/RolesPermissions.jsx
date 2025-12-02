import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaUsers,
  FaEye,
} from "react-icons/fa";
import GetCompanyId from "../../../Api/GetCompanyId";
import axios from "axios";
import BaseUrl from "../../../Api/BaseUrl";

// All available general permissions
const allPermissions = ["View", "Create", "Edit", "Full Access"];
const tallyModules = [
  { name: "Account", permissions: ["Create", "View", "Update", "Delete"] },
  { name: "Inventory", permissions: ["Create", "View", "Update", "Delete"] },
  { name: "POS", permissions: ["Create", "View", "Update", "Delete"] },
  { name: "Sales", permissions: ["Create", "View", "Update", "Delete"] },
  { name: "Purchase", permissions: ["Create", "View", "Update", "Delete"] },
  { name: "GST", permissions: ["Create", "View", "Update", "Delete"] },
  { name: "User Management", permissions: ["Create", "View", "Update", "Delete"] },
  { name: "Report", permissions: ["View"] },
  { name: "Setting", permissions: ["View", "Update"] }
];

const RolesPermissions = () => {
  const companyId = GetCompanyId();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", permissions: [], type: "user", modulePermissions: {} });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Custom Role Types
  const [customRoleTypes, setCustomRoleTypes] = useState([]);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newRoleType, setNewRoleType] = useState("");
  const [isAddingType, setIsAddingType] = useState(false);
  const [typeError, setTypeError] = useState("");

  // ✅ TOAST NOTIFICATION STATE
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Load custom role types from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customRoleTypes");
    if (saved) {
      setCustomRoleTypes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (customRoleTypes.length > 0) {
      localStorage.setItem("customRoleTypes", JSON.stringify(customRoleTypes));
    }
  }, [customRoleTypes]);

  // ✅ FETCH ROLES FUNCTION
  const fetchRoles = async () => {
    if (!companyId) {
      setError("Company ID not found.");
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${BaseUrl}user-roles?company_id=${companyId}`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        const mappedRoles = response.data.data.map(role => {
          let generalPerms = [];
          try {
            // Backend sends general_permissions as JSON string
            const parsed = JSON.parse(role.general_permissions || "[]");
            generalPerms = parsed.map(p => {
              // Normalize to match UI options
              if (p.toLowerCase() === "full access" || p.toLowerCase() === "full_access") {
                return "Full Access";
              }
              return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
            });
          } catch (e) {
            console.warn("Failed to parse general_permissions for role:", role.id);
          }

          const modulePermissions = {};
          tallyModules.forEach(module => {
            const permObj = role.permissions?.find(p => p.module_name === module.name);
            if (permObj) {
              const perms = [];
              if (permObj.full_access) {
                perms.push("Full Access", ...module.permissions);
              } else {
                if (permObj.can_create) perms.push("Create");
                if (permObj.can_view) perms.push("View");
                if (permObj.can_update) perms.push("Update");
                if (permObj.can_delete) perms.push("Delete");
              }
              modulePermissions[module.name] = perms;
            } else {
              modulePermissions[module.name] = [];
            }
          });

          return {
            id: role.id,
            name: role.role_name,
            users: 0,
            permissions: generalPerms,
            lastModified: new Date(role.created_at).toISOString().split('T')[0],
            type: "user",
            status: role.status || "Active",
            modulePermissions,
          };
        });
        setRoles(mappedRoles);
      } else {
        setError("Failed to load roles.");
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchRoles();
  }, [companyId]);

  // ✅ PATCH API FOR TOGGLING ROLE STATUS — SEND STRING "Active"/"Inactive"
  const toggleRoleStatus = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    const newStatus = role.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await axios.patch(`${BaseUrl}user-roles/${roleId}/status`, {
        company_id: companyId,
        status: newStatus // ✅ String, not boolean
      });
      if (response.data?.success) {
        setRoles(roles.map(r =>
          r.id === roleId ? { ...r, status: newStatus } : r
        ));
        setToastMessage(`Role marked as ${newStatus} successfully!`);
        setToastVariant("success");
        setShowToast(true);
      } else {
        throw new Error(response.data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating role status:", err);
      setToastMessage("Failed to update role status. Please try again.");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const filteredRoles = roles.filter((role) => {
    const matchesSearch = role.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && role.status === "Active") ||
      (statusFilter === "Inactive" && role.status === "Inactive");
    const roleDate = new Date(role.lastModified);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const matchesDate =
      (!from || roleDate >= from) &&
      (!to || roleDate <= to);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleAdd = () => {
    const initialModulePermissions = {};
    tallyModules.forEach(module => {
      initialModulePermissions[module.name] = [];
    });
    setForm({ name: "", permissions: [], type: "user", modulePermissions: initialModulePermissions });
    setShowAdd(true);
  };

  const handleAddSave = async () => {
    if (!form.name.trim()) {
      setToastMessage("Role name is required.");
      setToastVariant("danger");
      setShowToast(true);
      return;
    }

    try {
      // Build module permissions array for API
      const permissionsPayload = Object.entries(form.modulePermissions || {}).map(([moduleName, perms]) => {
        const set = new Set((perms || []).map(p => p.toLowerCase()));
        return {
          module_name: moduleName,
          can_create: set.has('create'),
          can_view: set.has('view'),
          can_update: set.has('update') || set.has('edit'),
          can_delete: set.has('delete'),
          full_access: set.has('full access') || set.has('full_access')
        };
      });

      // General permissions as array of lowercase strings
      const generalPerms = form.permissions.map(p => 
        p === "Full Access" ? "full access" : p.toLowerCase()
      );

      const response = await axios.post(`${BaseUrl}user-roles`, {
        company_id: companyId,
        role_name: form.name,
        general_permissions: generalPerms,
        permissions: permissionsPayload
      });

      if (response.data?.success) {
        setShowAdd(false);
        setForm({ name: "", permissions: [], type: "user", modulePermissions: {} });
        await fetchRoles();
        setToastMessage("Role created successfully!");
        setToastVariant("success");
        setShowToast(true);
      } else {
        throw new Error(response.data.message || "Failed to create role");
      }
    } catch (error) {
      console.error('API Error:', error);
      setToastMessage('Failed to create role. Please try again.');
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleEdit = (role) => {
    setSelected(role);
    setForm({
      name: role.name,
      permissions: [...role.permissions],
      type: role.type,
      modulePermissions: { ...role.modulePermissions }
    });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    if (!form.name.trim()) {
      setToastMessage("Role name is required.");
      setToastVariant("danger");
      setShowToast(true);
      return;
    }

    try {
      const permissionsPayload = Object.entries(form.modulePermissions || {}).map(([moduleName, perms]) => {
        const set = new Set((perms || []).map(p => p.toLowerCase()));
        return {
          module_name: moduleName,
          can_create: set.has('create'),
          can_view: set.has('view'),
          can_update: set.has('update') || set.has('edit'),
          can_delete: set.has('delete'),
          full_access: set.has('full access') || set.has('full_access')
        };
      });

      const generalPerms = form.permissions.map(p => 
        p === "Full Access" ? "full access" : p.toLowerCase()
      );

      const response = await axios.put(`${BaseUrl}user-roles/${selected.id}`, {
        company_id: companyId,
        role_name: form.name,
        general_permissions: generalPerms,
        permissions: permissionsPayload
      });

      if (response.data?.success) {
        setShowEdit(false);
        await fetchRoles();
        setToastMessage("Role updated successfully!");
        setToastVariant("success");
        setShowToast(true);
      } else {
        throw new Error(response.data.message || "Failed to update role");
      }
    } catch (error) {
      console.error('API Error:', error);
      setToastMessage('Failed to update role. Please try again.');
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleDelete = (role) => {
    setSelected(role);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`${BaseUrl}user-roles/${selected.id}`, {
        params: { company_id: companyId }
      });
      if (response.data?.success) {
        setShowDelete(false);
        await fetchRoles();
        setToastMessage("Role deleted successfully!");
        setToastVariant("success");
        setShowToast(true);
      } else {
        throw new Error(response.data.message || "Failed to delete role");
      }
    } catch (error) {
      console.error('API Error:', error);
      setToastMessage('Failed to delete role. Please try again.');
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  const handleView = (role) => {
    setSelected(role);
    setShowView(true);
  };

  const toggleGeneralPerm = (perm) => {
    if (perm === "Full Access") {
      setForm(f => ({
        ...f,
        permissions: f.permissions.includes("Full Access") ? [] : ["Full Access"]
      }));
    } else {
      setForm(f => {
        const currentPerms = [...f.permissions];
        const fullAccessIndex = currentPerms.indexOf("Full Access");
        if (fullAccessIndex !== -1) {
          return { ...f, permissions: [perm] };
        } else {
          const permIndex = currentPerms.indexOf(perm);
          if (permIndex !== -1) {
            currentPerms.splice(permIndex, 1);
          } else {
            currentPerms.push(perm);
          }
          return { ...f, permissions: currentPerms };
        }
      });
    }
  };

  const toggleModulePerm = (moduleName, perm) => {
    setForm(prevForm => {
      const currentModulePerms = prevForm.modulePermissions[moduleName] || [];
      const permIndex = currentModulePerms.indexOf(perm);
      let newModulePerms = permIndex !== -1
        ? currentModulePerms.filter(p => p !== perm)
        : [...currentModulePerms, perm];
      return {
        ...prevForm,
        modulePermissions: {
          ...prevForm.modulePermissions,
          [moduleName]: newModulePerms
        }
      };
    });
  };

  const toggleModuleFullAccess = (moduleName) => {
    setForm(prevForm => {
      const module = tallyModules.find(m => m.name === moduleName);
      const allModulePerms = module ? module.permissions : [];
      const hasFullAccess = prevForm.modulePermissions[moduleName]?.includes("Full Access");
      return {
        ...prevForm,
        modulePermissions: {
          ...prevForm.modulePermissions,
          [moduleName]: hasFullAccess ? [] : ["Full Access", ...allModulePerms]
        }
      };
    });
  };

  const handleAddRoleType = async () => {
    if (!newRoleType.trim()) {
      setTypeError("Role type name is required");
      return;
    }
    if (customRoleTypes.includes(newRoleType)) {
      setTypeError("This role type already exists");
      return;
    }
    if (!companyId) {
      setTypeError("Company ID not found. Please try again.");
      return;
    }
    setIsAddingType(true);
    setTypeError("");
    try {
      const response = await axios.post(`${BaseUrl}roletype`, {
        type_name: newRoleType,
        company_id: companyId
      });
      if (response.data?.success) {
        setCustomRoleTypes([...customRoleTypes, newRoleType]);
        setNewRoleType("");
        setShowAddTypeModal(false);
        setToastMessage("Role type added successfully!");
        setToastVariant("success");
        setShowToast(true);
      } else {
        setTypeError(response.data?.message || "Failed to add role type");
      }
    } catch (error) {
      console.error("Error adding role type:", error);
      setTypeError("An error occurred while adding the role type. Please try again.");
    } finally {
      setIsAddingType(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 style={{ fontWeight: "600" }}>Roles & Permission</h4>
          <p style={{ marginBottom: 0, color: "#666" }}>Manage your roles</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Button
            style={{ whiteSpace: "nowrap", backgroundColor: "#3daaaa", borderColor: "#3daaaa" }}
            onClick={handleAdd}
          >
            + Add Role
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="">
        <Card.Body>
          {/* Filters */}
          <div className="d-flex flex-wrap gap-3 mb-3 align-items-end">
            <div>
              <Form.Label>Search Role</Form.Label>
              <InputGroup style={{ maxWidth: 300 }}>
                <Form.Control
                  placeholder="Enter role name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </div>
            <div>
              <Form.Label>Status</Form.Label>
              <Form.Select
                style={{ minWidth: 150 }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Form.Select>
            </div>
            <div>
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ minWidth: 140 }}
              />
            </div>
            <div>
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ minWidth: 140 }}
              />
            </div>
            <div>
              <Form.Label>&nbsp;</Form.Label>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Roles Table */}
          <div style={{ overflowX: "auto" }}>
            <Table responsive style={{ minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th><Form.Check /></th>
                  <th>Role</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th style={{ minWidth: 150 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td><Form.Check /></td>
                    <td>{role.name}</td>
                    <td>{role.lastModified}</td>
                    <td>
                      <span
                        style={{
                          background: role.status === "Active" ? "#27ae60" : "#e74c3c",
                          color: "#fff",
                          padding: "4px 14px",
                          borderRadius: 20,
                          fontSize: 14,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                          transition: "background-color 0.3s ease"
                        }}
                        onClick={() => toggleRoleStatus(role.id)}
                        title={`Click to mark as ${role.status === "Active" ? "Inactive" : "Active"}`}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            background: "#fff",
                            borderRadius: "50%",
                          }}
                        ></span>
                        {role.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          title="View Details"
                          onClick={() => handleView(role)}
                        >
                          <FaEye size={14} />
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          title="Edit"
                          onClick={() => handleEdit(role)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDelete(role)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Modals */}
      {/* Delete Confirmation Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the role <b>{selected?.name}</b>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Role Details Modal */}
      <Modal show={showView} onHide={() => setShowView(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Role Details: {selected?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px", maxHeight: '70vh', overflowY: 'auto' }}>
          {selected && (
            <>
              <div className="mb-3">
                <h6>General Information</h6>
                <p><strong>Name:</strong> {selected.name}</p>
                <p><strong>Last Modified:</strong> {selected.lastModified}</p>
                <p><strong>Number of Users:</strong> {selected.users}</p>
                <p><strong>Status:</strong>
                  <span className={`badge ${selected.status === 'Active' ? 'bg-success' : 'bg-danger'} ms-2`}>
                    {selected.status}
                  </span>
                </p>
              </div>
              <div className="mb-3">
                <h6>General Permissions</h6>
                {selected.permissions && selected.permissions.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {selected.permissions.map((perm, idx) => (
                      <span
                        key={idx}
                        className="badge"
                        style={{
                          backgroundColor: perm === "Full Access" ? "#ffe6c7" : "#f5f0eb",
                          color: perm === "Full Access" ? "#FFA94D" : "#b47b3a",
                          fontWeight: perm === "Full Access" ? 600 : 500
                        }}
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No general permissions assigned.</p>
                )}
              </div>
              <div>
                <h6>Module Permissions</h6>
                {selected.modulePermissions ? (
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Module</th>
                          <th>Permissions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selected.modulePermissions).map(([moduleName, perms]) => (
                          <tr key={moduleName}>
                            <td><strong>{moduleName}</strong></td>
                            <td>
                              {perms && perms.length > 0 ? (
                                <div className="d-flex flex-wrap gap-1">
                                  {perms.map((perm, idx) => (
                                    <span key={idx} className="badge me-1 bg-primary">
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted">No permissions</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-muted">No module permissions defined.</p>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowView(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Role Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Add Role</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px", maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Role Name *</Form.Label>
              <Form.Control
                placeholder="Enter role name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>General Permissions</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {allPermissions.map((perm) => {
                  const isActive = form.permissions.includes(perm);
                  return (
                    <Button
                      key={perm}
                      variant={isActive ? "warning" : "outline-warning"}
                      style={{
                        background: isActive ? "#53b2a5" : "#fff",
                        color: isActive ? "#fff" : "#53b2a5",
                        borderColor: "#53b2a5",
                        fontWeight: 500,
                        borderRadius: 8,
                        fontSize: 15,
                        padding: "3px 18px",
                      }}
                      onClick={() => toggleGeneralPerm(perm)}
                    >
                      {perm}
                    </Button>
                  );
                })}
              </div>
            </Form.Group>
            <div className="mb-3">
              <h6 className="fw-semibold mb-3" style={{ fontSize: 14 }}>
                Assign Module Permissions to Role
              </h6>
              <div style={{ border: "1px solid #dee2e6", borderRadius: "0.375rem" }}>
                <Table responsive="sm" size="sm" style={{ fontSize: 13, marginBottom: 0 }}>
                  <thead style={{ background: "#f8f9fa" }}>
                    <tr>
                      <th style={{ width: 40, border: "none", padding: "10px 12px" }}></th>
                      <th style={{ border: "none", fontWeight: 600, padding: "10px 12px", minWidth: 150 }}>
                        MODULE
                      </th>
                      <th style={{ border: "none", fontWeight: 600, padding: "10px 12px", textAlign: "left" }}>
                        PERMISSIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tallyModules.map((module, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "10px 12px", border: "none" }}></td>
                        <td style={{ padding: "10px 12px", border: "none", fontWeight: 500, minWidth: 150 }}>
                          {module.name}
                        </td>
                        <td style={{ padding: "10px 12px", border: "none" }}>
                          <div className="mb-1">
                            <Form.Check
                              type="checkbox"
                              id={`add-${module.name}-full-access`}
                              label="Full Access"
                              checked={form.modulePermissions[module.name]?.includes("Full Access") || false}
                              onChange={() => toggleModuleFullAccess(module.name)}
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: form.modulePermissions[module.name]?.includes("Full Access") ? "#53b2a5" : "inherit"
                              }}
                            />
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {module.permissions.map((perm) => {
                              const isFullAccess = form.modulePermissions[module.name]?.includes("Full Access");
                              const isSelected = form.modulePermissions[module.name]?.includes(perm);
                              return (
                                <Form.Check
                                  key={`add-${module.name}-${perm}`}
                                  type="checkbox"
                                  id={`add-${module.name}-${perm}`}
                                  label={perm}
                                  checked={isSelected}
                                  onChange={() => toggleModulePerm(module.name, perm)}
                                  disabled={isFullAccess}
                                  style={{
                                    fontSize: 13,
                                    marginRight: 15,
                                    color: isSelected ? "#53b2a5" : "inherit",
                                    fontWeight: isSelected ? 500 : 400,
                                    opacity: isFullAccess ? 0.6 : 1
                                  }}
                                />
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #e9ecef", padding: "15px 20px" }}>
          <Button
            variant="secondary"
            onClick={() => setShowAdd(false)}
            style={{
              background: "#6c757d",
              border: "none",
              borderRadius: 4,
              padding: "8px 20px",
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddSave}
            disabled={!form.name.trim()}
            style={{
              background: "#53b2a5",
              border: "none",
              borderRadius: 4,
              padding: "8px 20px",
              fontWeight: 500
            }}
          >
            Add Role
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Role Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered size="xl">
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e9ecef" }}>
          <Modal.Title style={{ fontWeight: 600, fontSize: 18 }}>Edit Role: {selected?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px", maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 500 }}>Role Name *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 14
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: 500 }}>Role Type</Form.Label>
              <div className="d-flex gap-2 align-items-center">
                <Form.Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 6,
                    padding: "8px 12px",
                    fontSize: 14,
                    flex: 1
                  }}
                >
                  <option value="">Select type</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="company">Company</option>
                  <option value="user">User</option>
                  {customRoleTypes.map((type, idx) => (
                    <option key={idx} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowAddTypeModal(true)}
                  style={{ whiteSpace: "nowrap" }}
                >
                  + Add Type
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>General Permissions</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {allPermissions.map((perm) => {
                  const isActive = form.permissions.includes(perm);
                  return (
                    <Button
                      key={perm}
                      variant={isActive ? "warning" : "outline-warning"}
                      style={{
                        background: isActive ? "#53b2a5" : "#fff",
                        color: isActive ? "#fff" : "#53b2a5",
                        borderColor: "#53b2a5",
                        fontWeight: 500,
                        borderRadius: 8,
                        fontSize: 15,
                        padding: "3px 18px",
                      }}
                      onClick={() => toggleGeneralPerm(perm)}
                    >
                      {perm}
                    </Button>
                  );
                })}
              </div>
            </Form.Group>
            <div className="mb-3">
              <h6 className="fw-semibold mb-3" style={{ fontSize: 14 }}>
                Assign Module Permissions to Role
              </h6>
              <div style={{ border: "1px solid #dee2e6", borderRadius: "0.375rem" }}>
                <Table responsive="sm" size="sm" style={{ fontSize: 13, marginBottom: 0 }}>
                  <thead style={{ background: "#f8f9fa" }}>
                    <tr>
                      <th style={{ width: 40, border: "none", padding: "10px 12px" }}></th>
                      <th style={{ border: "none", fontWeight: 600, padding: "10px 12px", minWidth: 150 }}>
                        MODULE
                      </th>
                      <th style={{ border: "none", fontWeight: 600, padding: "10px 12px", textAlign: "left" }}>
                        PERMISSIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tallyModules.map((module, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "10px 12px", border: "none" }}></td>
                        <td style={{ padding: "10px 12px", border: "none", fontWeight: 500, minWidth: 150 }}>
                          {module.name}
                        </td>
                        <td style={{ padding: "10px 12px", border: "none" }}>
                          <div className="mb-1">
                            <Form.Check
                              type="checkbox"
                              id={`edit-${module.name}-full-access`}
                              label="Full Access"
                              checked={form.modulePermissions[module.name]?.includes("Full Access") || false}
                              onChange={() => toggleModuleFullAccess(module.name)}
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: form.modulePermissions[module.name]?.includes("Full Access") ? "#53b2a5" : "inherit"
                              }}
                            />
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            {module.permissions.map((perm) => {
                              const isFullAccess = form.modulePermissions[module.name]?.includes("Full Access");
                              const isSelected = form.modulePermissions[module.name]?.includes(perm);
                              return (
                                <Form.Check
                                  key={`edit-${module.name}-${perm}`}
                                  type="checkbox"
                                  id={`edit-${module.name}-${perm}`}
                                  label={perm}
                                  checked={isSelected}
                                  onChange={() => toggleModulePerm(module.name, perm)}
                                  disabled={isFullAccess}
                                  style={{
                                    fontSize: 13,
                                    marginRight: 15,
                                    color: isSelected ? "#53b2a5" : "inherit",
                                    fontWeight: isSelected ? 500 : 400,
                                    opacity: isFullAccess ? 0.6 : 1
                                  }}
                                />
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #e9ecef", padding: "15px 20px" }}>
          <Button
            variant="secondary"
            onClick={() => setShowEdit(false)}
            style={{
              background: "#6c757d",
              border: "none",
              borderRadius: 4,
              padding: "8px 20px",
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            disabled={!form.name.trim()}
            style={{
              background: "#53b2a5",
              border: "none",
              borderRadius: 4,
              padding: "8px 20px",
              fontWeight: 500
            }}
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Role Type Modal */}
      <Modal
        show={showAddTypeModal}
        onHide={() => {
          setShowAddTypeModal(false);
          setNewRoleType("");
          setTypeError("");
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Role Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Enter New Role Type</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Accountant, HR"
              value={newRoleType}
              onChange={(e) => setNewRoleType(e.target.value.trimStart())}
              isInvalid={!!typeError || (!!newRoleType && customRoleTypes.includes(newRoleType))}
            />
            <Form.Control.Feedback type="invalid">
              {typeError || (newRoleType && customRoleTypes.includes(newRoleType) ? "This role type already exists." : "")}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAddTypeModal(false);
            setNewRoleType("");
            setTypeError("");
          }}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!newRoleType || customRoleTypes.includes(newRoleType) || isAddingType}
            onClick={handleAddRoleType}
          >
            {isAddingType ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adding...
              </>
            ) : "Add Type"}
          </Button>
        </Modal.Footer>
      </Modal>

      <p className="text-muted text-center mt-3">
        This page allows you to define and manage user roles with specific permissions such as create, read, update, and delete. Control access across the application.
      </p>

      {/* ✅ TOAST CONTAINER */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default RolesPermissions;
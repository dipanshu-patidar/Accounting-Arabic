import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputGroup,
  Toast,
  ToastContainer,
  Row,
  Col,
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

// Updated tallyModules with categories (Dashboard removed)
const tallyModules = [

   {
    category: "Dashboard",
    modules: [
      { name: "Dashboard", permissions: ["Create", "View", "Update", "Delete"] },
     
    ]
  },
  {
    category: "Accounts",
    modules: [
      { name: "Charts_of_Accounts", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Customers/Debtors", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Vendors/Creditors", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "All_Transaction", permissions: ["Create", "View", "Update", "Delete"] },
    ]
  },
  {
    category: "Inventory",
    modules: [
      { name: "Warehouse", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Unit_of_measure", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Product_Inventory", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Service", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "StockTransfer", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Inventory_Adjustment", permissions: ["Create", "View", "Update", "Delete"] },
    ]
  },
  {
    category: "Sales Order",
    modules: [
      { name: "Sales_Order", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Sales_Return", permissions: ["Create", "View", "Update", "Delete"] },
    ]
  },
  {
    category: "Purchase Order",
    modules: [
      { name: "Purchase_Orders", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Purchase_Return", permissions: ["Create", "View", "Update", "Delete"] },
    ]
  },
  {
    category: "POS",
    modules: [
      { name: "POS_Screen", permissions: ["Create", "View", "Update", "Delete"] },
    ]
  },
  {
    category: "Voucher",
    modules: [
      { name: "Create_Voucher", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Expenses", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Income", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Contra_Voucher", permissions: ["Create", "View", "Update", "Delete"] },
    ]
  },
  {
    category: "Reports",
    modules: [
      { name: "Sales_Report", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Purchase_Report", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "POS_Report", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Tax_Report", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Inventory_Summary", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Balance_Sheet", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Cash_Flow", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Profit_Loss", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Vat_Report", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "DayBook", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Journal_Entries", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Ledger", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Trial_Balance", permissions: ["Create", "View", "Update", "Delete"] },
    ]
  },
  {
    category: "Users Management",
    modules: [
      { name: "Users", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Roles_Permissions", permissions: ["Create", "View", "Update", "Delete"] },
    ]
  },
  {
    category: "Settings",
    modules: [
      { name: "Company_Info", permissions: ["Create", "View", "Update", "Delete"] },
      { name: "Password_Requests", permissions: ["Create", "View", "Update", "Delete"] }
    ]
  }
];

// Helper function to flatten modules for easier processing
const flattenModules = () => {
  const flattened = [];
  tallyModules.forEach(category => {
    category.modules.forEach(module => {
      flattened.push(module);
    });
  });
  return flattened;
};

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

  // TOAST NOTIFICATION STATE
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Modal cleanup refs
  const isCleaningUpRef = useRef(false);
  const modalKeyRef = useRef({ add: 0, edit: 0, view: 0, delete: 0, addType: 0 });

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

  // FETCH ROLES FUNCTION - Updated to match API response
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
          const modulePermissions = {};
          
          // Process permissions from API response
          if (role.permissions && Array.isArray(role.permissions)) {
            role.permissions.forEach(perm => {
              const perms = [];
              if (perm.can_create) perms.push("Create");
              if (perm.can_view) perms.push("View");
              if (perm.can_update) perms.push("Update");
              if (perm.can_delete) perms.push("Delete");
              
              modulePermissions[perm.module_name] = perms;
            });
          }
          
          // Initialize modules with empty permissions if not present in API response
          flattenModules().forEach(module => {
            if (!modulePermissions[module.name]) {
              modulePermissions[module.name] = [];
            }
          });

          return {
            id: role.role_id,
            name: role.role_name,
            users: 0,
            permissions: [], // No general permissions in API response
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

  // PATCH API FOR TOGGLING ROLE STATUS
  const toggleRoleStatus = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    const newStatus = role.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await axios.patch(`${BaseUrl}user-roles/${roleId}/status`, {
        company_id: companyId,
        status: newStatus
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
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    // Force modal remount
    modalKeyRef.current.add += 1;
    const initialModulePermissions = {};
    flattenModules().forEach(module => {
      initialModulePermissions[module.name] = [];
    });
    setForm({ name: "", permissions: [], type: "user", modulePermissions: initialModulePermissions });
    setShowAdd(true);
  };

  const handleCloseAdd = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowAdd(false);
    modalKeyRef.current.add += 1;
  };

  const handleAddExited = () => {
    const initialModulePermissions = {};
    flattenModules().forEach(module => {
      initialModulePermissions[module.name] = [];
    });
    setForm({ name: "", permissions: [], type: "user", modulePermissions: initialModulePermissions });
    isCleaningUpRef.current = false;
  };

  // Updated to match API format
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
        return {
          module_name: moduleName,
          can_create: perms.includes('Create'),
          can_view: perms.includes('View'),
          can_update: perms.includes('Update'),
          can_delete: perms.includes('Delete')
        };
      });

      const response = await axios.post(`${BaseUrl}user-roles`, {
        company_id: companyId,
        role_name: form.name,
        permissions: permissionsPayload
      });

      if (response.data?.success) {
        setShowAdd(false);
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
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    // Force modal remount
    modalKeyRef.current.edit += 1;
    setSelected(role);
    setForm({
      name: role.name,
      permissions: [...role.permissions],
      type: role.type,
      modulePermissions: { ...role.modulePermissions }
    });
    setShowEdit(true);
  };

  const handleCloseEdit = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowEdit(false);
    modalKeyRef.current.edit += 1;
  };

  const handleEditExited = () => {
    setSelected(null);
    setForm({ name: "", permissions: [], type: "user", modulePermissions: {} });
    isCleaningUpRef.current = false;
  };

  // Updated to match API format
  const handleEditSave = async () => {
    if (!form.name.trim()) {
      setToastMessage("Role name is required.");
      setToastVariant("danger");
      setShowToast(true);
      return;
    }

    try {
      const permissionsPayload = Object.entries(form.modulePermissions || {}).map(([moduleName, perms]) => {
        return {
          module_name: moduleName,
          can_create: perms.includes('Create'),
          can_view: perms.includes('View'),
          can_update: perms.includes('Update'),
          can_delete: perms.includes('Delete')
        };
      });

      const response = await axios.put(`${BaseUrl}user-roles/${selected.id}`, {
        company_id: companyId,
        role_name: form.name,
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
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    // Force modal remount
    modalKeyRef.current.delete += 1;
    setSelected(role);
    setShowDelete(true);
  };

  const handleCloseDelete = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowDelete(false);
    modalKeyRef.current.delete += 1;
  };

  const handleDeleteExited = () => {
    setSelected(null);
    isCleaningUpRef.current = false;
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
    // Reset cleanup flag
    isCleaningUpRef.current = false;
    // Force modal remount
    modalKeyRef.current.view += 1;
    setSelected(role);
    setShowView(true);
  };

  const handleCloseView = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowView(false);
    modalKeyRef.current.view += 1;
  };

  const handleViewExited = () => {
    setSelected(null);
    isCleaningUpRef.current = false;
  };

  // Updated toggleModulePerm to handle individual permissions
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

  // Updated toggleModuleFullAccess to properly handle full access
  const toggleModuleFullAccess = (moduleName) => {
    setForm(prevForm => {
      const module = flattenModules().find(m => m.name === moduleName);
      const allModulePerms = module ? module.permissions : [];
      const hasFullAccess = prevForm.modulePermissions[moduleName]?.length === module.permissions.length;
      
      return {
        ...prevForm,
        modulePermissions: {
          ...prevForm.modulePermissions,
          [moduleName]: hasFullAccess ? [] : allModulePerms
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

  // Render module permissions with categories
  const renderModulePermissions = (isEdit = false) => {
    return (
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
              {tallyModules.map((category, categoryIdx) => (
                <React.Fragment key={categoryIdx}>
                  <tr>
                    <td colSpan="3" style={{ 
                      background: "#e9ecef", 
                      fontWeight: 600, 
                      padding: "8px 12px",
                      borderTop: categoryIdx === 0 ? "none" : "1px solid #dee2e6"
                    }}>
                      {category.category}
                    </td>
                  </tr>
                  {category.modules.map((module, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "10px 12px", border: "none" }}></td>
                      <td style={{ padding: "10px 12px", border: "none", fontWeight: 500, minWidth: 150 }}>
                        {module.name}
                      </td>
                      <td style={{ padding: "10px 12px", border: "none" }}>
                        <div className="mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`${isEdit ? 'edit' : 'add'}-${module.name}-full-access`}
                              checked={form.modulePermissions[module.name]?.length === module.permissions.length}
                              onChange={() => toggleModuleFullAccess(module.name)}
                              style={{
                                fontSize: 13,
                                marginRight: 5,
                                cursor: "pointer"
                              }}
                            />
                            <label 
                              className="form-check-label" 
                              htmlFor={`${isEdit ? 'edit' : 'add'}-${module.name}-full-access`}
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                color: form.modulePermissions[module.name]?.length === module.permissions.length ? "#53b2a5" : "inherit"
                              }}
                            >
                              Full Access
                            </label>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {module.permissions.map((perm) => {
                            const isSelected = form.modulePermissions[module.name]?.includes(perm);
                            const isFullAccess = form.modulePermissions[module.name]?.length === module.permissions.length;
                            return (
                              <div key={`${isEdit ? 'edit' : 'add'}-${module.name}-${perm}`} className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`${isEdit ? 'edit' : 'add'}-${module.name}-${perm}`}
                                  checked={isSelected || isFullAccess}
                                  onChange={() => toggleModulePerm(module.name, perm)}
                                  disabled={isFullAccess}
                                  style={{
                                    fontSize: 13,
                                    marginRight: 5,
                                    cursor: isFullAccess ? "not-allowed" : "pointer",
                                    opacity: isFullAccess ? 0.6 : 1
                                  }}
                                />
                                <label 
                                  className="form-check-label" 
                                  htmlFor={`${isEdit ? 'edit' : 'add'}-${module.name}-${perm}`}
                                  style={{
                                    fontSize: 13,
                                    color: isSelected || isFullAccess ? "#53b2a5" : "inherit",
                                    fontWeight: isSelected || isFullAccess ? 500 : 400,
                                    cursor: isFullAccess ? "not-allowed" : "pointer",
                                    opacity: isFullAccess ? 0.6 : 1
                                  }}
                                >
                                  {perm}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    );
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
      <Modal 
        key={modalKeyRef.current.delete}
        show={showDelete} 
        onHide={handleCloseDelete}
        onExited={handleDeleteExited}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete role <b>{selected?.name}</b>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Role Details Modal */}
      <Modal 
        key={modalKeyRef.current.view}
        show={showView} 
        onHide={handleCloseView}
        onExited={handleViewExited}
        centered 
        size="lg"
      >
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
          <Button variant="secondary" onClick={handleCloseView}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Role Modal */}
      <Modal 
        key={modalKeyRef.current.add}
        show={showAdd} 
        onHide={handleCloseAdd}
        onExited={handleAddExited}
        centered 
        size="xl"
      >
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
            {renderModulePermissions(false)}
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #e9ecef", padding: "15px 20px" }}>
          <Button
            variant="secondary"
            onClick={handleCloseAdd}
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

      {/* Edit Role Modal - Removed Role Type section */}
      <Modal 
        key={modalKeyRef.current.edit}
        show={showEdit} 
        onHide={handleCloseEdit}
        onExited={handleEditExited}
        centered 
        size="xl"
      >
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
            {renderModulePermissions(true)}
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "1px solid #e9ecef", padding: "15px 20px" }}>
          <Button
            variant="secondary"
            onClick={handleCloseEdit}
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

      <p className="text-muted text-center mt-3">
        This page allows you to define and manage user roles with specific permissions such as create, read, update, and delete. Control access across the application.
      </p>

      {/* TOAST CONTAINER */}
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
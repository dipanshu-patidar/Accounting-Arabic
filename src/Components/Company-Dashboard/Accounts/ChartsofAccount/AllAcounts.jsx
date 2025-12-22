import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import {
  Table,
  Container,
  Card,
  Button,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { FaUserPlus, FaUserFriends } from "react-icons/fa";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AddCustomerModal from "./AddCustomerModal";
import AddVendorModal from "./AddVendorModal";
import AddNewAccountModal from "./AddNewAccountModal";
import AccountActionModal from "./AccountActionModal";
import BaseUrl from "../../../../Api/BaseUrl";
import axiosInstance from "../../../../Api/axiosInstance";
import GetCompanyId from "../../../../Api/GetCompanyId";
import { CurrencyContext } from "../../../../hooks/CurrencyContext";

const AllAccounts = () => {
  const navigate = useNavigate();
  const companyId = GetCompanyId();

  // Permission states
  const [userPermissions, setUserPermissions] = useState([]);
  const [canView, setCanView] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  // State declarations
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [accountData, setAccountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshData, setRefreshData] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { convertPrice, symbol, currency } = useContext(CurrencyContext);

  // Refs to prevent multiple API calls
  const isEditingRef = useRef(false);
  const isDeletingRef = useRef(false);
  const isSavingRef = useRef(false);
  const apiCallLock = useRef(false);
  const lastSaveTime = useRef(0);
  const isCleaningUpRef = useRef(false); // Prevent multiple cleanup calls
  const modalKeyRef = useRef({ customer: 0, vendor: 0, newAccount: 0, action: 0 }); // Force modal remount

  // Check permissions
  useEffect(() => {
    // Get user role and permissions
    const role = localStorage.getItem("role");
    
    // Superadmin and Company roles have access to all modules
    if (role === "SUPERADMIN" || role === "COMPANY") {
      setCanView(true);
      setCanCreate(true);
      setCanUpdate(true);
      setCanDelete(true);
    } else if (role === "USER") {
      // For USER role, check specific permissions
      try {
        const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
        setUserPermissions(permissions);
        
        // Check if user has permissions for Charts_of_Accounts
        const chartsPermission = permissions.find(p => p.module_name === "Charts_of_Accounts");
        
        if (chartsPermission) {
          setCanView(chartsPermission.can_view || false);
          setCanCreate(chartsPermission.can_create || false);
          setCanUpdate(chartsPermission.can_update || false);
          setCanDelete(chartsPermission.can_delete || false);
        } else {
          setCanView(false);
          setCanCreate(false);
          setCanUpdate(false);
          setCanDelete(false);
        }
      } catch (error) {
        console.error("Error parsing user permissions:", error);
        setCanView(false);
        setCanCreate(false);
        setCanUpdate(false);
        setCanDelete(false);
      }
    } else {
      setCanView(false);
      setCanCreate(false);
      setCanUpdate(false);
      setCanDelete(false);
    }
  }, []);

  const options = accountData.flatMap((group) =>
    group.rows.map((row) => ({ value: row.name, label: row.name }))
  );

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [actionModal, setActionModal] = useState({
    show: false,
    mode: null, // 'view', 'edit', 'delete'
  });

  const [vendorFormData, setVendorFormData] = useState({
    name: "",
    nameArabic: "",
    companyName: "",
    companyLocation: "",
    idCardImage: null,
    extraFile: null,
    accountType: "Sundry Creditors",
    accountName: "",
    balanceType: "Credit",
    accountBalance: "0.00",
    creationDate: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankName: "",
    country: "",
    state: "",
    pincode: "",
    address: "",
    stateCode: "",
    shippingAddress: "",
    phone: "",
    email: "",
    creditPeriod: "",
    gstin: "",
    gstType: "Registered",
    taxEnabled: true,
    taxNumber: "",
  });

  const [customerFormData, setCustomerFormData] = useState({
    gstin: "",
    gstEnabled: true,
    name: "",
    nameArabic: "",
    companyName: "",
    companyLocation: "",
    idCardImage: null,
    extraFile: null,
    accountType: "Sundry Debtors",
    accountName: "",
    balanceType: "Debit",
    accountBalance: "0.00",
    creationDate: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankName: "",
    country: "",
    state: "",
    pincode: "",
    address: "",
    stateCode: "",
    shippingAddress: "",
    phone: "",
    email: "",
    creditPeriod: "",
    gstin: "",
    gstType: "Registered",
    taxEnabled: true,
    taxNumber: "",
  });

  const [newAccountData, setNewAccountData] = useState({
    type: "",
    subgroup: "",
    name: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankNameBranch: "",
    parentId: "",
    balance: "0.00",
    phone: "",
    email: "",
    isDefault: false,
  });

  // Memoize transformAccountData to ensure it uses the correct balance field from the API
  const transformAccountData = useCallback((apiData) => {
    if (!Array.isArray(apiData)) {
      console.error("API data is not an array:", apiData);
      return [];
    }

    const groupedData = {};

    apiData.forEach((account) => {
      const subgroupName =
        account.parent_account?.subgroup_name || "Uncategorized";

      if (!groupedData[subgroupName]) {
        groupedData[subgroupName] = {
          type: subgroupName,
          rows: [],
        };
      }

      const hasBankDetails =
        account.account_number && account.ifsc_code ? "Yes" : "No";
      const accountName =
        account.sub_of_subgroup?.name ||
        account.account_name ||
        `Account ${account.id}`;
      const subOfSubgroupName = account.sub_of_subgroup?.name || "";

      // CRITICAL FIX: Use the `accountBalance` field from the API response
      // This is the source of truth for the balance.
      const balance = account.accountBalance?.toString() || "0.00";

      groupedData[subgroupName].rows.push({
        name: accountName,
        // Store the raw balance string from the `accountBalance` field
        bal: balance,
        id: account.id,
        has_bank_details: hasBankDetails,
        account_number: account.account_number,
        ifsc_code: account.ifsc_code,
        bank_name_branch: account.bank_name_branch,
        subgroup_id: account.subgroup_id,
        company_id: account.company_id,
        subgroup_name: subgroupName,
        sub_of_subgroup_id: account.sub_of_subgroup_id || "",
        parent_account: account.parent_account,
        sub_of_subgroup: account.sub_of_subgroup,
        sub_of_subgroup_name: subOfSubgroupName,
      });
    });

    return Object.values(groupedData);
  }, []); // Empty dependency array means this function is created only once

  const fetchAccountData = useCallback(async () => {
    if (!canView) return; // Don't fetch data if user doesn't have view permission
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${BaseUrl}account/company/${companyId}`
      );
      console.log("API Response:", response.data);

      if (response.data && response.data.success) {
        const transformedData = transformAccountData(response.data.data);
        setAccountData(transformedData);
      } else {
        const transformedData = transformAccountData(response.data);
        setAccountData(transformedData);
      }
    } catch (err) {
      console.error("Error fetching account data:", err);
      setError("No Account Found");
    } finally {
      setLoading(false);
    }
  }, [companyId, transformAccountData, canView]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData, refreshData]);

  // Modal close handlers
  const handleCloseCustomerModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowCustomerModal(false);
    modalKeyRef.current.customer += 1;
  };

  const handleCloseVendorModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowVendorModal(false);
    modalKeyRef.current.vendor += 1;
  };

  const handleCloseNewAccountModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setShowNewAccountModal(false);
    modalKeyRef.current.newAccount += 1;
  };

  const handleCloseActionModal = () => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;
    setActionModal({ show: false, mode: null });
    modalKeyRef.current.action += 1;
  };

  // Modal exited handlers
  const handleCustomerModalExited = () => {
    setCustomerFormData({
      gstin: "",
      gstEnabled: true,
      name: "",
      nameArabic: "",
      companyName: "",
      companyLocation: "",
      idCardImage: null,
      extraFile: null,
      accountType: "Sundry Debtors",
      accountName: "",
      balanceType: "Debit",
      accountBalance: "0.00",
      creationDate: "",
      bankAccountNumber: "",
      bankIFSC: "",
      bankName: "",
      country: "",
      state: "",
      pincode: "",
      address: "",
      stateCode: "",
      shippingAddress: "",
      phone: "",
      email: "",
      creditPeriod: "",
      gstin: "",
      gstType: "Registered",
      taxEnabled: true,
      taxNumber: "",
    });
    isCleaningUpRef.current = false;
  };

  const handleVendorModalExited = () => {
    setVendorFormData({
      name: "",
      nameArabic: "",
      companyName: "",
      companyLocation: "",
      idCardImage: null,
      extraFile: null,
      accountType: "Sundry Creditors",
      accountName: "",
      balanceType: "Credit",
      accountBalance: "0.00",
      creationDate: "",
      bankAccountNumber: "",
      bankIFSC: "",
      bankName: "",
      country: "",
      state: "",
      pincode: "",
      address: "",
      stateCode: "",
      shippingAddress: "",
      phone: "",
      email: "",
      creditPeriod: "",
      gstin: "",
      gstType: "Registered",
      taxEnabled: true,
      taxNumber: "",
    });
    isCleaningUpRef.current = false;
  };

  const handleNewAccountModalExited = () => {
    setNewAccountData({
      type: "",
      subgroup: "",
      name: "",
      bankAccountNumber: "",
      bankIFSC: "",
      bankNameBranch: "",
      parentId: "",
      balance: "0.00",
      phone: "",
      email: "",
      isDefault: false,
    });
    setShowBankDetails(true);
    isCleaningUpRef.current = false;
  };

  const handleActionModalExited = () => {
    setSelectedAccount(null);
    isCleaningUpRef.current = false;
  };

  // Handlers (no changes here, but included for completeness)
  const handleSaveVendor = () => {
    console.log("Vendor Saved:", vendorFormData);
    handleCloseVendorModal();
  };

  const handleSaveCustomer = () => {
    console.log("Customer Saved:", customerFormData);
    handleCloseCustomerModal();
  };

  const handleSaveNewAccount = async (e) => {
    if (!canCreate) return; // Check create permission
    
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (apiCallLock.current) return;

    const now = Date.now();
    if (now - lastSaveTime.current < 2000) return;

    lastSaveTime.current = now;
    apiCallLock.current = true;
    isSavingRef.current = true;

    try {
      await axiosInstance.post(`${BaseUrl}account`, {
        subgroup_id: newAccountData.subgroup_id,
        company_id: companyId,
        account_name: newAccountData.name,
        has_bank_details: showBankDetails ? 1 : 0,
        account_number: newAccountData.bankAccountNumber || "",
        ifsc_code: newAccountData.bankIFSC || "",
        bank_name_branch: newAccountData.bankNameBranch || "",
        sub_of_subgroup_id: newAccountData.sub_of_subgroup_id || "",
      });

      handleCloseNewAccountModal();
      setNewAccountData({
        /* reset state */
      });
      setRefreshData((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to save new account:", error);
    } finally {
      apiCallLock.current = false;
      isSavingRef.current = false;
    }
  };

  const handleAddNewParent = () => {
    if (!canCreate) return; // Check create permission
    
    if (!selectedMainCategory) {
      alert("Please select a main category");
      return;
    }
    setSelectedMainCategory("");
    setShowAddParentModal(false);
  };

  const handleViewAccount = (type, name) => {
    if (!canView) return; // Check view permission
    
    isCleaningUpRef.current = false;
    modalKeyRef.current.action += 1;
    const accountGroup = accountData.find((acc) => acc.type === type);
    const row = accountGroup?.rows.find(
      (r) => r.name === name || r.originalName === name
    );

    setSelectedAccount({
      type,
      name: row ? row.name : name,
      originalName: row ? row.originalName : name,
      id: row ? row.id : null,
      balance: row ? parseFloat(row.bal) : 0,
      has_bank_details: row ? row.has_bank_details : "No",
      account_number: row ? row.account_number : "",
      ifsc_code: row ? row.ifsc_code : "",
      bank_name_branch: row ? row.bank_name_branch : "",
      subgroup_id: row ? row.subgroup_id : "",
      company_id: row ? row.company_id : "",
      sub_of_subgroup_id: row ? row.sub_of_subgroup_id : "",
    });
    setActionModal({ show: true, mode: "view" });
  };

  const handleEditAccount = (type, name) => {
    if (!canUpdate) return; // Check update permission
    
    isCleaningUpRef.current = false;
    modalKeyRef.current.action += 1;
    const accountGroup = accountData.find((acc) => acc.type === type);
    const row = accountGroup?.rows.find(
      (r) => r.name === name || r.originalName === name
    );

    setSelectedAccount({
      type,
      name: row ? row.name : name,
      originalName: row ? row.originalName : name,
      id: row ? row.id : null,
      balance: row ? parseFloat(row.bal) : 0,
      has_bank_details: row ? row.has_bank_details : "No",
      account_number: row ? row.account_number : "",
      ifsc_code: row ? row.ifsc_code : "",
      bank_name_branch: row ? row.bank_name_branch : "",
      subgroup_id: row ? row.subgroup_id : "",
      company_id: row ? row.company_id : "",
      sub_of_subgroup_id: row ? row.sub_of_subgroup_id : "",
    });
    setActionModal({ show: true, mode: "edit" });
  };

  const handleDeleteAccount = async (type, name) => {
    if (!canDelete) return; // Check delete permission
    
    try {
      setIsDeleting(true);
      isDeletingRef.current = true;

      const accountGroup = accountData.find((acc) => acc.type === type);
      const row = accountGroup?.rows.find(
        (r) => r.name === name || r.originalName === name
      );

      if (!row || !row.id) throw new Error("Account not found");

      if (
        window.confirm(`Are you sure you want to delete the account "${name}"?`)
      ) {
        await axiosInstance.delete(`${BaseUrl}account/${row.id}`);
        setRefreshData((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsDeleting(false);
      isDeletingRef.current = false;
    }
  };

  const handleViewLedger = (type, name) => {
    if (!canView) return; // Check view permission
    
    const accountGroup = accountData.find((acc) => acc.type === type);
    const row = accountGroup?.rows.find(
      (r) => r.name === name || r.originalName === name
    );

    if (!row || !row.id) {
      console.error("Account ID not found for ledger navigation");
      alert("Unable to open ledger: Account ID missing");
      return;
    }

    const accountName = row.sub_of_subgroup_name || row.name || name;

    navigate("/company/ledgerpageaccount", {
      state: {
        accountName: accountName,
        accountType: type,
        accountId: row.id, // 👈 THIS IS CRITICAL
      },
    });
  };
  
  const handleSaveEditedAccount = async (updatedAccount) => {
    if (!canUpdate) return; // Check update permission
    
    if (apiCallLock.current) return;

    const now = Date.now();
    if (now - lastSaveTime.current < 2000) return;

    lastSaveTime.current = now;
    apiCallLock.current = true;
    isEditingRef.current = true;
    setIsEditing(true);

    try {
      if (!selectedAccount || !selectedAccount.id) {
        console.error("No account selected for editing");
        return;
      }

      const payload = {
        account_name: updatedAccount.name,
        accountBalance: updatedAccount.balance,
        has_bank_details: updatedAccount.has_bank_details === "Yes" ? "1" : "0",
        sub_of_subgroup_id: updatedAccount.sub_of_subgroup_id || "",
      };

      if (updatedAccount.has_bank_details === "Yes") {
        payload.account_number = updatedAccount.account_number || "";
        payload.ifsc_code = updatedAccount.ifsc_code || "";
        payload.bank_name_branch = updatedAccount.bank_name_branch || "";
      }

      await axiosInstance.put(
        `${BaseUrl}account/${selectedAccount.id}`,
        payload
      );

      handleCloseActionModal();
      setRefreshData((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to update account:", error);
    } finally {
      apiCallLock.current = false;
      isEditingRef.current = false;
      setIsEditing(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!canDelete) return; // Check delete permission
    
    if (isDeletingRef.current) return;
    isDeletingRef.current = true;
    setIsDeleting(true);

    try {
      if (!selectedAccount || !selectedAccount.id) {
        console.error("No account selected for deletion");
        return;
      }
      await axiosInstance.delete(`${BaseUrl}account/${selectedAccount.id}`);

      handleCloseActionModal();
      setRefreshData((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsDeleting(false);
      isDeletingRef.current = false;
    }
  };

  const [filterName, setFilterName] = useState("");
  const filteredAccountData = accountData.filter((accountGroup) => {
    const typeMatches =
      accountGroup.type?.toLowerCase()?.includes(filterName.toLowerCase()) ||
      false;
    const nameMatches = accountGroup.rows.some((row) => {
      const nameToCheck = row.sub_of_subgroup_name || row.name;
      return (
        nameToCheck
          ?.trim()
          ?.toLowerCase()
          ?.includes(filterName.toLowerCase()) || false
      );
    });
    return typeMatches || nameMatches;
  });

  // This function now correctly sums up the `bal` property, which we've ensured holds the correct value
  const calculateTotalBalance = (accountGroup) => {
    return accountGroup.rows
      .filter((row) => row.name && row.name.trim() !== "")
      .reduce((total, row) => {
        // `row.bal` is now the correct string from `accountBalance`
        const bal = parseFloat(row.bal.toString().replace(/,/g, "")) || 0;
        return total + bal;
      }, 0);
  };

  const accountTypes = [...new Set(accountData.map((acc) => acc.type))];

  // If user doesn't have view permission, show access denied message
  if (!canView) {
    return (
      <Container fluid className="p-3">
        <Card className="text-center p-5">
          <h3>Access Denied</h3>
          <p>You don't have permission to view the Charts of Accounts.</p>
          <p>Please contact your administrator for access.</p>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3">
      {/* Header Row */}
      <Row className="align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <Col xs={12} md="auto">
          <h4
            className="fw-bold text-start mb-2 mb-md-0"
            style={{ marginTop: "1rem" }}
          >
            All Accounts
          </h4>
        </Col>
        <Col
          xs={12}
          md="auto"
          className="d-flex flex-wrap gap-2 justify-content-end"
        >
          {canCreate && (
            <Button
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "8px 16px",
              }}
              className="d-flex align-items-center gap-2 text-white fw-semibold flex-shrink-0"
              onClick={() => {
                isCleaningUpRef.current = false;
                modalKeyRef.current.newAccount += 1;
                setShowNewAccountModal(true);
              }}
            >
              + Add New Account
            </Button>
          )}
          {/* Commented out buttons - can be uncommented if needed with permission checks */}
          {/* {canCreate && (
            <Button
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "8px 16px",
              }}
              className="d-flex align-items-center gap-2 text-white fw-semibold flex-shrink-0"
              onClick={() => setShowVendorModal(true)}
            >
              <FaUserPlus size={18} /> Add Vendor
            </Button>
          )}
          {canCreate && (
            <Button
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "8px 16px",
              }}
              className="d-flex align-items-center gap-2 text-white fw-semibold flex-shrink-0"
              onClick={() => setShowCustomerModal(true)}
            >
              <FaUserFriends /> Add Customer
            </Button>
          )} */}
        </Col>
      </Row>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-3 align-items-end">
        <Form.Group>
          <Form.Label>Filter by Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Search account name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            style={{ minWidth: "200px" }}
          />
        </Form.Group>
        <Button
          variant="secondary"
          onClick={() => {
            setFilterName("");
          }}
          className="mt-auto"
        >
          Clear
        </Button>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading....</span>
          </div>
          <p className="mt-2">Loading accounts.....</p>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="table-responsive border rounded-3" style={{ minWidth: "100%" }}>
          <Table className="align-middle text-center mb-0">
            <thead
              className=""
              style={{ position: "sticky", top: 0, zIndex: 1 }}
            >
              <tr>
                <th>Account Type</th>
                <th>Account Name</th>
                <th>Account Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccountData?.length > 0 ? (
                filteredAccountData?.map((accountGroup) => {
                  const totalBalance = calculateTotalBalance(accountGroup);
                  return (
                    <React.Fragment key={accountGroup.type}>
                      <tr className="">
                        <td colSpan="4" className="text-start fw-bold">
                          {accountGroup.type}
                        </td>
                      </tr>
                      {accountGroup.rows
                        .filter((row) => row.name && row.name.trim() !== "")
                        .map((row, index) => (
                          <tr key={`${accountGroup.type}-${index}`}>
                            <td className="text-start">{accountGroup.type}</td>
                            <td className="text-start">{row?.name || ""}</td>
                            {/* FIX: Display the balance using the correct `bal` property */}
                            <td>
                              {symbol} {convertPrice(row.bal)}
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                {canView && (
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    title="View"
                                    onClick={() =>
                                      handleViewAccount(
                                        accountGroup.type,
                                        row.name
                                      )
                                    }
                                  >
                                    <FaEye />
                                  </Button>
                                )}
                                {canUpdate && (
                                  <Button
                                    variant="outline-warning"
                                    size="sm"
                                    title="Edit"
                                    onClick={() =>
                                      handleEditAccount(
                                        accountGroup.type,
                                        row.name
                                      )
                                    }
                                    disabled={isEditing}
                                  >
                                    <FaEdit />
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    title="Delete"
                                    onClick={() =>
                                      handleDeleteAccount(
                                        accountGroup.type,
                                        row.name
                                      )
                                    }
                                    disabled={isDeleting}
                                  >
                                    <FaTrash />
                                  </Button>
                                )}
                                {canView && (
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    title="View Ledger"
                                    onClick={() =>
                                      handleViewLedger(
                                        accountGroup.type,
                                        row.name
                                      )
                                    }
                                  >
                                    View Ledger
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      {totalBalance !== 0 && (
                        <tr className=" font-weight-bold">
                          <td colSpan="2" className="text-end">
                            Total Balance
                          </td>
                          <td className="text-end">
                            {totalBalance >= 0
                              ? `${symbol} ${convertPrice(totalBalance)}`
                              : `(${symbol} ${convertPrice(
                                Math.abs(totalBalance)
                              )})`}
                          </td>
                          <td></td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}

      {/* Modals */}
      <AddCustomerModal
        key={modalKeyRef.current.customer}
        show={showCustomerModal}
        onHide={handleCloseCustomerModal}
        onExited={handleCustomerModalExited}
        onSave={handleSaveCustomer}
        customerFormData={customerFormData}
        setCustomerFormData={setCustomerFormData}
        keyboard={false}
      />
      <AddVendorModal
        key={modalKeyRef.current.vendor}
        show={showVendorModal}
        onHide={handleCloseVendorModal}
        onExited={handleVendorModalExited}
        onSave={handleSaveVendor}
        vendorFormData={vendorFormData}
        setVendorFormData={setVendorFormData}
      />
      <AddNewAccountModal
        key={modalKeyRef.current.newAccount}
        show={showNewAccountModal}
        onHide={handleCloseNewAccountModal}
        onExited={handleNewAccountModalExited}
        onSave={handleSaveNewAccount}
        newAccountData={newAccountData}
        setNewAccountData={setNewAccountData}
        showBankDetails={showBankDetails}
        setShowBankDetails={setShowBankDetails}
        showAddParentModal={showAddParentModal}
        setShowAddParentModal={setShowAddParentModal}
        selectedMainCategory={selectedMainCategory}
        setSelectedMainCategory={setSelectedMainCategory}
        accountData={accountData}
        handleAddNewParent={handleAddNewParent}
      />
      <AccountActionModal
        key={modalKeyRef.current.action}
        show={actionModal.show}
        onHide={handleCloseActionModal}
        onExited={handleActionModalExited}
        mode={actionModal.mode}
        accountData={accountData}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        onSave={handleSaveEditedAccount}
        onDelete={handleDeleteConfirmed}
        accountTypes={accountTypes}
        isEditing={isEditing}
        isDeleting={isDeleting}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />

      {/* Page Description */}
      <Card className="mb-4 p-3 shadow rounded-4 mt-2">
        <Card.Body>
          <h5 className="fw-semibold border-bottom pb-2 mb-3 ">
            Page Info
          </h5>
          <ul
            className=" fs-6 mb-0"
            style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}
          >
            <li>Displays all financial accounts.</li>
            <li>Accounts are categorized by type.</li>
            <li>Helps in easy management and tracking.</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AllAccounts;
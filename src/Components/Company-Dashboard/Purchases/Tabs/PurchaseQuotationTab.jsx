import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  Button,
  Table,
  Row,
  Col,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faTrash,
  faSearch,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import AddProductModal from "../../../Company-Dashboard/Inventory/AddProductModal";
import GetCompanyId from "../../../../Api/GetCompanyId";
import axiosInstance from "../../../../Api/axiosInstance";

const PurchaseQuotationTab = ({ onSubmit, initialData }) => {
  const companyId = GetCompanyId();
  const navigate = useNavigate();
  const pdfRef = useRef();

  // State for API products
  const [apiProducts, setApiProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // State for company details
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // State for vendors
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [showVendorSearch, setShowVendorSearch] = useState(false);

  // Generate document number
  const generateDocNo = (prefix) => {
    const year = new Date().getFullYear().toString().slice(-2); // e.g. 24
    const key = `docNo_${prefix}`;
    const currentNo = localStorage.getItem(key) || "000";
    const nextNo = (parseInt(currentNo) + 1).toString().padStart(3, "0");
    const docNo = `${prefix}-${year}-${nextNo}`;
    localStorage.setItem(key, nextNo);
    return docNo;
  };

  // Generate reference ID
  const generateReferenceId = (prefix) => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  };

  // Fetch company details from API
  const fetchCompanyDetails = async () => {
    if (!companyId) return;

    setLoadingCompany(true);
    try {
      const response = await axiosInstance.get(`/auth/Company`);
      if (response.data && response.data.success) {
        // Find the current company from the list
        const currentCompany = response.data.data.find(
          (company) => company.id === parseInt(companyId)
        );

        if (currentCompany) {
          setCompanyDetails(currentCompany);

          // Update form data with company details
          setFormData((prev) => ({
            ...prev,
            companyName: currentCompany.name || "",
            companyAddress: currentCompany.address || "",
            companyEmail: currentCompany.email || "",
            companyPhone: currentCompany.phone || "",
            logo: currentCompany.branding?.company_logo_url || "",
          }));

          console.log("Company details loaded:", currentCompany);
        }
      }
    } catch (error) {
      console.error("Error fetching company details:", error);
    } finally {
      setLoadingCompany(false);
    }
  };

  // Fetch vendors from API
  const fetchVendors = async () => {
    if (!companyId) return;

    setLoadingVendors(true);
    try {
      const response = await axiosInstance.get(
        `/vendorCustomer/company/${companyId}?type=vender`
      );
      if (response.data && response.data.success) {
        setVendors(response.data.data);
        console.log("Vendors loaded:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    if (!companyId) return;

    setLoadingProducts(true);
    try {
      const response = await axiosInstance.get(
        `/products/company/${companyId}`
      );
      if (response.data && response.data.success) {
        setApiProducts(response.data.data);
        console.log("API Products loaded:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Form data state
  const [formData, setFormData] = useState(() => ({
    companyName: "",
    referenceId: "", // Auto-generated
    manualRefNo: "", // Optional manual input
    quotationNo: "", // Auto-generated
    manualQuotationNo: "", // Optional manual input
    companyAddress: "",
    companyEmail: "",
    companyPhone: "",
    quotationDate: "",
    validDate: "",
    vendorName: "",
    vendorAddress: "",
    vendorEmail: "",
    vendorPhone: "",
    items: [
      {
        name: "",
        qty: "",
        rate: "",
        tax: 0,
        discount: 0,
        warehouse: "", // Added warehouse field
      },
    ],
    bankName: "",
    accountNo: "",
    accountHolder: "",
    ifsc: "",
    notes: "",
    terms: "",
    signature: "",
    photo: "",
    files: [],
    logo: "", // Added logo field
  }));

  // State for modals and UI controls
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([
    "Electronics",
    "Furniture",
    "Apparel",
    "Stationery",
    "Other",
  ]);

  // Search state for each row
  const [rowSearchTerms, setRowSearchTerms] = useState({});
  const [showRowSearch, setShowRowSearch] = useState({});

  // New item state
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    hsn: "",
    tax: 0,
    sellingPrice: 0,
    uom: "PCS",
  });

  // Initialize form data and fetch company details, vendors, and products
  useEffect(() => {
    const generateRefId = (prefix) => {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}-${year}-${rand}`;
    };

    const generateDocNo = (prefix) => {
      return `${prefix}-${Date.now().toString().slice(-6)}`;
    };

    // Generate reference ID if not exists
    if (!formData.referenceId) {
      handleChange("referenceId", generateRefId("QRF"));
    }

    // Handle Quotation No: Use manual if provided, else generate
    if (!formData.quotationNo) {
      if (formData.manualQuotationNo) {
        handleChange("quotationNo", formData.manualQuotationNo);
      } else {
        handleChange("quotationNo", generateDocNo("QTN"));
      }
    }

    // If manualQuotationNo is updated after auto-generation, sync it
    if (
      formData.manualQuotationNo &&
      formData.manualQuotationNo !== formData.quotationNo
    ) {
      handleChange("quotationNo", formData.manualQuotationNo);
    }

    // Fetch company details, vendors, and products from API
    fetchCompanyDetails();
    fetchVendors();
    fetchProducts();
  }, [
    formData.referenceId,
    formData.quotationNo,
    formData.manualQuotationNo,
    companyId,
  ]);

  // Handlers
  const handleChange = (field, value) => {
    // Don't allow editing of company fields
    if (
      [
        "companyName",
        "companyAddress",
        "companyEmail",
        "companyPhone",
      ].includes(field)
    ) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleProductChange = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const handleRowSearchChange = (index, value) => {
    setRowSearchTerms((prev) => ({
      ...prev,
      [`purchaseQuotation-${index}`]: value,
    }));
  };

  const handleSelectSearchedItem = (index, item) => {
    // Create a copy of the items array
    const updatedItems = [...formData.items];

    // It's an API product
    updatedItems[index] = {
      ...updatedItems[index],
      name: item.item_name,
      rate: item.purchase_price || item.sale_price,
      tax: parseFloat(item.tax_account) || 0,
      hsn: item.hsn,
      uom: item.unit_detail?.uom_id || "PCS",
      productId: item.id, // Store product ID for reference
      warehouses: item.warehouses || [], // Store warehouses for selection
    };

    // Update the form data with the new item
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Hide search for this row
    setShowRowSearch((prev) => ({
      ...prev,
      [`purchaseQuotation-${index}`]: false,
    }));

    // Clear search term
    setRowSearchTerms((prev) => ({
      ...prev,
      [`purchaseQuotation-${index}`]: "",
    }));
  };

  const toggleRowSearch = (index) => {
    const rowKey = `purchaseQuotation-${index}`;
    setShowRowSearch((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  // Vendor search handlers
  const handleVendorSearchChange = (value) => {
    setVendorSearchTerm(value);
    setShowVendorSearch(true);
  };

  const handleSelectVendor = (vendor) => {
    // Update form data with vendor details
    setFormData((prev) => ({
      ...prev,
      vendorName: vendor.name_english || "",
      vendorAddress: vendor.address || "",
      vendorEmail: vendor.email || "",
      vendorPhone: vendor.phone || "",
      // Also update bank details if available
      bankName: vendor.bank_name_branch || "",
      accountNo: vendor.bank_account_number || "",
      accountHolder: vendor.account_name || "",
      ifsc: vendor.bank_ifsc || "",
    }));

    // Hide vendor search
    setShowVendorSearch(false);
    setVendorSearchTerm("");
  };

  const toggleVendorSearch = () => {
    setShowVendorSearch(!showVendorSearch);
  };

  // Filter vendors based on search term
  const getFilteredVendors = () => {
    if (!vendorSearchTerm) return vendors;

    return vendors.filter((vendor) => {
      const vendorName = vendor.name_english || "";
      const vendorCompany = vendor.company_name || "";
      const vendorEmail = vendor.email || "";
      const vendorPhone = vendor.phone || "";

      return (
        vendorName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
        (vendorCompany &&
          vendorCompany
            .toLowerCase()
            .includes(vendorSearchTerm.toLowerCase())) ||
        (vendorEmail &&
          vendorEmail.toLowerCase().includes(vendorSearchTerm.toLowerCase())) ||
        (vendorPhone &&
          vendorPhone.toLowerCase().includes(vendorSearchTerm.toLowerCase()))
      );
    });
  };

  const calculateTotalAmount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      return total + rate * qty;
    }, 0);
  };

  const calculateTotalWithTaxAndDiscount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      const tax = parseFloat(item.tax) || 0;
      const discount = parseFloat(item.discount) || 0;
      const subtotal = rate * qty;
      const taxAmount = (subtotal * tax) / 100;
      return total + subtotal + taxAmount - discount;
    }, 0);
  };

  // Top buttons handlers
  const handlePrint = (lang) => {
    const printContent = pdfRef.current;
    if (!printContent) {
      alert("No content to print!");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open("", "", "height=800,width=1000");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write(
      "<style>body { margin: 20px; font-family: Arial, sans-serif; }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContent.outerHTML); // Full rendered HTML
    printWindow.document.write("</body></html>");
    printWindow.document.close();

    // Wait for images to load
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const handleSend = () => {
    window.location.href = `mailto:?subject=Purchase Quotation&body=Please find the purchase quotation details attached.`;
  };

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `purchase-quotation-${formData.quotationNo || "document"
          }.pdf`,
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        html2canvas: { scale: 3 },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .save();
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formData.items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Quotation");
    XLSX.writeFile(
      workbook,
      `purchase-quotation-${formData.quotationNo || "draft"}.xlsx`
    );
  };

  const handleSaveDraft = () => onSubmit(formData, "purchaseQuotation");

  // File handlers
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("logo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("signature", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange("photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: reader.result,
        });

        if (newFiles.length === files.length) {
          handleChange("files", [...formData.files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    const updatedFiles = [...formData.files];
    updatedFiles.splice(index, 1);
    handleChange("files", updatedFiles);
  };

  // Product handlers
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      alert("Product name and category are required!");
      return;
    }
    const itemToAdd = {
      name: newItem.name,
      qty: 1,
      rate: newItem.sellingPrice,
      tax: newItem.tax,
      discount: 0,
      hsn: newItem.hsn,
      uom: newItem.uom,
      warehouse: "",
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, itemToAdd],
    }));

    setNewItem({
      name: "",
      category: "",
      hsn: "",
      tax: 0,
      sellingPrice: 0,
      uom: "PCS",
    });
    setShowAdd(false);
  };

  const handleUpdateItem = () => {
    console.log("Update item:", newItem);
    setShowEdit(false);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
      setNewItem((prev) => ({ ...prev, category: newCategory }));
      setNewCategory("");
    }
    setShowAddCategoryModal(false);
  };

  // Render items table
  const renderItemsTable = () => {
    const items = formData.items || [];

    // Filter items based on search term for each row
    const getFilteredItems = (index) => {
      const searchTerm = rowSearchTerms[`purchaseQuotation-${index}`] || "";
      if (!searchTerm) return apiProducts; // Return all products if search term is empty

      // Filter API products based on search term
      return apiProducts.filter((item) => {
        const itemName = item.item_name || "";
        const itemCategory = item.item_category?.item_category_name || "";

        return (
          itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (itemCategory &&
            itemCategory.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    };

    return (
      <div>
        <div className="d-flex justify-content-between mb-2">
          <div>
            <Button
              size="sm"
              onClick={addItem}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "6px 12px",
                fontWeight: "500",
                marginRight: "5px",
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "6px 12px",
                fontWeight: "500",
              }}
            >
              + Add Product
            </Button>
          </div>
        </div>

        <AddProductModal
          showAdd={showAdd}
          showEdit={showEdit}
          newItem={newItem}
          categories={categories}
          newCategory={newCategory}
          showUOMModal={showUOMModal}
          showAddCategoryModal={showAddCategoryModal}
          setShowAdd={setShowAdd}
          setShowEdit={setShowEdit}
          setShowUOMModal={setShowUOMModal}
          setShowAddCategoryModal={setShowAddCategoryModal}
          setNewCategory={setNewCategory}
          handleChange={handleProductChange}
          handleAddItem={handleAddItem}
          handleUpdateItem={handleUpdateItem}
          handleAddCategory={handleAddCategory}
          companyId={companyId}
        />

        <Table bordered hover size="sm" className="dark-bordered-table">
          <thead className="bg-light">
            <tr>
              <th>Item Name</th>
              <th>Warehouse</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Tax %</th>
              <th>Discount</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = parseInt(item.qty) || 0;
              const amount = (parseFloat(item.rate) || 0) * qty;
              const rowKey = `purchaseQuotation-${idx}`;
              const filteredItems = getFilteredItems(idx);
              const isSearchVisible = showRowSearch[rowKey];

              return (
                <tr key={idx}>
                  <td style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(idx, "name", e.target.value)
                        }
                        placeholder="Item Name"
                        style={{ marginRight: "5px" }}
                        onFocus={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Show search dropdown when focusing on the input
                          setShowRowSearch((prev) => ({
                            ...prev,
                            [rowKey]: true,
                          }));
                        }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleRowSearch(idx);
                        }}
                        title="Search Items"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    {isSearchVisible && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                          </InputGroup.Text>
                          <FormControl
                            placeholder="Search items..."
                            value={rowSearchTerms[rowKey] || ""}
                            onChange={(e) =>
                              handleRowSearchChange(idx, e.target.value)
                            }
                            autoFocus
                          />
                        </InputGroup>
                        {filteredItems.length > 0 ? (
                          <div
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                          >
                            {filteredItems.map((filteredItem) => {
                              // Convert price values to numbers before using toFixed
                              const purchasePrice =
                                parseFloat(filteredItem.purchase_price) || 0;
                              const salePrice =
                                parseFloat(filteredItem.sale_price) || 0;
                              const price = purchasePrice || salePrice;

                              return (
                                <div
                                  key={filteredItem.id}
                                  style={{
                                    padding: "8px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #eee",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleSelectSearchedItem(idx, filteredItem);
                                  }}
                                  onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f0f0f0")
                                  }
                                  onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "white")
                                  }
                                >
                                  <div>
                                    <strong>{filteredItem.item_name}</strong>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#666",
                                    }}
                                  >
                                    {
                                      filteredItem.item_category
                                        ?.item_category_name
                                    }{" "}
                                    - ${price.toFixed(2)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            {loadingProducts
                              ? "Loading products..."
                              : "No items found"}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={item.warehouse || ""}
                      onChange={(e) =>
                        handleItemChange(idx, "warehouse", e.target.value)
                      }
                    >
                      <option value="">Select Warehouse</option>
                      {item.warehouses &&
                        item.warehouses.map((warehouse, wIdx) => (
                          <option key={wIdx} value={warehouse.warehouse_id}>
                            {warehouse.warehouse_name} ({warehouse.location})
                          </option>
                        ))}
                    </Form.Select>
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      size="sm"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(idx, "qty", e.target.value)
                      }
                      placeholder="Qty"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.rate}
                      onChange={(e) =>
                        handleItemChange(idx, "rate", e.target.value)
                      }
                      placeholder="Rate"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.tax}
                      onChange={(e) =>
                        handleItemChange(idx, "tax", e.target.value)
                      }
                      placeholder="Tax %"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(idx, "discount", e.target.value)
                      }
                      placeholder="Discount"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={amount.toFixed(2)}
                      readOnly
                      style={{ backgroundColor: "#f8f9fa", fontWeight: "bold" }}
                    />
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeItem(idx);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  // Render PDF view
  const renderPDFView = () => {
    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "white",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* Header with Logo and Title */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              border: "2px dashed #28a745",
              padding: "10px",
              width: "120px",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Logo"
                style={{ maxWidth: "100%", maxHeight: "100px" }}
              />
            ) : (
              "Logo"
            )}
          </div>
          <div style={{ textAlign: "center", color: "#28a745" }}>
            <h2>PURCHASE QUOTATION</h2>
          </div>
        </div>
        <hr style={{ border: "2px solid #28a745", margin: "15px 0" }} />

        {/* Company Info */}
        <div style={{ marginBottom: "15px" }}>
          <h4>{formData.companyName}</h4>
          <p>{formData.companyAddress}</p>
          <p>
            Email: {formData.companyEmail} | Phone: {formData.companyPhone}
          </p>
        </div>

        {/* Vendor Info */}
        {formData.vendorName && (
          <div style={{ marginBottom: "15px" }}>
            <h5>Vendor</h5>
            <p>{formData.vendorName}</p>
            <p>{formData.vendorAddress}</p>
            <p>
              Email: {formData.vendorEmail} | Phone: {formData.vendorPhone}
            </p>
          </div>
        )}

        {/* Document Numbers */}
        <div style={{ marginBottom: "15px" }}>
          <strong>Ref NO:</strong> {formData.referenceId} |
          <strong>Quotation No.:</strong> {formData.quotationNo} |
          <strong>Date:</strong> {formData.quotationDate}
        </div>

        {/* Items Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Item Name
              </th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>Qty</th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>Rate</th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Tax %
              </th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Discount
              </th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Warehouse
              </th>
              <th style={{ border: "1px solid #000", padding: "8px" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, idx) => {
              const qty = parseInt(item.qty) || 0;
              const amount = (parseFloat(item.rate) || 0) * qty;
              return (
                <tr key={idx}>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {item.name}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {item.qty}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {parseFloat(item.rate).toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {item.tax}%
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {parseFloat(item.discount).toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {item.warehouse || ""}
                  </td>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    {amount.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={6}
                style={{
                  textAlign: "right",
                  fontWeight: "bold",
                  border: "1px solid #000",
                  padding: "8px",
                }}
              >
                Total:
              </td>
              <td
                style={{
                  fontWeight: "bold",
                  border: "1px solid #000",
                  padding: "8px",
                }}
              >
                ${calculateTotalWithTaxAndDiscount(formData.items).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Terms & Conditions */}
        {formData.terms && (
          <div style={{ marginBottom: "15px" }}>
            <strong>Terms & Conditions:</strong>
            <p>{formData.terms}</p>
          </div>
        )}

        {/* Attachments */}
        <div style={{ marginBottom: "15px" }}>
          {formData.signature && (
            <div>
              <strong>Signature:</strong>
              <br />
              <img
                src={formData.signature}
                alt="Signature"
                style={{
                  maxWidth: "150px",
                  maxHeight: "100px",
                  margin: "5px 0",
                }}
              />
            </div>
          )}
          {formData.photo && (
            <div>
              <strong>Photo:</strong>
              <br />
              <img
                src={formData.photo}
                alt="Photo"
                style={{
                  maxWidth: "150px",
                  maxHeight: "100px",
                  margin: "5px 0",
                }}
              />
            </div>
          )}
          {formData.files && formData.files.length > 0 && (
            <div>
              <strong>Files:</strong>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {formData.files.map((file, i) => (
                  <li key={i}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p
          style={{ textAlign: "center", fontWeight: "bold", marginTop: "30px" }}
        >
          Thank you for your business!
        </p>
      </div>
    );
  };

  // Render attachment fields
  const renderAttachmentFields = () => {
    return (
      <div className="mt-4 mb-4">
        <h5>Attachments</h5>
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Signature</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
              />
              {formData.signature && (
                <div className="mt-2">
                  <img
                    src={formData.signature}
                    alt="Signature"
                    style={{
                      width: "100px",
                      height: "50px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Photo</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt="Photo"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Attach Files</Form.Label>
              <Form.Control type="file" multiple onChange={handleFileChange} />
              {formData.files && formData.files.length > 0 && (
                <div className="mt-2">
                  <ul className="list-unstyled">
                    {formData.files.map((file, index) => (
                      <li
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span
                          style={{
                            display: "inline-block",
                            maxWidth: "150px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            verticalAlign: "middle",
                            marginBottom: "12px"
                          }}
                        >
                          {file.name}
                        </span>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>
      </div>
    );
  };

  // Render vendor search dropdown
  const renderVendorSearch = () => {
    const filteredVendors = getFilteredVendors();

    return (
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <InputGroup>
          <FormControl
            placeholder="Enter Vendor Name....."
            value={formData.vendorName}
            onChange={(e) => {
              handleChange("vendorName", e.target.value);
              handleVendorSearchChange(e.target.value);
            }}
            onFocus={() => setShowVendorSearch(true)}
          />
          <Button
            variant="outline-secondary"
            onClick={toggleVendorSearch}
            title="Search Vendors"
          >
            <FontAwesomeIcon icon={faSearch} />
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/Company/vendorscreditors")}
            title="Add Vendor"
            style={{
              backgroundColor: "#53b2a5",
              border: "none",
              padding: "6px 12px",
              fontWeight: "500",
            }}
          >
            Add Vendor
          </Button>
        </InputGroup>

        {showVendorSearch && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectVendor(vendor);
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0f0f0")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  <div>
                    <strong>{vendor.name_english}</strong>
                    {vendor.company_name && (
                      <span> - {vendor.company_name}</span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    {vendor.email} | {vendor.phone}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#666" }}>
                    {vendor.address}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "10px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                {loadingVendors ? "Loading vendors..." : "No vendors found"}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="container-fluid mt-4 px-2" ref={pdfRef}>
        <Form>
          {/* Header: Logo + Company Info + Title */}
          <Row className="mb-4 mt-3">
            <Col
              md={3}
              className="d-flex align-items-center justify-content-center"
            >
              <div
                className="border rounded d-flex flex-column align-items-center justify-content-center"
                style={{
                  height: "120px",
                  width: "100%",
                  borderStyle: "dashed",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById("logo-upload")?.click()}
              >
                {formData.logo ? (
                  <img
                    src={formData.logo}
                    alt="Company Logo"
                    style={{ maxWidth: "100%", maxHeight: "100px" }}
                  />
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faUpload}
                      size="2x"
                      className="text-muted"
                    />
                    <small>Upload Logo</small>
                  </>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleLogoChange}
                />
              </div>
            </Col>

            <Col md={6}>
              <div className="d-flex flex-column gap-1">
                <Form.Control
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Enter Your Company Name......."
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    backgroundColor: "#f8f9fa", // Added to indicate read-only
                    cursor: "default", // Added to indicate read-only
                  }}
                  readOnly // Added to make field read-only
                />
                <Form.Control
                  type="text"
                  value={formData.companyAddress}
                  onChange={(e) =>
                    handleChange("companyAddress", e.target.value)
                  }
                  placeholder="Company Address, City, State, Pincode......."
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    backgroundColor: "#f8f9fa", // Added to indicate read-only
                    cursor: "default", // Added to indicate read-only
                  }}
                  readOnly // Added to make field read-only
                />
                <Form.Control
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => handleChange("companyEmail", e.target.value)}
                  placeholder="Company Email......."
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    backgroundColor: "#f8f9fa", // Added to indicate read-only
                    cursor: "default", // Added to indicate read-only
                  }}
                  readOnly // Added to make field read-only
                />
                <Form.Control
                  type="text"
                  value={formData.companyPhone}
                  onChange={(e) => handleChange("companyPhone", e.target.value)}
                  placeholder="Phone No........"
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    backgroundColor: "#f8f9fa", // Added to indicate read-only
                    cursor: "default", // Added to indicate read-only
                  }}
                  readOnly // Added to make field read-only
                />
              </div>
            </Col>
            <Col
              md={3}
              className="d-flex flex-column align-items-end justify-content-center"
            >
              <h2 className="text-success mb-0">PURCHASE QUOTATION</h2>
              <hr
                style={{
                  width: "80%",
                  borderColor: "#28a745",
                  marginTop: "5px",
                  marginBottom: "10px",
                }}
              />
            </Col>
          </Row>

          <hr
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "#28a745",
              border: "none",
              marginTop: "5px",
              marginBottom: "10px",
            }}
          />

          {/* Quotation & Vendor Info */}
          <Row className="mb-4 d-flex justify-content-between">
            <Col md={8}>
              <h5>Quotation From</h5>
              {renderVendorSearch()}

              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.vendorAddress}
                  onChange={(e) =>
                    handleChange("vendorAddress", e.target.value)
                  }
                  placeholder="Vendor Address"
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  value={formData.vendorEmail}
                  onChange={(e) => handleChange("vendorEmail", e.target.value)}
                  placeholder="Email"
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.vendorPhone}
                  onChange={(e) => handleChange("vendorPhone", e.target.value)}
                  placeholder="Phone"
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Reference No</Form.Label>
                <Form.Control
                  type="text"
                  value={
                    formData.referenceId || generateReferenceId("quotation")
                  }
                  readOnly
                  style={{
                    border: "1px solid #495057",
                    backgroundColor: "#f8f9fa",
                    fontWeight: "500",
                  }}
                  placeholder="PUR-QRF-2025-XXXX"
                />
              </Form.Group>
              {/* Purchase Quotation - Manual Reference No. */}
              <Form.Group className="mb-2">
                <Form.Label
                  className="mb-0"
                  style={{
                    fontSize: "0.9rem",
                    color: "#6c757d",
                    whiteSpace: "nowrap",
                  }}
                >
                  Manual Ref. No. (Optional)
                </Form.Label>

                <Form.Control
                  type="text"
                  value={formData.manualRefNo}
                  onChange={(e) => handleChange("manualRefNo", e.target.value)}
                  placeholder="e.g. PUR-PO-001"
                  style={{
                    border: "1px solid #495057",
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0.375rem 0.75rem",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Quotation No.</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.quotationNo}
                  onChange={(e) => handleChange("quotationNo", e.target.value)}
                  placeholder="e.g. PQ-001"
                  style={{ border: "1px solid #495057" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Quotation Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.quotationDate}
                  onChange={(e) =>
                    handleChange("quotationDate", e.target.value)
                  }
                  style={{ border: "1px solid #495057" }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Valid Till</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.validDate}
                  onChange={(e) => handleChange("validDate", e.target.value)}
                  style={{ border: "1px solid #495057" }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Items Table */}
          <Row className="mb-4">
            <Col>{renderItemsTable()}</Col>
          </Row>

          <hr
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "#28a745",
              border: "none",
              marginTop: "5px",
              marginBottom: "10px",
            }}
          />

          {/* Totals - Moved to left side */}
          <Row className="mb-4 mt-2">
            <Col md={4}>
              <Table bordered size="sm" className="dark-bordered-table">
                <tbody>
                  <tr>
                    <td className="fw-bold">Sub Total:</td>
                    <td>
                      ${" "}
                      {formData.items
                        .reduce(
                          (sum, item) =>
                            sum +
                            (parseFloat(item.rate) || 0) *
                            (parseInt(item.qty) || 0),
                          0
                        )
                        .toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Tax:</td>
                    <td>
                      ${" "}
                      {formData.items
                        .reduce((sum, item) => {
                          const subtotal =
                            (parseFloat(item.rate) || 0) *
                            (parseInt(item.qty) || 0);
                          return (
                            sum + (subtotal * (parseFloat(item.tax) || 0)) / 100
                          );
                        }, 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Discount:</td>
                    <td>
                      ${" "}
                      {formData.items
                        .reduce(
                          (sum, item) => sum + (parseFloat(item.discount) || 0),
                          0
                        )
                        .toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Total:</td>
                    <td className="fw-bold">
                      ${" "}
                      {calculateTotalWithTaxAndDiscount(formData.items).toFixed(
                        2
                      )}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <hr
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "#28a745",
              border: "none",
              marginTop: "5px",
              marginBottom: "10px",
            }}
          />

          {/* Bank & Notes */}
          <Row className="mb-4">
            <h5>Bank Details</h5>
            <Col
              md={6}
              className="p-2 rounded"
              style={{ border: "1px solid #343a40" }}
            >
              {["bankName", "accountNo", "accountHolder", "ifsc"].map(
                (field) => (
                  <Form.Group key={field} className="mb-2">
                    <Form.Control
                      type="text"
                      placeholder={
                        {
                          bankName: "Bank Name",
                          accountNo: "Account No.",
                          accountHolder: "Account Holder",
                          ifsc: "IFSC Code",
                        }[field]
                      }
                      value={formData[field] || ""}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className="form-control-no-border"
                      style={{
                        fontSize: "1rem",
                        lineHeight: "1.5",
                        minHeight: "auto",
                        padding: "0",
                      }}
                    />
                  </Form.Group>
                )
              )}
            </Col>
            <Col md={6}>
              <h5>Notes</h5>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Enter any additional notes"
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
                style={{ border: "1px solid #343a40" }}
              />
            </Col>
          </Row>

          <hr
            style={{
              width: "100%",
              height: "4px",
              backgroundColor: "#28a745",
              border: "none",
              marginTop: "5px",
              marginBottom: "10px",
            }}
          />

          {/* Terms & Footer */}
          <Row className="mb-4">
            <Col>
              <Form.Group>
                <Form.Label>Terms & Conditions</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.terms}
                  onChange={(e) => handleChange("terms", e.target.value)}
                  placeholder="e.g. Payment within 15 days"
                  style={{ border: "1px solid #343a40" }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Attachment Fields */}
          {renderAttachmentFields()}

          <Row className="text-center mb-4">
            <Col>
              <p>
                <strong>Thank you for your business!</strong>
              </p>
              <p className="text-muted">www.yourcompany.com</p>
            </Col>
          </Row>

          {/* Navigation */}
          <div className="d-flex justify-content-between mt-5">
            <Button variant="secondary" onClick={() => { }}>
              Skip
            </Button>
            <Button variant="warning" onClick={handleSaveDraft}>
              Save
            </Button>
            <Button variant="primary" onClick={() => { }}>
              Save & Next
            </Button>
            <Button variant="success" onClick={() => { }}>
              Next
            </Button>
          </div>
        </Form>
      </div>

      {/* Hidden PDF View - Only for PDF generation and printing */}
      <div
        style={{
          visibility: "hidden",
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "210mm",
          padding: "15mm",
          boxSizing: "border-box",
        }}
      >
        <div id="pdf-view" ref={pdfRef}>
          {renderPDFView()}
        </div>
      </div>
    </>
  );
};

export default PurchaseQuotationTab;

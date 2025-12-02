import React, { useState, useRef, useEffect } from "react";
import { Form, Button, Table, Row, Col, InputGroup, FormControl, Tabs, Tab, Alert,} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTrash, faSearch, faPlus,} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import AddProductModal from "../Inventory/AddProductModal";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";

const MultiStepPurchaseForm = ({ onSubmit, initialData, initialStep, onClose,selectedOrder }) => {
  const companyId = GetCompanyId();
  const navigate = useNavigate();
  const location = useLocation();
  const pdfRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
    console.log(selectedOrder)
  // State
  const [activeTab, setActiveTab] = useState(initialStep || "purchaseQuotation");
  const [poId, setPoId] = useState(null); // Critical: ID from POST
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===============================
  // MASTER FORM DATA
  // ===============================
  const [formData, setFormData] = useState({
    purchaseQuotation: {
      companyName: "",
      referenceId: `QRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      manualRefNo: "",
      quotationNo: `PQ-${Date.now().toString().slice(-6)}`,
      manualQuotationNo: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      quotationDate: "",
      validDate: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      items: [{ name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "", hsn: "", uom: "PCS" }],
      bankName: "",
      accountNo: "",
      accountHolder: "",
      ifsc: "",
      notes: "",
      terms_and_conditions: "",
      signature: "",
      photo: "",
      files: [],
      logo: "",
    },
    purchaseOrder: {
      referenceId: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      manualRefNo: "",
      orderNo: `PO-${Date.now().toString().slice(-6)}`,
      manualOrderNo: "",
      quotationNo: "",
      manualQuotationNo: "",
      orderDate: "",
      deliveryDate: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      items: [{ name: "", qty: "", rate: "", tax: 0, discount: 0, hsn: "", uom: "PCS" }],
      terms: "",
      signature: "",
      photo: "",
      files: [],
    },
    goodsReceipt: {
      referenceId: `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      manualRefNo: "",
      purchaseOrderNo: "",
      receiptNo: `GR-${Date.now().toString().slice(-6)}`,
      manualReceiptNo: "",
      receiptDate: "",
      vehicleNo: "",
      driverName: "",
      driverPhone: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      shipToName: "",
      shipToAddress: "",
      shipToEmail: "",
      shipToPhone: "",
      items: [{ name: "", qty: "", receivedQty: "", rate: "", tax: 0, discount: 0, hsn: "", uom: "PCS" }],
      terms: "",
      signature: "",
      photo: "",
      files: [],
    },
    bill: {
      referenceId: `BILL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      manualRefNo: "",
      billNo: `BILL-${Date.now().toString().slice(-6)}`,
      manualBillNo: "",
      goodsReceiptNo: "",
      manualGoodsReceiptNo: "",
      billDate: "",
      dueDate: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      items: [{ description: "", qty: "", rate: "", tax: "", discount: "", amount: "", hsn: "", uom: "PCS" }],
      terms: "",
      signature: "",
      photo: "",
      files: [],
    },
    payment: {
      referenceId: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      manualRefNo: "",
      paymentNo: `PAY-${Date.now().toString().slice(-6)}`,
      manualPaymentNo: "",
      billNo: "",
      manualBillNo: "",
      Manual_payment_no:"",
      paymentDate: "",
      amount: "",
      paymentMethod: "",
      paymentStatus: "Pending",
      note: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      companyName: "",
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      totalAmount: "",
      footerNote: "Thank you for your payment!",
      signature: "",
      photo: "",
      files: [],
    },
  });

  // ===============================
  // API DATA
  // ===============================
  const [companyDetails, setCompanyDetails] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [apiProducts, setApiProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [categories] = useState([
    "Electronics",
    "Furniture",
    "Apparel",
    "Stationery",
    "Other",
  ]);

  // ===============================
  // MODAL & UI STATES
  // ===============================
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    hsn: "",
    tax: 0,
    sellingPrice: 0,
    uom: "PCS",
  });
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [rowSearchTerms, setRowSearchTerms] = useState({});
  const [showRowSearch, setShowRowSearch] = useState({});
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [showVendorSearch, setShowVendorSearch] = useState(false);

  // ===============================
  // FETCHERS
  // ===============================
  const fetchCompanyDetails = async () => {
    if (!companyId) return;
    try {
      const res = await axiosInstance.get(`auth/Company`);
      const current = res.data?.data?.find((c) => c.id === parseInt(companyId));
      if (current) {
        setCompanyDetails(current);
        setFormData((prev) => ({
          ...prev,
          purchaseQuotation: {
            ...prev.purchaseQuotation,
            companyName: current.name || "",
            companyAddress: current.address || "",
            companyEmail: current.email || "",
            companyPhone: current.phone || "",
            logo: current.branding?.company_logo_url || "",
            terms_and_conditions: current.terms_and_conditions || "",
            notes: current.notes || "",
          },
        }));
        // Propagate to other tabs
        ["purchaseOrder", "goodsReceipt", "bill", "payment"].forEach((tab) => {
          setFormData((prev) => ({
            ...prev,
            [tab]: {
              ...prev[tab], ...{
                companyName: current.name || "",
                companyAddress: current.address || "",
                companyEmail: current.email || "",
                companyPhone: current.phone || "",
              }
            },
          }));
        });
      }
    } catch (err) {
      console.error("Error fetching company:", err);
    }
  };

  const fetchVendors = async () => {
    if (!companyId) return;
    try {
      const res = await axiosInstance.get(`vendorCustomer/company/${companyId}?type=vender`);
      if (res.data?.success) setVendors(res.data.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  const fetchProducts = async () => {
    if (!companyId) return;
    try {
      const res = await axiosInstance.get(`/products/company/${companyId}`);
      if (res.data?.success) setApiProducts(res.data.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchWarehouses = async () => {
    if (!companyId) return;
    try {
      const res = await axiosInstance.get(`warehouses/company/${companyId}`);
      if (res.data?.success) setWarehouses(res.data.data);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
    fetchVendors();
    fetchProducts();
    fetchWarehouses();
  }, [companyId]);

  // ===============================
  // UTILS
  // ===============================
  const calculateTotalWithTaxAndDiscount = (items) => {
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty || item.receivedQty) || 0;
      const tax = parseFloat(item.tax) || 0;
      const discount = parseFloat(item.discount) || 0;
      const sub = rate * qty;
      return total + sub + (sub * tax) / 100 - discount;
    }, 0);
  };

  const calculateTotalAmount = (items) => {
    return items.reduce(
      (t, i) => t + (parseFloat(i.rate) || 0) * (parseInt(i.qty || i.receivedQty) || 0),
      0
    );
  };

  // ===============================
  // FILE HANDLERS
  // ===============================
  const handleFileChange = (tab, field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: reader.result } }));
    };
    reader.readAsDataURL(file);
  };

  const handleMultiFileChange = (tab, e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({ name: file.name, size: file.size, base64: reader.result });
        if (newFiles.length === files.length) {
          setFormData((prev) => ({
            ...prev,
            [tab]: { ...prev[tab], files: [...(prev[tab].files || []), ...newFiles] },
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (tab, index) => {
    setFormData((prev) => {
      const updated = [...(prev[tab].files || [])];
      updated.splice(index, 1);
      return { ...prev, [tab]: { ...prev[tab], files: updated } };
    });
  };

  // ===============================
  // API INTEGRATION
  // ===============================
  const uiStepToApiStep = {
    purchaseQuotation: "quotation",
    purchaseOrder: "purchase_order",
    goodsReceipt: "goods_receipt",
    bill: "bill",
    payment: "payment",
  };

  const apiStepToUiStep = {
    quotation: "purchaseQuotation",
    purchase_order: "purchaseOrder",
    goods_receipt: "goodsReceipt",
    bill: "bill",
    payment: "payment",
  };

  // CREATE (Step 1)
  const createPurchaseOrder = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post(`purchase-orders/create-purchase-order`, payload);
      if (res.data.success) {
        const id = res.data.data.company_info.id;
        setPoId(id);
        setSuccess("Purchase order created!");
        await loadPurchaseOrder(id);
        return id;
      } else {
        throw new Error(res.data.message || "Creation failed");
      }
    } catch (err) {
      setError(err.message || "Failed to create PO");
      console.error("POST error:", err);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE (Steps 2–5)
  const updatePurchaseOrder = async (id, stepData) => {
    setLoading(true);
    setError(null);
    try {
      const payload = { steps: stepData };
      const res = await axiosInstance.put(`purchase-orders/create-purchase-order/${id}`, payload);
      if (res.data.success) {
        setSuccess("Step updated!");
        await loadPurchaseOrder(id);
      } else {
        throw new Error(res.data.message || "Update failed");
      }
    } catch (err) {
      setError(err.message || "Failed to update step");
      console.error("PUT error:", err);
    } finally {
      setLoading(false);
    }
  };
  console.log(selectedOrder)
   useEffect(() => {
  // Check if we have a PO ID from props
  if (selectedOrder?.id) {
    loadPurchaseOrder(selectedOrder.id);
  }
}, [selectedOrder?.id]);

 


  const loadPurchaseOrder = async (id) => {
    try {
      const res = await axiosInstance.get(`purchase-orders/${id}`);
      if (res.data) {
         setPoId(id);
        const apiData = res.data.data;
        console.log("API Data", apiData);
        
     
        const formatDate = (iso) => (iso ? iso.split("T")[0] : "");

        const newFormData = {
          purchaseQuotation: {
            companyName: apiData.company_info?.company_name || "",
            referenceId: apiData.steps?.find(s => s.step === "quotation")?.data?.ref_no || `QRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            manualRefNo: apiData.steps?.find(s => s.step === "quotation")?.data?.manual_ref_no || "",
            quotationNo: apiData.steps?.find(s => s.step === "quotation")?.data?.quotation_no || `PQ-${Date.now().toString().slice(-6)}`,
            manualQuotationNo: apiData.steps?.find(s => s.step === "quotation")?.data?.manual_quo_no || "",
            companyAddress: apiData.company_info?.company_address || "",
            companyEmail: apiData.company_info?.company_email || "",
            companyPhone: apiData.company_info?.company_phone || "",
            logo: apiData.company_info?.logo_url || "",
            quotationDate: formatDate(apiData.steps?.find(s => s.step === "quotation")?.data?.quotation_date),
            validDate: formatDate(apiData.steps?.find(s => s.step === "quotation")?.data?.valid_till),
            vendorName: apiData.shipping_details?.bill_to_company_name || apiData.steps?.find(s => s.step === "quotation")?.data?.quotation_from_vendor_name || "",
            vendorAddress: apiData.shipping_details?.bill_to_company_address || apiData.steps?.find(s => s.step === "quotation")?.data?.quotation_from_vendor_address || "",
            vendorEmail: apiData.shipping_details?.bill_to_company_email || apiData.steps?.find(s => s.step === "quotation")?.data?.quotation_from_vendor_email || "",
            vendorPhone: apiData.shipping_details?.bill_to_company_phone || apiData.steps?.find(s => s.step === "quotation")?.data?.quotation_from_vendor_phone || "",
            items: apiData.items?.map((i) => ({
              name: i.item_name || "",
              qty: i.qty || "",
              rate: i.rate || "",
              tax: parseFloat(i.tax_percent) || 0,
              discount: parseFloat(i.discount) || 0,
              hsn: "",
              uom: "PCS",
            })) || [{ name: "", qty: "", rate: "", tax: 0, discount: 0, warehouse: "", hsn: "", uom: "PCS" }],
            bankName: apiData.company_info?.bank_name || "",
            accountNo: apiData.company_info?.account_no || "",
            accountHolder: apiData.company_info?.account_holder || "",
            ifsc: apiData.company_info?.ifsc_code || "",
            notes: apiData.company_info?.notes || "",
            terms_and_conditions: apiData.company_info?.terms || "",
            signature: apiData.additional_info?.signature_url || "",
            photo: apiData.additional_info?.photo_url || "",
            files: apiData.additional_info?.files || [],
          },
          purchaseOrder: {
            referenceId: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            manualRefNo: "",
            orderNo: apiData.steps?.find(s => s.step === "purchase_order")?.data?.PO_no || `PO-${Date.now().toString().slice(-6)}`,
            manualOrderNo: apiData.steps?.find(s => s.step === "purchase_order")?.data?.Manual_PO_ref || "",
            quotationNo: apiData.steps?.find(s => s.step === "quotation")?.data?.quotation_no || "",
            manualQuotationNo: apiData.steps?.find(s => s.step === "quotation")?.data?.manual_quo_no || "",
            orderDate: "",
            deliveryDate: "",
            companyName: apiData.company_info?.company_name || "",
            companyAddress: apiData.company_info?.company_address || "",
            companyEmail: apiData.company_info?.company_email || "",
            companyPhone: apiData.company_info?.company_phone || "",
            vendorName: apiData.shipping_details?.bill_to_company_name || "",
            vendorAddress: apiData.shipping_details?.bill_to_company_address || "",
            vendorEmail: apiData.shipping_details?.bill_to_company_email || "",
            vendorPhone: apiData.shipping_details?.bill_to_company_phone || "",
            items: apiData.items?.map((i) => ({
              name: i.item_name || "",
              qty: i.qty || "",
              rate: i.rate || "",
              tax: parseFloat(i.tax_percent) || 0,
              discount: parseFloat(i.discount) || 0,
              hsn: "",
              uom: "PCS",
            })) || [{ name: "", qty: "", rate: "", tax: 0, discount: 0, hsn: "", uom: "PCS" }],
            terms: apiData.company_info?.terms || "",
            signature: apiData.additional_info?.signature_url || "",
            photo: apiData.additional_info?.photo_url || "",
            files: [],
          },
          goodsReceipt: {
            referenceId: `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            manualRefNo: "",
            purchaseOrderNo: apiData.steps?.find(s => s.step === "purchase_order")?.data?.PO_no || "",
            receiptNo: apiData.steps?.find(s => s.step === "goods_receipt")?.data?.GR_no || `GR-${Date.now().toString().slice(-6)}`,
            manualReceiptNo: apiData.steps?.find(s => s.step === "goods_receipt")?.data?.Manual_GR_no || "",
            receiptDate: "",
            vehicleNo: apiData.steps?.find(s => s.step === "goods_receipt")?.data?.vehicle_no || "",
            driverName: apiData.steps?.find(s => s.step === "goods_receipt")?.data?.driver_name || "",
            driverPhone: apiData.steps?.find(s => s.step === "goods_receipt")?.data?.driver_phone || "",
            companyName: apiData.company_info?.company_name || "",
            companyAddress: apiData.company_info?.company_address || "",
            companyEmail: apiData.company_info?.company_email || "",
            companyPhone: apiData.company_info?.company_phone || "",
            vendorName: apiData.shipping_details?.bill_to_company_name || "",
            vendorAddress: apiData.shipping_details?.bill_to_company_address || "",
            vendorEmail: apiData.shipping_details?.bill_to_company_email || "",
            vendorPhone: apiData.shipping_details?.bill_to_company_phone || "",
            shipToName: apiData.shipping_details?.ship_to_company_name || "",
            shipToAddress: apiData.shipping_details?.ship_to_company_address || "",
            shipToEmail: apiData.shipping_details?.ship_to_company_email || "",
            shipToPhone: apiData.shipping_details?.ship_to_company_phone || "",
            items: apiData.items?.map((i) => ({
              name: i.item_name || "",
              qty: i.qty || "",
              receivedQty: i.qty || "",
              rate: i.rate || "",
              tax: parseFloat(i.tax_percent) || 0,
              discount: parseFloat(i.discount) || 0,
              hsn: "",
              uom: "PCS",
            })) || [{ name: "", qty: "", receivedQty: "", rate: "", tax: 0, discount: 0, hsn: "", uom: "PCS" }],
            terms: apiData.company_info?.terms || "",
            signature: apiData.additional_info?.signature_url || "",
            photo: apiData.additional_info?.photo_url || "",
            files: [],
          },
          bill: {
            referenceId: `BILL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            manualRefNo: "",
            billNo: apiData.steps?.find(s => s.step === "bill")?.data?.Bill_no || `BILL-${Date.now().toString().slice(-6)}`,
            manualBillNo: apiData.steps?.find(s => s.step === "bill")?.data?.Manual_Bill_no || "",
            goodsReceiptNo: apiData.steps?.find(s => s.step === "goods_receipt")?.data?.GR_no || "",
            manualGoodsReceiptNo: apiData.steps?.find(s => s.step === "goods_receipt")?.data?.Manual_GR_no || "",
            billDate: "",
            dueDate: formatDate(apiData.steps?.find(s => s.step === "bill")?.data?.due_date),
            companyName: apiData.company_info?.company_name || "",
            companyAddress: apiData.company_info?.company_address || "",
            companyEmail: apiData.company_info?.company_email || "",
            companyPhone: apiData.company_info?.company_phone || "",
            vendorName: apiData.shipping_details?.bill_to_company_name || "",
            vendorAddress: apiData.shipping_details?.bill_to_company_address || "",
            vendorEmail: apiData.shipping_details?.bill_to_company_email || "",
            vendorPhone: apiData.shipping_details?.bill_to_company_phone || "",
            shipToName: apiData.shipping_details?.ship_to_company_name || "",
            shipToAddress: apiData.shipping_details?.ship_to_company_address || "",
            shipToEmail: apiData.shipping_details?.ship_to_company_email || "",
            shipToPhone: apiData.shipping_details?.ship_to_company_phone || "",
            items: apiData.items?.map((i) => ({
              description: i.item_name || "",
              qty: i.qty || "",
              rate: i.rate || "",
              tax: parseFloat(i.tax_percent) || 0,
              discount: parseFloat(i.discount) || 0,
              amount: ((parseFloat(i.rate) || 0) * (parseInt(i.qty) || 0)).toFixed(2),
              hsn: "",
              uom: "PCS",
            })) || [{ description: "", qty: "", rate: "", tax: "", discount: "", amount: "", hsn: "", uom: "PCS" }],
            terms: apiData.company_info?.terms || "",
            signature: apiData.additional_info?.signature_url || "",
            photo: apiData.additional_info?.photo_url || "",
            files: [],
          },
          payment: {
            referenceId: `PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            manualRefNo: "",
            paymentNo: apiData.steps?.find(s => s.step === "payment")?.data?.Payment_no || `PAY-${Date.now().toString().slice(-6)}`,
            manualPaymentNo: apiData.steps?.find(s => s.step === "payment")?.data?.Manual_payment_no || "",
            billNo: apiData.steps?.find(s => s.step === "bill")?.data?.Bill_no || "",
            manualBillNo: apiData.steps?.find(s => s.step === "bill")?.data?.Manual_Bill_no || "",
            paymentDate: "",
            amount: apiData.steps?.find(s => s.step === "payment")?.data?.amount_paid || "",
            paymentMethod: "",
            paymentStatus: apiData.steps?.find(s => s.step === "payment")?.data?.payment_status || "Pending",
            note: apiData.steps?.find(s => s.step === "payment")?.data?.payment_note || "",
            vendorName: apiData.shipping_details?.bill_to_company_name || apiData.steps?.find(s => s.step === "payment")?.data?.payment_made_vendor_name || "",
            vendorAddress: apiData.shipping_details?.bill_to_company_address || apiData.steps?.find(s => s.step === "payment")?.data?.payment_made_vendor_address || "",
            vendorEmail: apiData.shipping_details?.bill_to_company_email || apiData.steps?.find(s => s.step === "payment")?.data?.payment_made_vendor_email || "",
            vendorPhone: apiData.shipping_details?.bill_to_company_phone || apiData.steps?.find(s => s.step === "payment")?.data?.payment_made_vendor_phone || "",
            companyName: apiData.company_info?.company_name || "",
            companyAddress: apiData.company_info?.company_address || "",
            companyEmail: apiData.company_info?.company_email || "",
            companyPhone: apiData.company_info?.company_phone || "",
            totalAmount: calculateTotalWithTaxAndDiscount(apiData.items?.map((i) => ({
              name: i.item_name || "",
              qty: i.qty || "",
              rate: i.rate || "",
              tax: parseFloat(i.tax_percent) || 0,
              discount: parseFloat(i.discount) || 0,
            })) || []),
            footerNote: "Thank you for your payment!",
            signature: apiData.additional_info?.signature_url || "",
            photo: apiData.additional_info?.photo_url || "",
            files: [],
          },
        };

        console.log("New Form Data:", newFormData); // Debug log
        setFormData(newFormData);
      }
    } catch (err) {
      setError("Failed to load PO");
      console.error("GET error:", err);
    }
  };

  useEffect(() => {
    // Check if we have a PO ID from URL or props
    const urlParams = new URLSearchParams(location.search);
    const poIdFromUrl = urlParams.get('poId') || initialData?.poId;
    
    if (poIdFromUrl) {
      setPoId(poIdFromUrl);
      loadPurchaseOrder(poIdFromUrl);
    }
  }, [location.search, initialData]);

  useEffect(() => {
    if (poId && activeTab !== "purchaseQuotation") {
      loadPurchaseOrder(poId);
    }
  }, [activeTab, poId]);

const handleSaveStep = async () => {
  setError(null);
  setSuccess(null);
  const currentApiStep = uiStepToApiStep[activeTab];
  if (!currentApiStep) return;

  if (!poId) {
    // STEP 1: POST
    const pq = formData.purchaseQuotation;
    const items = pq.items.map((i) => ({
      item_name: i.name,
      qty: i.qty,
      rate: i.rate,
      tax_percent: i.tax,
      discount: i.discount,
      amount: (parseFloat(i.rate) || 0) * (parseInt(i.qty) || 0),
    }));

    // Get ship to data from the current active tab
    const getShipToData = () => {
      if (activeTab === "goodsReceipt") {
        return {
          ship_to_attention_name: formData.goodsReceipt.shipToName || "",
          ship_to_company_name: formData.goodsReceipt.shipToName || "",
          ship_to_company_address: formData.goodsReceipt.shipToAddress || "",
          ship_to_company_email: formData.goodsReceipt.shipToEmail || "",
          ship_to_company_phone: formData.goodsReceipt.shipToPhone || "",
        };
      } else if (activeTab === "bill") {
        return {
          ship_to_attention_name: formData.bill.shipToName || "",
          ship_to_company_name: formData.bill.shipToName || "",
          ship_to_company_address: formData.bill.shipToAddress || "",
          ship_to_company_email: formData.bill.shipToEmail || "",
          ship_to_company_phone: formData.bill.shipToPhone || "",
        };
      } else {
        // Default empty values for other tabs
        return {
          ship_to_attention_name: "",
          ship_to_company_name: "",
          ship_to_company_address: "",
          ship_to_company_email: "",
          ship_to_company_phone: "",
        };
      }
    };

    const payload = {
      company_info: {
        company_id: companyId,
        company_name: pq.companyName,
        company_address: pq.companyAddress,
        company_email: pq.companyEmail,
        company_phone: pq.companyPhone,
        bank_name: pq.bankName,
        account_no: pq.accountNo,
        account_holder: pq.accountHolder,
        ifsc_code: pq.ifsc,
        terms: pq.terms_and_conditions,
        notes: pq.notes,
      },
      shipping_details: {
        bill_to_attention_name: pq.vendorName,
        bill_to_company_name: pq.vendorName,
        bill_to_company_address: pq.vendorAddress,
        bill_to_company_email: pq.vendorEmail,
        bill_to_company_phone: pq.vendorPhone,
        // Use ship to data from the current active tab
        ...getShipToData(),
      },
      items,
      steps: {
        quotation: {
          quotation_from_vendor_name: pq.vendorName,
          quotation_from_vendor_address: pq.vendorAddress,
          quotation_from_vendor_email: pq.vendorEmail,
          quotation_from_vendor_phone: pq.vendorPhone,
          ref_no: pq.referenceId,
          manual_ref_ro: pq.manualRefNo,
          quotation_no: pq.quotationNo,
          manual_quo_no: pq.manualRefNo,
          quotation_date: pq.quotationDate,
          valid_till: pq.validDate,
        },
        purchase_order: {},
        goods_receipt: {},
        bill: {},
        payment: {},
      },
      sub_total: calculateTotalAmount(items),
      tax: items.reduce((s, i) => {
        const sub = (parseFloat(i.rate) || 0) * (parseInt(i.qty) || 0);
        return s + (sub * (parseFloat(i.tax_percent) || 0)) / 100;
      }, 0),
      discount: items.reduce((s, i) => s + (parseFloat(i.discount) || 0), 0),
      total: calculateTotalWithTaxAndDiscount(items),
    };

    const id = await createPurchaseOrder(payload);
    if (id) {
      handleNext();
    }
  } else {
    // STEPS 2–5: PUT
    const currentData = formData[activeTab];
    let apiStepData = {};

    if (activeTab === "purchaseOrder") {
      apiStepData = {
        PO_no: currentData.orderNo,
        Manual_PO_ref: currentData.manualOrderNo,
      };
    } else if (activeTab === "goodsReceipt") {
      apiStepData = {
        GR_no: currentData.receiptNo,
        Manual_GR_no: currentData.manualReceiptNo,
        vehicle_no: currentData.vehicleNo,
        driver_name: currentData.driverName,
        driver_phone: currentData.driverPhone,
        // Include ship to details in goods receipt step
        ship_to_attention_name: currentData.shipToName,
        ship_to_company_name: currentData.shipToName,
        ship_to_company_address: currentData.shipToAddress,
        ship_to_company_email: currentData.shipToEmail,
        ship_to_company_phone: currentData.shipToPhone,
      };
    } else if (activeTab === "bill") {
      apiStepData = {
        Bill_no: currentData.billNo,
        Manual_Bill_no: currentData.manualBillNo,
        due_date: currentData.dueDate,
        // Include ship to details in bill step
        ship_to_attention_name: currentData.shipToName,
        ship_to_company_name: currentData.shipToName,
        ship_to_company_address: currentData.shipToAddress,
        ship_to_company_email: currentData.shipToEmail,
        ship_to_company_phone: currentData.shipToPhone,
      };
    } else if (activeTab === "payment") {
      const totalAmount = calculateTotalWithTaxAndDiscount(formData.purchaseQuotation.items);
      apiStepData = {
        Payment_no: currentData.paymentNo,
        Manual_payment_no: currentData.Manual_payment_no,
        amount_paid: parseFloat(currentData.amount) || 0,
        total_amount: totalAmount,
        total_bill: totalAmount,
        balance: totalAmount - (parseFloat(currentData.amount) || 0),
        payment_note: currentData.note,
        payment_status: currentData.paymentStatus,
        payment_made_vendor_name: currentData.vendorName,
        payment_made_vendor_address: currentData.vendorAddress,
        payment_made_vendor_email: currentData.vendorEmail,
        payment_made_vendor_phone: currentData.vendorPhone,
      };
    }

    const payload = { [currentApiStep]: apiStepData };
    await updatePurchaseOrder(poId, payload);
  }
};

  
  const renderPurchaseQuotationTab = () => {
    const tab = "purchaseQuotation";
    const data = formData[tab];
    const handleChange = (field, value) => {
      if (
        [
          "companyName",
          "companyAddress",
          "companyEmail",
          "companyPhone",
          "notes",
          "terms_and_conditions",
        ].includes(field)
      )
        return;
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));
    };

    const handleItemChange = (idx, field, value) => {
      const items = [...data.items];
      items[idx][field] = value;
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const addItem = () => {
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              name: "",
              qty: "",
              rate: "",
              tax: 0,
              discount: 0,
              warehouse: "",
              hsn: "",
              uom: "PCS",
            },
          ],
        },
      }));
    };

    const removeItem = (idx) => {
      const items = [...data.items];
      items.splice(idx, 1);
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const handleRowSearchChange = (idx, value) => {
      setRowSearchTerms((prev) => ({ ...prev, [`${tab}-${idx}`]: value }));
    };

    const toggleRowSearch = (idx) => {
      setShowRowSearch((prev) => ({
        ...prev,
        [`${tab}-${idx}`]: !prev[`${tab}-${idx}`],
      }));
    };

    const handleSelectSearchedItem = (idx, item) => {
      const items = [...data.items];
      items[idx] = {
        ...items[idx],
        name: item.item_name,
        rate: item.purchase_price || item.sale_price,
        tax: parseFloat(item.tax_account) || 0,
        hsn: item.hsn,
        uom: item.unit_detail?.uom_name || "PCS",
        productId: item.id,
        warehouse: item.warehouses?.[0]?.warehouse_id || "",
      };
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
      setShowRowSearch((prev) => ({ ...prev, [`${tab}-${idx}`]: false }));
      setRowSearchTerms((prev) => ({ ...prev, [`${tab}-${idx}`]: "" }));
    };

    const getFilteredItems = (idx) => {
      const term = (rowSearchTerms[`${tab}-${idx}`] || "").toLowerCase();
      return term
        ? apiProducts.filter(
          (i) =>
            (i.item_name || "").toLowerCase().includes(term) ||
            (i.item_category?.item_category_name || "")
              .toLowerCase()
              .includes(term)
        )
        : apiProducts;
    };

    const handleAddItem = () => {
      if (!newItem.name || !newItem.category) return alert("Name and category required!");
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              name: newItem.name,
              qty: 1,
              rate: newItem.sellingPrice,
              tax: newItem.tax,
              discount: 0,
              hsn: newItem.hsn,
              uom: newItem.uom,
              warehouse: "",
            },
          ],
        },
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

    const handleVendorSearchChange = (value) => {
      setVendorSearchTerm(value);
      setShowVendorSearch(true);
    };

    const handleSelectVendor = (v) => {
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          vendorName: v.name_english || "",
          vendorAddress: v.address || "",
          vendorEmail: v.email || "",
          vendorPhone: v.phone || "",
          bankName: v.bank_name_branch || "",
          accountNo: v.bank_account_number || "",
          accountHolder: v.account_name || "",
          ifsc: v.bank_ifsc || "",
        },
      }));
      setShowVendorSearch(false);
      setVendorSearchTerm("");
    };

    const filteredVendors = vendorSearchTerm
      ? vendors.filter(
        (v) =>
          (v.name_english || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
          (v.email || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
          (v.phone || "").toLowerCase().includes(vendorSearchTerm.toLowerCase())
      )
      : vendors;

    return (
      <Form>
        {/* Header */}
        <Row className="mb-4 mt-3">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{
                height: "120px",
                width: "100%",
                borderStyle: "dashed",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("logo-pq")?.click()}
            >
              {data.logo ? (
                <img
                  src={data.logo}
                  alt="Logo"
                  style={{ maxWidth: "100%", maxHeight: "100px" }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input
                id="logo-pq"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileChange(tab, "logo", e)}
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={data.companyName}
                readOnly
                className="form-control-no-border"
                style={{ backgroundColor: "#f8f9fa" }}
              />
              <Form.Control
                type="text"
                value={data.companyAddress}
                readOnly
                className="form-control-no-border"
                style={{ backgroundColor: "#f8f9fa" }}
              />
              <Form.Control
                type="email"
                value={data.companyEmail}
                readOnly
                className="form-control-no-border"
                style={{ backgroundColor: "#f8f9fa" }}
              />
              <Form.Control
                type="text"
                value={data.companyPhone}
                readOnly
                className="form-control-no-border"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">PURCHASE QUOTATION</h2>
            <hr
              style={{
                width: "80%",
                borderColor: "#28a745",
                margin: "5px 0 10px",
              }}
            />
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        {/* Vendor & Dates */}
        <Row className="mb-4">
          <Col md={8}>
            <h5>Quotation From</h5>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <Form.Control
                value={data.vendorName}
                onChange={(e) => {
                  handleChange("vendorName", e.target.value);
                  handleVendorSearchChange(e.target.value);
                }}
                onFocus={() => setShowVendorSearch(true)}
                placeholder="Vendor Name"
                className="form-control-no-border"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowVendorSearch(!showVendorSearch)}
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/Company/vendorscreditors")}
                style={{
                  textWrap: "nowrap",
                  backgroundColor: "#53b2a5",
                  border: "none",
                  marginLeft: "5px",
                }}
              >
                Add Vendor
              </Button>
            </div>
            {showVendorSearch && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 10,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  maxHeight: "200px",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                {filteredVendors.map((v) => (
                  <div
                    key={v.id}
                    style={{ padding: "8px", cursor: "pointer" }}
                    onClick={() => handleSelectVendor(v)}
                  >
                    <strong>{v.name_english}</strong> – {v.email} | {v.phone}
                  </div>
                ))}
              </div>
            )}
            <Form.Control
              type="text"
              value={data.vendorAddress}
              onChange={(e) => handleChange("vendorAddress", e.target.value)}
              placeholder="Address"
              className="form-control-no-border"
            />
            <Form.Control
              type="email"
              value={data.vendorEmail}
              onChange={(e) => handleChange("vendorEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border"
            />
            <Form.Control
              type="text"
              value={data.vendorPhone}
              onChange={(e) => handleChange("vendorPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border"
            />
          </Col>
          <Col md={4}>
            <Form.Group className="mb-2">
              <Form.Label>Reference No</Form.Label>
              <Form.Control value={data.referenceId} readOnly style={{ backgroundColor: "#f8f9fa" }} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Manual Ref. No. (Optional)</Form.Label>
              <Form.Control
                value={data.manualRefNo}
                onChange={(e) => handleChange("manualRefNo", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Quotation No.</Form.Label>
              <Form.Control
                value={data.quotationNo}
                onChange={(e) => handleChange("quotationNo", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Quotation Date</Form.Label>
              <Form.Control
                type="date"
                value={data.quotationDate}
                onChange={(e) => handleChange("quotationDate", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Valid Till</Form.Label>
              <Form.Control
                type="date"
                value={data.validDate}
                onChange={(e) => handleChange("validDate", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Items */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <Button
              size="sm"
              onClick={addItem}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                marginRight: "5px",
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{ backgroundColor: "#53b2a5", border: "none" }}
            >
              + Add Product
            </Button>
          </div>
          <AddProductModal
            showAdd={showAdd}
            showEdit={false}
            newItem={newItem}
            categories={categories}
            newCategory={newCategory}
            showUOMModal={showUOMModal}
            showAddCategoryModal={showAddCategoryModal}
            setShowAdd={setShowAdd}
            setShowEdit={() => { }}
            setShowUOMModal={setShowUOMModal}
            setShowAddCategoryModal={setShowAddCategoryModal}
            setNewCategory={setNewCategory}
            handleChange={(f, v) => setNewItem((prev) => ({ ...prev, [f]: v }))}
            handleAddItem={handleAddItem}
            handleUpdateItem={() => { }}
            handleAddCategory={(e) => {
              e.preventDefault();
              if (newCategory && !categories.includes(newCategory)) {
                setNewItem((prev) => ({ ...prev, category: newCategory }));
              }
              setNewCategory("");
              setShowAddCategoryModal(false);
            }}
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
              {data.items.map((item, idx) => {
                const qty = parseInt(item.qty) || 0;
                const amount = (parseFloat(item.rate) || 0) * qty;
                const rowKey = `${tab}-${idx}`;
                return (
                  <tr key={idx}>
                    <td style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Control
                          size="sm"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          style={{ marginRight: "5px" }}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => toggleRowSearch(idx)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>
                      {showRowSearch[rowKey] && (
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
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          <InputGroup size="sm">
                            <InputGroup.Text>
                              <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <FormControl
                              placeholder="Search..."
                              value={rowSearchTerms[rowKey] || ""}
                              onChange={(e) => handleRowSearchChange(idx, e.target.value)}
                              autoFocus
                            />
                          </InputGroup>
                          {getFilteredItems(idx).map((fItem) => (
                            <div
                              key={fItem.id}
                              style={{ padding: "8px", cursor: "pointer" }}
                              onClick={() => handleSelectSearchedItem(idx, fItem)}
                            >
                              <strong>{fItem.item_name}</strong> – $                               {(parseFloat(fItem.purchase_price || fItem.sale_price) || 0).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={item.warehouse || ""}
                        onChange={(e) => handleItemChange(idx, "warehouse", e.target.value)}
                      >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.warehouse_name} ({w.location})
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.tax}
                        onChange={(e) => handleItemChange(idx, "tax", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={amount.toFixed(2)}
                        readOnly
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(idx)}
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
        {/* Totals, Bank, Notes, Terms, Attachments */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td>Sub Total:</td>
                  <td>
                    $                     {data.items
                      .reduce(
                        (s, i) =>
                          s + (parseFloat(i.rate) || 0) * (parseInt(i.qty) || 0),
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td>Tax:</td>
                  <td>
                    $                     {data.items
                      .reduce((s, i) => {
                        const sub = (parseFloat(i.rate) || 0) * (parseInt(i.qty) || 0);
                        return s + (sub * (parseFloat(i.tax) || 0)) / 100;
                      }, 0)
                      .toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td>Discount:</td>
                  <td>
                    $                     {data.items
                      .reduce((s, i) => s + (parseFloat(i.discount) || 0), 0)
                      .toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">
                    ${calculateTotalWithTaxAndDiscount(data.items).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        <Row className="mb-4">
          <h5>Bank Details</h5>
          <Col md={6} className="p-2 rounded" style={{ border: "1px solid #343a40" }}>
            {["bankName", "accountNo", "accountHolder", "ifsc"].map((f) => (
              <Form.Group key={f} className="mb-2">
                <Form.Control
                  type="text"
                  placeholder={f.replace(/([A-Z])/g, " $1")}
                  value={data[f] || ""}
                  onChange={(e) => handleChange(f, e.target.value)}
                  className="form-control-no-border"
                />
              </Form.Group>
            ))}
          </Col>
          <Col md={6}>
            <h5>Notes</h5>
            <Form.Control
              as="textarea"
              rows={5}
              value={data.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              style={{ border: "1px solid #343a40" }}
            />
          </Col>
        </Row>
        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={data.terms_and_conditions || ""}
                onChange={(e) => handleChange("terms_and_conditions", e.target.value)}
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="mt-4 mb-4">
          <h5>Attachments</h5>
          <Row>
            {["signature", "photo"].map((field, i) => (
              <Col md={4} key={i}>
                <Form.Group>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(tab, field, e)}
                  />
                  {data[field] && (
                    <img
                      src={data[field]}
                      alt={field}
                      style={{
                        width: i === 0 ? "100px" : "100px",
                        height: i === 0 ? "50px" : "100px",
                        objectFit: "cover",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Attach Files</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => handleMultiFileChange(tab, e)}
                />
                {data.files?.length > 0 && (
                  <ul className="list-unstyled mt-2">
                    {data.files.map((f, i) => (
                      <li key={i} className="d-flex justify-content-between">
                        <span>{f.name}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(tab, i)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>
        <Row className="text-center mb-4">
          <Col>
            <p>
              <strong>Thank you for your business!</strong>
            </p>
            <p className="text-muted">www.yourcompany.com</p>
          </Col>
        </Row>
      </Form>
    );
  };

  // --- PurchaseOrderTab ---
  const renderPurchaseOrderTab = () => {
    const tab = "purchaseOrder";
    const data = formData[tab];
    const handleChange = (field, value) =>
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));

    const handleItemChange = (idx, field, value) => {
      const items = [...data.items];
      items[idx][field] = value;
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const addItem = () =>
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            { name: "", qty: "", rate: "", tax: 0, discount: 0, hsn: "", uom: "PCS" },
          ],
        },
      }));

    const removeItem = (idx) => {
      const items = [...data.items];
      items.splice(idx, 1);
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const handleRowSearchChange = (idx, value) =>
      setRowSearchTerms((prev) => ({ ...prev, [`${tab}-${idx}`]: value }));

    const toggleRowSearch = (idx) =>
      setShowRowSearch((prev) => ({ ...prev, [`${tab}-${idx}`]: !prev[`${tab}-${idx}`] }));

    const handleSelectSearchedItem = (idx, item) => {
      const items = [...data.items];
      items[idx] = {
        ...items[idx],
        name: item.item_name,
        rate: item.purchase_price || item.sale_price,
        tax: parseFloat(item.tax_account) || 0,
        hsn: item.hsn,
        uom: item.unit_detail?.uom_name || "PCS",
        productId: item.id,
      };
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
      setShowRowSearch((prev) => ({ ...prev, [`${tab}-${idx}`]: false }));
      setRowSearchTerms((prev) => ({ ...prev, [`${tab}-${idx}`]: "" }));
    };

    const getFilteredItems = (idx) => {
      const term = (rowSearchTerms[`${tab}-${idx}`] || "").toLowerCase();
      return term
        ? apiProducts.filter(
          (i) =>
            (i.item_name || "").toLowerCase().includes(term) ||
            (i.item_category?.item_category_name || "")
              .toLowerCase()
              .includes(term)
        )
        : apiProducts;
    };

    const handleAddItem = () => {
      if (!newItem.name || !newItem.category) return alert("Name and category required!");
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              name: newItem.name,
              qty: 1,
              rate: newItem.sellingPrice,
              tax: newItem.tax,
              discount: 0,
              hsn: newItem.hsn,
              uom: newItem.uom,
            },
          ],
        },
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

    const handleVendorSearchChange = (value) => {
      setVendorSearchTerm(value);
      setShowVendorSearch(true);
    };

    const handleSelectVendor = (v) => {
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          vendorName: v.name_english || "",
          vendorAddress: v.address || "",
          vendorEmail: v.email || "",
          vendorPhone: v.phone || "",
        },
      }));
      setShowVendorSearch(false);
      setVendorSearchTerm("");
    };

    const filteredVendors = vendorSearchTerm
      ? vendors.filter(
        (v) =>
          (v.name_english || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
          (v.email || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
          (v.phone || "").toLowerCase().includes(vendorSearchTerm.toLowerCase())
      )
      : vendors;

    return (
      <Form>
        {/* Header */}
        <Row className="mb-4 mt-3">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{
                height: "120px",
                width: "100%",
                borderStyle: "dashed",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("logo-po")?.click()}
            >
              {formData.purchaseQuotation.logo ? (
                <img
                  src={formData.purchaseQuotation.logo}
                  alt="Logo"
                  style={{ maxWidth: "100%", maxHeight: "100px" }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input
                id="logo-po"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileChange(tab, "logo", e)}
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={data.companyName}
                readOnly
                className="form-control-no-border"
                style={{ backgroundColor: "#f8f9fa" }}
              />
              <Form.Control
                type="text"
                value={data.companyAddress}
                readOnly
                className="form-control-no-border"
                style={{ backgroundColor: "#f8f9fa" }}
              />
              <Form.Control
                type="email"
                value={data.companyEmail}
                readOnly
                className="form-control-no-border"
                style={{ backgroundColor: "#f8f9fa" }}
              />
              <Form.Control
                type="text"
                value={data.companyPhone}
                readOnly
                className="form-control-no-border"
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">PURCHASE ORDER</h2>
            <hr
              style={{
                width: "80%",
                borderColor: "#28a745",
                margin: "5px 0 10px",
              }}
            />
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        {/* Order Info */}
        <Row className="mb-4">
          <Col md={8}>
            <h5>Order From</h5>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <Form.Control
                value={data.vendorName}
                onChange={(e) => {
                  handleChange("vendorName", e.target.value);
                  handleVendorSearchChange(e.target.value);
                }}
                onFocus={() => setShowVendorSearch(true)}
                placeholder="Vendor Name"
                className="form-control-no-border"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowVendorSearch(!showVendorSearch)}
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/Company/vendorscreditors")}
                style={{
                  textWrap: "nowrap",
                  backgroundColor: "#53b2a5",
                  border: "none",
                  marginLeft: "5px",
                }}
              >
                Add Vendor
              </Button>
            </div>
            {showVendorSearch && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 10,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  maxHeight: "200px",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                {filteredVendors.map((v) => (
                  <div
                    key={v.id}
                    style={{ padding: "8px", cursor: "pointer" }}
                    onClick={() => handleSelectVendor(v)}
                  >
                    <strong>{v.name_english}</strong> – {v.email} | {v.phone}
                  </div>
                ))}
              </div>
            )}
            <Form.Control
              type="text"
              value={data.vendorAddress}
              onChange={(e) => handleChange("vendorAddress", e.target.value)}
              placeholder="Address"
              className="form-control-no-border"
            />
            <Form.Control
              type="email"
              value={data.vendorEmail}
              onChange={(e) => handleChange("vendorEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border"
            />
            <Form.Control
              type="text"
              value={data.vendorPhone}
              onChange={(e) => handleChange("vendorPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border"
            />
          </Col>
          <Col md={4}>
            <Form.Group className="mb-2">
              <Form.Label>Reference No</Form.Label>
              <Form.Control value={data.referenceId} readOnly style={{ backgroundColor: "#f8f9fa" }} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Order No.</Form.Label>
              <Form.Control
                value={data.orderNo}
                onChange={(e) => handleChange("orderNo", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Manual Order No.</Form.Label>
              <Form.Control
                value={data.manualOrderNo}
                onChange={(e) => handleChange("manualOrderNo", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Quotation No.</Form.Label>
              <Form.Control
                value={data.quotationNo || "-"}
                onChange={(e) => handleChange("quotationNo", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Order Date</Form.Label>
              <Form.Control
                type="date"
                value={data.orderDate}
                onChange={(e) => handleChange("orderDate", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Delivery Date</Form.Label>
              <Form.Control
                type="date"
                value={data.deliveryDate}
                onChange={(e) => handleChange("deliveryDate", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Items Table */}
        <div className="mb-4">
          <div className="d-flex justify-content-between mb-2">
            <Button
              size="sm"
              onClick={addItem}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                marginRight: "5px",
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{ backgroundColor: "#53b2a5", border: "none" }}
            >
              + Add Product
            </Button>
          </div>
          <AddProductModal
            showAdd={showAdd}
            showEdit={false}
            newItem={newItem}
            categories={categories}
            newCategory={newCategory}
            showUOMModal={showUOMModal}
            showAddCategoryModal={showAddCategoryModal}
            setShowAdd={setShowAdd}
            setShowEdit={() => { }}
            setShowUOMModal={setShowUOMModal}
            setShowAddCategoryModal={setShowAddCategoryModal}
            setNewCategory={setNewCategory}
            handleChange={(f, v) => setNewItem((prev) => ({ ...prev, [f]: v }))}
            handleAddItem={handleAddItem}
            handleUpdateItem={() => { }}
            handleAddCategory={(e) => {
              e.preventDefault();
              if (newCategory && !categories.includes(newCategory)) {
                setNewItem((prev) => ({ ...prev, category: newCategory }));
              }
              setNewCategory("");
              setShowAddCategoryModal(false);
            }}
            companyId={companyId}
          />
          <Table bordered hover size="sm" className="dark-bordered-table">
            <thead className="bg-light">
              <tr>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax %</th>
                <th>Discount</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => {
                const qty = parseInt(item.qty) || 0;
                const amount = (parseFloat(item.rate) || 0) * qty;
                const rowKey = `${tab}-${idx}`;
                return (
                  <tr key={idx}>
                    <td style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Control
                          size="sm"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          style={{ marginRight: "5px" }}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => toggleRowSearch(idx)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>
                      {showRowSearch[rowKey] && (
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
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          <InputGroup size="sm">
                            <InputGroup.Text>
                              <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <FormControl
                              placeholder="Search..."
                              value={rowSearchTerms[rowKey] || ""}
                              onChange={(e) => handleRowSearchChange(idx, e.target.value)}
                              autoFocus
                            />
                          </InputGroup>
                          {getFilteredItems(idx).map((fItem) => (
                            <div
                              key={fItem.id}
                              style={{ padding: "8px", cursor: "pointer" }}
                              onClick={() => handleSelectSearchedItem(idx, fItem)}
                            >
                              <strong>{fItem.item_name}</strong> – $                               {(parseFloat(fItem.purchase_price || fItem.sale_price) || 0).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.tax}
                        onChange={(e) => handleItemChange(idx, "tax", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={amount.toFixed(2)}
                        readOnly
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(idx)}
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
        {/* Totals */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td>Sub Total:</td>
                  <td>
                    $                     {data.items
                      .reduce(
                        (s, i) =>
                          s + (parseFloat(i.rate) || 0) * (parseInt(i.qty) || 0),
                        0
                      )
                      .toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td>Tax:</td>
                  <td>
                    $                     {data.items
                      .reduce((s, i) => {
                        const sub = (parseFloat(i.rate) || 0) * (parseInt(i.qty) || 0);
                        return s + (sub * (parseFloat(i.tax) || 0)) / 100;
                      }, 0)
                      .toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td>Discount:</td>
                  <td>
                    $                     {data.items
                      .reduce((s, i) => s + (parseFloat(i.discount) || 0), 0)
                      .toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">
                    ${calculateTotalWithTaxAndDiscount(data.items).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        {/* Terms & Attachments */}
        <Row className="mb-4">
          <Col>
            <Form.Group>
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={data.terms || ""}
                onChange={(e) => handleChange("terms", e.target.value)}
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="mt-4 mb-4">
          <h5>Attachments</h5>
          <Row>
            {["signature", "photo"].map((field, i) => (
              <Col md={4} key={i}>
                <Form.Group>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(tab, field, e)}
                  />
                  {data[field] && (
                    <img
                      src={data[field]}
                      alt={field}
                      style={{
                        width: i === 0 ? "100px" : "100px",
                        height: i === 0 ? "50px" : "100px",
                        objectFit: "cover",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Attach Files</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => handleMultiFileChange(tab, e)}
                />
                {data.files?.length > 0 && (
                  <ul className="list-unstyled mt-2">
                    {data.files.map((f, i) => (
                      <li key={i} className="d-flex justify-content-between">
                        <span>{f.name}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(tab, i)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>
        <Row className="text-center mb-4">
          <Col>
            <p>
              <strong>Thank you for your business!</strong>
            </p>
            <p className="text-muted">www.yourcompany.com</p>
          </Col>
        </Row>
      </Form>
    );
  };

  // --- GoodsReceiptTab ---
  const renderGoodsReceiptTab = () => {
    const tab = "goodsReceipt";
    const data = formData[tab];
    const handleChange = (field, value) =>
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));

    const handleItemChange = (idx, field, value) => {
      const items = [...data.items];
      items[idx][field] = value;
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const addItem = () =>
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              name: "",
              qty: "",
              receivedQty: "",
              rate: "",
              tax: 0,
              discount: 0,
              hsn: "",
              uom: "PCS",
            },
          ],
        },
      }));

    const removeItem = (idx) => {
      const items = [...data.items];
      items.splice(idx, 1);
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const handleRowSearchChange = (idx, value) =>
      setRowSearchTerms((prev) => ({ ...prev, [`${tab}-${idx}`]: value }));

    const toggleRowSearch = (idx) =>
      setShowRowSearch((prev) => ({ ...prev, [`${tab}-${idx}`]: !prev[`${tab}-${idx}`] }));

    const handleSelectSearchedItem = (idx, item) => {
      const items = [...data.items];
      items[idx] = {
        ...items[idx],
        name: item.item_name,
        rate: item.purchase_price || item.sale_price,
        tax: parseFloat(item.tax_account) || 0,
        hsn: item.hsn,
        uom: item.unit_detail?.uom_name || "PCS",
        productId: item.id,
      };
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
      setShowRowSearch((prev) => ({ ...prev, [`${tab}-${idx}`]: false }));
      setRowSearchTerms((prev) => ({ ...prev, [`${tab}-${idx}`]: "" }));
    };

    const getFilteredItems = (idx) => {
      const term = (rowSearchTerms[`${tab}-${idx}`] || "").toLowerCase();
      return term
        ? apiProducts.filter(
          (i) =>
            (i.item_name || "").toLowerCase().includes(term) ||
            (i.item_category?.item_category_name || "")
              .toLowerCase()
              .includes(term)
        )
        : apiProducts;
    };

    const handleAddItem = () => {
      if (!newItem.name || !newItem.category) return alert("Name and category required!");
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              name: newItem.name,
              qty: 1,
              receivedQty: 1,
              rate: newItem.sellingPrice,
              tax: newItem.tax,
              discount: 0,
              hsn: newItem.hsn,
              uom: newItem.uom,
            },
          ],
        },
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

    const handleVendorSearchChange = (value) => {
      setVendorSearchTerm(value);
      setShowVendorSearch(true);
    };

    const handleSelectVendor = (v) => {
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          vendorName: v.name_english || "",
          vendorAddress: v.address || "",
          vendorEmail: v.email || "",
          vendorPhone: v.phone || "",
        },
      }));
      setShowVendorSearch(false);
      setVendorSearchTerm("");
    };

    const filteredVendors = vendorSearchTerm
      ? vendors.filter(
        (v) =>
          (v.name_english || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
          (v.email || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
          (v.phone || "").toLowerCase().includes(vendorSearchTerm.toLowerCase())
      )
      : vendors;

    return (
      <Form>
        <Row className="mb-4 d-flex justify-content-between align-items-center">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{
                height: "120px",
                width: "100%",
                borderStyle: "dashed",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("logo-gr")?.click()}
            >
              {formData.purchaseQuotation.logo ? (
                <img
                  src={formData.purchaseQuotation.logo}
                  alt="Logo"
                  style={{ maxWidth: "100%", maxHeight: "100px" }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input
                id="logo-gr"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileChange(tab, "logo", e)}
              />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">GOODS RECEIPT NOTE</h2>
            <hr
              style={{
                width: "80%",
                borderColor: "#28a745",
                margin: "5px 0 10px",
              }}
            />
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        <Row className="mb-4 mt-3">
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={data.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Company Name"
                className="form-control-no-border"
              />
              <Form.Control
                type="text"
                value={data.companyAddress}
                onChange={(e) => handleChange("companyAddress", e.target.value)}
                placeholder="Address"
                className="form-control-no-border"
              />
              <Form.Control
                type="email"
                value={data.companyEmail}
                onChange={(e) => handleChange("companyEmail", e.target.value)}
                placeholder="Email"
                className="form-control-no-border"
              />
              <Form.Control
                type="text"
                value={data.companyPhone}
                onChange={(e) => handleChange("companyPhone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border"
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end gap-2">
            <Form.Control
              type="date"
              value={data.receiptDate}
              onChange={(e) => handleChange("receiptDate", e.target.value)}
              className="form-control-no-border text-end"
            />
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-left text-nowrap">
                <Form.Label className="mb-0" style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                  Ref No.
                </Form.Label>
                <Form.Control
                  type="text"
                  value={data.referenceId}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Receipt No.</Form.Label>
                <Form.Control
                  type="text"
                  value={data.receiptNo}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Manual GR No.</Form.Label>
                <Form.Control
                  type="text"
                  value={data.manualReceiptNo}
                  onChange={(e) => handleChange("manualReceiptNo", e.target.value)}
                  className="form-control-no-border text-end"
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Purchase Order No</Form.Label>
                <Form.Control
                  type="text"
                  value={data.purchaseOrderNo}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
            <div className="d-flex justify-content-between align-items-center text-nowrap">
              <Form.Label className="mb-0">Vehicle No</Form.Label>
              <Form.Control
                type="text"
                value={data.vehicleNo}
                onChange={(e) => handleChange("vehicleNo", e.target.value)}
                placeholder="Vehicle No."
                className="form-control-no-border text-end"
              />
            </div>
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        {/* Vendor & Ship To */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6}>
            <h5>VENDOR</h5>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <Form.Control
                value={data.vendorName}
                onChange={(e) => {
                  handleChange("vendorName", e.target.value);
                  handleVendorSearchChange(e.target.value);
                }}
                onFocus={() => setShowVendorSearch(true)}
                placeholder="Vendor Name"
                className="form-control-no-border"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowVendorSearch(!showVendorSearch)}
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/Company/vendorscreditors")}
                style={{
                  textWrap: "nowrap",
                  backgroundColor: "#53b2a5",
                  border: "none",
                  marginLeft: "5px",
                }}
              >
                Add Vendor
              </Button>
            </div>
            {showVendorSearch && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 10,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  maxHeight: "200px",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                {filteredVendors.map((v) => (
                  <div
                    key={v.id}
                    style={{ padding: "8px", cursor: "pointer" }}
                    onClick={() => handleSelectVendor(v)}
                  >
                    <strong>{v.name_english}</strong> – {v.email} | {v.phone}
                  </div>
                ))}
              </div>
            )}
            <Form.Control
              type="text"
              value={data.vendorAddress}
              onChange={(e) => handleChange("vendorAddress", e.target.value)}
              placeholder="Address"
              className="form-control-no-border"
            />
            <Form.Control
              type="text"
              value={data.vendorPhone}
              onChange={(e) => handleChange("vendorPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border"
            />
            <Form.Control
              type="email"
              value={data.vendorEmail}
              onChange={(e) => handleChange("vendorEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border"
            />
          </Col>
          <Col md={6}>
            <h5 className="text-right">SHIP TO</h5>
            <Form.Control
              type="text"
              value={data.shipToName}
              onChange={(e) => handleChange("shipToName", e.target.value)}
              placeholder="Name"
              className="form-control-no-border text-end"
            />
            <Form.Control
              type="text"
              value={data.shipToAddress}
              onChange={(e) => handleChange("shipToAddress", e.target.value)}
              placeholder="Address"
              className="form-control-no-border text-end"
            />
            <Form.Control
              type="text"
              value={data.shipToPhone}
              onChange={(e) => handleChange("shipToPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border text-end"
            />
            <Form.Control
              type="email"
              value={data.shipToEmail}
              onChange={(e) => handleChange("shipToEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border text-end"
            />
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        {/* Driver Details */}
        <Row className="mb-4">
          <Col md={6}>
            <h5>Driver Details</h5>
            <Form.Group className="mb-2">
              <Form.Label>Driver Name</Form.Label>
              <Form.Control
                type="text"
                value={data.driverName}
                onChange={(e) => handleChange("driverName", e.target.value)}
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Driver Phone</Form.Label>
              <Form.Control
                type="text"
                value={data.driverPhone}
                onChange={(e) => handleChange("driverPhone", e.target.value)}
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Items Table */}
        <div className="mt-4 mb-4">
          <div className="d-flex justify-content-between mb-2">
            <Button
              size="sm"
              onClick={addItem}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                marginRight: "5px",
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{ backgroundColor: "#53b2a5", border: "none" }}
            >
              + Add Product
            </Button>
          </div>
          <AddProductModal
            showAdd={showAdd}
            showEdit={false}
            newItem={newItem}
            categories={categories}
            newCategory={newCategory}
            showUOMModal={showUOMModal}
            showAddCategoryModal={showAddCategoryModal}
            setShowAdd={setShowAdd}
            setShowEdit={() => { }}
            setShowUOMModal={setShowUOMModal}
            setShowAddCategoryModal={setShowAddCategoryModal}
            setNewCategory={setNewCategory}
            handleChange={(f, v) => setNewItem((prev) => ({ ...prev, [f]: v }))}
            handleAddItem={handleAddItem}
            handleUpdateItem={() => { }}
            handleAddCategory={(e) => {
              e.preventDefault();
              if (newCategory && !categories.includes(newCategory)) {
                setNewItem((prev) => ({ ...prev, category: newCategory }));
              }
              setNewCategory("");
              setShowAddCategoryModal(false);
            }}
            companyId={companyId}
          />
          <Table bordered hover size="sm" className="dark-bordered-table">
            <thead className="bg-light">
              <tr>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Received Qty</th>
                <th>Rate</th>
                <th>Tax %</th>
                <th>Discount</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => {
                const qty = parseInt(item.receivedQty) || 0;
                const amount = (parseFloat(item.rate) || 0) * qty;
                const rowKey = `${tab}-${idx}`;
                return (
                  <tr key={idx}>
                    <td style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => toggleRowSearch(idx)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>
                      {showRowSearch[rowKey] && (
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
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          <InputGroup size="sm">
                            <InputGroup.Text>
                              <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <FormControl
                              placeholder="Search..."
                         
                              value={rowSearchTerms[rowKey] || ""}
                              onChange={(e) => handleRowSearchChange(idx, e.target.value)}
                              autoFocus
                            />
                          </InputGroup>
                          {getFilteredItems(idx).map((fItem) => (
                            <div
                              key={fItem.id}
                              style={{ padding: "8px", cursor: "pointer" }}
                              onClick={() => handleSelectSearchedItem(idx, fItem)}
                            >
                              <strong>{fItem.item_name}</strong> – $
                              {(parseFloat(fItem.purchase_price || fItem.sale_price) || 0).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.receivedQty}
                        onChange={(e) => handleItemChange(idx, "receivedQty", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.tax}
                        onChange={(e) => handleItemChange(idx, "tax", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={amount.toFixed(2)}
                        readOnly
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(idx)}
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
        {/* Totals */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td>Sub Total:</td>
                  <td>${calculateTotalAmount(data.items).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">${calculateTotalAmount(data.items).toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        {/* Terms & Attachments */}
        <Form.Group className="mt-4">
          <Form.Label>Terms & Conditions</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={data.terms}
            onChange={(e) => handleChange("terms", e.target.value)}
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        <div className="mt-4 mb-4">
          <h5>Attachments</h5>
          <Row>
            {["signature", "photo"].map((field, i) => (
              <Col md={4} key={i}>
                <Form.Group>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(tab, field, e)}
                  />
                  {data[field] && (
                    <img
                      src={data[field]}
                      alt={field}
                      style={{
                        width: i === 0 ? "100px" : "100px",
                        height: i === 0 ? "50px" : "100px",
                        objectFit: "cover",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Attach Files</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => handleMultiFileChange(tab, e)}
                />
                {data.files?.length > 0 && (
                  <ul className="list-unstyled mt-2">
                    {data.files.map((f, i) => (
                      <li key={i} className="d-flex justify-content-between">
                        <span>{f.name}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(tab, i)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>
        <Row className="text-center mt-5 mb-4 pt-3 border-top">
          <Col>
            <p>
              <strong>Thank you for your business!</strong>
            </p>
            <p className="text-muted">www.yourcompany.com</p>
          </Col>
        </Row>
      </Form>
    );
  };

  // --- BillTab ---
  const renderBillTab = () => {
    const tab = "bill";
    const data = formData[tab];
    const handleChange = (field, value) =>
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));

    const handleItemChange = (idx, field, value) => {
      const items = [...data.items];
      items[idx][field] = value;
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const addItem = () =>
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              description: "",
              qty: "",
              rate: "",
              tax: "",
              discount: "",
              amount: "",
              hsn: "",
              uom: "PCS",
            },
          ],
        },
      }));

    const removeItem = (idx) => {
      const items = [...data.items];
      items.splice(idx, 1);
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const handleRowSearchChange = (idx, value) =>
      setRowSearchTerms((prev) => ({ ...prev, [`${tab}-${idx}`]: value }));

    const toggleRowSearch = (idx) =>
      setShowRowSearch((prev) => ({ ...prev, [`${tab}-${idx}`]: !prev[`${tab}-${idx}`] }));

    const handleSelectSearchedItem = (idx, item) => {
      const items = [...data.items];
      items[idx] = {
        ...items[idx],
        description: item.item_name, // Use fetched product name for description
        rate: item.purchase_price || item.sale_price, // Use fetched rate
        tax: parseFloat(item.tax_account) || 0, // Use fetched tax
        hsn: item.hsn, // Use fetched HSN
        uom: item.unit_detail?.uom_name || "PCS", // Use fetched UOM
        productId: item.id, // Store ID if needed later
      };
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
      setShowRowSearch((prev) => ({ ...prev, [`${tab}-${idx}`]: false }));
      setRowSearchTerms((prev) => ({ ...prev, [`${tab}-${idx}`]: "" }));
    };

    const getFilteredItems = (idx) => {
      const term = (rowSearchTerms[`${tab}-${idx}`] || "").toLowerCase();
      return term
        ? apiProducts.filter(
          (i) =>
            (i.item_name || "").toLowerCase().includes(term) ||
            (i.item_category?.item_category_name || "")
              .toLowerCase()
              .includes(term)
        )
        : apiProducts;
    };

    const handleAddItem = () => {
      if (!newItem.name || !newItem.category) return alert("Name and category required!");
      const amount = newItem.sellingPrice;
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              description: newItem.name,
              qty: 1,
              rate: newItem.sellingPrice,
              tax: newItem.tax,
              discount: 0,
              amount,
              hsn: newItem.hsn,
              uom: newItem.uom,
            },
          ],
        },
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

    return (
      <Form>
        <Row className="mb-4 d-flex justify-content-between align-items-center">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{
                height: "120px",
                width: "100%",
                borderStyle: "dashed",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("logo-bill")?.click()}
            >
              {formData.purchaseQuotation.logo ? ( // Use logo from PQ
                <img
                  src={formData.purchaseQuotation.logo}
                  alt="Logo"
                  style={{ maxWidth: "100%", maxHeight: "100px" }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input
                id="logo-bill"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileChange(tab, "logo", e)}
              />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">PURCHASE BILL</h2>
            <hr
              style={{
                width: "80%",
                borderColor: "#28a745",
                margin: "5px 0 10px",
              }}
            />
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        <Row className="mb-4 mt-3">
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={data.companyName} // Use fetched company name
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Company Name"
                className="form-control-no-border"
              />
              <Form.Control
                type="text"
                value={data.companyAddress} // Use fetched company address
                onChange={(e) => handleChange("companyAddress", e.target.value)}
                placeholder="Address"
                className="form-control-no-border"
              />
              <Form.Control
                type="email"
                value={data.companyEmail} // Use fetched company email
                onChange={(e) => handleChange("companyEmail", e.target.value)}
                placeholder="Email"
                className="form-control-no-border"
              />
              <Form.Control
                type="text"
                value={data.companyPhone} // Use fetched company phone
                onChange={(e) => handleChange("companyPhone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border"
              />
            </div>
          </Col>
          <Col md={6} className=" gap-2 d-flex flex-column align-items-end">
            <Form.Control
              type="date"
              value={data.billDate}
              onChange={(e) => handleChange("billDate", e.target.value)}
              className="form-control-no-border text-end"
            />
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Ref No.</Form.Label>
                <Form.Control
                  type="text"
                  value={data.referenceId}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Bill No.</Form.Label>
                <Form.Control
                  type="text"
                  value={data.billNo || ""}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Manual Bill No.</Form.Label>
                <Form.Control
                  type="text"
                  value={data.manualBillNo || ""}
                  onChange={(e) => handleChange("manualBillNo", e.target.value)}
                  className="form-control-no-border text-end"
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Goods Receipt No</Form.Label>
                <Form.Control
                  type="text"
                  value={data.goodsReceiptNo || ""}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
            {/* <Form.Control type="date" value={data.dueDate} onChange={(e) => handleChange("dueDate", e.target.value)} placeholder="Due Date" className="form-control-no-border text-end" /> */}
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        {/* Vendor & Ship To */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6}>
            <h5>VENDOR</h5>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <Form.Control
                value={data.vendorName}
                onChange={(e) => {
                  handleChange("vendorName", e.target.value);
                  handleVendorSearchChange(e.target.value); // Reuse vendor search logic
                }}
                onFocus={() => setShowVendorSearch(true)} // Reuse vendor search logic
                placeholder="Vendor Name"
                className="form-control-no-border"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowVendorSearch(!showVendorSearch)} // Reuse vendor search logic
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/Company/vendorscreditors")}
                style={{
                  textWrap: "nowrap",
                  backgroundColor: "#53b2a5",
                  border: "none",
                  marginLeft: "5px",
                }}
              >
                Add Vendor
              </Button>
            </div>
            {showVendorSearch && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 10,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  maxHeight: "200px",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                {vendors
                  .filter(
                    (v) =>
                      (v.name_english || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                      (v.email || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                      (v.phone || "").toLowerCase().includes(vendorSearchTerm.toLowerCase())
                  )
                  .map((v) => (
                    <div
                      key={v.id}
                      style={{ padding: "8px", cursor: "pointer" }}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          [tab]: {
                            ...prev[tab],
                            vendorName: v.name_english || "",
                            vendorAddress: v.address || "",
                            vendorEmail: v.email || "",
                            vendorPhone: v.phone || "",
                          },
                        }));
                        setShowVendorSearch(false);
                        setVendorSearchTerm("");
                      }}
                    >
                      <strong>{v.name_english}</strong> – {v.email} | {v.phone}
                    </div>
                  ))}
              </div>
            )}
            <Form.Control
              as="textarea"
              rows={2}
              value={data.vendorAddress}
              onChange={(e) => handleChange("vendorAddress", e.target.value)}
              placeholder="Address"
              className="form-control-no-border"
            />
            <Form.Control
              type="email"
              value={data.vendorEmail}
              onChange={(e) => handleChange("vendorEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border"
            />
            <Form.Control
              type="text"
              value={data.vendorPhone}
              onChange={(e) => handleChange("vendorPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border"
            />
          </Col>
          <Col md={6}>
            <h5 className="text-right">SHIP TO</h5>
            <Form.Control
              type="text"
              value={data.shipToName || ""}
              onChange={(e) => handleChange("shipToName", e.target.value)}
              placeholder="Name"
              className="form-control-no-border text-end"
            />
            <Form.Control
              type="text"
              value={data.shipToAddress || ""}
              onChange={(e) => handleChange("shipToAddress", e.target.value)}
              placeholder="Address"
              className="form-control-no-border text-end"
            />
            <Form.Control
              type="email"
              value={data.shipToEmail || ""}
              onChange={(e) => handleChange("shipToEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border text-end"
            />
            <Form.Control
              type="text"
              value={data.shipToPhone || ""}
              onChange={(e) => handleChange("shipToPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border text-end"
            />
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        {/* Items Table */}
        <div className="mt-4 mb-4">
          <div className="d-flex justify-content-between mb-2">
            <Button
              size="sm"
              onClick={addItem}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                marginRight: "5px",
              }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{ backgroundColor: "#53b2a5", border: "none" }}
            >
              + Add Product
            </Button>
          </div>
          <AddProductModal
            showAdd={showAdd}
            showEdit={false}
            newItem={newItem}
            categories={categories}
            newCategory={newCategory}
            showUOMModal={showUOMModal}
            showAddCategoryModal={showAddCategoryModal}
            setShowAdd={setShowAdd}
            setShowEdit={() => { }}
            setShowUOMModal={setShowUOMModal}
            setShowAddCategoryModal={setShowAddCategoryModal}
            setNewCategory={setNewCategory}
            handleChange={(f, v) => setNewItem((prev) => ({ ...prev, [f]: v }))}
            handleAddItem={handleAddItem}
            handleUpdateItem={() => { }}
            handleAddCategory={(e) => {
              e.preventDefault();
              if (newCategory && !categories.includes(newCategory)) {
                setNewItem((prev) => ({ ...prev, category: newCategory }));
              }
              setNewCategory("");
              setShowAddCategoryModal(false);
            }}
            companyId={companyId}
          />
          <Table bordered hover size="sm" className="dark-bordered-table">
            <thead className="bg-light">
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Tax %</th>
                <th>Discount</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => {
                const qty = parseInt(item.qty) || 0;
                const rate = parseFloat(item.rate) || 0;
                const amount = qty * rate;
                const rowKey = `${tab}-${idx}`;
                return (
                  <tr key={idx}>
                    <td style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => toggleRowSearch(idx)}
                        >
                          <FontAwesomeIcon icon={faSearch} />
                        </Button>
                      </div>
                      {showRowSearch[rowKey] && (
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
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          <InputGroup size="sm">
                            <InputGroup.Text>
                              <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <FormControl
                              placeholder="Search..."
                              value={rowSearchTerms[rowKey] || ""}
                              onChange={(e) => handleRowSearchChange(idx, e.target.value)}
                              autoFocus
                            />
                          </InputGroup>
                          {getFilteredItems(idx).map((fItem) => (
                            <div
                              key={fItem.id}
                              style={{ padding: "8px", cursor: "pointer" }}
                              onClick={() => handleSelectSearchedItem(idx, fItem)}
                            >
                              <strong>{fItem.item_name}</strong> – $
                              {(parseFloat(fItem.purchase_price || fItem.sale_price) || 0).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.rate}
                        onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.tax}
                        onChange={(e) => handleItemChange(idx, "tax", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={item.discount}
                        onChange={(e) => handleItemChange(idx, "discount", e.target.value)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        size="sm"
                        value={amount.toFixed(2)}
                        readOnly
                        style={{ backgroundColor: "#f8f9fa" }}
                      />
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(idx)}
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
        {/* Totals */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td>Sub Total:</td>
                  <td>${calculateTotalAmount(data.items).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="fw-bold">Total Due:</td>
                  <td className="fw-bold">${calculateTotalAmount(data.items).toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        {/* Terms & Attachments */}
        <Form.Group className="mt-4">
          <Form.Label>Terms & Conditions</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={data.terms}
            onChange={(e) => handleChange("terms", e.target.value)}
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        <div className="mt-4 mb-4">
          <h5>Attachments</h5>
          <Row>
            {["signature", "photo"].map((field, i) => (
              <Col md={4} key={i}>
                <Form.Group>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(tab, field, e)}
                  />
                  {data[field] && (
                    <img
                      src={data[field]}
                      alt={field}
                      style={{
                        width: i === 0 ? "100px" : "100px",
                        height: i === 0 ? "50px" : "100px",
                        objectFit: "cover",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Attach Files</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => handleMultiFileChange(tab, e)}
                />
                {data.files?.length > 0 && (
                  <ul className="list-unstyled mt-2">
                    {data.files.map((f, i) => (
                      <li key={i} className="d-flex justify-content-between">
                        <span>{f.name}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(tab, i)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>
        <Row className="text-center mt-5 mb-4 pt-3">
          <Col>
            <Form.Control
              type="text"
              value={data.footerNote}
              onChange={(e) => handleChange("footerNote", e.target.value)}
              className="text-center mb-2 fw-bold"
              placeholder="Thank you for your business!"
            />
          </Col>
        </Row>
      </Form>
    );
  };

  // --- PaymentTab ---
  const renderPaymentTab = () => {
    const tab = "payment";
    const data = formData[tab];
    const handleChange = (field, value) =>
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));

    const handleItemChange = (idx, field, value) => {
      const items = [...data.items];
      items[idx][field] = value;
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const addItem = () =>
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              description: "",
              qty: "",
              rate: "",
              tax: "",
              discount: "",
              amount: "",
              hsn: "",
              uom: "PCS",
            },
          ],
        },
      }));

    const removeItem = (idx) => {
      const items = [...data.items];
      items.splice(idx, 1);
      setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], items } }));
    };

    const handleAddItem = () => {
      if (!newItem.name || !newItem.category) return alert("Name and category required!");
      const amount = newItem.sellingPrice;
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...prev[tab].items,
            {
              description: newItem.name,
              qty: 1,
              rate: newItem.sellingPrice,
              tax: newItem.tax,
              discount: 0,
              amount,
              hsn: newItem.hsn,
              uom: newItem.uom,
            },
          ],
        },
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

    const totalBill = parseFloat(data.totalAmount) || calculateTotalAmount(formData.bill?.items || []);
    const amountPaid = parseFloat(data.amount) || 0;
    const balance = totalBill - amountPaid;

    return (
      <Form>
        <Row className="mb-4 d-flex justify-content-between align-items-center">
          <Col md={3} className="d-flex align-items-center justify-content-center">
            <div
              className="border rounded d-flex flex-column align-items-center justify-content-center"
              style={{
                height: "120px",
                width: "100%",
                borderStyle: "dashed",
                cursor: "pointer",
              }}
              onClick={() => document.getElementById("logo-pay")?.click()}
            >
              {formData.purchaseQuotation.logo ? ( // Use logo from PQ
                <img
                  src={formData.purchaseQuotation.logo}
                  alt="Logo"
                  style={{ maxWidth: "100%", maxHeight: "100px" }}
                />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} size="2x" className="text-muted" />
                  <small>Upload Logo</small>
                </>
              )}
              <input
                id="logo-pay"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFileChange(tab, "logo", e)}
              />
            </div>
          </Col>
          <Col md={3} className="d-flex flex-column align-items-end justify-content-center">
            <h2 className="text-success mb-0">PAYMENT RECEIPT</h2>
            <hr
              style={{
                width: "80%",
                borderColor: "#28a745",
                margin: "5px 0 10px",
              }}
            />
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        <Row className="mb-4 mt-3">
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={data.companyName} // Use fetched company name
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Company Name"
                className="form-control-no-border"
              />
              <Form.Control
                type="text"
                value={data.companyAddress} // Use fetched company address
                onChange={(e) => handleChange("companyAddress", e.target.value)}
                placeholder="Address"
                className="form-control-no-border"
              />
              <Form.Control
                type="email"
                value={data.companyEmail} // Use fetched company email
                onChange={(e) => handleChange("companyEmail", e.target.value)}
                placeholder="Email"
                className="form-control-no-border"
              />
              <Form.Control
                type="text"
                value={data.companyPhone} // Use fetched company phone
                onChange={(e) => handleChange("companyPhone", e.target.value)}
                placeholder="Phone"
                className="form-control-no-border"
              />
            </div>
          </Col>
          <Col md={6} className="gap-2 d-flex flex-column align-items-end">
            <Form.Control
              type="date"
              value={data.paymentDate}
              onChange={(e) => handleChange("paymentDate", e.target.value)}
              className="form-control-no-border text-end"
            />
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Ref No.</Form.Label>
                <Form.Control
                  type="text"
                  value={data.referenceId}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
           
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Bill No.</Form.Label>
                <Form.Control
                  type="text"
                  value={data.billNo || ""}
                  readOnly
                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-0">
              <div className="d-flex justify-content-between align-items-center text-nowrap">
                <Form.Label className="mb-0">Payment No.</Form.Label>
                <Form.Control
                  type="text"
                  value={data.Manual_payment_no || ""}
                    onChange={(e) => handleChange("Manual_payment_no", e.target.value)}

                  className="form-control-no-border text-end"
                  style={{ backgroundColor: "#f8f9fa" }}
                />
              </div>
            </Form.Group>
            <Form.Control
              type="text"
              value={data.paymentMethod}
              onChange={(e) => handleChange("paymentMethod", e.target.value)}
              placeholder="Payment Method"
              className="form-control-no-border text-end"
            />
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6}>
            <h5>PAID TO</h5>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <Form.Control
                value={data.vendorName}
                onChange={(e) => {
                  handleChange("vendorName", e.target.value);
                  handleVendorSearchChange(e.target.value); // Reuse vendor search logic
                }}
                onFocus={() => setShowVendorSearch(true)} // Reuse vendor search logic
                placeholder="Vendor Name"
                className="form-control-no-border"
              />
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowVendorSearch(!showVendorSearch)} // Reuse vendor search logic
              >
                <FontAwesomeIcon icon={faSearch} />
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/Company/vendorscreditors")}
                style={{
                  textWrap: "nowrap",
                  backgroundColor: "#53b2a5",
                  border: "none",
                  marginLeft: "5px",
                }}
              >
                Add Vendor
              </Button>
            </div>
            {showVendorSearch && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 10,
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                  maxHeight: "200px",
                  overflowY: "auto",
                  width: "100%",
                }}
              >
                {vendors
                  .filter(
                    (v) =>
                      (v.name_english || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                      (v.email || "").toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
                      (v.phone || "").toLowerCase().includes(vendorSearchTerm.toLowerCase())
                  )
                  .map((v) => (
                    <div
                      key={v.id}
                      style={{ padding: "8px", cursor: "pointer" }}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          [tab]: {
                            ...prev[tab],
                            vendorName: v.name_english || "",
                            vendorAddress: v.address || "",
                            vendorEmail: v.email || "",
                            vendorPhone: v.phone || "",
                          },
                        }));
                        setShowVendorSearch(false);
                        setVendorSearchTerm("");
                      }}
                    >
                      <strong>{v.name_english}</strong> – {v.email} | {v.phone}
                    </div>
                  ))}
              </div>
            )}
            <Form.Control
              as="textarea"
              rows={2}
              value={data.vendorAddress || ""}
              onChange={(e) => handleChange("vendorAddress", e.target.value)}
              placeholder="Address"
              className="form-control-no-border"
            />
            <Form.Control
              type="email"
              value={data.vendorEmail || ""}
              onChange={(e) => handleChange("vendorEmail", e.target.value)}
              placeholder="Email"
              className="form-control-no-border"
            />
            <Form.Control
              type="text"
              value={data.vendorPhone || ""}
              onChange={(e) => handleChange("vendorPhone", e.target.value)}
              placeholder="Phone"
              className="form-control-no-border"
            />
          </Col>
          <Col md={6}>
            <h5>PAYMENT DETAILS</h5>
            <Form.Group className="mb-2">
              <Form.Label>Amount Paid</Form.Label>
              <Form.Control
                type="number"
                step="0"
                value={data.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                className="form-control-no-border text-start  "
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Total Amount</Form.Label>
              <Form.Control
                type="number"
                step="0"
                value={totalBill.toFixed(2)}
                className="form-control-no-border text-start "
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Payment Status</Form.Label>
              <Form.Control
                type="text"
                value={data.paymentStatus}
                onChange={(e) => handleChange("paymentStatus", e.target.value)}
                className="form-control-no-border text-start"
              />
            </Form.Group>
          </Col>
        </Row>
        <hr
          style={{
            height: "4px",
            backgroundColor: "#28a745",
            border: "none",
            margin: "5px 0 10px",
          }}
        />
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td>Total Bill:</td>
                  <td>${totalBill.toFixed(2)}</td>
                </tr>
                <tr className="fw-bold">
                  <td>Amount Paid:</td>
                  <td>${amountPaid.toFixed(2)}</td>
                </tr>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <td className="fw-bold">Balance:</td>
                  <td className="fw-bold text-danger">${balance.toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        <Form.Group className="mt-4">
          <Form.Label>Note</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={data.note}
            onChange={(e) => handleChange("note", e.target.value)}
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        <div className="mt-4 mb-4">
          <h5>Attachments</h5>
          <Row>
            {["signature", "photo"].map((field, i) => (
              <Col md={4} key={i}>
                <Form.Group>
                  <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(tab, field, e)}
                  />
                  {data[field] && (
                    <img
                      src={data[field]}
                      alt={field}
                      style={{
                        width: i === 0 ? "100px" : "100px",
                        height: i === 0 ? "50px" : "100px",
                        objectFit: "cover",
                        marginTop: "8px",
                      }}
                    />
                  )}
                </Form.Group>
              </Col>
            ))}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Attach Files</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={(e) => handleMultiFileChange(tab, e)}
                />
                {data.files?.length > 0 && (
                  <ul className="list-unstyled mt-2">
                    {data.files.map((f, i) => (
                      <li key={i} className="d-flex justify-content-between">
                        <span>{f.name}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(tab, i)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </Form.Group>
            </Col>
          </Row>
        </div>
        <Row className="text-center mt-5 mb-4 pt-3 border-top">
          <Col>
            <Form.Control
              type="text"
              value={data.footerNote}
              onChange={(e) => handleChange("footerNote", e.target.value)}
              className="text-center mb-2 fw-bold"
              placeholder="Thank you for your payment!"
            />
          </Col>
        </Row>
      </Form>
    );
  };

  // ===============================
  // NAVIGATION
  // ===============================
  const handleNext = () => {
    const tabs = ["purchaseQuotation", "purchaseOrder", "goodsReceipt", "bill", "payment"];
    const idx = tabs.indexOf(activeTab);
    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
  };

  const handlePrev = () => {
    const tabs = ["purchaseQuotation", "purchaseOrder", "goodsReceipt", "bill", "payment"];
    const idx = tabs.indexOf(activeTab);
    if (idx > 0) setActiveTab(tabs[idx - 1]);
  };

  const handleSaveDraft = () => onSubmit(formData, activeTab);

  // Save current step AND go to next step
  const handleSaveAndNext = async () => {
    await handleSaveStep(); // First save
    // Only go next if save was successful and we have poId
    if (activeTab !== "payment") {
      const tabs = ["purchaseQuotation", "purchaseOrder", "goodsReceipt", "bill", "payment"];
      const idx = tabs.indexOf(activeTab);
      if (idx < tabs.length - 1) {
        const nextTab = tabs[idx + 1];
        setActiveTab(nextTab);
        // If we have poId and it's not Step 1, load data for next tab
        if (poId && nextTab !== "purchaseQuotation") {
          await loadPurchaseOrder(poId);
        }
      }
    }
  };

  const handleSubmitAndClose = async () => {
  
    await handleSaveStep(); 

  
    if (onClose && typeof onClose === "function") {
      onClose(); // Closes modal
    }

    if (onSubmit && typeof onSubmit === "function") {
      onSubmit(formData, "payment"); 
    }
  };
  
  return (
    <div className="container-fluid mt-4 px-2">
      <h4 className="text-center mb-4">Purchase Process</h4>
     
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4 custom-tabs" fill>
        <Tab eventKey="purchaseQuotation" title="Purchase Quotation" />
        <Tab eventKey="purchaseOrder" title="Purchase Order" />
        <Tab eventKey="goodsReceipt" title="Goods Receipt" />
        <Tab eventKey="bill" title="Bill" />
        <Tab eventKey="payment" title="Payment" />
      </Tabs>

      {activeTab === "purchaseQuotation" && renderPurchaseQuotationTab()}
      {activeTab === "purchaseOrder" && renderPurchaseOrderTab()}
      {activeTab === "goodsReceipt" && renderGoodsReceiptTab()}
      {activeTab === "bill" && renderBillTab()}
      {activeTab === "payment" && renderPaymentTab()}

      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={handlePrev}
          disabled={activeTab === "purchaseQuotation"}
        >
          Previous
        </Button>

        <Button
          variant="warning"
          onClick={handleSaveStep}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </Button>

        {activeTab === "payment" ? (
          <Button
            variant="success"
            onClick={handleSubmitAndClose}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit & Close"}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleSaveAndNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save & Next"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiStepPurchaseForm;
import React, { useState, useRef, useEffect } from "react";
import { Tabs,
 Tab,
  Form,
  Button,
  Table,
  Row,
  Col,
  Modal,
  InputGroup,
  FormControl,
  Dropdown,
  FormGroup,
} from "react-bootstrap";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
// import "./MultiStepSalesForm.css"; // Ensure this CSS file is included in your project
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faTrash,
  faEye,  
  faEdit,
  faPlus,
  faSearch,
  faUserPlus,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../Api/axiosInstance";
import GetCompanyId from "../../../Api/GetCompanyId";

const MultiStepSalesForm = ({
  onSubmit,
  initialData = {},
  initialStep = "quotation",
  companyDetails = {}, // Pass company details from parent
  availableItems = [], // Pass items from parent
  warehouses = [], // Pass warehouses from parent
  loadingItems = false, // Pass loading state from parent
  loadingWarehouses = false, // Pass loading state from parent
}) => {
  const navigate = useNavigate();
  const [key, setKey] = useState(initialStep);
  const tabsWithItems = [
    "quotation",
    "salesOrder",
    "deliveryChallan",
    "invoice",
  ];
  const formRef = useRef();
  const pdfRef = useRef();

  // Sales workflow state
  const [salesWorkflow, setSalesWorkflow] = useState([]);
  const [loadingWorkflow, setLoadingWorkflow] = useState(false);

  // Current sales order ID for updates
  const [currentSalesOrderId, setCurrentSalesOrderId] = useState(null);

  // Loading flag for final submit to prevent duplicate clicks
  const [submittingFinal, setSubmittingFinal] = useState(false);

  // Validation state - track if user has attempted to save
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Helper function to validate required manual fields for current step
  const validateRequiredFields = () => {
    const manualFields = {
      quotation: "manualQuotationRef",
      salesOrder: "manualQuotationRef",
      deliveryChallan: "manualChallanNo",
      invoice: "manualInvoiceNo",
      payment: "manualPaymentNo",
    };

    const fieldName = manualFields[key];
    if (fieldName) {
      const value = formData[key]?.[fieldName]?.trim();
      return !!value; // Return true if field has value
    }
    return true; // If no required field for this step, return true
  };


// Add this useEffect to your MultiStepSalesForm component
useEffect(() => {
  if (initialData) {
    // Extract the ID from different possible paths
    const orderId = initialData.id || 
                   initialData.sales_order_id || 
                   (initialData.company_info && initialData.company_info.id);
    
    if (orderId) {
      console.log("Order ID received:", orderId);
      setCurrentSalesOrderId(orderId);
      
      // Fetch the complete order data using the ID
      fetchOrderData(orderId);
    }
    
    // If there's a draftStep property, set the current step
    if (initialData.draftStep) {
      console.log("Setting initial step:", initialData.draftStep);
      setKey(initialData.draftStep);
    }
  }
}, [initialData]);

// Add this function to fetch order data
const fetchOrderData = async (orderId) => {
  try {
    const response = await axiosInstance.get(`sales-order/${orderId}`);
    if (response?.data?.success && response?.data?.data) {
      const orderData = response.data.data;
      console.log("Order data fetched:", orderData);
      
      // Populate form data with the fetched order data
      populateFormData(orderData);
      
      // Find the first pending step and set it as current
      const firstPendingStep = findFirstPendingStep(orderData.steps);
      if (firstPendingStep) {
        console.log("Setting current step to first pending:", firstPendingStep);
        setKey(firstPendingStep);
      }
    }
  } catch (err) {
    console.error("Error fetching order data:", err);
    alert("Failed to load order data. Please try again.");
  }
};

// Add this function to populate form data with API response
const populateFormData = (orderData) => {
  // Extract data from API response
  const { company_info, shipping_details, steps, items, additional_info } = orderData;
  
  // Update form data with company info
  setFormData(prev => ({
    ...prev,
    quotation: {
      ...prev.quotation,
      companyName: company_info.company_name || prev.quotation.companyName,
      companyAddress: company_info.company_address || prev.quotation.companyAddress,
      companyEmail: company_info.company_email || prev.quotation.companyEmail,
      companyPhone: company_info.company_phone || prev.quotation.companyPhone,
      companyLogo: company_info.logo_url || prev.quotation.companyLogo,
      bankName: company_info.bank_name || prev.quotation.bankName,
      accountNo: company_info.account_no || prev.quotation.accountNo,
      accountHolder: company_info.account_holder || prev.quotation.accountHolder,
      ifsc: company_info.ifsc_code || prev.quotation.ifsc,
      terms: company_info.terms || prev.quotation.terms,
      quotationNo: steps.quotation.quotation_no || prev.quotation.quotationNo,
      manualQuotationRef: steps.quotation.manual_quo_no || prev.quotation.manualQuotationRef,
      quotationDate: steps.quotation.quotation_date || prev.quotation.quotationDate,
      validDate: steps.quotation.valid_till || prev.quotation.validDate,
      billToName: steps.quotation.qoutation_to_customer_name || prev.quotation.billToName,
      billToAddress: steps.quotation.qoutation_to_customer_address || prev.quotation.billToAddress,
      billToEmail: steps.quotation.qoutation_to_customer_email || prev.quotation.billToEmail,
      billToPhone: steps.quotation.qoutation_to_customer_phone || prev.quotation.billToPhone,
      notes: steps.quotation.notes || prev.quotation.notes,
      customerReference: steps.quotation.customer_ref || prev.quotation.customerReference,
      signature: additional_info.signature_url || prev.quotation.signature,
      photo: additional_info.photo_url || prev.quotation.photo,
      files: additional_info.files || prev.quotation.files,
    },
    salesOrder: {
      ...prev.salesOrder,
      companyName: company_info.company_name || prev.salesOrder.companyName,
      companyAddress: company_info.company_address || prev.salesOrder.companyAddress,
      companyEmail: company_info.company_email || prev.salesOrder.companyEmail,
      companyPhone: company_info.company_phone || prev.salesOrder.companyPhone,
      companyLogo: company_info.logo_url || prev.salesOrder.companyLogo,
      salesOrderNo: steps.sales_order.SO_no || prev.salesOrder.salesOrderNo,
      manualQuotationRef: steps.sales_order.manual_quo_no || prev.salesOrder.manualQuotationRef,
      orderDate: steps.sales_order.order_date || prev.salesOrder.orderDate,
      customerNo: steps.sales_order.customer_no || prev.salesOrder.customerNo,
      billToAttn: shipping_details.bill_to_attention_name || prev.salesOrder.billToAttn,
      billToCompanyName: shipping_details.bill_to_company_name || prev.salesOrder.billToCompanyName,
      billToAddress: shipping_details.bill_to_address || prev.salesOrder.billToAddress,
      billToEmail: shipping_details.bill_to_email || prev.salesOrder.billToEmail,
      billToPhone: shipping_details.bill_to_phone || prev.salesOrder.billToPhone,
      // Require user to manually fill 'Ship To' fields; do not auto-populate
      shipToAttn: shipping_details.ship_to_name,
     shipToName: shipping_details.ship_to_name,
      shipToAddress:shipping_details.ship_to_address ,
      shipToEmail: shipping_details.ship_to_email,
      shipToPhone:shipping_details.ship_to_phone ,
      terms: company_info.terms || prev.salesOrder.terms,
      signature: additional_info.signature_url || prev.salesOrder.signature,
      photo: additional_info.photo_url || prev.salesOrder.photo,
      files: additional_info.files || prev.salesOrder.files,
    },
    deliveryChallan: {
      ...prev.deliveryChallan,
      companyName: company_info.company_name || prev.deliveryChallan.companyName,
      companyAddress: company_info.company_address || prev.deliveryChallan.companyAddress,
      companyEmail: company_info.company_email || prev.deliveryChallan.companyEmail,
      companyPhone: company_info.company_phone || prev.deliveryChallan.companyPhone,
      companyLogo: company_info.logo_url || prev.deliveryChallan.companyLogo,
      challanNo: steps.delivery_challan.challan_no || prev.deliveryChallan.challanNo,
      manualChallanNo: steps.delivery_challan.manual_challan_no || prev.deliveryChallan.manualChallanNo,
      challanDate: steps.delivery_challan.challan_date || prev.deliveryChallan.challanDate,
      vehicleNo: steps.delivery_challan.vehicle_no || prev.deliveryChallan.vehicleNo,
      driverName: steps.delivery_challan.driver_name || prev.deliveryChallan.driverName,
      driverPhone: steps.delivery_challan.driver_phone || prev.deliveryChallan.driverPhone,
      billToName: shipping_details.bill_to_name || prev.deliveryChallan.billToName,
      billToAddress: shipping_details.bill_to_address || prev.deliveryChallan.billToAddress,
      billToEmail: shipping_details.bill_to_email || prev.deliveryChallan.billToEmail,
      billToPhone: shipping_details.bill_to_phone || prev.deliveryChallan.billToPhone,
      // Clear ship-to on delivery challan so user fills manually
            shipToAttn: shipping_details.ship_to_name,
      shipToName: shipping_details.ship_to_name,
      shipToAddress:shipping_details.ship_to_address ,
      shipToEmail: shipping_details.ship_to_email,
      shipToPhone:shipping_details.ship_to_phone ,
      terms: company_info.terms || prev.deliveryChallan.terms,
      signature: additional_info.signature_url || prev.deliveryChallan.signature,
      photo: additional_info.photo_url || prev.deliveryChallan.photo,
      files: additional_info.files || prev.deliveryChallan.files,
    },
    invoice: {
      ...prev.invoice,
      companyName: company_info.company_name || prev.invoice.companyName,
      companyAddress: company_info.company_address || prev.invoice.companyAddress,
      companyEmail: company_info.company_email || prev.invoice.companyEmail,
      companyPhone: company_info.company_phone || prev.invoice.companyPhone,
      companyLogo: company_info.logo_url || prev.invoice.companyLogo,
      invoiceNo: steps.invoice.invoice_no || prev.invoice.invoiceNo,
      manualInvoiceNo: steps.invoice.manual_invoice_no || prev.invoice.manualInvoiceNo,
      invoiceDate: steps.invoice.invoice_date || prev.invoice.invoiceDate,
      dueDate: steps.invoice.due_date || prev.invoice.dueDate,
      customerName: shipping_details.bill_to_name || prev.invoice.customerName,
      customerAddress: shipping_details.bill_to_address || prev.invoice.customerAddress,
      customerEmail: shipping_details.bill_to_email || prev.invoice.customerEmail,
      customerPhone: shipping_details.bill_to_phone || prev.invoice.customerPhone,
      // Require manual entry for invoice ship-to fields
       shipToName: shipping_details.ship_to_name,
      shipToAddress:shipping_details.ship_to_address ,
      shipToEmail: shipping_details.ship_to_email,
      shipToPhone:shipping_details.ship_to_phone ,
      paymentStatus: steps.invoice.payment_status || prev.invoice.paymentStatus,
      paymentMethod: steps.invoice.payment_method || prev.invoice.paymentMethod,
      note: steps.invoice.note || prev.invoice.note,
      terms: company_info.terms || prev.invoice.terms,
      signature: additional_info.signature_url || prev.invoice.signature,
      photo: additional_info.photo_url || prev.invoice.photo,
      files: additional_info.files || prev.invoice.files,
    },
    payment: {
      ...prev.payment,
      companyName: company_info.company_name || prev.payment.companyName,
      companyAddress: company_info.company_address || prev.payment.companyAddress,
      companyEmail: company_info.company_email || prev.payment.companyEmail,
      companyPhone: company_info.company_phone || prev.payment.companyPhone,
      companyLogo: company_info.logo_url || prev.payment.companyLogo,
      paymentNo: steps.payment.payment_no || prev.payment.paymentNo,
      manualPaymentNo: steps.payment.manual_payment_no || prev.payment.manualPaymentNo,
      paymentDate: steps.payment.payment_date || prev.payment.paymentDate,
      amount: steps.payment.amount_received || prev.payment.amount,
        amount_received: steps.payment.amount_received || prev.payment.amount_received || 0,
      total_invoice: steps.payment.total_invoice || prev.payment.total_invoice || 0,
      balance: steps.payment.balance || prev.payment.balance || 0,
      totalAmount: steps.payment.total_invoice || prev.payment.totalAmount,
      paymentMethod: steps.payment.payment_method || prev.payment.paymentMethod,
      paymentStatus: steps.payment.payment_status || prev.payment.paymentStatus,
      note: steps.payment.payment_note || prev.payment.note,
      customerName: shipping_details.bill_to_name || prev.payment.customerName,
      customerAddress: shipping_details.bill_to_address || prev.payment.customerAddress,
      customerEmail: shipping_details.bill_to_email || prev.payment.customerEmail,
      customerPhone: shipping_details.bill_to_phone || prev.payment.customerPhone,
      signature: additional_info.signature_url || prev.payment.signature,
      photo: additional_info.photo_url || prev.payment.photo,
      files: additional_info.files || prev.payment.files,
    }
  }));
  
  // Update items if available
  if (items && items.length > 0) {
    setFormData(prev => {
      const updatedItems = items.map(item => ({
        item_name: item.item_name,
        description: item.description || "",
        qty: item.qty,
        rate: item.rate,
        tax: item.tax_percent || 0,
        discount: item.discount || 0,
        amount: item.amount || (item.qty * item.rate),
        warehouse: item.warehouse_id || "",
        uom: item.uom || "PCS",
        hsn: item.hsn || "",
        sku: item.sku || "",
        barcode: item.barcode || "",
      }));
      
      return {
        ...prev,
        quotation: {
          ...prev.quotation,
          items: updatedItems
        },
        salesOrder: {
          ...prev.salesOrder,
          items: updatedItems
        },
        deliveryChallan: {
          ...prev.deliveryChallan,
          items: updatedItems.map(item => ({
            ...item,
            deliveredQty: item.qty // Default to ordered qty
          }))
        },
        invoice: {
          ...prev.invoice,
          items: updatedItems
        }
      };
    });
  }
};

// Add this function to find the first pending step
const findFirstPendingStep = (steps) => {
  const stepOrder = ['quotation', 'salesOrder', 'deliveryChallan', 'invoice', 'payment'];
  
  for (const step of stepOrder) {
    const stepKey = step === 'quotation' ? 'quotation' : 
                    step === 'salesOrder' ? 'sales_order' :
                    step === 'deliveryChallan' ? 'delivery_challan' :
                    step === 'invoice' ? 'invoice' : 'payment';
    
    if (steps[stepKey] && steps[stepKey].status === 'pending') {
      return step;
    }
  }
  
  // If all steps are completed, return the last step
  return 'payment';
};

// Update the handleSkip function to allow skipping completed steps
const handleSkip = () => {
  setKey((prev) => {
    const stepOrder = ['quotation', 'salesOrder', 'deliveryChallan', 'invoice', 'payment'];
    const currentIndex = stepOrder.indexOf(prev);
    
    if (currentIndex < stepOrder.length - 1) {
      return stepOrder[currentIndex + 1];
    }
    
    return prev;
  });
};

  // --- Form Data State ---
  const [formData, setFormData] = useState(() => {
    const initialFormData = {
      quotation: {
        referenceId: "",
        manualRefNo: "", // Optional manual ref
        companyName: companyDetails.name || "",
        companyAddress: companyDetails.address || "",
        companyEmail: companyDetails.email || "",
        companyPhone: companyDetails.phone || "",
        companyLogo: companyDetails.branding?.company_logo_url || "",
        companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
        companyIcon: companyDetails.branding?.company_icon_url || "",
        companyFavicon: companyDetails.branding?.favicon_url || "",
        quotationNo: "", // Auto-generated Quotation No
        manualQuotationRef: "", // Optional manual ref
        quotationDate: new Date().toISOString().split("T")[0],
        validDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 7 days from now
        billToName: "",
        billToAddress: "",
        billToEmail: "",
        billToPhone: "",
        customerId: null, // Add customer ID if available
        customerReference: "", // Add customer reference if needed
        items: [
          {
            item_name: "", // Changed from 'name' for clarity
            description: "",
            qty: "",
            rate: "",
            tax: 0,
            discount: 0,
            amount: 0, // Calculated amount
            sellingPrice: 0,
            uom: "PCS",
            warehouse: "",
            hsn: "",
            sku: "",
            barcode: "",
            warehouses: [], // List of warehouses for the item
          },
        ],
        terms: companyDetails.terms_and_conditions || "",
        notes: companyDetails.notes || "",
        bankName: companyDetails.bank_details?.bank_name || "",
        accountNo: companyDetails.bank_details?.account_number || "",
        accountHolder: companyDetails.bank_details?.account_holder || "",
        ifsc: companyDetails.bank_details?.ifsc_code || "",
        signature: "",
        photo: "",
        files: [],
        footerNote: "Thank you!",
      },
      salesOrder: {
        referenceId: "",
        salesOrderNo: "", // Auto-generated SO No
        manualOrderRef: "", // Manual SO Ref
        manualQuotationRef: "", // Manual QUO Ref
        manualRefNo: "",
        orderDate: new Date().toISOString().split("T")[0],
        customerName: "",
        customerAddress: "",
        customerEmail: "",
        customerPhone: "",
        customerNo: "",
        companyName: companyDetails.name || "",
        companyAddress: companyDetails.address || "",
        companyEmail: companyDetails.email || "",
        companyPhone: companyDetails.phone || "",
        companyLogo: companyDetails.branding?.company_logo_url || "",
        companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
        companyIcon: companyDetails.branding?.company_icon_url || "",
        companyFavicon: companyDetails.branding?.favicon_url || "",
        billToAttn: "",
        billToCompanyName: "",
        billToAddress: "",
        billToEmail: "",
        billToPhone: "",
        shipToAttn: "",
        shipToCompanyName: "",
        shipToAddress: "",
        shipToEmail: "",
        shipToPhone: "",
        items: [
          {
            item_name: "",
            qty: "",
            rate: "",
            tax: 0,
            discount: 0,
            warehouse: "",
          },
        ],
        terms: companyDetails.terms_and_conditions || "",
        signature: "",
        photo: "",
        files: [],
        footerNote: "Thank you!",
        // 👉 Quotation No (Auto + Manual)
        quotationNo: "", // Auto-generated QUO No
        manualQuotationRef: "", // Manual QUO Ref
      },
      deliveryChallan: {
        referenceId: "",
        challanNo: "", // Auto-generated DC No
        manualChallanNo: "", // Manual DC Ref
        manualRefNo: "", // Fallback manual ref
        challanDate: new Date().toISOString().split("T")[0],
        vehicleNo: "",
        driverName: "",
        driverPhone: "",
        salesOrderNo: "", // Auto-generated SO No
        manualSalesOrderRef: "", // Manual SO Ref
        companyName: companyDetails.name || "",
        companyAddress: companyDetails.address || "",
        companyEmail: companyDetails.email || "",
        companyPhone: companyDetails.phone || "",
        companyLogo: companyDetails.branding?.company_logo_url || "",
        companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
        companyIcon: companyDetails.branding?.company_icon_url || "",
        companyFavicon: companyDetails.branding?.favicon_url || "",
        billToName: "",
        billToAddress: "",
        billToEmail: "",
        billToPhone: "",
        shipToName: "",
        shipToAddress: "",
        shipToEmail: "",
        shipToPhone: "",
        items: [
          {
            item_name: "",
            qty: "",
            deliveredQty: "",
            rate: "",
            tax: 0,
            discount: 0,
            warehouse: "",
          },
        ],
        terms: companyDetails.terms_and_conditions || "",
        signature: "",
        photo: "",
        files: [],
        footerNote: "Thank you!",
      },
      invoice: {
        referenceId: "",
        invoiceNo: "", // Auto-generated INV No
        manualInvoiceNo: "", // Manual INV Ref
        manualRefNo: "", // Fallback manual ref
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0], // 15 days from now
        challanNo: "", // Auto-generated DC No
        manualChallanRef: "", // Manual DC Ref
        manualChallanNo: "",
        companyName: companyDetails.name || "",
        companyAddress: companyDetails.address || "",
        companyEmail: companyDetails.email || "",
        companyPhone: companyDetails.phone || "",
        companyLogo: companyDetails.branding?.company_logo_url || "",
        companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
        companyIcon: companyDetails.branding?.company_icon_url || "",
        companyFavicon: companyDetails.branding?.favicon_url || "",
        customerName: "",
        customerAddress: "",
        customerEmail: "",
        customerPhone: "",
        shipToName: "",
        shipToAddress: "",
        shipToEmail: "",
        shipToPhone: "",
        items: [
          {
            description: "",
            rate: "",
            qty: "",
            tax: "",
            discount: "",
            amount: "",
            warehouse: "",
          },
        ],
        paymentStatus: "Pending",
        paymentMethod: "",
        note: "",
        terms: companyDetails.terms_and_conditions || "",
        signature: "",
        photo: "",
        files: [],
        footerNote: "Thank you!",
      },
      payment: {
        referenceId: "",
        paymentNo: "", // Auto-generated PAY No
        manualPaymentNo: "", // Manual PAY Ref
        manualRefNo: "", // Fallback manual ref
        paymentDate: new Date().toISOString().split("T")[0],
        amount: "",
       amount_received: 0, // Amount received from customer
        total_invoice: 0, // Total invoice amount
        balance: 0, // Balance amount
    
        paymentMethod: "",
        paymentStatus: "Pending",
        note: "",
        invoiceNo: "", // Auto-generated INV No
        manualInvoiceRef: "", // Manual INV Ref
        customerName: "",
        customerAddress: "",
        customerEmail: "",
        customerPhone: "",
        companyName: companyDetails.name || "",
        companyAddress: companyDetails.address || "",
        companyEmail: companyDetails.email || "",
        companyPhone: companyDetails.phone || "",
        companyLogo: companyDetails.branding?.company_logo_url || "",
        companyDarkLogo: companyDetails.branding?.company_dark_logo_url || "",
        companyIcon: companyDetails.branding?.company_icon_url || "",
        companyFavicon: companyDetails.branding?.favicon_url || "",
        signature: "",
        photo: "",
        files: [],
        footerNote: "Thank you!",
      },
    };

    // Merge initialData if provided (guard against null/undefined)
    Object.keys(initialData || {}).forEach((tabKey) => {
      if (initialFormData[tabKey]) {
        initialFormData[tabKey] = {
          ...initialFormData[tabKey],
          ...initialData[tabKey],
        };
      }
    });

    return initialFormData;
  });

  // Fetch company details by logged-in company id and populate all steps
  useEffect(() => {
    const company_id = GetCompanyId();
    if (!company_id) return;

    const fetchCompany = async () => {
      try {
        const response = await axiosInstance.get(`auth/Company/${company_id}`);
        const company = response?.data?.data;
        if (!company) return;

        setFormData((prev) => {
          const mapCompanyToTab = (tab) => ({
            ...prev[tab],
            companyName: company.name || prev[tab].companyName,
            companyAddress: company.address || prev[tab].companyAddress,
            companyEmail: company.email || prev[tab].companyEmail,
            companyPhone: company.phone || prev[tab].companyPhone,
            companyLogo:
              company.branding?.company_logo_url || prev[tab].companyLogo,
            companyDarkLogo:
              company.branding?.company_dark_logo_url ||
              prev[tab].companyDarkLogo,
            companyIcon:
              company.branding?.company_icon_url || prev[tab].companyIcon,
            companyFavicon:
              company.branding?.favicon_url || prev[tab].companyFavicon,
            terms: company.terms_and_conditions || prev[tab].terms,
            notes: company.notes || prev[tab].notes,
            bankName: company.bank_details?.bank_name || prev[tab].bankName,
            accountNo:
              company.bank_details?.account_number || prev[tab].accountNo,
            accountHolder:
              company.bank_details?.account_holder || prev[tab].accountHolder,
            ifsc: company.bank_details?.ifsc_code || prev[tab].ifsc,
          });

          return {
            ...prev,
            quotation: mapCompanyToTab("quotation"),
            salesOrder: mapCompanyToTab("salesOrder"),
            deliveryChallan: mapCompanyToTab("deliveryChallan"),
            invoice: mapCompanyToTab("invoice"),
            payment: mapCompanyToTab("payment"),
          };
        });
      } catch (err) {
        console.error("Failed to fetch company details:", err);
      }
    };

    fetchCompany();
  }, []);

  // Fetch sales workflow data
  useEffect(() => {
    const fetchSalesWorkflow = async () => {
      try {
        setLoadingWorkflow(true);
        const company_id = GetCompanyId();
        if (!company_id) return;

        const response = await axiosInstance.get(
          `sales-order/company/${company_id}`
        );
        if (response?.data?.data) {
          setSalesWorkflow(response.data.data);

          // Extract the current sales order ID if it exists
          const salesOrderData = response.data.data.find(
            (item) => item.step === "sales_order" && item.status === "completed"
          );

          if (salesOrderData && salesOrderData.id) {
            setCurrentSalesOrderId(salesOrderData.id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sales workflow:", err);
      } finally {
        setLoadingWorkflow(false);
      }
    };

    fetchSalesWorkflow();
  }, []);

  // Search state for each row
  const [rowSearchTerms, setRowSearchTerms] = useState({});
  const [showRowSearch, setShowRowSearch] = useState({});
  // Search state for each row's warehouse
  const [warehouseSearchTerms, setWarehouseSearchTerms] = useState({});
  const [showWarehouseSearch, setShowWarehouseSearch] = useState({});

  // Modals and state for adding items/services
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    hsn: "",
    tax: 0,
    sellingPrice: 0,
    uom: "PCS",
  });
  const [serviceForm, setServiceForm] = useState({
    name: "",
    serviceDescription: "",
    price: "",
    tax: "",
  });

  // Customer search state (for Quotation Tab)
  const [customerList, setCustomerList] = useState([]); // Should come from parent or API call
  const [filteredCustomerList, setFilteredCustomerList] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [productList, setProductList] = useState(availableItems || []);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  // When a customer is selected in the quotation tab, propagate basic customer info to all steps
  useEffect(() => {
    if (!selectedCustomer) return;

    setFormData((prev) => ({
      ...prev,
      quotation: {
        ...prev.quotation,
        billToName:
          selectedCustomer.name_english || selectedCustomer.name || "",
        billToAddress: selectedCustomer.address || "",
        billToEmail: selectedCustomer.email || "",
        billToPhone: selectedCustomer.phone || selectedCustomer.mobile || "",
        customerId: selectedCustomer.id || prev.quotation.customerId,
      },
      salesOrder: {
        ...prev.salesOrder,
        customerName:
          selectedCustomer.name_english || selectedCustomer.name || "",
        customerAddress: selectedCustomer.address || "",
        customerEmail: selectedCustomer.email || "",
        customerPhone: selectedCustomer.phone || selectedCustomer.mobile || "",
        billToAttn:
          selectedCustomer.name_english || selectedCustomer.name || "",
        billToCompanyName:
          selectedCustomer.company_name || selectedCustomer.name_english || "",
        billToAddress: selectedCustomer.address || "",
        billToEmail: selectedCustomer.email || "",
        billToPhone: selectedCustomer.phone || selectedCustomer.mobile || "",
      },
      deliveryChallan: {
        ...prev.deliveryChallan,
        billToName:
          selectedCustomer.name_english || selectedCustomer.name || "",
        billToAddress: selectedCustomer.address || "",
        billToEmail: selectedCustomer.email || "",
        billToPhone: selectedCustomer.phone || selectedCustomer.mobile || "",
      },
      invoice: {
        ...prev.invoice,
        customerName:
          selectedCustomer.name_english || selectedCustomer.name || "",
        customerAddress: selectedCustomer.address || "",
        customerEmail: selectedCustomer.email || "",
        customerPhone: selectedCustomer.phone || selectedCustomer.mobile || "",
      },
      payment: {
        ...prev.payment,
        customerName:
          selectedCustomer.name_english || selectedCustomer.name || "",
        customerAddress: selectedCustomer.address || "",
        customerEmail: selectedCustomer.email || "",
        customerPhone: selectedCustomer.phone || selectedCustomer.mobile || "",
      },
    }));
  }, [selectedCustomer]);

  // Categories (could also come from parent)
  const [categories, setCategories] = useState([
    "Electronics",
    "Furniture",
    "Apparel",
    "Food",
    "Books",
    "Automotive",
    "Medical",
    "Software",
    "Stationery",
    "Other",
  ]);

  // Fetch initial data (example placeholder - parent should handle this)
  useEffect(() => {
    // Example: setCustomerList([]); // Fetch from parent prop or API
    setFilteredCustomerList(customerList);
  }, [customerList]);

  // --- Reference ID and Auto-Number Generation ---
  const generateReferenceId = (tabKey) => {
    const prefixes = {
      quotation: "QUO",
      salesOrder: "SO",
      deliveryChallan: "DC",
      invoice: "INV",
      payment: "PAY",
    };
    const prefix = prefixes[tabKey] || "REF";
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  };

  // --- Auto-fill Logic ---
  useEffect(() => {
    // Quotation Auto-fill
    if (!formData.quotation.referenceId) {
      handleChange(
        "quotation",
        "referenceId",
        generateReferenceId("quotation")
      );
    }
    if (!formData.quotation.quotationNo) {
      if (formData.quotation.manualQuotationRef) {
        handleChange(
          "quotation",
          "quotationNo",
          formData.quotation.manualQuotationRef
        );
      } else {
        handleChange(
          "quotation",
          "quotationNo",
          generateReferenceId("quotation")
        );
      }
    }
    // Do not overwrite an existing primary quotationNo when manual field changes
    // Manual quotation ref is used only as initial value when primary is empty.

    // Sales Order Auto-fill
    if (!formData.salesOrder.referenceId) {
      handleChange(
        "salesOrder",
        "referenceId",
        generateReferenceId("salesOrder")
      );
    }
    if (!formData.salesOrder.salesOrderNo) {
      if (formData.salesOrder.manualOrderRef) {
        handleChange(
          "salesOrder",
          "salesOrderNo",
          formData.salesOrder.manualOrderRef
        );
      } else {
        handleChange(
          "salesOrder",
          "salesOrderNo",
          generateReferenceId("salesOrder")
        );
      }
    }
    // Do not overwrite an existing primary salesOrderNo when manual field changes
    // Manual order ref is applied only if salesOrderNo is empty (handled above).
    if (!formData.salesOrder.quotationNo && formData.quotation.quotationNo) {
      handleChange("salesOrder", "quotationNo", formData.quotation.quotationNo);
    }
    // Apply manual quotation ref to sales order only if salesOrder.quotationNo is empty
    if (
      formData.salesOrder.manualQuotationRef &&
      !formData.salesOrder.quotationNo
    ) {
      handleChange(
        "salesOrder",
        "quotationNo",
        formData.salesOrder.manualQuotationRef
      );
    }

    // Delivery Challan Auto-fill
    if (!formData.deliveryChallan.referenceId) {
      handleChange(
        "deliveryChallan",
        "referenceId",
        generateReferenceId("deliveryChallan")
      );
    }
    if (!formData.deliveryChallan.challanNo) {
      if (formData.deliveryChallan.manualChallanNo) {
        handleChange(
          "deliveryChallan",
          "challanNo",
          formData.deliveryChallan.manualChallanNo
        );
      } else {
        handleChange(
          "deliveryChallan",
          "challanNo",
          generateReferenceId("deliveryChallan")
        );
      }
    }
    // Do not overwrite an existing primary challanNo when manual field changes
    // Manual challan ref is respected only as initial value when primary is empty.
    if (
      !formData.deliveryChallan.salesOrderNo &&
      formData.salesOrder.salesOrderNo
    ) {
      handleChange(
        "deliveryChallan",
        "salesOrderNo",
        formData.salesOrder.salesOrderNo
      );
    }

    // Invoice Auto-fill
    if (!formData.invoice.referenceId) {
      handleChange("invoice", "referenceId", generateReferenceId("invoice"));
    }
    if (!formData.invoice.invoiceNo) {
      if (formData.invoice.manualInvoiceNo) {
        handleChange("invoice", "invoiceNo", formData.invoice.manualInvoiceNo);
      } else {
        handleChange("invoice", "invoiceNo", generateReferenceId("invoice"));
      }
    }
    // Do not overwrite an existing primary invoiceNo when manual field changes
    // Manual invoice ref is used only as initial value when primary is empty.
    if (!formData.invoice.challanNo && formData.deliveryChallan.challanNo) {
      handleChange("invoice", "challanNo", formData.deliveryChallan.challanNo);
    }

    // Payment Auto-fill
    if (!formData.payment.referenceId) {
      handleChange("payment", "referenceId", generateReferenceId("payment"));
    }
    if (!formData.payment.paymentNo) {
      if (formData.payment.manualPaymentNo) {
        handleChange("payment", "paymentNo", formData.payment.manualPaymentNo);
      } else {
        handleChange("payment", "paymentNo", generateReferenceId("payment"));
      }
    }
    // Do not overwrite an existing primary paymentNo when manual field changes
    // Manual payment ref is used only as initial value when primary is empty.
    if (!formData.payment.invoiceNo && formData.invoice.invoiceNo) {
      handleChange("payment", "invoiceNo", formData.invoice.invoiceNo);
    }
  }, [
    formData.quotation.referenceId,
    formData.quotation.quotationNo,
    formData.quotation.manualQuotationRef,
    formData.salesOrder.referenceId,
    formData.salesOrder.salesOrderNo,
    formData.salesOrder.manualOrderRef,
    formData.salesOrder.quotationNo,
    formData.salesOrder.manualQuotationRef,
    formData.deliveryChallan.referenceId,
    formData.deliveryChallan.challanNo,
    formData.deliveryChallan.manualChallanNo,
    formData.deliveryChallan.salesOrderNo,
    formData.invoice.referenceId,
    formData.invoice.invoiceNo,
    formData.invoice.manualInvoiceNo,
    formData.invoice.challanNo,
    formData.payment.referenceId,
    formData.payment.paymentNo,
    formData.payment.manualPaymentNo,
    formData.payment.invoiceNo,
  ]);

  // --- Handlers ---
  const handleChange = (tab, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };

  const handleItemChange = (tab, index, field, value) => {
    const updatedItems = [...formData[tab].items];
    updatedItems[index][field] = value;
    // Recalculate amount if rate or qty changes
    if (field === "rate" || field === "qty") {
      const rate = parseFloat(updatedItems[index].rate) || 0;
      const qty = parseFloat(updatedItems[index].qty) || 0;
      updatedItems[index].amount = rate * qty;
    }
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };

  const handleProductChange = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleServiceInput = (e) => {
    const { name, value } = e.target;
    setServiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addItem = (tab) => {
    setFormData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [
          ...prev[tab].items,
          {
            item_name: "",
            qty: "",
            rate: "",
            tax: 0,
            discount: 0,
            warehouse: "",
          },
        ],
      },
    }));
  };

  const removeItem = (tab, index) => {
    const updatedItems = [...formData[tab].items];
    updatedItems.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };

  // --- Row Search Handlers ---
  const handleRowSearchChange = (tab, index, value) => {
    setRowSearchTerms((prev) => ({
      ...prev,
      [`${tab}-${index}`]: value,
    }));
  };

  const handleSelectSearchedItem = (tab, index, item) => {
    const updatedItems = [...formData[tab].items];
    // Support different API shapes: products use `item_name` and `sale_price` etc.
    const name = item.name || item.item_name || "";
    const rate =
      item.price || item.sale_price || item.sellingPrice || item.rate || "";
    const tax = item.tax || item.tax_percent || 0;
    const hsn = item.hsn || "";
    const uom =
      item.uom ||
      item.unit_detail?.uom_name ||
      updatedItems[index].uom ||
      "PCS";
    const description =
      item.description ||
      item.prod_description ||
      updatedItems[index].description ||
      "";
    const sku = item.sku || item.SKU || "";
    const barcode = item.barcode || "";
    const warehousesForItem = item.warehouses || item.warehouses_list || [];

    updatedItems[index] = {
      ...updatedItems[index],
      item_name: name,
      rate: rate,
      tax: tax,
      hsn: hsn,
      uom: uom,
      description: description,
      sku: sku,
      barcode: barcode,
      warehouses: warehousesForItem,
    };
    if (warehousesForItem && warehousesForItem.length > 0) {
      updatedItems[index].warehouse =
        warehousesForItem[0].warehouse_name ||
        warehousesForItem[0].warehouse ||
        "";
    } else {
      updatedItems[index].warehouse = "";
    }
    setFormData((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
    setShowRowSearch((prev) => ({
      ...prev,
      [`${tab}-${index}`]: false,
    }));
    setRowSearchTerms((prev) => ({
      ...prev,
      [`${tab}-${index}`]: "",
    }));
  };

  const toggleRowSearch = (tab, index) => {
    const rowKey = `${tab}-${index}`;
    setShowRowSearch((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  // --- Warehouse Search Handlers ---
  const handleWarehouseSearchChange = (tab, index, value) => {
    setWarehouseSearchTerms((prev) => ({
      ...prev,
      [`${tab}-${index}`]: value,
    }));
  };

  const handleSelectSearchedWarehouse = (tab, index, warehouse) => {
    handleItemChange(tab, index, "warehouse", warehouse.warehouse_id);
    setShowWarehouseSearch((prev) => ({
      ...prev,
      [`${tab}-${index}`]: false,
    }));
    setWarehouseSearchTerms((prev) => ({
      ...prev,
      [`${tab}-${index}`]: "",
    }));
  };

  const toggleWarehouseSearch = (tab, index) => {
    const rowKey = `${tab}-${index}`;
    setShowWarehouseSearch((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  // --- Calculation Functions ---
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

  // --- Navigation Buttons ---
  // const handleSkip = () => {
  //   setKey((prev) => {
  //     if (prev === "quotation") return "salesOrder";
  //     if (prev === "salesOrder") return "deliveryChallan";
  //     if (prev === "deliveryChallan") return "invoice";
  //     if (prev === "invoice") return "payment";
  //     return "quotation";
  //   });
  // };
useEffect(() => {
  if (key === 'payment') {
    const totalInvoice = parseFloat(formData.payment.total_invoice) || 0;
    const amountReceived = parseFloat(formData.payment.amount_received) || 0;
    const balance = totalInvoice - amountReceived;
    
    // Update the balance in the form data
    setFormData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        balance: balance.toFixed(2)
      }
    }));
  }
}, [formData.payment.amount_received, formData.payment.total_invoice, key]);

// When navigating from Sales Order -> Delivery Challan / Invoice, copy ship-to fields
// from Sales Order into the next steps, but do not override existing values.
useEffect(() => {
  // Helper to check empty-ish values
  const isEmpty = (v) => v === undefined || v === null || String(v).trim() === "";

  if (key === "deliveryChallan") {
    setFormData((prev) => {
      const sales = prev.salesOrder || {};
      const dest = prev.deliveryChallan || {};
      const updated = { ...dest };

      // Map salesOrder ship fields to deliveryChallan fields
      if (isEmpty(dest.shipToName) && !isEmpty(sales.shipToCompanyName)) {
        updated.shipToName = sales.shipToCompanyName;
      }
      if (isEmpty(updated.shipToName) && !isEmpty(sales.shipToAttn)) {
        updated.shipToName = sales.shipToAttn;
      }
      if (isEmpty(dest.shipToAddress) && !isEmpty(sales.shipToAddress)) {
        updated.shipToAddress = sales.shipToAddress;
      }
      if (isEmpty(dest.shipToEmail) && !isEmpty(sales.shipToEmail)) {
        updated.shipToEmail = sales.shipToEmail;
      }
      if (isEmpty(dest.shipToPhone) && !isEmpty(sales.shipToPhone)) {
        updated.shipToPhone = sales.shipToPhone;
      }

      // If nothing changed, return prev to avoid unnecessary renders
      const changed = Object.keys(updated).some((k) => updated[k] !== dest[k]);
      if (!changed) return prev;
      return { ...prev, deliveryChallan: updated };
    });
  }

  if (key === "invoice") {
    setFormData((prev) => {
      const sales = prev.salesOrder || {};
      const dest = prev.invoice || {};
      const updated = { ...dest };

      // Map salesOrder ship fields to invoice fields
      if (isEmpty(dest.shipToName) && !isEmpty(sales.shipToCompanyName)) {
        updated.shipToName = sales.shipToCompanyName;
      }
      if (isEmpty(updated.shipToName) && !isEmpty(sales.shipToAttn)) {
        updated.shipToName = sales.shipToAttn;
      }
      if (isEmpty(dest.shipToAddress) && !isEmpty(sales.shipToAddress)) {
        updated.shipToAddress = sales.shipToAddress;
      }
      if (isEmpty(dest.shipToEmail) && !isEmpty(sales.shipToEmail)) {
        updated.shipToEmail = sales.shipToEmail;
      }
      if (isEmpty(dest.shipToPhone) && !isEmpty(sales.shipToPhone)) {
        updated.shipToPhone = sales.shipToPhone;
      }

      const changed = Object.keys(updated).some((k) => updated[k] !== dest[k]);
      if (!changed) return prev;
      return { ...prev, invoice: updated };
    });
  }
}, [key]);
const handleSaveDraft = async () => {
  // Mark validation attempt as true so error messages show
  setValidationAttempted(true);

  // Check if required fields are filled
  if (!validateRequiredFields()) {
    toast.error("Please fill all required fields before saving");
    return;
  }

  try {
    const company_id = GetCompanyId();
    if (!company_id) return;

    // Calculate total invoice amount from invoice items if not already set
    const totalInvoiceAmount = key === 'payment' 
      ? (parseFloat(formData.payment.total_invoice) || calculateTotalWithTaxAndDiscount(formData.invoice.items))
      : 0;

    // Update payment form data with calculated total invoice
    if (key === 'payment') {
      setFormData(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          total_invoice: totalInvoiceAmount.toFixed(2),
          balance: (totalInvoiceAmount - (parseFloat(prev.payment.amount_received) || 0)).toFixed(2)
        }
      }));
    }

    // Single endpoint for all steps
    const endpoint = "sales-order/create-sales-order";
    
    // Determine if this is the first step (quotation) or a subsequent step
    const isFirstStep = key === "quotation" && !currentSalesOrderId;
    const method = isFirstStep ? "post" : "put"; // POST for first step, PUT for subsequent steps

    // Build a unified payload that includes all steps data
    const payload = {
      company_info: {
        company_id: company_id,
        company_name: formData[key].companyName,
        company_address: formData[key].companyAddress,
        company_email: formData[key].companyEmail,
        company_phone: formData[key].companyPhone,
        logo_url: formData[key].companyLogo,
        bank_name: formData.quotation.bankName,
        account_no: formData.quotation.accountNo,
        account_holder: formData.quotation.accountHolder,
        ifsc_code: formData.quotation.ifsc,
        terms: formData[key].terms,
      },
      shipping_details: {
        bill_to_name: formData[key].billToName || formData[key].customerName,
        bill_to_address: formData[key].billToAddress || formData[key].customerAddress,
        bill_to_email: formData[key].billToEmail || formData[key].customerEmail,
        bill_to_phone: formData[key].billToPhone || formData[key].customerPhone,
        bill_to_attention_name: formData.salesOrder.billToAttn || "",
        bill_to_company_name: formData.salesOrder.billToCompanyName || formData[key].billToName || formData[key].customerName,
        ship_to_name: formData[key].shipToName,
        ship_to_address: formData[key].shipToAddress,
        ship_to_email: formData[key].shipToEmail,
        ship_to_phone: formData[key].shipToPhone,
        ship_to_attention_name: formData.salesOrder.shipToAttn || "",
        ship_to_company_name: formData.salesOrder.shipToCompanyName || formData[key].shipToName,
      },
      items: (formData[key] && Array.isArray(formData[key].items) ? formData[key].items : (formData.invoice && Array.isArray(formData.invoice.items) ? formData.invoice.items : [])).map((item) => ({
        item_name: item.item_name || item.description,
        description: item.description,
        qty: item.qty,
        rate: item.rate,
        tax_percent: item.tax,
        discount: item.discount,
        amount: item.amount,
        uom: item.uom,
        hsn: item.hsn,
        sku: item.sku,
        barcode: item.barcode,
        warehouse_id: item.warehouse,
      })),
      // Include all step-specific data
      steps: {
        quotation: {
          quotation_no: formData.quotation.quotationNo,
          manual_quo_no: formData.quotation.manualQuotationRef,
          quotation_date: formData.quotation.quotationDate,
          valid_till: formData.quotation.validDate,
          qoutation_to_customer_name: formData.quotation.billToName,
          qoutation_to_customer_address: formData.quotation.billToAddress,
          qoutation_to_customer_email: formData.quotation.billToEmail,
          qoutation_to_customer_phone: formData.quotation.billToPhone,
          notes: formData.quotation.notes,
          customer_ref: formData.quotation.customerReference,
        },
        sales_order: {
          SO_no: formData.salesOrder.salesOrderNo,
          manual_ref_no: formData.salesOrder.manualQuotationRef,
          order_date: formData.salesOrder.orderDate,
          customer_no: formData.salesOrder.customerNo,
        },
        delivery_challan: {
          challan_no: formData.deliveryChallan.challanNo,
          manual_challan_no: formData.deliveryChallan.manualChallanNo,
          challan_date: formData.deliveryChallan.challanDate,
          vehicle_no: formData.deliveryChallan.vehicleNo,
          driver_name: formData.deliveryChallan.driverName,
          driver_phone: formData.deliveryChallan.driverPhone,
        },
        invoice: {
          invoice_no: formData.invoice.invoiceNo,
          manual_invoice_no: formData.invoice.manualInvoiceNo,
          invoice_date: formData.invoice.invoiceDate,
          due_date: formData.invoice.dueDate,
          payment_status: formData.invoice.paymentStatus,
          payment_method: formData.invoice.paymentMethod,
          note: formData.invoice.note,
          customer_name: formData.invoice.customerName,
          customer_address: formData.invoice.customerAddress,
          customer_email: formData.invoice.customerEmail,
          customer_phone: formData.invoice.customerPhone,
        },
        payment: {
          payment_no: formData.payment.paymentNo,
          manual_payment_no: formData.payment.manualPaymentNo,
          payment_date: formData.payment.paymentDate,
          amount_received: parseFloat(formData.payment.amount_received) || 0,
          total_invoice: parseFloat(formData.payment.total_invoice) || totalInvoiceAmount,
          balance: parseFloat(formData.payment.balance) || (totalInvoiceAmount - (parseFloat(formData.payment.amount_received) || 0)),
          payment_method: formData.payment.paymentMethod,
          payment_status: formData.payment.paymentStatus,
          payment_note: formData.payment.note,
        },
      },
      additional_info: {
        files: (formData[key] && Array.isArray(formData[key].files) ? formData[key].files : []),
        signature_url: formData[key] ? formData[key].signature : "",
        photo_url: formData[key] ? formData[key].photo : "",
        attachment_url: (formData[key] && Array.isArray(formData[key].files) && formData[key].files.length > 0) ? formData[key].files[0].base64 : "",
      },
      current_step: key, // Indicate which step is currently being saved
    };

    // Send the request to the API
    let response;
    if (method === "put" && currentSalesOrderId) {
      response = await axiosInstance.put(`${endpoint}/${currentSalesOrderId}`, payload);
    } else {
      response = await axiosInstance.post(endpoint, payload);
    }

    if (response?.data?.success) {
      alert("Draft saved successfully!");

      // If we just created a sales order, store its ID for future updates
      if (
        isFirstStep &&
        response.data.data?.sales_order_id
      ) {
        setCurrentSalesOrderId(response.data.data.sales_order_id);
      }

      // Refresh the sales workflow
      fetchSalesWorkflow();
    } else {
      alert("Failed to save draft. Please try again.");
    }
  } catch (err) {
    console.error("Error saving draft:", err);
    alert("Error saving draft. Please try again.");
  }
};

  const fetchSalesWorkflow = async () => {
    try {
      setLoadingWorkflow(true);
      const company_id = GetCompanyId();
      if (!company_id) return;

      const response = await axiosInstance.get(
        `sales-order/company/${company_id}`
      );
      if (response?.data?.data) {
        setSalesWorkflow(response.data.data);

        // Extract the current sales order ID if it exists
        const salesOrderData = response.data.data.find(
          (item) => item.step === "sales_order" && item.status === "completed"
        );

        if (salesOrderData && salesOrderData.id) {
          setCurrentSalesOrderId(salesOrderData.id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch sales workflow:", err);
    } finally {
      setLoadingWorkflow(false);
    }
  };

  const handleSaveNext = async () => {
    // First save the current step
    await handleSaveDraft();

    // Then move to the next step
    setKey((prev) => {
      if (prev === "quotation") {
        setFormData((prevData) => ({
          ...prevData,
          salesOrder: {
            ...prevData.salesOrder,
            quotationNo: prevData.quotation.quotationNo,
            orderDate: prevData.quotation.quotationDate,
            customerName: prevData.quotation.billToName,
            customerAddress: prevData.quotation.billToAddress,
            customerEmail: prevData.quotation.billToEmail,
            customerPhone: prevData.quotation.billToPhone,
            companyName: prevData.quotation.companyName,
            companyAddress: prevData.quotation.companyAddress,
            companyEmail: prevData.quotation.companyEmail,
            companyPhone: prevData.quotation.companyPhone,
            companyLogo: prevData.quotation.companyLogo,
            companyDarkLogo: prevData.quotation.companyDarkLogo,
            companyIcon: prevData.quotation.companyIcon,
            companyFavicon: prevData.quotation.companyFavicon,
            billToAttn: prevData.quotation.billToName, // Map to new fields
            billToCompanyName: prevData.quotation.billToName,
            billToAddress: prevData.quotation.billToAddress,
            billToEmail: prevData.quotation.billToEmail,
            billToPhone: prevData.quotation.billToPhone,
            // Clear ship-to fields to force manual entry by the user
            shipToAttn: "",
            shipToCompanyName: "",
            shipToAddress: "",
            shipToEmail: "",
            shipToPhone: "",
            items: prevData.quotation.items.map((item) => ({
              item_name: item.item_name,
              qty: item.qty,
              rate: item.rate,
              warehouse: item.warehouse || "",
              warehouses: item.warehouses || [],
            })),
            terms: prevData.quotation.terms,
          },
        }));
        return "salesOrder";
      }
      if (prev === "salesOrder") {
        setFormData((prevData) => ({
          ...prevData,
          deliveryChallan: {
            ...prevData.deliveryChallan,
            salesOrderNo: prevData.salesOrder.salesOrderNo,
            challanDate: new Date().toISOString().split("T")[0],
            companyName: prevData.salesOrder.companyName,
            companyAddress: prevData.salesOrder.companyAddress,
            companyEmail: prevData.salesOrder.companyEmail,
            companyPhone: prevData.salesOrder.companyPhone,
            companyLogo: prevData.salesOrder.companyLogo,
            companyDarkLogo: prevData.salesOrder.companyDarkLogo,
            companyIcon: prevData.salesOrder.companyIcon,
            companyFavicon: prevData.salesOrder.companyFavicon,
            billToName: prevData.salesOrder.billToCompanyName, // Map from SO
            billToAddress: prevData.salesOrder.billToAddress,
            billToEmail: prevData.salesOrder.billToEmail,
            billToPhone: prevData.salesOrder.billToPhone,
            // Clear ship-to so user can enter manually
            shipToName: "",
            shipToAddress: "",
            shipToEmail: "",
            shipToPhone: "",
            items: prevData.salesOrder.items.map((item) => ({
              item_name: item.item_name,
              qty: item.qty,
              deliveredQty: item.qty, // Default to ordered qty
              rate: item.rate,
              warehouse: item.warehouse || "",
              warehouses: item.warehouses || [],
            })),
            terms: prevData.salesOrder.terms,
          },
        }));
        return "deliveryChallan";
      }
      if (prev === "deliveryChallan") {
        setFormData((prevData) => ({
          ...prevData,
          invoice: {
            ...prevData.invoice,
            challanNo: prevData.deliveryChallan.challanNo,
            invoiceDate: new Date().toISOString().split("T")[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            customerName: prevData.deliveryChallan.billToName, // Map from DC
            customerAddress: prevData.deliveryChallan.billToAddress,
            customerEmail: prevData.deliveryChallan.billToEmail,
            customerPhone: prevData.deliveryChallan.billToPhone,
            // Require manual ship-to entry for invoice
            shipToName: "",
            shipToAddress: "",
            shipToEmail: "",
            shipToPhone: "",
            companyName: prevData.deliveryChallan.companyName,
            companyAddress: prevData.deliveryChallan.companyAddress,
            companyEmail: prevData.deliveryChallan.companyEmail,
            companyPhone: prevData.deliveryChallan.companyPhone,
            companyLogo: prevData.deliveryChallan.companyLogo,
            companyDarkLogo: prevData.deliveryChallan.companyDarkLogo,
            companyIcon: prevData.deliveryChallan.companyIcon,
            companyFavicon: prevData.deliveryChallan.companyFavicon,
            items: prevData.deliveryChallan.items.map((item) => ({
              description: item.item_name,
              qty: item.deliveredQty,
              rate: item.rate,
              tax: item.tax,
              discount: item.discount,
              amount: item.rate * item.deliveredQty,
              warehouse: item.warehouse || "",
              warehouses: item.warehouses || [],
            })),
            terms: prevData.deliveryChallan.terms,
          },
        }));
        return "invoice";
      }
      if (prev === "invoice") {
        const totalInvoiceAmount = calculateTotalWithTaxAndDiscount(
          formData.invoice.items
        );
        setFormData((prevData) => ({
          ...prevData,
          payment: {
            ...prevData.payment,
            invoiceNo: prevData.invoice.invoiceNo,
            paymentDate: new Date().toISOString().split("T")[0],
            total_invoice: totalInvoiceAmount.toFixed(2),
              amount: "", // User needs to fill this
            customerName: prevData.invoice.customerName, // Map from INV
            customerAddress: prevData.invoice.customerAddress,
            customerEmail: prevData.invoice.customerEmail,
            customerPhone: prevData.invoice.customerPhone,
            companyName: prevData.invoice.companyName,
            companyAddress: prevData.invoice.companyAddress,
            companyEmail: prevData.invoice.companyEmail,
            companyPhone: prevData.invoice.companyPhone,
            companyLogo: prevData.invoice.companyLogo,
            companyDarkLogo: prevData.invoice.companyDarkLogo,
            companyIcon: prevData.invoice.companyIcon,
            companyFavicon: prevData.invoice.companyFavicon,
          },
        }));
        return "payment";
      }
      return "quotation";
    });
  };

  const handleNext = () => {
    setKey((prev) => {
      if (prev === "quotation") return "salesOrder";
      if (prev === "salesOrder") return "deliveryChallan";
      if (prev === "deliveryChallan") return "invoice";
      if (prev === "invoice") return "payment";
      return "quotation";
    });
  };

 const handleFinalSubmit = async () => {
  console.log("handleFinalSubmit: invoked", { key, currentSalesOrderId });
  if (submittingFinal) {
    console.log("handleFinalSubmit: already submitting, ignoring duplicate click");
    return;
  }
  setSubmittingFinal(true);
  try {
    // Calculate total invoice amount from invoice items
    const totalInvoiceAmount = calculateTotalWithTaxAndDiscount(formData.invoice.items);
    
    // Update payment form data with calculated total invoice and balance
    const amountReceived = parseFloat(formData.payment.amount_received) || 0;
    const balance = totalInvoiceAmount - amountReceived;
    
    setFormData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        total_invoice: totalInvoiceAmount.toFixed(2),
        balance: balance.toFixed(2)
      }
    }));
    
    // Resolve company id (try GetCompanyId, then props or initialData). Do not bail out —
    // proceed with the request even if company id is missing so the API still fires.
    let company_id = GetCompanyId();
    if (!company_id && companyDetails && companyDetails.id) company_id = companyDetails.id;
    if (!company_id && initialData) {
      company_id = initialData.company_id || (initialData.company_info && initialData.company_info.company_id);
    }
    if (!company_id) console.warn("handleFinalSubmit: company_id not found from GetCompanyId/companyDetails/initialData — proceeding without it");

    // Build payload (same structure as handleSaveDraft) and ensure company_id is included
    const endpoint = "sales-order/create-sales-order";
    const payload = {
      company_id: company_id,
      company_info: {
        company_id: company_id,
        company_name: formData[key].companyName,
        company_address: formData[key].companyAddress,
        company_email: formData[key].companyEmail,
        company_phone: formData[key].companyPhone,
        logo_url: formData[key].companyLogo,
        bank_name: formData.quotation.bankName,
        account_no: formData.quotation.accountNo,
        account_holder: formData.quotation.accountHolder,
        ifsc_code: formData.quotation.ifsc,
        terms: formData[key].terms,
      },
      shipping_details: {
        bill_to_name: formData[key].billToName || formData[key].customerName,
        bill_to_address: formData[key].billToAddress || formData[key].customerAddress,
        bill_to_email: formData[key].billToEmail || formData[key].customerEmail,
        bill_to_phone: formData[key].billToPhone || formData[key].customerPhone,
        bill_to_attention_name: formData.salesOrder.billToAttn || "",
        bill_to_company_name: formData.salesOrder.billToCompanyName || formData[key].billToName || formData[key].customerName,
        ship_to_name: formData[key].shipToName,
        ship_to_address: formData[key].shipToAddress,
        ship_to_email: formData[key].shipToEmail,
        ship_to_phone: formData[key].shipToPhone,
        ship_to_attention_name: formData.salesOrder.shipToAttn || "",
        ship_to_company_name: formData.salesOrder.shipToCompanyName || formData[key].shipToName,
      },
      items: (formData[key] && Array.isArray(formData[key].items) ? formData[key].items : (formData.invoice && Array.isArray(formData.invoice.items) ? formData.invoice.items : [])).map((item) => ({
        item_name: item.item_name || item.description,
        description: item.description,
        qty: item.qty,
        rate: item.rate,
        tax_percent: item.tax,
        discount: item.discount,
        amount: item.amount,
        uom: item.uom,
        hsn: item.hsn,
        sku: item.sku,
        barcode: item.barcode,
        warehouse_id: item.warehouse,
      })),
      steps: {
        quotation: {
          quotation_no: formData.quotation.quotationNo,
          manual_quo_no: formData.quotation.manualQuotationRef,
          quotation_date: formData.quotation.quotationDate,
          valid_till: formData.quotation.validDate,
          qoutation_to_customer_name: formData.quotation.billToName,
          qoutation_to_customer_address: formData.quotation.billToAddress,
          qoutation_to_customer_email: formData.quotation.billToEmail,
          qoutation_to_customer_phone: formData.quotation.billToPhone,
          notes: formData.quotation.notes,
          customer_ref: formData.quotation.customerReference,
        },
        sales_order: {
          SO_no: formData.salesOrder.salesOrderNo,
          manual_ref_no: formData.salesOrder.manualQuotationRef,
          order_date: formData.salesOrder.orderDate,
          customer_no: formData.salesOrder.customerNo,
        },
        delivery_challan: {
          challan_no: formData.deliveryChallan.challanNo,
          manual_challan_no: formData.deliveryChallan.manualChallanNo,
          challan_date: formData.deliveryChallan.challanDate,
          vehicle_no: formData.deliveryChallan.vehicleNo,
          driver_name: formData.deliveryChallan.driverName,
          driver_phone: formData.deliveryChallan.driverPhone,
        },
        invoice: {
          invoice_no: formData.invoice.invoiceNo,
          manual_invoice_no: formData.invoice.manualInvoiceNo,
          invoice_date: formData.invoice.invoiceDate,
          due_date: formData.invoice.dueDate,
          payment_status: formData.invoice.paymentStatus,
          payment_method: formData.invoice.paymentMethod,
          note: formData.invoice.note,
          customer_name: formData.invoice.customerName,
          customer_address: formData.invoice.customerAddress,
          customer_email: formData.invoice.customerEmail,
          customer_phone: formData.invoice.customerPhone,
        },
        payment: {
          payment_no: formData.payment.paymentNo,
          manual_payment_no: formData.payment.manualPaymentNo,
          payment_date: formData.payment.paymentDate,
          amount_received: amountReceived,
          total_invoice: totalInvoiceAmount,
          balance: balance,
          payment_method: formData.payment.paymentMethod,
          payment_status: formData.payment.paymentStatus,
          payment_note: formData.payment.note,
        },
      },
      additional_info: {
        files: (formData[key] && Array.isArray(formData[key].files) ? formData[key].files : []),
        signature_url: formData[key] ? formData[key].signature : "",
        photo_url: formData[key] ? formData[key].photo : "",
        attachment_url: (formData[key] && Array.isArray(formData[key].files) && formData[key].files.length > 0) ? formData[key].files[0].base64 : "",
      },
      current_step: key,
    };

    // Execute request(s) and log for debugging
    if (currentSalesOrderId) {
      console.log("handleFinalSubmit: calling PUT", `${endpoint}/${currentSalesOrderId}`, payload);
      const putResp = await axiosInstance.put(`${endpoint}/${currentSalesOrderId}`, payload);
      console.log("handleFinalSubmit: PUT response", putResp?.data || putResp);
    } else {
      console.log("handleFinalSubmit: no currentSalesOrderId, calling POST to create");
      const createResp = await axiosInstance.post(endpoint, payload);
      console.log("handleFinalSubmit: POST response", createResp?.data || createResp);
      const newId = createResp?.data?.data?.sales_order_id || createResp?.data?.data?.id;
      if (newId) {
        setCurrentSalesOrderId(newId);
        console.log("handleFinalSubmit: created id", newId, "calling PUT to update payment step");
        const putResp2 = await axiosInstance.put(`${endpoint}/${newId}`, payload);
        console.log("handleFinalSubmit: subsequent PUT response", putResp2?.data || putResp2);
      }
    }

    // Call the parent's onSubmit function with the complete form data
    if (typeof onSubmit === "function") onSubmit(formData, "payment");

    // Show success message
    alert("Sales process completed successfully!");

    // Redirect to sales workflow page
    navigate("/company/Invoice");
  } catch (err) {
    // Improved error logging to help debugging network/server errors
    try {
      console.error("Error submitting final form:", err?.response?.data || err?.message || err);
    } catch (e) {
      console.error("Error submitting final form (unable to parse error):", err);
    }
    alert("Error submitting final form. Please try again.");
  } finally {
    setSubmittingFinal(false);
  }
};

  // Navigate to a specific step in the workflow
  const navigateToStep = (step) => {
    setKey(step);
  };

  // File handlers
  const handleSignatureChange = (tab, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(tab, "signature", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoChange = (tab, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(tab, "photo", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (tab, e) => {
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
          handleChange(tab, "files", [...formData[tab].files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (tab, index) => {
    const updatedFiles = [...formData[tab].files];
    updatedFiles.splice(index, 1);
    handleChange(tab, "files", updatedFiles);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category) {
      alert("Product name and category are required!");
      return;
    }
    const itemToAdd = {
      item_name: newItem.name,
      qty: 1,
      rate: newItem.sellingPrice,
      tax: newItem.tax,
      discount: 0,
      hsn: newItem.hsn,
      uom: newItem.uom,
      warehouse: "",
    };
    const tab = key;
    setFormData((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [...prev[tab].items, itemToAdd],
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

  const handleAddService = () => {
    if (!serviceForm.name || !serviceForm.price) {
      alert("Service name and price are required!");
      return;
    }
    const serviceItem = {
      item_name: serviceForm.name,
      qty: 1,
      rate: serviceForm.price,
      tax: serviceForm.tax || 0,
      discount: 0,
      description: serviceForm.serviceDescription,
      warehouse: "",
    };
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        items: [...prev[key].items, serviceItem],
      },
    }));
    setServiceForm({
      name: "",
      serviceDescription: "",
      price: "",
      tax: "",
    });
    setShowServiceModal(false);
  };

  // --- Quotation Tab Specific Handlers ---
  // Filter customers based on search term
  useEffect(() => {
    const term = (customerSearchTerm || "").trim();
    if (!term) {
      setFilteredCustomerList(customerList);
      return;
    }
    const lower = term.toLowerCase();
    const digits = term.replace(/\D/g, "");
    const filtered = customerList.filter((customer) => {
      const nameMatch = (customer?.name_english || "")
        .toString()
        .toLowerCase()
        .includes(lower);
      const companyMatch = (customer?.company_name || "")
        .toString()
        .toLowerCase()
        .includes(lower);
      const emailMatch = (customer?.email || "")
        .toString()
        .toLowerCase()
        .includes(lower);
      const phoneFields = [
        customer?.phone,
        customer?.mobile,
        customer?.contact,
        customer?.phone_no,
        customer?.mobile_no,
      ];
      const phoneMatch = digits
        ? phoneFields.some(
            (p) => p && p.toString().replace(/\D/g, "").includes(digits)
          )
        : false;
      return !!(nameMatch || companyMatch || emailMatch || phoneMatch);
    });
    setFilteredCustomerList(filtered);
  }, [customerSearchTerm, customerList]);

  // Handle clicks outside the customer dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch customers for the logged-in company so search works by name/phone
  useEffect(() => {
    const company_id = GetCompanyId();
    if (!company_id) return;

    const fetchCustomers = async () => {
      try {
        const res = await axiosInstance.get(
          `vendorCustomer/company/${company_id}?type=customer`
        );
        const data = res?.data?.data || [];
        setCustomerList(data);
        setFilteredCustomerList(data);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch products for the company and keep local productList used by item search
  useEffect(() => {
    const company_id = GetCompanyId();
    if (!company_id) return;

    const fetchProducts = async () => {
      try {
        const res = await axiosInstance.get(`products/company/${company_id}`);
        const data = res?.data?.data || [];
        setProductList(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // fallback to availableItems prop if provided
        setProductList(availableItems || []);
      }
    };

    fetchProducts();
  }, []);

  // Keep productList in sync when parent passes availableItems prop
  useEffect(() => {
    if (availableItems && availableItems.length > 0)
      setProductList(availableItems);
  }, [availableItems]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    handleChange("quotation", "billToName", customer.name_english || "");
    handleChange("quotation", "billToAddress", customer.address || "");
    handleChange("quotation", "billToEmail", customer.email || "");
    handleChange("quotation", "billToPhone", customer.phone || "");
    handleChange("quotation", "customerId", customer.id);
    setCustomerSearchTerm(customer.name_english);
    setShowCustomerDropdown(false);
  };

  // --- Render Functions ---
  const renderItemsTable = (tab) => {
    const items = formData[tab]?.items || [];
    const handleItemChange = (index, field, value) => {
      const updatedItems = [...items];
      updatedItems[index][field] = value;
      // Recalculate amount if rate or qty changes
      if (field === "rate" || field === "qty") {
        const rate = parseFloat(updatedItems[index].rate) || 0;
        const qty = parseFloat(updatedItems[index].qty) || 0;
        updatedItems[index].amount = rate * qty;
      }
      setFormData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], items: updatedItems },
      }));
    };

    const addItem = () => {
      setFormData((prev) => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [
            ...items,
            {
              item_name: "",
              qty: "",
              rate: "",
              tax: 0,
              discount: 0,
              warehouse: "",
            },
          ],
        },
      }));
    };

    const removeItem = (idx) => {
      const updatedItems = items.filter((_, index) => index !== idx);
      setFormData((prev) => ({
        ...prev,
        [tab]: { ...prev[tab], items: updatedItems },
      }));
    };

    // Filter items based on search term for each row
    const getFilteredItems = (index) => {
      const searchTerm = (rowSearchTerms[`${tab}-${index}`] || "").trim();
      if (!searchTerm) return productList;
      const lower = searchTerm.toLowerCase();
      return productList.filter((item) => {
        const name = (item.name || item.item_name || "")
          .toString()
          .toLowerCase();
        const category = (
          item.category ||
          item.item_category?.item_category_name ||
          ""
        )
          .toString()
          .toLowerCase();
        const sku = (item.sku || item.SKU || "").toString().toLowerCase();
        const barcode = (item.barcode || "").toString().toLowerCase();
        const desc = (item.description || "").toString().toLowerCase();
        return (
          name.includes(lower) ||
          category.includes(lower) ||
          sku.includes(lower) ||
          barcode.includes(lower) ||
          desc.includes(lower)
        );
      });
    };

    // Get warehouses to display in the dropdown for a specific row
    const getWarehousesForDropdown = (item) => {
      if (item.item_name && item.warehouses && item.warehouses.length > 0) {
        return item.warehouses;
      }
      return warehouses.map((wh) => ({ ...wh, stock_qty: null }));
    };

    // Filter warehouses based on search term for each row
    const getFilteredWarehouses = (index) => {
      const item = items[index];
      const searchTerm = warehouseSearchTerms[`${tab}-${index}`] || "";
      const warehousesToFilter = getWarehousesForDropdown(item);
      if (!searchTerm) return warehousesToFilter;
      return warehousesToFilter.filter(
        (wh) =>
          wh.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (wh.location &&
            wh.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
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
                marginRight: "5px",
              }}
            >
              + Add Product
            </Button>
            <Button
              size="sm"
              onClick={() => setShowServiceModal(true)}
              style={{
                backgroundColor: "#53b2a5",
                border: "none",
                padding: "6px 12px",
                fontWeight: "500",
              }}
            >
              + Add Service
            </Button>
          </div>
        </div>

        {/* Add Product Modal */}
        <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Add Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={(e) =>
                    handleProductChange(e.target.name, e.target.value)
                  }
                  placeholder="Enter product name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <div className="d-flex">
                  <Form.Select
                    name="category"
                    value={newItem.category}
                    onChange={(e) =>
                      handleProductChange(e.target.name, e.target.value)
                    }
                    className="flex-grow-1 me-2"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowAddCategoryModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </Button>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>HSN Code</Form.Label>
                <Form.Control
                  type="text"
                  name="hsn"
                  value={newItem.hsn}
                  onChange={(e) =>
                    handleProductChange(e.target.name, e.target.value)
                  }
                  placeholder="Enter HSN code"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Selling Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="sellingPrice"
                  value={newItem.sellingPrice}
                  onChange={(e) =>
                    handleProductChange(e.target.name, e.target.value)
                  }
                  placeholder="Enter selling price"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tax %</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="tax"
                  value={newItem.tax}
                  onChange={(e) =>
                    handleProductChange(e.target.name, e.target.value)
                  }
                  placeholder="e.g. 18"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>UOM</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    name="uom"
                    value={newItem.uom}
                    onChange={(e) =>
                      handleProductChange(e.target.name, e.target.value)
                    }
                    placeholder="e.g. PCS"
                    className="flex-grow-1 me-2"
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowUOMModal(true)}
                  >
                    Add
                  </Button>
                </div>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }}
              onClick={handleAddItem}
            >
              Add Product
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Service Modal */}
        <Modal
          show={showServiceModal}
          onHide={() => setShowServiceModal(false)}
          centered
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>Add Service</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Service Name</Form.Label>
                <Form.Control
                  name="name"
                  value={serviceForm.name}
                  onChange={handleServiceInput}
                  required
                  className="shadow-sm"
                  placeholder="Enter service name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Service Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="serviceDescription"
                  value={serviceForm.serviceDescription}
                  onChange={handleServiceInput}
                  rows={3}
                  className="shadow-sm"
                  placeholder="Describe the service"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="price"
                  value={serviceForm.price}
                  onChange={handleServiceInput}
                  placeholder="Enter service price"
                  className="shadow-sm"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tax %</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="tax"
                  value={serviceForm.tax}
                  onChange={handleServiceInput}
                  className="shadow-sm"
                  placeholder="e.g. 18"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowServiceModal(false)}
            >
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5" }}
              onClick={handleAddService}
            >
              Add Service
            </Button>
          </Modal.Footer>
        </Modal>

    

        <Table bordered hover size="sm" className="dark-bordered-table">
          <thead className="bg-light">
            <tr>
              <th>Item Name</th>
              <th>Warehouse (Stock)</th>
              <th>Qty</th>
              {tab === "deliveryChallan" && <th>Delivered Qty</th>}
              <th>Rate</th>
              <th>Tax %</th>
              <th>Discount</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty =
                tab === "deliveryChallan"
                  ? parseInt(item.deliveredQty) || 0
                  : parseInt(item.qty) || 0;
              const amount = (parseFloat(item.rate) || 0) * qty;
              const itemRowKey = `${tab}-${idx}`;
              const filteredItems = getFilteredItems(idx);
              const isItemSearchVisible = showRowSearch[itemRowKey];
              const warehouseRowKey = `${tab}-${idx}`;
              const filteredWarehouses = getFilteredWarehouses(idx);
              const isWarehouseSearchVisible =
                showWarehouseSearch[warehouseRowKey];

              return (
                <tr key={idx}>
                  {/* Item Name Cell with Search */}
                  <td style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.item_name}
                        onChange={(e) => {
                          handleItemChange(idx, "item_name", e.target.value);
                          handleRowSearchChange(tab, idx, e.target.value);
                        }}
                        onFocus={() => toggleRowSearch(tab, idx)}
                        placeholder="Click to search products"
                        style={{ marginRight: "5px" }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => toggleRowSearch(tab, idx)}
                        title="Search Items"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    {isItemSearchVisible && (
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
                      >
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                          </InputGroup.Text>
                          <FormControl
                            placeholder="Search items..."
                            value={rowSearchTerms[itemRowKey] || ""}
                            onChange={(e) =>
                              handleRowSearchChange(tab, idx, e.target.value)
                            }
                            autoFocus
                          />
                        </InputGroup>
                        {loadingItems ? (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            Loading products...
                          </div>
                        ) : filteredItems.length > 0 ? (
                          <div
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                          >
                            {filteredItems.map((filteredItem) => (
                              <div
                                key={filteredItem.id}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                                onClick={() =>
                                  handleSelectSearchedItem(
                                    tab,
                                    idx,
                                    filteredItem
                                  )
                                }
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
                                  <strong>
                                    {filteredItem.name ||
                                      filteredItem.item_name}
                                  </strong>
                                </div>
                                <div
                                  style={{ fontSize: "0.8rem", color: "#666" }}
                                >
                                  {filteredItem.category ||
                                    filteredItem.item_category
                                      ?.item_category_name ||
                                    ""}{" "}
                                  - $                                   {filteredItem.price ||
                                  filteredItem.sale_price ||
                                  filteredItem.sellingPrice
                                    ? parseFloat(
                                        filteredItem.price ||
                                          filteredItem.sale_price ||
                                          filteredItem.sellingPrice
                                      ).toFixed(2)
                                    : "0.00"}
                                  {(filteredItem.sku || filteredItem.SKU) && (
                                    <span>
                                      {" "}
                                      | SKU:{" "}
                                      {filteredItem.sku || filteredItem.SKU}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            No items found
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  {/* Warehouse Cell with Search */}
                  <td style={{ position: "relative" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.warehouse || ""}
                        onChange={(e) =>
                          handleWarehouseSearchChange(tab, idx, e.target.value)
                        }
                        onFocus={() => toggleWarehouseSearch(tab, idx)}
                        placeholder="Click to search warehouses"
                        style={{ marginRight: "5px" }}
                        readOnly
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => toggleWarehouseSearch(tab, idx)}
                        title="Search Warehouses"
                      >
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    {isWarehouseSearchVisible && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          right: 0,
                          zIndex: 9,
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      >
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                          </InputGroup.Text>
                          <FormControl
                            placeholder="Search warehouses..."
                            value={warehouseSearchTerms[warehouseRowKey] || ""}
                            onChange={(e) =>
                              handleWarehouseSearchChange(
                                tab,
                                idx,
                                e.target.value
                              )
                            }
                            autoFocus
                          />
                        </InputGroup>
                        {loadingWarehouses ? (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            Loading warehouses...
                          </div>
                        ) : filteredWarehouses.length > 0 ? (
                          <div
                            style={{ maxHeight: "200px", overflowY: "auto" }}
                          >
                            {filteredWarehouses.map((wh) => (
                              <div
                                key={wh.warehouse_id || wh.warehouse_name}
                                style={{
                                  padding: "8px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                }}
                                onClick={() =>
                                  handleSelectSearchedWarehouse(tab, idx, wh)
                                }
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
                                  <strong>{wh.warehouse_name}</strong>
                                </div>
                                <div
                                  style={{ fontSize: "0.8rem", color: "#666" }}
                                >
                                  {wh.stock_qty !== null
                                    ? `Stock: ${wh.stock_qty}`
                                    : wh.location || "General Warehouse"}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px",
                              textAlign: "center",
                              color: "#666",
                            }}
                          >
                            No warehouses found
                          </div>
                        )}
                      </div>
                    )}
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
                  {tab === "deliveryChallan" && (
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.deliveredQty}
                        onChange={(e) =>
                          handleItemChange(idx, "deliveredQty", e.target.value)
                        }
                        placeholder="Delivered Qty"
                      />
                    </td>
                  )}
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
    );
  };

  const renderAttachmentFields = (tab) => {
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
                onChange={(e) => handleSignatureChange(tab, e)}
              />
              {formData[tab].signature && (
                <div className="mt-2">
                  <img
                    src={formData[tab].signature}
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
                onChange={(e) => handlePhotoChange(tab, e)}
              />
              {formData[tab].photo && (
                <div className="mt-2">
                  <img
                    src={formData[tab].photo}
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
              <Form.Control
                type="file"
                multiple
                onChange={(e) => handleFileChange(tab, e)}
              />
              {formData[tab].files && formData[tab].files.length > 0 && (
                <div className="mt-2">
                  <ul className="list-unstyled">
                    {formData[tab].files.map((file, index) => (
                      <li
                        key={index}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span>{file.name}</span>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(tab, index)}
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

  const formatCompanyAddress = () => {
    // Prefer populated formData for quotation (fetched company sets this), fallback to companyDetails prop
    if (formData?.quotation?.companyAddress)
      return formData.quotation.companyAddress;
    const parts = [
      companyDetails.address,
      companyDetails.city,
      companyDetails.state,
      companyDetails.postal_code,
      companyDetails.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // --- Tab Components Inline ---
  const renderQuotationTab = () => {
    return (
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
                overflow: "hidden",
              }}
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              {formData.quotation.companyLogo ? (
                <img
                  src={formData.quotation.companyLogo}
                  alt="Company Logo"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
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
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleChange("quotation", "companyLogo", e.target.files[0]);
                  }
                }}
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={
                  formData?.quotation?.companyName || companyDetails.name || ""
                }
                readOnly
                placeholder="Company Name"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                  fontWeight: "bold",
                }}
              />
              <Form.Control
                type="text"
                value={formatCompanyAddress()}
                onChange={(e) =>
                  handleChange("quotation", "companyAddress", e.target.value)
                }
                placeholder="Company Address, City, State, Pincode......."
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="email"
                value={
                  formData?.quotation?.companyEmail ||
                  companyDetails.email ||
                  ""
                }
                readOnly
                placeholder="Company Email"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.quotation.companyPhone}
                onChange={(e) =>
                  handleChange("quotation", "companyPhone", e.target.value)
                }
                placeholder="Phone No........"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </div>
          </Col>
          <Col
            md={3}
            className="d-flex flex-column align-items-end justify-content-center"
          >
            <h2 className="text-success mb-0">QUOTATION</h2>
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
        {/* Quotation & Customer Info */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={8}>
            <h5>Quotation To</h5>
            <Form.Group className="mb-2 position-relative">
              <div className="position-relative" ref={searchRef}>
                <Form.Control
                  type="text"
                  placeholder="Search Customer..."
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => {
                    setShowCustomerDropdown(true);
                    if (!customerSearchTerm) {
                      setFilteredCustomerList(customerList);
                    }
                  }}
                />
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowCustomerDropdown(!showCustomerDropdown);
                    if (!showCustomerDropdown && !customerSearchTerm) {
                      setFilteredCustomerList(customerList);
                    }
                  }}
                />
              </div>
              {showCustomerDropdown && filteredCustomerList.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm z-index-10"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {filteredCustomerList.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-2 hover:bg-light cursor-pointer"
                      onClick={() => handleCustomerSelect(customer)}
                    >
                      <div className="fw-bold">{customer.name_english}</div>
                      {customer.company_name && (
                        <div className="text-muted small">
                          {customer.company_name}
                        </div>
                      )}
                      <div className="text-muted small">{customer.email}</div>
                    </div>
                  ))}
                </div>
              )}
              {showCustomerDropdown && filteredCustomerList.length === 0 && (
                <div
                  ref={dropdownRef}
                  className="position-absolute w-100 bg-white border rounded mt-1 shadow-sm z-index-10 p-2 text-muted"
                >
                  No customers found
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Control
                type="text"
                value={formData.quotation.billToAddress}
                onChange={(e) =>
                  handleChange("quotation", "billToAddress", e.target.value)
                }
                placeholder="Customer Address"
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
                value={formData.quotation.billToEmail}
                onChange={(e) =>
                  handleChange("quotation", "billToEmail", e.target.value)
                }
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
                value={formData.quotation.billToPhone}
                onChange={(e) =>
                  handleChange("quotation", "billToPhone", e.target.value)
                }
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
            <div className="mt-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => navigate("/add-customer")} // Example navigation
                title="Add Customer"
              >
                Add Customer
              </Button>
            </div>
          </Col>
          <Col md={4} className="d-flex flex-column align-items-start">
            <div
              className="d-flex flex-column gap-2"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    Quotation No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quotation.quotationNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manual QUO No <span style={{color: "red"}}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.quotation.manualQuotationRef || ""}
                    onChange={(e) =>
                      handleChange(
                        "quotation",
                        "manualQuotationRef",
                        e.target.value
                      )
                    }
                    placeholder="e.g. QUO-CUST-001"
                    className="form-control-no-border text-end flex-grow-1"
                    isInvalid={!formData.quotation.manualQuotationRef?.trim()}
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0.375rem 0.75rem",
                      textAlign: "right",
                    }}
                  />
                </div>
                {validationAttempted && !formData.quotation.manualQuotationRef?.trim() && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "4px", display: "block" }}>
                    This field is required
                  </small>
                )}
              </Form.Group>
              <Row className="align-items-center g-2 mb-2">
                <Col md="auto" className="p-0">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Quotation Date
                  </Form.Label>
                </Col>
                <Col className="p-0">
                  <Form.Control
                    type="date"
                    value={formData.quotation.quotationDate}
                    onChange={(e) =>
                      handleChange("quotation", "quotationDate", e.target.value)
                    }
                    style={{ border: "1px solid #495057", fontSize: "1rem" }}
                  />
                </Col>
              </Row>
              <Row className="align-items-center g-2 mb-2">
                <Col md="auto" className="p-0">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Valid Till
                  </Form.Label>
                </Col>
                <Col className="p-0">
                  <Form.Control
                    type="date"
                    value={formData.quotation.validDate}
                    onChange={(e) =>
                      handleChange("quotation", "validDate", e.target.value)
                    }
                    style={{ border: "1px solid #495057", fontSize: "1rem" }}
                  />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        {/* Items Table */}
        <Row className="mb-4">
          <Col>{renderItemsTable("quotation")}</Col>
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
        {/* Totals */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>
                    ${calculateTotalAmount(formData.quotation.items).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Tax:</td>
                  <td>
                    $                     {formData.quotation.items
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
                    $                     {formData.quotation.items
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
                    $                     {calculateTotalWithTaxAndDiscount(
                      formData.quotation.items
                    ).toFixed(2)}
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
            {["bankName", "accountNo", "accountHolder", "ifsc"].map((field) => (
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
                  value={formData.quotation[field] || ""}
                  onChange={(e) =>
                    handleChange("quotation", field, e.target.value)
                  }
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                  }}
                />
              </Form.Group>
            ))}
          </Col>
          <Col md={6}>
            <h5>Notes</h5>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Enter any additional notes"
              value={formData.quotation.notes || ""}
              onChange={(e) =>
                handleChange("quotation", "notes", e.target.value)
              }
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
                value={formData.quotation.terms}
                onChange={(e) =>
                  handleChange("quotation", "terms", e.target.value)
                }
                placeholder="e.g. Payment within 15 days"
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Attachment Fields */}
        {renderAttachmentFields("quotation")}
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
          <Button variant="secondary" onClick={handleSkip}>
            Skip
          </Button>
          <Button variant="warning" onClick={handleSaveDraft}>
            Save
          </Button>
          <Button variant="primary" onClick={handleSaveNext}>
            Save & Next
          </Button>
          <Button variant="success" onClick={handleNext}>
            Next
          </Button>
        </div>
      </Form>
    );
  };

  const renderSalesOrderTab = () => {
    return (
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 d-flex justify-content-between">
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
                overflow: "hidden",
              }}
              onClick={() => document.getElementById("logo-upload-so")?.click()}
            >
              {formData.salesOrder.companyLogo ? (
                <img
                  src={formData.salesOrder.companyLogo}
                  alt="Company Logo"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
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
                id="logo-upload-so"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files[0])
                    handleChange(
                      "salesOrder",
                      "companyLogo",
                      e.target.files[0]
                    );
                }}
              />
            </div>
          </Col>
          <Col
            md={3}
            className="d-flex flex-column align-items-end justify-content-center"
          >
            <h2 className="text-success mb-0">SALES ORDER FORM</h2>
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
        <Row className="mb-4 mt-3">
          <Col md={6}>
            <div className="d-flex flex-column align-items-end justify-content-center gap-1">
              <Form.Control
                type="text"
                value={formData.salesOrder.companyName}
                onChange={(e) =>
                  handleChange("salesOrder", "companyName", e.target.value)
                }
                placeholder="Your Company Name"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.salesOrder.companyAddress}
                onChange={(e) =>
                  handleChange("salesOrder", "companyAddress", e.target.value)
                }
                placeholder="Company Address, City, State, Pincode"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="email"
                value={formData.salesOrder.companyEmail}
                onChange={(e) =>
                  handleChange("salesOrder", "companyEmail", e.target.value)
                }
                placeholder="Company Email"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.salesOrder.companyPhone}
                onChange={(e) =>
                  handleChange("salesOrder", "companyPhone", e.target.value)
                }
                placeholder="Phone No."
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div
              className="d-flex flex-column gap-2 text-end"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              {/* Sales Order No (Auto or Manual) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    SO No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.salesOrder.salesOrderNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              {/* Quotation No (Auto from Quotation) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    Quotation No
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.salesOrder.quotationNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              {/* Manual Sales No (Required) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manual Sales No <span style={{color: "red"}}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.salesOrder.manualQuotationRef || ""}
                    onChange={(e) =>
                      handleChange(
                        "salesOrder",
                        "manualQuotationRef",
                        e.target.value
                      )
                    }
                    placeholder="e.g. CUST-QTN-001"
                    className="form-control-no-border text-end flex-grow-1"
                    isInvalid={!formData.salesOrder.manualQuotationRef?.trim()}
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0.375rem 0.75rem",
                      textAlign: "right",
                    }}
                  />
                </div>
                {validationAttempted && !formData.salesOrder.manualQuotationRef?.trim() && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "4px", display: "block" }}>
                    This field is required
                  </small>
                )}
              </Form.Group>
              {/* Customer No */}
              <Form.Group>
                <Form.Control
                  type="text"
                  value={formData.salesOrder.customerNo}
                  onChange={(e) =>
                    handleChange("salesOrder", "customerNo", e.target.value)
                  }
                  placeholder="Customer No."
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
            </div>
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
        {/* Bill To and Ship To Sections */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6} className="d-flex flex-column align-items-start">
            <h5>BILL TO</h5>
            <Form.Group className="mb-2 w-100">
              <Form.Label>ATN: Name / Dept</Form.Label>
              <Form.Control
                type="text"
                value={formData.salesOrder.billToAttn}
                onChange={(e) =>
                  handleChange("salesOrder", "billToAttn", e.target.value)
                }
                placeholder="Attention Name / Department"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Form.Control
                  type="text"
                  value={formData.salesOrder.billToCompanyName}
                  onChange={(e) =>
                    handleChange(
                      "salesOrder",
                      "billToCompanyName",
                      e.target.value
                    )
                  }
                  placeholder="Company Name"
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    marginRight: "5px",
                  }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.salesOrder.billToAddress}
                onChange={(e) =>
                  handleChange("salesOrder", "billToAddress", e.target.value)
                }
                placeholder="Company Address"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.salesOrder.billToPhone}
                onChange={(e) =>
                  handleChange("salesOrder", "billToPhone", e.target.value)
                }
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
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="email"
                value={formData.salesOrder.billToEmail}
                onChange={(e) =>
                  handleChange("salesOrder", "billToEmail", e.target.value)
                }
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
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <h5>SHIP TO</h5>
            <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
              <Form.Group className="mb-2">
                <Form.Label>ATN: Name / Dept</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.salesOrder.shipToAttn}
                  onChange={(e) =>
                    handleChange("salesOrder", "shipToAttn", e.target.value)
                  }
                  placeholder="Attention Name / Department"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.salesOrder.shipToCompanyName}
                  onChange={(e) =>
                    handleChange(
                      "salesOrder",
                      "shipToCompanyName",
                      e.target.value
                    )
                  }
                  placeholder="Company Name"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.salesOrder.shipToAddress}
                  onChange={(e) =>
                    handleChange("salesOrder", "shipToAddress", e.target.value)
                  }
                  placeholder="Company Address"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.salesOrder.shipToPhone}
                  onChange={(e) =>
                    handleChange("salesOrder", "shipToPhone", e.target.value)
                  }
                  placeholder="Phone"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  value={formData.salesOrder.shipToEmail}
                  onChange={(e) =>
                    handleChange("salesOrder", "shipToEmail", e.target.value)
                  }
                  placeholder="Email"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
            </div>
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
        {/* Items Table */}
        <div className="mt-4">{renderItemsTable("salesOrder")}</div>
        {/* Totals - Moved to left side */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>
                    $
                    {calculateTotalAmount(formData.salesOrder.items).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">
                    $
                    {calculateTotalAmount(formData.salesOrder.items).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        {/* Terms & Conditions */}
        <Form.Group className="mt-4">
          <Form.Label>Terms & Conditions</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={formData.salesOrder.terms}
            onChange={(e) =>
              handleChange("salesOrder", "terms", e.target.value)
            }
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        {/* Attachment Fields */}
        {renderAttachmentFields("salesOrder")}
        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={handleSkip}>
            Skip
          </Button>
          <Button variant="warning" onClick={handleSaveDraft}>
            Save
          </Button>
          <Button variant="primary" onClick={handleSaveNext}>
            Save & Next
          </Button>
          <Button variant="success" onClick={handleNext}>
            Next
          </Button>
        </div>
      </Form>
    );
  };

  const renderDeliveryChallanTab = () => {
    return (
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 d-flex justify-content-between">
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
                overflow: "hidden",
              }}
              onClick={() => document.getElementById("logo-upload-dc")?.click()}
            >
              {formData.deliveryChallan.companyLogo ? (
                <img
                  src={formData.deliveryChallan.companyLogo}
                  alt="Company Logo"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
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
                id="logo-upload-dc"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files[0])
                    handleChange(
                      "deliveryChallan",
                      "companyLogo",
                      e.target.files[0]
                    );
                }}
              />
            </div>
          </Col>
          <Col
            md={3}
            className="d-flex flex-column align-items-end justify-content-center"
          >
            <h2 className="text-success mb-0">DELIVERY CHALLAN</h2>
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
        <Row className="mb-4 mt-3">
          <Col md={6}>
            <div className="d-flex flex-column align-items-end justify-content-center gap-1">
              <Form.Control
                type="text"
                value={formData.deliveryChallan.companyName}
                onChange={(e) =>
                  handleChange("deliveryChallan", "companyName", e.target.value)
                }
                placeholder="Your Company Name"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.deliveryChallan.companyAddress}
                onChange={(e) =>
                  handleChange(
                    "deliveryChallan",
                    "companyAddress",
                    e.target.value
                  )
                }
                placeholder="Company Address, City, State, Pincode"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="email"
                value={formData.deliveryChallan.companyEmail}
                onChange={(e) =>
                  handleChange(
                    "deliveryChallan",
                    "companyEmail",
                    e.target.value
                  )
                }
                placeholder="Company Email"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.deliveryChallan.companyPhone}
                onChange={(e) =>
                  handleChange(
                    "deliveryChallan",
                    "companyPhone",
                    e.target.value
                  )
                }
                placeholder="Phone No."
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div
              className="d-flex flex-column gap-2 text-end"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              {/* Challan No (Auto or Manual) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    Challan No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.deliveryChallan.challanNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              {/* Manual Challan No (Required) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manual DC No <span style={{color: "red"}}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.deliveryChallan.manualChallanNo || ""}
                    onChange={(e) =>
                      handleChange(
                        "deliveryChallan",
                        "manualChallanNo",
                        e.target.value
                      )
                    }
                    placeholder="e.g. DC-CUST-001"
                    className="form-control-no-border text-end flex-grow-1"
                    isInvalid={!formData.deliveryChallan.manualChallanNo?.trim()}
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0.375rem 0.75rem",
                      textAlign: "right",
                    }}
                  />
                </div>
                {validationAttempted && !formData.deliveryChallan.manualChallanNo?.trim() && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "4px", display: "block" }}>
                    This field is required
                  </small>
                )}
              </Form.Group>
              {/* Sales Order No (Auto) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    SO No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.deliveryChallan.salesOrderNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              {/* Manual Sales Order No (Optional) */}
              {/* <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manual SO No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.deliveryChallan.manualSalesOrderRef || ""}
                    onChange={(e) =>
                      handleChange(
                        "deliveryChallan",
                        "manualSalesOrderRef",
                        e.target.value
                      )
                    }
                    placeholder="e.g. SO-CUST-001"
                    className="form-control-no-border text-end flex-grow-1"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0.375rem 0.75rem",
                      textAlign: "right",
                    }}
                  />
                </div>
              </Form.Group> */}
              {/* Vehicle No */}
              <Form.Group>
                <Form.Control
                  type="text"
                  value={formData.deliveryChallan.vehicleNo}
                  onChange={(e) =>
                    handleChange("deliveryChallan", "vehicleNo", e.target.value)
                  }
                  placeholder="Vehicle No."
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
            </div>
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
        {/* Bill To and Ship To Sections */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6} className="d-flex flex-column align-items-start">
            <h5>BILL TO</h5>
            <Form.Group className="mb-2 w-100">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Form.Control
                  type="text"
                  value={formData.deliveryChallan.billToName}
                  onChange={(e) =>
                    handleChange(
                      "deliveryChallan",
                      "billToName",
                      e.target.value
                    )
                  }
                  placeholder="Attention Name / Department"
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    marginRight: "5px",
                  }}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.deliveryChallan.billToAddress}
                onChange={(e) =>
                  handleChange(
                    "deliveryChallan",
                    "billToAddress",
                    e.target.value
                  )
                }
                placeholder="Company Address"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.deliveryChallan.billToPhone}
                onChange={(e) =>
                  handleChange("deliveryChallan", "billToPhone", e.target.value)
                }
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
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="email"
                value={formData.deliveryChallan.billToEmail}
                onChange={(e) =>
                  handleChange("deliveryChallan", "billToEmail", e.target.value)
                }
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
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <h5>SHIP TO</h5>
            <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
              <Form.Group className="mb-2">
                <Form.Label>ATN: Name / Dept</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.deliveryChallan.shipToName}
                  onChange={(e) =>
                    handleChange(
                      "deliveryChallan",
                      "shipToName",
                      e.target.value
                    )
                  }
                  placeholder="Attention Name / Department"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.deliveryChallan.shipToAddress}
                  onChange={(e) =>
                    handleChange(
                      "deliveryChallan",
                      "shipToAddress",
                      e.target.value
                    )
                  }
                  placeholder="Company Address"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.deliveryChallan.shipToPhone}
                  onChange={(e) =>
                    handleChange(
                      "deliveryChallan",
                      "shipToPhone",
                      e.target.value
                    )
                  }
                  placeholder="Phone"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  value={formData.deliveryChallan.shipToEmail}
                  onChange={(e) =>
                    handleChange(
                      "deliveryChallan",
                      "shipToEmail",
                      e.target.value
                    )
                  }
                  placeholder="Email"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
            </div>
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
        {/* Driver Details */}
        <Row className="mb-4">
          <Col md={6}>
            <h5>Driver Details</h5>
            <Form.Group className="mb-2">
              <Form.Label>Driver Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.deliveryChallan.driverName}
                onChange={(e) =>
                  handleChange("deliveryChallan", "driverName", e.target.value)
                }
                placeholder="Driver Name"
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Driver Phone</Form.Label>
              <Form.Control
                type="text"
                value={formData.deliveryChallan.driverPhone}
                onChange={(e) =>
                  handleChange("deliveryChallan", "driverPhone", e.target.value)
                }
                placeholder="Driver Phone"
                style={{ border: "1px solid #343a40" }}
              />
            </Form.Group>
          </Col>
        </Row>
        {/* Items Table */}
        <div className="mt-4">{renderItemsTable("deliveryChallan")}</div>
        {/* Totals - Moved to left side */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>
                    $
                    {calculateTotalAmount(
                      formData.deliveryChallan.items
                    ).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Total:</td>
                  <td className="fw-bold">
                    $
                    {calculateTotalAmount(
                      formData.deliveryChallan.items
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        {/* Terms & Conditions */}
        <Form.Group className="mt-4">
          <Form.Label>Terms & Conditions</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={formData.deliveryChallan.terms}
            onChange={(e) =>
              handleChange("deliveryChallan", "terms", e.target.value)
            }
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        {/* Attachment Fields */}
        {renderAttachmentFields("deliveryChallan")}
        {/* Thank You Section */}
        <Row className="text-center mt-5 mb-4 pt-3 border-top">
          <Col>
            <p>
              <strong>Thank you for your business!</strong>
            </p>
            <p className="text-muted">www.yourcompany.com</p>
          </Col>
        </Row>
        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <Button variant="secondary" onClick={handleSkip}>
            Skip
          </Button>
          <Button variant="warning" onClick={handleSaveDraft}>
            Save
          </Button>
          <Button variant="primary" onClick={handleSaveNext}>
            Save & Next
          </Button>
          <Button variant="success" onClick={handleNext}>
            Next
          </Button>
        </div>
      </Form>
    );
  };

  const renderInvoiceTab = () => {
    return (
      <Form>
        {/* Header: Logo + Company Info + Title */}
        <Row className="mb-4 d-flex justify-content-between align-items-center">
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
                overflow: "hidden",
              }}
              onClick={() =>
                document.getElementById("logo-upload-invoice")?.click()
              }
            >
              {formData.invoice.companyLogo ? (
                <img
                  src={formData.invoice.companyLogo}
                  alt="Company Logo"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
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
                id="logo-upload-invoice"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files[0])
                    handleChange("invoice", "companyLogo", e.target.files[0]);
                }}
              />
            </div>
          </Col>
          <Col
            md={3}
            className="d-flex flex-column align-items-end justify-content-center"
          >
            <h2 className="text-success mb-0">INVOICE</h2>
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
        <Row className="mb-4 mt-3">
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={formData.invoice.companyName}
                onChange={(e) =>
                  handleChange("invoice", "companyName", e.target.value)
                }
                placeholder="Your Company Name"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.invoice.companyAddress}
                onChange={(e) =>
                  handleChange("invoice", "companyAddress", e.target.value)
                }
                placeholder="Company Address, City, State, Pincode"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="email"
                value={formData.invoice.companyEmail}
                onChange={(e) =>
                  handleChange("invoice", "companyEmail", e.target.value)
                }
                placeholder="Company Email"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.invoice.companyPhone}
                onChange={(e) =>
                  handleChange("invoice", "companyPhone", e.target.value)
                }
                placeholder="Phone No."
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div
              className="d-flex flex-column gap-2 text-end"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              {/* Invoice No (Auto or Manual) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    Invoice No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.invoice.invoiceNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              {/* Manual Invoice No (Required) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manual Invoice No <span style={{color: "red"}}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.invoice.manualInvoiceNo || ""}
                    onChange={(e) =>
                      handleChange("invoice", "manualInvoiceNo", e.target.value)
                    }
                    placeholder="e.g. INV-CUST-001"
                    className="form-control-no-border text-end flex-grow-1"
                    isInvalid={!formData.invoice.manualInvoiceNo?.trim()}
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0.375rem 0.75rem",
                      textAlign: "right",
                    }}
                  />
                </div>
                {validationAttempted && !formData.invoice.manualInvoiceNo?.trim() && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "4px", display: "block" }}>
                    This field is required
                  </small>
                )}
              </Form.Group>
              {/* Challan No (Auto from DC) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    Challan No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.invoice.challanNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              {/* Manual Challan No (Optional) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  {/* <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manual Challan No (Optional)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.invoice.manualChallanNo || ""}
                    onChange={(e) =>
                      handleChange("invoice", "manualChallanNo", e.target.value)
                    }
                    placeholder="e.g. DC-CUST-001"
                    className="form-control-no-border text-end flex-grow-1"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0.375rem 0.75rem",
                      textAlign: "right",
                    }}
                  /> */}
                </div>
              </Form.Group>
              {/* Due Date */}
              <Form.Group>
                <Form.Label
                  className="mb-0"
                  style={{ fontSize: "0.9rem", color: "#6c757d" }}
                >
                  Due Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData.invoice.dueDate}
                  onChange={(e) =>
                    handleChange("invoice", "dueDate", e.target.value)
                  }
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
            </div>
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
        {/* Bill To & Customer Info */}
        <Row className="mb-4 d-flex justify-content-between">
          <Col md={6} className="d-flex flex-column align-items-start">
            <h5>BILL TO</h5>
            <Form.Group className="mb-2 w-100">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Form.Control
                  type="text"
                  value={formData.invoice.customerName}
                  onChange={(e) =>
                    handleChange("invoice", "customerName", e.target.value)
                  }
                  placeholder="Customer Name"
                  className="form-control-no-border"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    marginRight: "5px",
                  }}
                />
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => navigate("/add-customer")} // Example navigation
                  title="Add Customer"
                >
                  Add Customer
                </Button>
              </div>
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.invoice.customerAddress}
                onChange={(e) =>
                  handleChange("invoice", "customerAddress", e.target.value)
                }
                placeholder="Customer Address"
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </Form.Group>
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="email"
                value={formData.invoice.customerEmail}
                onChange={(e) =>
                  handleChange("invoice", "customerEmail", e.target.value)
                }
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
            <Form.Group className="mb-2 w-100">
              <Form.Control
                type="text"
                value={formData.invoice.customerPhone}
                onChange={(e) =>
                  handleChange("invoice", "customerPhone", e.target.value)
                }
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
          <Col md={6} className="d-flex flex-column align-items-end">

            <h5>SHIP TO</h5>

            <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.invoice.shipToName || ""}
                  onChange={(e) =>
                    handleChange("invoice", "shipToName", e.target.value)
                  }
                  placeholder="Name"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.invoice.shipToAddress || ""}
                  onChange={(e) =>
                    handleChange("invoice", "shipToAddress", e.target.value)
                  }
                  placeholder="Address"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="email"
                  value={formData.invoice.shipToEmail || ""}
                  onChange={(e) =>
                    handleChange("invoice", "shipToEmail", e.target.value)
                  }
                  placeholder="Email"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Control
                  type="text"
                  value={formData.invoice.shipToPhone || ""}
                  onChange={(e) =>
                    handleChange("invoice", "shipToPhone", e.target.value)
                  }
                  placeholder="Phone"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
            </div>
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
        {/* Items Table */}
        <div className="mt-4">{renderItemsTable("invoice")}</div>
        {/* Totals - Moved to left side */}
        <Row className="mb-4 mt-2">
          <Col md={4}>
            <Table bordered size="sm" className="dark-bordered-table">
              <tbody>
                <tr>
                  <td className="fw-bold">Sub Total:</td>
                  <td>
                    ${calculateTotalAmount(formData.invoice.items).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="fw-bold">Total Due:</td>
                  <td className="fw-bold">
                    ${calculateTotalAmount(formData.invoice.items).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>
        {/* Terms & Conditions */}
        <Form.Group className="mt-4">
          <Form.Label>Terms & Conditions</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.invoice.terms}
            onChange={(e) => handleChange("invoice", "terms", e.target.value)}
            placeholder="e.g. Payment within 15 days. Late fees may apply."
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        {/* Attachment Fields */}
        {renderAttachmentFields("invoice")}
        {/* Footer Note */}
        <Row className="text-center mt-5 mb-4 pt-3">
          <Col>
            <Form.Control
              type="text"
              value={formData.invoice.footerNote}
              onChange={(e) =>
                handleChange("invoice", "footerNote", e.target.value)
              }
              className="text-center mb-2 fw-bold"
              placeholder=" Thank you for your business!"
            />
          </Col>
        </Row>
        {/* Navigation */}
        <div className="d-flex justify-content-between mt-4 border-top pt-3">
          <Button variant="secondary" onClick={handleSkip}>
            Skip
          </Button>
          <Button variant="warning" onClick={handleSaveDraft}>
            Save
          </Button>
          <Button variant="primary" onClick={handleSaveNext}>
            Save & Next
          </Button>
          <Button variant="success" onClick={handleNext}>
            Next
          </Button>
        </div>
      </Form>
    );
  };

  const renderPaymentTab = () => {
    return (
      <Form>
        {/* Header: Logo + Title */}
        <Row className="mb-4 d-flex justify-content-between align-items-center">
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
                overflow: "hidden",
              }}
              onClick={() =>
                document.getElementById("logo-upload-payment")?.click()
              }
            >
              {formData.payment.companyLogo ? (
                <img
                  src={formData.payment.companyLogo}
                  alt="Company Logo"
                  style={{
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
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
                id="logo-upload-payment"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files[0])
                    handleChange("payment", "companyLogo", e.target.files[0]);
                }}
              />
            </div>
          </Col>
          <Col
            md={3}
            className="d-flex flex-column align-items-end justify-content-center"
          >
            <h2 className="text-success mb-0">PAYMENT RECEIPT</h2>
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
        <Row className="mb-4 mt-3">
          <Col md={6}>
            <div className="d-flex flex-column gap-1">
              <Form.Control
                type="text"
                value={formData.payment.companyName}
                onChange={(e) =>
                  handleChange("payment", "companyName", e.target.value)
                }
                placeholder=" Enter Your Company Name. . . . ."
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.payment.companyAddress}
                onChange={(e) =>
                  handleChange("payment", "companyAddress", e.target.value)
                }
                placeholder="Company Address, City, State, Pincode  . . . "
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="email"
                value={formData.payment.companyEmail}
                onChange={(e) =>
                  handleChange("payment", "companyEmail", e.target.value)
                }
                placeholder="Company Email. . . ."
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
              <Form.Control
                type="text"
                value={formData.payment.companyPhone}
                onChange={(e) =>
                  handleChange("payment", "companyPhone", e.target.value)
                }
                placeholder="Phone No....."
                className="form-control-no-border"
                style={{
                  fontSize: "1rem",
                  lineHeight: "1.5",
                  minHeight: "auto",
                  padding: "0",
                }}
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column align-items-end">
            <div
              className="d-flex flex-column gap-2 text-end"
              style={{ maxWidth: "400px", width: "100%" }}
            >
              {/* Payment No (Auto) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    Payment No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.payment.paymentNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              {/* Manual Payment No (Required) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0 flex-shrink-0 me-2"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manual Payment No <span style={{color: "red"}}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.payment.manualPaymentNo || ""}
                    onChange={(e) =>
                      handleChange("payment", "manualPaymentNo", e.target.value)
                    }
                    placeholder="e.g. PAY-CUST-001"
                    className="form-control-no-border text-end flex-grow-1"
                    isInvalid={!formData.payment.manualPaymentNo?.trim()}
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0.375rem 0.75rem",
                      textAlign: "right",
                    }}
                  />
                </div>
                {validationAttempted && !formData.payment.manualPaymentNo?.trim() && (
                  <small style={{ color: "#dc3545", fontSize: "0.875rem", marginTop: "4px", display: "block" }}>
                    This field is required
                  </small>
                )}
              </Form.Group>
              {/* Invoice No (Auto) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Label
                    className="mb-0"
                    style={{
                      fontSize: "0.9rem",
                      color: "#6c757d",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      marginRight: "8px",
                    }}
                  >
                    Invoice No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.payment.invoiceNo}
                    readOnly
                    className="form-control-no-border text-end"
                    style={{
                      fontSize: "1rem",
                      lineHeight: "1.5",
                      minHeight: "auto",
                      padding: "0",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#495057",
                      cursor: "not-allowed",
                      textAlign: "right",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </Form.Group>
              {/* Manual Invoice No (Optional) */}
              <Form.Group className="mb-0">
                <div className="d-flex justify-content-between align-items-center">
               
                </div>
              </Form.Group>
              {/* Payment Method */}
              <Form.Group>
                <Form.Control
                  type="text"
                  value={formData.payment.paymentMethod}
                  onChange={(e) =>
                    handleChange("payment", "paymentMethod", e.target.value)
                  }
                  placeholder="Payment Method"
                  className="form-control-no-border text-end"
                  style={{
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    minHeight: "auto",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </Form.Group>
            </div>
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
   <Row className="mb-4 d-flex justify-content-between">
  <Col md={6} className="d-flex flex-column align-items-start">
    <h5>RECEIVED FROM</h5>
    <Form.Control
      type="text"
      value={formData.payment.customerName || ""}
      onChange={(e) =>
        handleChange("payment", "customerName", e.target.value)
      }
      placeholder="Enter Customer Name. . . . ."
      className="form-control-no-border"
      style={{
        fontSize: "1rem",
        lineHeight: "1.5",
        minHeight: "auto",
        padding: "0",
      }}
    />
    <Form.Group className="mb-1 w-100">
      <Form.Control
        rows={2}
        value={formData.payment.customerAddress || ""}
        onChange={(e) =>
          handleChange("payment", "customerAddress", e.target.value)
        }
        placeholder="Customer Address. . . .  ."
        className="form-control-no-border"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
        }}
      />
    </Form.Group>
    <Form.Group className="mb-2 w-100">
      <Form.Control
        type="email"
        value={formData.payment.customerEmail || ""}
        onChange={(e) =>
          handleChange("payment", "customerEmail", e.target.value)
        }
        placeholder="Email. . . . . "
        className="form-control-no-border"
        style={{
          fontSize: "1rem",
          lineHeight: "1.5",
          minHeight: "auto",
          padding: "0",
        }}
      />
    </Form.Group>
    <Form.Group className="mb-2 w-100">
      <Form.Control
        type="text"
        value={formData.payment.customerPhone || ""}
        onChange={(e) =>
          handleChange("payment", "customerPhone", e.target.value)
        }
        placeholder="Phone. . . . . ."
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
  <Col md={6} className="d-flex flex-column align-items-end">
    <h5>PAYMENT DETAILS</h5>
    <div className="w-100 text-end" style={{ maxWidth: "400px" }}>
      <Form.Group className="mb-2">
        <Form.Label>Amount Received</Form.Label>
        <Form.Control
          type="number"
          step="0.01"
          // CHANGED: 'amount' ki jagah 'amount_received' use kiya
          value={formData.payment.amount_received || ""}
          onChange={(e) =>
            // CHANGED: 'amount' ki jagah 'amount_received' update kiya
            handleChange("payment", "amount_received", e.target.value)
          }
          placeholder="Amount"
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            textAlign: "right",
          }}
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Total Invoice</Form.Label>
        <Form.Control
          type="number"
          step="0.01"
          // CHANGED: 'totalAmount' ki jagah 'total_invoice' use kiya
          value={(
            parseFloat(formData.payment.total_invoice) ||
            calculateTotalAmount(formData.invoice.items)
          ).toFixed(2)}
          readOnly
          className="form-control-no-border text-end"
          style={{ textAlign: "right" }}
        />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Payment Status</Form.Label>
        <Form.Control
          type="text"
          value={formData.payment.paymentStatus}
          onChange={(e) =>
            handleChange("payment", "paymentStatus", e.target.value)
          }
          placeholder="Payment Status"
          className="form-control-no-border text-end"
          style={{
            fontSize: "1rem",
            lineHeight: "1.5",
            minHeight: "auto",
            padding: "0",
            textAlign: "right",
          }}
        />
      </Form.Group>

      <Form.Group>
        {/* CHANGED: Balance ab directly state se aa raha hai */}
        <tr style={{ backgroundColor: "#f8f9fa" }}>
          <td className="fw-bold">Balance:</td>
          <td className="fw-bold ">${formData.payment.balance || "0.00"}</td>
        </tr>
      </Form.Group>
    </div>
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
<Row className="mb-4 mt-2">
  <Col md={4}>
    <Table bordered size="sm" className="dark-bordered-table">
      <tbody>
        <tr>
          <td className="fw-bold">Total Invoice:</td>
          {/* CHANGED: 'totalAmount' ki jagah 'total_invoice' use kiya */}
          <td>
            $             {(
              parseFloat(formData.payment.total_invoice) ||
              calculateTotalWithTaxAndDiscount(formData.invoice.items)
            ).toFixed(2)}
          </td>
        </tr>
        <tr className="fw-bold">
          <td>Amount Received:</td>
          {/* CHANGED: 'amount' ki jagah 'amount_received' use kiya */}
          <td>
            ${(parseFloat(formData.payment.amount_received) || 0).toFixed(2)}
          </td>
        </tr>
        <tr style={{ backgroundColor: "#f8f9fa" }}>
          <td className="fw-bold">Balance:</td>
          {/* CHANGED: Balance ab directly state se aa raha hai */}
          <td className="fw-bold text-danger">
            ${formData.payment.balance || "0.00"}
          </td>
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
            value={formData.payment.note}
            onChange={(e) => handleChange("payment", "note", e.target.value)}
            placeholder="e.g. Payment received via UPI / Cash"
            style={{ border: "1px solid #343a40" }}
          />
        </Form.Group>
        {/* Attachment Fields */}
        {renderAttachmentFields("payment")}
        <Row className="text-center mt-5 mb-4 pt-3 border-top">
          <Col>
            <Form.Control
              type="text"
              value={formData.payment.footerNote}
              onChange={(e) =>
                handleChange("payment", "footerNote", e.target.value)
              }
              className="text-center mb-2 fw-bold"
              placeholder="Thank you for your payment!"
            />
          </Col>
        </Row>
        <div className="d-flex justify-content-between mt-4 border-top pt-3">
          <Button variant="secondary" onClick={handleSkip}>
            Skip
          </Button>
          <Button variant="warning" onClick={handleSaveDraft}>
            Save
          </Button>
          <Button variant="primary" onClick={handleFinalSubmit}>
            Submit
          </Button>
        </div>
      </Form>
    );
  };

  const renderPDFView = () => {
    const currentTab = formData[key];
    const hasItems =
      tabsWithItems.includes(key) && Array.isArray(currentTab.items);
    const titleMap = {
      quotation: "QUOTATION",
      salesOrder: "SALES ORDER",
      deliveryChallan: "DELIVERY CHALLAN",
      invoice: "INVOICE",
      payment: "PAYMENT RECEIPT",
    };

    return (
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "white",
        }}
      >
        {/* Header: Logo + Title */}
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
              textAlign: "center",
            }}
          >
            {currentTab.companyLogo ? (
              <img
                src={currentTab.companyLogo}
                alt="Logo"
                style={{ maxWidth: "100%", maxHeight: "100px" }}
              />
            ) : (
              "Logo"
            )}
          </div>
          <div style={{ textAlign: "center", color: "#28a745" }}>
            <h2>{titleMap[key]}</h2>
          </div>
        </div>
        <hr style={{ border: "2px solid #28a745", margin: "15px 0" }} />
        {/* Company Info */}
        <div style={{ marginBottom: "15px" }}>
          <h4>{currentTab.companyName}</h4>
          <p>{currentTab.companyAddress}</p>
          <p>
            Email: {currentTab.companyEmail} | Phone: {currentTab.companyPhone}
          </p>
        </div>
        {/* Customer Info */}
        {(currentTab.billToName || currentTab.customerName) && (
          <div style={{ marginBottom: "15px" }}>
            <h5>{key === "invoice" ? "BILL TO" : "CUSTOMER"}</h5>
            <p>{currentTab.billToName || currentTab.customerName}</p>
            <p>{currentTab.billToAddress || currentTab.customerAddress}</p>
            <p>
              Email: {currentTab.billToEmail || currentTab.customerEmail} |
              Phone: {currentTab.billToPhone || currentTab.customerPhone}
            </p>
          </div>
        )}
        {/* Ship To */}
        {(currentTab.shipToName || currentTab.shipToAddress) && (
          <div style={{ marginBottom: "15px" }}>
            <h5>SHIP TO</h5>
            <p>{currentTab.shipToName}</p>
            <p>{currentTab.shipToAddress}</p>
            <p>
              Email: {currentTab.shipToEmail} | Phone: {currentTab.shipToPhone}
            </p>
          </div>
        )}
        {/* Driver & Vehicle (Delivery Challan) */}
        {key === "deliveryChallan" && (
          <div style={{ marginBottom: "15px" }}>
            <h5>DRIVER DETAILS</h5>
            <p>
              {currentTab.driverName} | {currentTab.driverPhone}
            </p>
            <p>
              <strong>Vehicle No.:</strong> {currentTab.vehicleNo}
            </p>
          </div>
        )}
        {/* Document Numbers */}
        <div style={{ marginBottom: "15px" }}>
          <strong>Ref ID:</strong> {currentTab.referenceId} |
          {key === "quotation" && (
            <>
              <strong>Quotation No.:</strong> {currentTab.quotationNo} |{" "}
            </>
          )}
          {key === "salesOrder" && (
            <>
              <strong>SO No.:</strong> {currentTab.salesOrderNo} |{" "}
            </>
          )}
          {key === "deliveryChallan" && (
            <>
              <strong>Challan No.:</strong> {currentTab.challanNo} |{" "}
            </>
          )}
          {key === "invoice" && (
            <>
              <strong>Invoice No.:</strong> {currentTab.invoiceNo} |{" "}
            </>
          )}
          {key === "payment" && (
            <>
              <strong>Payment No.:</strong> {currentTab.paymentNo} |{" "}
            </>
          )}
          <strong>Date:</strong>{" "}
          {currentTab[`${key}Date`] ||
            currentTab.date ||
            new Date().toISOString().split("T")[0]}
          {key === "quotation" && currentTab.validDate && (
            <>
              {" "}
              | <strong>Valid Till:</strong> {currentTab.validDate}
            </>
          )}
          {key === "invoice" && currentTab.dueDate && (
            <>
              {" "}
              | <strong>Due Date:</strong> {currentTab.dueDate}
            </>
          )}
        </div>
        {/* Items Table */}
        {hasItems && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "20px",
            }}
          >
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Item Name
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Qty
                </th>
                {key === "deliveryChallan" && (
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "8px",
                      textAlign: "left",
                    }}
                  >
                    Delivered Qty
                  </th>
                )}
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Tax %
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Discount
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "8px",
                    textAlign: "left",
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {currentTab.items.map((item, idx) => {
                const qty =
                  key === "deliveryChallan"
                    ? parseInt(item.deliveredQty) || 0
                    : parseInt(item.qty) || 0;
                const rate = parseFloat(item.rate) || 0;
                const tax = parseFloat(item.tax) || 0;
                const discount = parseFloat(item.discount) || 0;
                const subtotal = rate * qty;
                const taxAmount = (subtotal * tax) / 100;
                const amount = subtotal + taxAmount - discount;
                return (
                  <tr key={idx}>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {item.item_name || item.description}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {item.qty}
                    </td>
                    {key === "deliveryChallan" && (
                      <td style={{ border: "1px solid #000", padding: "8px" }}>
                        {item.deliveredQty}
                      </td>
                    )}
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      ${rate.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      {tax}%
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      ${discount.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                      ${amount.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #000", padding: "8px" }}>
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
            <tfoot>
              <tr>
                <td
                  colSpan={key === "deliveryChallan" ? 6 : 5}
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
                  ${" "}
                  {calculateTotalWithTaxAndDiscount(currentTab.items).toFixed(
                    2
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
        {/* Payment Details (Payment Tab) */}
        {key === "payment" && (
          <div style={{ marginBottom: "15px" }}>
            <h5>PAYMENT DETAILS</h5>
            <p>
              <strong>Amount Paid:</strong> ${" "}
              {parseFloat(currentTab.amount || 0).toFixed(2)}
            </p>
            <p>
              <strong>Payment Method:</strong> {currentTab.paymentMethod}
            </p>
            <p>
              <strong>Status:</strong> {currentTab.paymentStatus}
            </p>
          </div>
        )}
        {/* Terms & Conditions */}
        {currentTab.terms && (
          <div style={{ marginBottom: "15px" }}>
            <h5>TERMS & CONDITIONS</h5>
            <p>{currentTab.terms}</p>
          </div>
        )}
        {/* Attachments */}
        <div style={{ marginBottom: "15px" }}>
          {currentTab.signature && (
            <div style={{ marginBottom: "10px" }}>
              <strong>SIGNATURE</strong>
              <br />
              <img
                src={currentTab.signature}
                alt="Signature"
                style={{
                  maxWidth: "150px",
                  maxHeight: "80px",
                  marginTop: "5px",
                }}
              />
            </div>
          )}
          {currentTab.photo && (
            <div style={{ marginBottom: "10px" }}>
              <strong>PHOTO</strong>
              <br />
              <img
                src={currentTab.photo}
                alt="Photo"
                style={{
                  maxWidth: "150px",
                  maxHeight: "150px",
                  objectFit: "cover",
                  marginTop: "5px",
                }}
              />
            </div>
          )}
          {currentTab.files && currentTab.files.length > 0 && (
            <div>
              <strong>FILES</strong>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "5px" }}>
                {currentTab.files.map((file, i) => (
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
          style={{
            textAlign: "center",
            fontWeight: "bold",
            marginTop: "30px",
            fontSize: "1.1em",
          }}
        >
          {currentTab.footerNote || "Thank you for your business!"}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="container-fluid mt-4 px-2" ref={formRef}>
        <h4 className="text-center mb-4">Sales Process</h4>

    
        <Tabs activeKey={key} onSelect={setKey}  className="mb-4 custom-tabs" fill>
          <Tab eventKey="quotation" title="Quotation">
            {renderQuotationTab()}
          </Tab>
          <Tab eventKey="salesOrder" title="Sales Order">
            {renderSalesOrderTab()}
          </Tab>
          <Tab eventKey="deliveryChallan" title="Delivery Challan">
            {renderDeliveryChallanTab()}
          </Tab>
          <Tab eventKey="invoice" title="Invoice">
            {renderInvoiceTab()}
          </Tab>
          <Tab eventKey="payment" title="Payment">
            {renderPaymentTab()}
          </Tab>
        </Tabs>
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
      </div>
    </>
  );
};
export default MultiStepSalesForm;
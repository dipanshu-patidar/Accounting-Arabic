import React, { useState, useRef, useEffect } from 'react';
import { Tabs, Tab, Form, Button, Table, Row, Col, Modal, InputGroup, FormControl, Dropdown } from 'react-bootstrap';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import "../Sales/MultiStepSalesForm/MultiStepSalesForm.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faEye, faEdit, faPlus, faSearch, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import AddProductModal from '../Inventory/AddProductModal';


import BillPage from './BillPage';
import GoodsReceiptPage from './GoodsReceiptPage';
import PaymentPage from './PaymentPage';
import PurchaseOrderPage from './PurchaseOrderPage';
import PurchaseQuotationPage from './PurchaseQuotationPage';
const MultiStepPurchaseForm = ({ onSubmit, initialData, initialStep }) => {
  const [key, setKey] = useState(initialStep || 'purchaseQuotation');
  const tabsWithItems = ['purchaseQuotation', 'purchaseOrder', 'goodsReceipt', 'bill'];
  const navigate = useNavigate();
  const formRef = useRef();
  const pdfRef = useRef();
  
  // --- Form Data State ---
  const [formData, setFormData] = useState(() => ({
    purchaseQuotation: {
      companyName: "",
      referenceId: '',
      companyAddress: "",
      companyEmail: "",
      companyPhone: "",
      quotationNo: "",
      quotationDate: "",
      validDate: "",
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      items: [
        { name: '', qty: '', rate: '', tax: 0, discount: 0 } 
      ],
      bankName: "",
      accountNo: "",
      accountHolder: "",
      ifsc: "",
      notes: "",
      terms: "",
      signature: '',
      photo: '',
      files: []
    },
    purchaseOrder: {
      referenceId: '',
      quotationNo: '',
      orderNo: '',
      orderDate: '',
      deliveryDate: '',
      vendorName: '',
      vendorAddress: '',
      vendorEmail: '',
      vendorPhone: '',
      items: [
        { name: '', qty: '', rate: '', tax: 0, discount: 0 } 
      ],
      terms: '',
      signature: '',
      photo: '',
      files: []
    },
    goodsReceipt: {
      referenceId: '',
      purchaseOrderNo: '',
      receiptNo: '',
      receiptDate: '',
      vehicleNo: '',
      driverName: '',
      driverPhone: '',
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      vendorName: "",
      vendorAddress: "",
      vendorEmail: "",
      vendorPhone: "",
      shipToName: '',
      shipToAddress: '',
      shipToEmail: '',
      shipToPhone: '',
      items: [
        { name: '', qty: '', receivedQty: '', rate: '', tax: 0, discount: 0 }
      ],
      terms: '',
      signature: '',
      photo: '',
      files: []
    },
    bill: {
      orderNo: '',
      billNo: '',
      billDate: '',
      dueDate: '',
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      companyPhone: '',
      vendorName: '',
      vendorAddress: '',
      vendorEmail: '',
      vendorPhone: '',
      items: [{ description: '', rate: '', qty: '', tax: '', discount: '', amount: '' }],
      paymentStatus: '',
      paymentMethod: '',
      note: '',
      terms: '',
      signature: '',
      photo: '',
      files: []
    },
    payment: {
      billNo: '',
      referenceId: '',
      paymentDate: '',
      amount: '',
      paymentMethod: '',
      paymentStatus: '',
      note: '',
      vendorName: '',
      vendorAddress: '',
      vendorEmail: '',
      vendorPhone: '',
      companyName: '',
      companyAddress: '',
      companyEmail: '',
      payment:'',
      companyPhone: '',
      totalAmount: '',
      footerNote: '',
      signature: '',
      photo: '',
      files: []
    },
  }));
  
  // Available items for search
  const [availableItems, setAvailableItems] = useState([
    { id: 1, name: "Laptop", category: "Electronics", price: 50000, tax: 18, hsn: "8471", uom: "PCS" },
    { id: 2, name: "Office Chair", category: "Furniture", price: 5000, tax: 12, hsn: "9401", uom: "PCS" },
    { id: 3, name: "T-Shirt", category: "Apparel", price: 500, tax: 5, hsn: "6109", uom: "PCS" },
    { id: 4, name: "Coffee Table", category: "Furniture", price: 8000, tax: 12, hsn: "9403", uom: "PCS" },
    { id: 5, name: "Smartphone", category: "Electronics", price: 20000, tax: 18, hsn: "8517", uom: "PCS" },
    { id: 6, name: "Notebook", category: "Stationery", price: 100, tax: 5, hsn: "4820", uom: "PCS" },
    { id: 7, name: "Water Bottle", category: "Other", price: 200, tax: 5, hsn: "3924", uom: "PCS" },
    { id: 8, name: "Desk Lamp", category: "Furniture", price: 1500, tax: 12, hsn: "9405", uom: "PCS" },
  ]);
  const [showUOMModal, setShowUOMModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
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
  // Search state for each row
  const [rowSearchTerms, setRowSearchTerms] = useState({});
  const [showRowSearch, setShowRowSearch] = useState({});
    // --- ButtonBar Component ---
const ButtonBar = ({ handleSaveNext, handleSkip, handleSaveDraft, handleFinalSubmit }) => {
  return (
    <div className="d-flex flex-wrap justify-content-center gap-2 mt-4 mb-3">
      <Button
        variant="primary"
        onClick={handleSaveNext}
        style={{ minWidth: "140px" }}
      >
        Save & Next
      </Button>
      <Button
        variant="secondary"
        onClick={handleSkip}
        style={{ minWidth: "110px" }}
      >
        Skip
      </Button>
      <Button
        variant="info"
        onClick={handleSaveDraft}
        style={{ minWidth: "120px" }}
      >
        Save
      </Button>
      <Button
        variant="success"
        onClick={handleFinalSubmit}
        style={{ minWidth: "140px" }}
      >
        Save & Close
      </Button>
    </div>
  );
};
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
      uom: newItem.uom
    };
    
    const tab = key;
    setFormData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [...prev[tab].items, itemToAdd]
      }
    }));
    
    setNewItem({
      name: '',
      category: '',
      hsn: '',
      tax: 0,
      sellingPrice: 0,
      uom: 'PCS'
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
      setCategories(prev => [...prev, newCategory]);
      setNewItem(prev => ({ ...prev, category: newCategory }));
      setNewCategory('');
    }
    setShowAddCategoryModal(false);
  };
  
  const [savedRecords, setSavedRecords] = useState([]);
  const [currentRecordId, setCurrentRecordId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    hsn: '',
    tax: 0,
    sellingPrice: 0,
    uom: 'PCS'
  });
  useEffect(() => {
    const tab = key;
    const updates = {};
  
    // Sync common fields across tabs
    const commonFields = [
      'companyName',
      'companyAddress',
      'companyEmail',
      'companyPhone',
      'vendorName',
      'vendorAddress',
      'vendorEmail',
      'vendorPhone'
    ];
  
    commonFields.forEach(field => {
      if (formData[tab][field]) {
        // Update in all other tabs
        tabsWithItems.forEach(t => {
          if (t !== tab && formData[t][field] !== formData[tab][field]) {
            updates[t] = { ...formData[t], [field]: formData[tab][field] };
          }
        });
      }
    });
  
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [formData.purchaseQuotation.companyName, formData.purchaseQuotation.vendorName, /* add others */ key]);
  const generateReferenceId = (type) => {
    const prefix = type === 'quotation' ? "PUR-QRF" : 
                   type === 'order' ? "PUR-ORD" : 
                   type === 'receipt' ? "PUR-GRN" : 
                   type === 'bill' ? "PUR-BILL" : "PUR-PAY";
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${rand}`;
  };
  
  useEffect(() => {
    if (!formData.purchaseQuotation.referenceId) {
      handleChange("purchaseQuotation", "referenceId", generateReferenceId('quotation'));
    }
    if (!formData.purchaseOrder.referenceId) {
      handleChange("purchaseOrder", "referenceId", generateReferenceId('order'));
    }
    if (!formData.goodsReceipt.referenceId) {
      handleChange("goodsReceipt", "referenceId", generateReferenceId('receipt'));
    }
    if (!formData.bill.referenceId) {
      handleChange("bill", "referenceId", generateReferenceId('bill'));
    }
    if (!formData.payment.referenceId) {
      handleChange("payment", "referenceId", generateReferenceId('payment'));
    }
  }, [formData.purchaseQuotation.referenceId, formData.purchaseOrder.referenceId, 
      formData.goodsReceipt.referenceId, formData.bill.referenceId, formData.payment.referenceId]);
  
  // --- Handlers ---
  const handleChange = (tab, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };
  
  const handleItemChange = (tab, index, field, value) => {
    const updatedItems = [...formData[tab].items];
    updatedItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };
  
  const handleProductChange = (field, value) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };
  
  const addItem = (tab) => {
    setFormData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        items: [
          ...prev[tab].items,
          { name: '', qty: '', rate: '', tax: 0, discount: 0 }
        ],
      },
    }));
  };
  
  const removeItem = (tab, index) => {
    const updatedItems = [...formData[tab].items];
    updatedItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems },
    }));
  };
  
  const handleRowSearchChange = (tab, index, value) => {
    setRowSearchTerms(prev => ({
      ...prev,
      [`${tab}-${index}`]: value
    }));
  };
  
  const handleSelectSearchedItem = (tab, index, item) => {
    const updatedItems = [...formData[tab].items];
    updatedItems[index] = {
      ...updatedItems[index],
      name: item.name,
      rate: item.price,
      tax: item.tax,
      hsn: item.hsn,
      uom: item.uom
    };
    
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], items: updatedItems }
    }));
    
    // Hide search for this row
    setShowRowSearch(prev => ({
      ...prev,
      [`${tab}-${index}`]: false
    }));
    
    // Clear search term
    setRowSearchTerms(prev => ({
      ...prev,
      [`${tab}-${index}`]: ''
    }));
  };
  
  const toggleRowSearch = (tab, index) => {
    const rowKey = `${tab}-${index}`;
    setShowRowSearch(prev => ({
      ...prev,
      [rowKey]: !prev[rowKey]
    }));
  };
  
  const calculateTotalAmount = (items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const rate = parseFloat(item.rate) || 0;
      const qty = parseInt(item.qty) || 0;
      return total + (rate * qty);
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
  
  // --- Top Buttons ---
  const handlePrint = (lang) => {
    const printContent = pdfRef.current;
    if (!printContent) {
      alert("No content to print!");
      return;
    }
  
    // Create a new window for printing
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<style>body { margin: 20px; font-family: Arial, sans-serif; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.outerHTML); // Full rendered HTML
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  
    // Wait for images to load
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Optionally close after print
      // printWindow.close();
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
        filename: `${key}-${formData[key].quotationNo || formData[key].billNo || 'document'}.pdf`,
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
        html2canvas: { scale: 3 },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .save();
  };
  
  useEffect(() => {
    const saved = localStorage.getItem('purchaseFormRecords');
    if (saved) setSavedRecords(JSON.parse(saved));
  }, []);
  
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(formData.purchaseQuotation.items);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Quotation');
    XLSX.writeFile(workbook, `purchase-quotation-${formData.purchaseQuotation.quotationNo || 'draft'}.xlsx`);
  };
  
  // --- Navigation Buttons ---
  const handleSkip = () => {
    setKey(prev => {
      if (prev === 'purchaseQuotation') return 'purchaseOrder';
      if (prev === 'purchaseOrder') return 'goodsReceipt';
      if (prev === 'goodsReceipt') return 'bill';
      if (prev === 'bill') return 'payment';
      return 'purchaseQuotation';
    });
  };
  
  const handleSaveDraft = () => {
    // This ensures current tab data is saved
    console.log("Draft saved for tab:", key);
    // If you want to save to localStorage:
    localStorage.setItem('purchaseFormData', JSON.stringify(formData));
  };
  
  const handleSaveNext = () => {
    // 1. Save current tab data
    handleSaveDraft();
  
    // 2. Sync data and move to next tab
    setKey(prevKey => {
      let nextKey = prevKey;
  
      if (prevKey === 'purchaseQuotation' && formData.purchaseQuotation.quotationNo) {
        // Sync to Purchase Order
        setFormData(prevData => ({
          ...prevData,
          purchaseOrder: {
            ...prevData.purchaseOrder,
            quotationNo: prevData.purchaseQuotation.quotationNo,
            orderDate: prevData.purchaseQuotation.quotationDate || new Date().toISOString().split('T')[0],
            vendorName: prevData.purchaseQuotation.vendorName,
            vendorAddress: prevData.purchaseQuotation.vendorAddress,
            vendorEmail: prevData.purchaseQuotation.vendorEmail,
            vendorPhone: prevData.purchaseQuotation.vendorPhone,
            companyName: prevData.purchaseQuotation.companyName,
            companyAddress: prevData.purchaseQuotation.companyAddress,
            companyEmail: prevData.purchaseQuotation.companyEmail,
            companyPhone: prevData.purchaseQuotation.companyPhone,
            items: prevData.purchaseQuotation.items.map(item => ({
              name: item.name,
              qty: item.qty,
              rate: item.rate,
              tax: item.tax,
              discount: item.discount,
            })),
          },
        }));
        nextKey = 'purchaseOrder';
      }
  
      else if (prevKey === 'purchaseOrder' && formData.purchaseOrder.orderNo) {
        setFormData(prevData => ({
          ...prevData,
          goodsReceipt: {
            ...prevData.goodsReceipt,
            purchaseOrderNo: prevData.purchaseOrder.orderNo,
            receiptDate: new Date().toISOString().split('T')[0],
            vendorName: prevData.purchaseOrder.vendorName,
            vendorAddress: prevData.purchaseOrder.vendorAddress,
            vendorEmail: prevData.purchaseOrder.vendorEmail,
            vendorPhone: prevData.purchaseOrder.vendorPhone,
            companyName: prevData.purchaseOrder.companyName,
            companyAddress: prevData.purchaseOrder.companyAddress,
            companyEmail: prevData.purchaseOrder.companyEmail,
            companyPhone: prevData.purchaseOrder.companyPhone,
            items: prevData.purchaseOrder.items.map(item => ({
              name: item.name,
              qty: item.qty,
              receivedQty: item.qty,
              rate: item.rate,
              tax: item.tax,
              discount: item.discount,
            })),
          },
        }));
        nextKey = 'goodsReceipt';
      }
  
      else if (prevKey === 'goodsReceipt' && formData.goodsReceipt.receiptNo) {
        setFormData(prevData => ({
          ...prevData,
          bill: {
            ...prevData.bill,
            orderNo: prevData.purchaseOrder.orderNo,
            billNo: `BILL-${Date.now().toString().slice(-6)}`,
            billDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            vendorName: prevData.goodsReceipt.vendorName,
            vendorAddress: prevData.goodsReceipt.vendorAddress,
            vendorEmail: prevData.goodsReceipt.vendorEmail,
            vendorPhone: prevData.goodsReceipt.vendorPhone,
            companyName: prevData.goodsReceipt.companyName,
            companyAddress: prevData.goodsReceipt.companyAddress,
            companyEmail: prevData.goodsReceipt.companyEmail,
            companyPhone: prevData.goodsReceipt.companyPhone,
            items: prevData.goodsReceipt.items.map(item => ({
              description: item.name,
              qty: item.receivedQty,
              rate: item.rate,
              tax: 0,
              discount: 0,
              amount: item.rate * item.receivedQty,
            })),
          },
        }));
        nextKey = 'bill';
      }
  
      else if (prevKey === 'bill' && formData.bill.billNo) {
        setFormData(prevData => ({
          ...prevData,
          payment: {
            ...prevData.payment,
            billNo: prevData.bill.billNo,
            paymentDate: new Date().toISOString().split('T')[0],
            totalAmount: calculateTotalAmount(prevData.bill.items).toFixed(2),
            amount: '',
            vendorName: prevData.bill.vendorName,
            vendorAddress: prevData.bill.vendorAddress,
            vendorEmail: prevData.bill.vendorEmail,
            vendorPhone: prevData.bill.vendorPhone,
            companyName: prevData.bill.companyName,
            companyAddress: prevData.bill.companyAddress,
            companyEmail: prevData.bill.companyEmail,
            companyPhone: prevData.bill.companyPhone,
          },
        }));
        nextKey = 'payment';
      }
  
      return nextKey;
    });
  };
  
  const handleNext = () => {
    setKey(prev => {
      if (prev === 'purchaseQuotation') return 'purchaseOrder';
      if (prev === 'purchaseOrder') return 'goodsReceipt';
      if (prev === 'goodsReceipt') return 'bill';
      if (prev === 'bill') return 'payment';
      return 'purchaseQuotation';
    });
  };
  // --- Pending Records Table ---
const renderPendingTable = () => {
  return (
    <div className="mt-5">
      <h5>Pending Actions</h5>
      <Table striped bordered hover size="sm">
        <thead className="bg-light">
          <tr>
            <th>Type</th>
            <th>Ref No.</th>
            <th>Vendor</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {/* Pending Quotations */}
          {formData.purchaseQuotation.quotationNo && !formData.purchaseOrder.orderNo && (
            <tr>
              <td>Purchase Quotation</td>
              <td>{formData.purchaseQuotation.referenceId}</td>
              <td>{formData.purchaseQuotation.vendorName}</td>
              <td>{formData.purchaseQuotation.quotationDate}</td>
              <td className="text-warning">Pending Order</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => setKey('purchaseOrder')}>
                  Create Order
                </Button>
              </td>
            </tr>
          )}

          {/* Pending Orders */}
          {formData.purchaseOrder.orderNo && !formData.goodsReceipt.receiptNo && (
            <tr>
              <td>Purchase Order</td>
              <td>{formData.purchaseOrder.referenceId}</td>
              <td>{formData.purchaseOrder.vendorName}</td>
              <td>{formData.purchaseOrder.orderDate}</td>
              <td className="text-warning">Pending Receipt</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => setKey('goodsReceipt')}>
                  Receive Goods
                </Button>
              </td>
            </tr>
          )}

          {/* Pending Receipts */}
          {formData.goodsReceipt.receiptNo && !formData.bill.billNo && (
            <tr>
              <td>Goods Receipt</td>
              <td>{formData.goodsReceipt.referenceId}</td>
              <td>{formData.goodsReceipt.vendorName}</td>
              <td>{formData.goodsReceipt.receiptDate}</td>
              <td className="text-warning">Pending Bill</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => setKey('bill')}>
                  Create Bill
                </Button>
              </td>
            </tr>
          )}

          {/* Pending Bills */}
          {formData.bill.billNo && !formData.payment.paymentStatus && (
            <tr>
              <td>Purchase Bill</td>
              <td>{formData.bill.referenceId}</td>
              <td>{formData.bill.vendorName}</td>
              <td>{formData.bill.billDate}</td>
              <td className="text-danger">Pending Payment</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => setKey('payment')}>
                  Make Payment
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};
  const handleFinalSubmit = () => {
    const newRecord = {
      id: currentRecordId || Date.now(),
      data: formData,
      createdAt: new Date().toLocaleString(),
    };
  
    if (currentRecordId) {
      setSavedRecords(prev => {
        const updated = prev.map(r => r.id === currentRecordId ? newRecord : r);
        localStorage.setItem('purchaseFormRecords', JSON.stringify(updated));
        return updated;
      });
    } else {
      const updatedRecords = [...savedRecords, newRecord];
      setSavedRecords(updatedRecords);
      localStorage.setItem('purchaseFormRecords', JSON.stringify(updatedRecords));
    }
  
    setCurrentRecordId(null);
    alert("Purchase form submitted!");
  };
  
  const handleEditRecord = (id) => {
    const record = savedRecords.find(r => r.id === id);
    if (record) {
      setFormData(record.data);
      setCurrentRecordId(id);
  
      if (record.data.payment?.billNo) {
        setKey('payment');
      } else if (record.data.bill?.billNo) {
        setKey('bill');
      } else if (record.data.goodsReceipt?.receiptNo) {
        setKey('goodsReceipt');
      } else if (record.data.purchaseOrder?.orderNo) {
        setKey('purchaseOrder');
      } else {
        setKey('purchaseQuotation');
      }
    }
  };
  
  const handleDeleteRecord = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setSavedRecords(prev => prev.filter(r => r.id !== id));
      if (currentRecordId === id) {
        setCurrentRecordId(null);
      }
    }
  };
  
  // File handlers
  const handleSignatureChange = (tab, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(tab, 'signature', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePhotoChange = (tab, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(tab, 'photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFileChange = (tab, e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: reader.result
        });
        
        if (newFiles.length === files.length) {
          handleChange(tab, 'files', [...formData[tab].files, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeFile = (tab, index) => {
    const updatedFiles = [...formData[tab].files];
    updatedFiles.splice(index, 1);
    handleChange(tab, 'files', updatedFiles);
  };
  
  const renderItemsTable = (tab) => {
    const items = formData[tab]?.items || [];
  
    const handleItemChange = (index, field, value) => {
      const updatedItems = [...items];
      updatedItems[index][field] = value;
      setFormData(prev => ({
        ...prev,
        [tab]: { ...prev[tab], items: updatedItems }
      }));
    };
  
    const addItem = () => {
      setFormData(prev => ({
        ...prev,
        [tab]: {
          ...prev[tab],
          items: [...items, { name: '', qty: '', rate: '', tax: 0, discount: 0 }]
        }
      }));
    };
  
    const removeItem = (idx) => {
      const updatedItems = items.filter((_, index) => index !== idx);
      setFormData(prev => ({
        ...prev,
        [tab]: { ...prev[tab], items: updatedItems }
      }));
    };
  
    // Filter items based on search term for each row
    const getFilteredItems = (index) => {
      const searchTerm = rowSearchTerms[`${tab}-${index}`] || '';
      if (!searchTerm) return [];
      
      return availableItems.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };

    return (
      <div>
        <div className="d-flex justify-content-between mb-2">
          <div>
            <Button
              size="sm"
              onClick={addItem}
              style={{ backgroundColor: "#53b2a5", border: "none", padding: "6px 12px", fontWeight: "500", marginRight: "5px" }}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Row
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAdd(true)}
              style={{ backgroundColor: "#53b2a5", border: "none", padding: "6px 12px", fontWeight: "500" }}
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
        />
        
        <Table bordered hover size="sm" className="dark-bordered-table">
          <thead className="bg-light">
            <tr>
              <th>Item Name</th>
              <th>Qty</th>
              {tab === 'goodsReceipt' && <th>Received Qty</th>}
              <th>Rate</th>
              <th>Tax %</th>
              <th>Discount</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = tab === 'goodsReceipt' ? (parseInt(item.receivedQty) || 0) : (parseInt(item.qty) || 0);
              const amount = (parseFloat(item.rate) || 0) * qty;
              const rowKey = `${tab}-${idx}`;
              const filteredItems = getFilteredItems(idx);
              const isSearchVisible = showRowSearch[rowKey];
              
              return (
                <tr key={idx}>
                  <td style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="Item Name"
                        style={{ marginRight: '5px' }}
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
                    {isSearchVisible && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                        <InputGroup size="sm">
                          <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                          </InputGroup.Text>
                          <FormControl
                            placeholder="Search items..."
                            value={rowSearchTerms[rowKey] || ''}
                            onChange={(e) => handleRowSearchChange(tab, idx, e.target.value)}
                            autoFocus
                          />
                        </InputGroup>
                        {filteredItems.length > 0 ? (
                          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {filteredItems.map(filteredItem => (
                              <div 
                                key={filteredItem.id}
                                style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                onClick={() => handleSelectSearchedItem(tab, idx, filteredItem)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                <div><strong>{filteredItem.name}</strong></div>
                                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                  {filteredItem.category} - ${filteredItem.price.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ padding: '8px', textAlign: 'center', color: '#666' }}>
                            No items found
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
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                      placeholder="Qty"
                    />
                  </td>
                  {tab === 'goodsReceipt' && (
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={item.receivedQty}
                        onChange={(e) => handleItemChange(idx, 'receivedQty', e.target.value)}
                        placeholder="Received Qty"
                      />
                    </td>
                  )}
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      placeholder="Rate"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.tax}
                      onChange={(e) => handleItemChange(idx, 'tax', e.target.value)}
                      placeholder="Tax %"
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      size="sm"
                      value={item.discount}
                      onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
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
                      style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
                    />
                  </td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => removeItem(idx)}>
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
  const renderPDFView = () => {
    const currentTab = formData[key];
    const hasItems = tabsWithItems.includes(key) && Array.isArray(currentTab.items);
  
    return (
      <div 
        ref={pdfRef} 
        style={{ 
          fontFamily: 'Arial, sans-serif', 
          padding: '20px', 
          backgroundColor: 'white',
          minHeight: '100vh',
          boxSizing: 'border-box'
        }}
      >
        {/* Header with Logo and Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ border: '2px dashed #28a745', padding: '10px', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {currentTab.logo ? <img src={currentTab.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100px' }} /> : 'Logo'}
          </div>
          <div style={{ textAlign: 'center', color: '#28a745' }}>
            <h2>
              {key === 'purchaseQuotation' && 'PURCHASE QUOTATION'}
              {key === 'purchaseOrder' && 'PURCHASE ORDER'}
              {key === 'goodsReceipt' && 'GOODS RECEIPT NOTE'}
              {key === 'bill' && 'PURCHASE BILL'}
              {key === 'payment' && 'PAYMENT RECEIPT'}
            </h2>
          </div>
        </div>
        <hr style={{ border: '2px solid #28a745', margin: '15px 0' }} />
  
        {/* Company Info */}
        <div style={{ marginBottom: '15px' }}>
          <h4>{currentTab.companyName}</h4>
          <p>{currentTab.companyAddress}</p>
          <p>Email: {currentTab.companyEmail} | Phone: {currentTab.companyPhone}</p>
        </div>
  
        {/* Vendor Info */}
        {currentTab.vendorName && (
          <div style={{ marginBottom: '15px' }}>
            <h5>Vendor</h5>
            <p>{currentTab.vendorName}</p>
            <p>{currentTab.vendorAddress}</p>
            <p>Email: {currentTab.vendorEmail} | Phone: {currentTab.vendorPhone}</p>
          </div>
        )}
  
        {/* Ship To */}
        {currentTab.shipToName && (
          <div style={{ marginBottom: '15px' }}>
            <h5>Ship To</h5>
            <p>{currentTab.shipToName}</p>
            <p>{currentTab.shipToAddress}</p>
            <p>Email: {currentTab.shipToEmail} | Phone: {currentTab.shipToPhone}</p>
          </div>
        )}
  
        {/* Driver & Vehicle */}
        {key === 'goodsReceipt' && (
          <div style={{ marginBottom: '15px' }}>
            <h5>Driver Details</h5>
            <p>{currentTab.driverName} | {currentTab.driverPhone}</p>
            <p>Vehicle No.: {currentTab.vehicleNo}</p>
          </div>
        )}
  
        {/* Document Numbers */}
        <div style={{ marginBottom: '15px' }}>
          <strong>Ref NO:</strong> {currentTab.referenceId} |
          {key === 'purchaseQuotation' && <><strong>Quotation No.:</strong> {currentTab.quotationNo} | </>}
          {key === 'purchaseOrder' && <><strong>Order No.:</strong> {currentTab.orderNo} | </>}
          {key === 'goodsReceipt' && <><strong>Receipt No.:</strong> {currentTab.receiptNo} | </>}
          {key === 'bill' && <><strong>Bill No.:</strong> {currentTab.billNo} | </>}
          {key === 'payment' && <><strong>Payment No.:</strong> {currentTab.paymentNo} | </>}
          <strong>Date:</strong> {currentTab[`${key}Date`] || currentTab.date}
        </div>
  
        {/* Items Table */}
        {hasItems && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Item Name</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Qty</th>
                {key === 'goodsReceipt' && <th style={{ border: '1px solid #000', padding: '8px' }}>Received Qty</th>}
                <th style={{ border: '1px solid #000', padding: '8px' }}>Rate</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Tax %</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Discount</th>
                <th style={{ border: '1px solid #000', padding: '8px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {currentTab.items.map((item, idx) => {
                const qty = key === 'goodsReceipt' ? (parseInt(item.receivedQty) || 0) : (parseInt(item.qty) || 0);
                const amount = (parseFloat(item.rate) || 0) * qty;
                return (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{item.name}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{item.qty}</td>
                    {key === 'goodsReceipt' && <td style={{ border: '1px solid #000', padding: '8px' }}>{item.receivedQty}</td>}
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{parseFloat(item.rate).toFixed(2)}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{item.tax}%</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{parseFloat(item.discount).toFixed(2)}</td>
                    <td style={{ border: '1px solid #000', padding: '8px' }}>{amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={key === 'goodsReceipt' ? 6 : 5} style={{ textAlign: 'right', fontWeight: 'bold', border: '1px solid #000', padding: '8px' }}>
                  Total:
                </td>
                <td style={{ fontWeight: 'bold', border: '1px solid #000', padding: '8px' }}>
                  ${calculateTotalWithTaxAndDiscount(currentTab.items).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
  
        {/* Payment Details */}
        {key === 'payment' && (
          <div style={{ marginBottom: '15px' }}>
            <h5>Payment Details</h5>
            <p>Amount Paid: ${parseFloat(currentTab.amount).toFixed(2)}</p>
            <p>Payment Method: {currentTab.paymentMethod}</p>
            <p>Status: {currentTab.paymentStatus}</p>
          </div>
        )}
  
        {/* Terms & Conditions */}
        {currentTab.terms && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Terms & Conditions:</strong>
            <p>{currentTab.terms}</p>
          </div>
        )}
  
        {/* Attachments */}
        <div style={{ marginBottom: '15px' }}>
          {currentTab.signature && (
            <div>
              <strong>Signature:</strong>
              <br />
              <img src={currentTab.signature} alt="Signature" style={{ maxWidth: '150px', maxHeight: '100px', margin: '5px 0' }} />
            </div>
          )}
          {currentTab.photo && (
            <div>
              <strong>Photo:</strong>
              <br />
              <img src={currentTab.photo} alt="Photo" style={{ maxWidth: '150px', maxHeight: '100px', margin: '5px 0' }} />
            </div>
          )}
          {currentTab.files && currentTab.files.length > 0 && (
            <div>
              <strong>Files:</strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {currentTab.files.map((file, i) => (
                  <li key={i}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
  
        {/* Footer Note */}
        <p style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '30px' }}>
          {currentTab.footerNote || "Thank you for your business!"}
        </p>
      </div>
    );
  };
  
  // Render attachment fields for all tabs
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
                    style={{ width: '100px', height: '50px', objectFit: 'contain' }} 
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
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
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
                      <li key={index} className="d-flex justify-content-between align-items-center">
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
  
  return (
    <>  
    <div className="container-fluid mt-4 px-2" ref={formRef}>
      <h4 className="text-center mb-4">Purchase Process</h4>
      
      {/* Top Action Buttons */}
{/* Top Action Buttons */}
<div className="d-flex flex-wrap justify-content-center gap-2 gap-sm-3 mb-4">
  
  {/* Print in English Button */}
  <Button
    variant="warning"
    onClick={() => handlePrint('english')}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "130px",
      fontSize: "0.95rem",
      padding: "6px 10px",
    }}
  >
    Print (English)
  </Button>

  {/* Print in Arabic Button */}
  <Button
    variant="warning"
    onClick={() => handlePrint('arabic')}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "130px",
      fontSize: "0.95rem",
      padding: "6px 10px",
      backgroundColor: '#d39e00',
      borderColor: '#c49200'
    }}
  >
    طباعة (العربية)
  </Button>

  {/* Print Both Button */}
  <Button
    variant="warning"
    onClick={() => handlePrint('both')}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "150px",
      fontSize: "0.95rem",
      padding: "6px 10px",
      backgroundColor: '#c87f0a',
      borderColor: '#b87409'
    }}
  >
    Print Both (EN + AR)
  </Button>

  {/* Other Buttons... */}
  <Button
    variant="info"
    onClick={handleSend}
    className="flex-fill flex-sm-grow-0"
    style={{
      color: 'white',
      minWidth: "110px",
      fontSize: "0.95rem",
      padding: "6px 10px",
    }}
  >
    Send
  </Button>

  <Button
    variant="success"
    onClick={handleDownloadPDF}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "130px",
      fontSize: "0.95rem",
      padding: "6px 10px",
    }}
  >
    Download PDF
  </Button>

  <Button
    variant="primary"
    onClick={() => navigate('/company/viewinvoicee')}
    className="flex-fill flex-sm-grow-0"
    style={{
      minWidth: "130px",
      fontSize: "0.95rem",
      padding: "6px 10px",
    }}
  >
    View Bills
  </Button>
</div>
      <Tabs activeKey={key} onSelect={setKey} className="mb-4" fill>
      <Tab eventKey="purchaseQuotation" title="Purchase Quotation">
  <Form>

    <PurchaseQuotationPage       formData={formData}
      handleChange={handleChange}
      addItem={addItem}
      removeItem={removeItem}
      renderItemsTable={renderItemsTable}
      generateReferenceId={generateReferenceId}
      renderAttachmentFields={renderAttachmentFields} />

<ButtonBar
        handleSaveNext={handleSaveNext}
        handleSkip={handleSkip}
        handleSaveDraft={handleSaveDraft}
        handleFinalSubmit={handleFinalSubmit}
      />
  </Form>
</Tab>

<Tab eventKey="purchaseOrder" title="Purchase Order">
  <Form>

    <PurchaseOrderPage       formData={formData}
      handleChange={handleChange}
      addItem={addItem}
      removeItem={removeItem}
      renderItemsTable={renderItemsTable}
      generateReferenceId={generateReferenceId}
      renderAttachmentFields={renderAttachmentFields} />
           <ButtonBar
        handleSaveNext={handleSaveNext}
        handleSkip={handleSkip}
        handleSaveDraft={handleSaveDraft}
        handleFinalSubmit={handleFinalSubmit}
      />
  </Form>
</Tab>

<Tab eventKey="goodsReceipt" title="Goods Receipt">
  <Form>

    <GoodsReceiptPage         formData={formData}
      handleChange={handleChange}
      addItem={addItem}
      removeItem={removeItem}
      renderItemsTable={renderItemsTable}
      generateReferenceId={generateReferenceId}
      renderAttachmentFields={renderAttachmentFields}/>
           <ButtonBar
        handleSaveNext={handleSaveNext}
        handleSkip={handleSkip}
        handleSaveDraft={handleSaveDraft}
        handleFinalSubmit={handleFinalSubmit}
      />
  </Form>
</Tab>

<Tab eventKey="bill" title="Bill">
  <Form>

    <BillPage        formData={formData}
      handleChange={handleChange}
      addItem={addItem}
      removeItem={removeItem}
      renderItemsTable={renderItemsTable}
      generateReferenceId={generateReferenceId}
      renderAttachmentFields={renderAttachmentFields} />
           <ButtonBar
        handleSaveNext={handleSaveNext}
        handleSkip={handleSkip}
        handleSaveDraft={handleSaveDraft}
        handleFinalSubmit={handleFinalSubmit}
      />
  </Form>
</Tab>

<Tab eventKey="payment" title="Payment">
  <Form>
 
    <PaymentPage        formData={formData}
      handleChange={handleChange}
      generateReferenceId={generateReferenceId}
      renderAttachmentFields={renderAttachmentFields}  />
           <ButtonBar
        handleSaveNext={handleSaveNext}
        handleSkip={handleSkip}
        handleSaveDraft={handleSaveDraft}
        handleFinalSubmit={handleFinalSubmit}
      />
  
  </Form>
</Tab>



      </Tabs>
      
      {/* Hidden PDF View - Only for PDF generation and printing */}
      <div style={{
        visibility: 'hidden',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '210mm',
        padding: '15mm',
        boxSizing: 'border-box',
      }}>
        <div id="pdf-view" ref={pdfRef}>
          {renderPDFView()}
        </div>
      </div>
    </div>
    </>
  );
};

export default MultiStepPurchaseForm;
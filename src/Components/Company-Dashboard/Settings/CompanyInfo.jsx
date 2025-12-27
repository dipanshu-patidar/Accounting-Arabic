import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, Container, Image, Nav, Tab, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaBuilding, FaImage, FaMapMarkerAlt, FaGlobe, FaFileInvoice, FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { CurrencySetting } from './CurrencySetting';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CompanyInfo.css';

const CompanyInfo = () => {
  const [printLanguage, setPrintLanguage] = useState('ar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const companyId = GetCompanyId();

  // ✅ Create a ref to store the AbortController for cleanup
  const abortControllerRef = useRef(null);

  const [formData, setFormData] = useState({
    // Company Info
    companyName: '',
    companyEmail: '',
    phoneNumber: '',
    fax: '',
    website: false,
    companyImages: false,
    companyIcon: null,
    favicon: null,
    companyLogo: null,
    companyDarkLogo: null,
    addressInfo: false,
    address: '',
    country: '',
    city: '',
    state: '',
    portalCode: '',
    currency: '',
    uploadImages: [false, false, false],

    // Invoice Settings
    invoiceTemplateId: 'template1',
    purchaseTemplateId: 'purchase1',
    receiptTemplateId: 'receipt1',
    headerLabel: 'Invoice No.',
    footerTerms: '',
    footerNote: '',
    footerBankDetails: '',
    // Dedicated bank fields
    bank_name: '',
    account_no: '',
    account_holder: '',
    ifsc_code: '',
    purchaseLogo: null,
    purchaseDarkLogo: null,
    purchaseIcon: null,
    invoiceImage: null,
    showDescription: true,
    showItemName: true,
    showPrice: true,
    showQuantity: true,
    showTotal: true
  });

  const [previewImages, setPreviewImages] = useState({
    companyIcon: null,
    favicon: null,
    companyLogo: null,
    companyDarkLogo: null,
    purchaseLogo: null,
    purchaseDarkLogo: null,
    purchaseIcon: null,
    invoiceImage: null
  });

  // ✅ Add a cleanup effect to run when the component unmounts
  useEffect(() => {
    // This function will be called when the component is unmounted
    return () => {
      console.log("CompanyInfo component is unmounting. Aborting any pending request.");
      // Abort the pending request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch company data on component mount
  useEffect(() => {
    if (!companyId) {
      setError('Company ID not found.');
      return;
    }

    const fetchAccounts = async () => {
      // ✅ Create a new AbortController for this specific request
      const controller = new AbortController();
      abortControllerRef.current = controller; // Store it in the ref

      try {
        const response = await axiosInstance.get(`account/company/${companyId}`, {
          signal: controller.signal, // Pass the signal to axios
        });
        let accountsArray = [];

        if (Array.isArray(response.data)) {
          accountsArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          accountsArray = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          const firstArray = Object.values(response.data).find(val => Array.isArray(val));
          if (firstArray) accountsArray = firstArray;
        }

        setAccounts(accountsArray);

        if (accountsArray.length > 0) {
          const first = accountsArray[0];
          const second = accountsArray.length > 1 ? accountsArray[1] : first;
          setAccountFromId(first.id);
          setAccountFromDisplay(formatAccountName(first));
          setAccountToId(second.id);
          setAccountToDisplay(formatAccountName(second));
        }
      } catch (err) {
        // ✅ Check if the error is from the abort
        if (axiosInstance.isCancel(err) || err.name === 'CanceledError') {
          console.log("Accounts fetch was canceled.");
          return; // Do not set an error state
        }
        console.error('Accounts API Error:', err);
        setError(err.response?.data?.message || 'Failed to load accounts.');
      }
    };

    fetchAccounts();
  }, [companyId]);

  // Fetch vouchers
  useEffect(() => {
    if (!companyId) return;

    const fetchContraVouchers = async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller; // Store it in the ref

      setTableLoading(true);
      try {
        const response = await axiosInstance.get(`contravouchers/company/${companyId}`, {
          signal: controller.signal, // Pass the signal to axios
        });
        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data && Array.isArray(response.data.contra_vouchers)) {
          data = response.data.contra_vouchers;
        }
        setContraVouchers(data);
      } catch (err) {
        // ✅ Check if the error is from the abort
        if (axiosInstance.isCancel(err) || err.name === 'CanceledError') {
          console.log("Vouchers fetch was canceled.");
          return; // Do not set an error state
        }
        console.error('Failed to fetch contra vouchers:', err);
      } finally {
        // ✅ Only set loading to false if the request wasn't aborted
        if (!controller.signal.aborted) {
          setTableLoading(false);
        }
      }
    };

    fetchContraVouchers();
  }, [companyId]);

  // Close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountFromRef.current && !accountFromRef.current.contains(event.target)) {
        document.getElementById('accountFromDropdown')?.classList.remove('show');
      }
      if (accountToRef.current && !accountToRef.current.contains(event.target)) {
        document.getElementById('accountToDropdown')?.classList.remove('show');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Helper function to create a timeout and store its ID for cleanup
  const createTimeout = (callback, delay) => {
    const timeoutId = setTimeout(() => {
      callback();
    }, delay);
    return timeoutId;
  };

  // Helpers
  const formatAccountName = (acc) => {
    const parent = acc.parent_account?.subgroup_name || 'Unknown';
    const sub = acc.sub_of_subgroup?.name;
    return sub ? `${parent} (${sub})` : parent;
  };

  const getAccountDisplayName = (accountId) => {
    if (!accountId || !accounts.length) return '—';
    const acc = accounts.find(a => a.id == accountId);
    return acc ? formatAccountName(acc) : 'Unknown Account';
  };

  // Get full document URL
  const getDocumentUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = axiosInstance.defaults.baseURL || '';
    return baseUrl + (path.startsWith('/') ? path : `/${path}`);
  };

  const toggleDropdown = (dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    dropdown?.classList.toggle('show');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentVoucherId(null);
    setCurrentDocumentUrl('');
    resetForm();
    setAutoVoucherNo(generateAutoVoucherNo());
    setShowModal(true);
  };

  const resetForm = () => {
    setManualVoucherNo('');
    setVoucherDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setNarration('');
    setUploadedFile(null);
    if (accounts.length > 0) {
      const first = accounts[0];
      const second = accounts.length > 1 ? accounts[1] : first;
      setAccountFromId(first.id);
      setAccountFromDisplay(formatAccountName(first));
      setAccountToId(second.id);
      setAccountToDisplay(formatAccountName(second));
    }
  };

  const handleEdit = (voucher) => {
    setIsEditing(true);
    setCurrentVoucherId(voucher.id);
    setManualVoucherNo(voucher.voucher_number || '');
    const dateStr = voucher.voucher_date
      ? voucher.voucher_date.split('T')[0]
      : new Date().toISOString().split('T')[0];
    setVoucherDate(dateStr);
    setAmount(voucher.amount || '');
    setNarration(voucher.narration || '');
    setUploadedFile(null);
    setCurrentDocumentUrl(voucher.document ? getDocumentUrl(voucher.document) : '');

    const fromAcc = accounts.find(acc => acc.id == voucher.account_from_id);
    const toAcc = accounts.find(acc => acc.id == voucher.account_to_id);

    if (fromAcc) {
      setAccountFromId(fromAcc.id);
      setAccountFromDisplay(formatAccountName(fromAcc));
    } else {
      setAccountFromId(voucher.account_from_id || '');
      setAccountFromDisplay('Unknown Account');
    }

    if (toAcc) {
      setAccountToId(toAcc.id);
      setAccountToDisplay(formatAccountName(toAcc));
    } else {
      setAccountToId(voucher.account_to_id || '');
      setAccountToDisplay('Unknown Account');
    }

    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(null);

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      setLoading(false);
      return;
    }

    if (accountFromId === accountToId) {
      setError('Account From and Account To cannot be same.');
      setLoading(false);
      return;
    }

    if (!accountFromId || !accountToId) {
      setError('Please select both accounts.');
      setLoading(false);
      return;
    }

    // ✅ Create a new AbortController for this specific request
    const controller = new AbortController();
    abortControllerRef.current = controller; // Store it in the ref

    const formDataForUpload = new FormData();
    if (manualVoucherNo.trim()) {
      formDataForUpload.append('voucher_number', manualVoucherNo.trim());
    }
    formDataForUpload.append('voucher_date', voucherDate);
    formDataForUpload.append('account_from_id', accountFromId);
    formDataForUpload.append('account_to_id', accountToId);
    formDataForUpload.append('amount', amount);
    formDataForUpload.append('narration', narration || '');
    formDataForUpload.append('company_id', companyId);

    if (uploadedFile) {
      formDataForUpload.append('document', uploadedFile);
    }

    try {
      let response;
      if (isEditing && currentVoucherId) {
        response = await axiosInstance.put(`contravouchers/${currentVoucherId}`, formDataForUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: controller.signal, // Pass the signal to axios
        });

        setContraVouchers((prev) =>
          prev.map((v) =>
            v.id === currentVoucherId
              ? {
                ...v,
                voucher_number: manualVoucherNo.trim() || v.voucher_number,
                voucher_date: voucherDate,
                account_from_id: accountFromId,
                account_to_id: accountToId,
                amount,
                narration: narration || '',
                document: response.data?.document || v.document,
              }
              : v
          )
        );
        toast.success('Voucher updated successfully!');
      } else {
        response = await axiosInstance.post('contravouchers', formDataForUpload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal: controller.signal, // Pass the signal to axios
        });

        const newVoucher = {
          id: response.data?.id || Date.now(),
          voucher_no: manualVoucherNo.trim() || response.data?.voucher_no || autoVoucherNo,
          voucher_number: manualVoucherNo.trim() || null,
          voucher_date: voucherDate,
          account_from_id: accountFromId,
          account_to_id: accountToId,
          amount,
          narration: narration || '',
          document: response.data?.document,
        };
        setContraVouchers((prev) => [newVoucher, ...prev]);
        toast.success('Contra Voucher created successfully!');
      }

      setShowModal(false);
    } catch (err) {
      // ✅ Check if the error is from the abort
      if (axiosInstance.isCancel(err) || err.name === 'CanceledError') {
        console.log("Save request was canceled.");
        return; // Do not set an error state
      }
      console.error('API Error:', err);
      setError(
        err.response?.data?.message ||
        (isEditing ? 'Failed to update voucher.' : 'Failed to create voucher.')
      );
      toast.error(
        err.response?.data?.message ||
        (isEditing ? 'Failed to update voucher.' : 'Failed to create voucher.')
      );
    } finally {
      // ✅ Only set loading to false if the request wasn't aborted
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this voucher?`)) return;

    // ✅ Create a new AbortController for this specific request
    const controller = new AbortController();
    abortControllerRef.current = controller; // Store it in the ref

    try {
      await axiosInstance.delete(`contravouchers/${id}`, {
        signal: controller.signal, // Pass the signal to axios
      });
      setContraVouchers((prev) => prev.filter((v) => v.id !== id));
      toast.success('Voucher deleted successfully!');
    } catch (err) {
      // ✅ Check if the error is from the abort
      if (axiosInstance.isCancel(err) || err.name === 'CanceledError') {
        console.log("Delete request was canceled.");
        return; // Do not set an error state
      }
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete voucher.');
    }
  };

  // Translations
  const translations = {
    en: {
      settings: "Settings",
      manageSettings: "Manage your settings on portal.",
      companySettings: "Company Settings",
      invoiceSettings: "Invoice Settings",
      companyInformation: "Company Information",
      companyName: "Company Name *",
      companyEmail: "Company Email Address *",
      phoneNumber: "Phone Number *",
      companyImages: "Company Images",
      companyIcon: "Company Icon",
      favicon: "Favicon",
      companyLogo: "Company Logo",
      companyDarkLogo: "Company Dark Logo",
      chooseFile: "Choose File",
      uploadInstruction: "Upload {field} of your company",
      addressInformation: "Address Information",
      address: "Address *",
      country: "Country *",
      city: "City *",
      state: "State *",
      portalCode: "Portal Code *",
      currency: "Currency *",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      select: "Select",
      pageDescription: "This page allows you to manage company settings including general info, upload logos/icons, and configure address details like country, city, and postal code.",
      // Invoice Settings
      invoiceTemplate: "Invoice Template",
      invoiceImage: "Invoice Image",
      purchases: "Purchases",
      receipts: "Receipts",
      salesInvoice: "Sales Invoice",
      cashInvoice: "Cash Invoice",
      deliveryNote: "Delivery Note",
      headerText: "Header Text",
      footerText: "Footer Text",
      termsConditions: "Terms & Conditions",
      note: "Note",
      bankDetails: "Bank Details",
      customizeFields: "Customize Fields",
      description: "Description",
      itemName: "Item Name (ATM)",
      price: "Price",
      quantity: "Quantity",
      total: "Total",
      saveSettings: "Save Settings"
    },
    ar: {
      settings: "الإعدادات",
      manageSettings: "إدارة إعداداتك على البوابة.",
      companySettings: "إعدادات الشركة",
      invoiceSettings: "إعدادات الفاتورة",
      companyInformation: "معلومات الشركة",
      companyName: "اسم الشركة *",
      companyEmail: "البريد الإلكتروني للشركة *",
      phoneNumber: "رقم الهاتف *",
      companyImages: "صور الشركة",
      companyIcon: "أيقونة الشركة",
      favicon: "favicon",
      companyLogo: "شعار الشركة",
      companyDarkLogo: "شعار الشركة الداكن",
      chooseFile: "اختر ملف",
      uploadInstruction: "تحميل {field} لشركتك",
      addressInformation: "معلومات العنوان",
      address: "العنوان *",
      country: "البلد *",
      city: "المدينة *",
      state: "الولاية *",
      portalCode: "الرمز البريدي *",
      currency: "العملة *",
      cancel: "إلغاء",
      saveChanges: "حفظ التغييرات",
      select: "اختر",
      pageDescription: "تسمح لك هذه الصفحة بإدارة إعدادات الشركة بما في ذلك المعلومات العامة وتحميل الشعارات/الأيقونات وتكوين تفاصيل العنوان مثل البلد والمدينة والرمز البريدي.",
      // Invoice Settings
      invoiceTemplate: "نموذج الفاتورة",
      invoiceImage: "صورة الفاتورة",
      purchases: "المشتريات",
      receipts: "الإيصالات",
      salesInvoice: "فاتورة مبيعات",
      cashInvoice: "فاتورة نقدية",
      deliveryNote: "مذكرة تسليم",
      headerText: "نص العنوان",
      footerText: "نص التذييل",
      termsConditions: "الشروط والأحكام",
      note: "ملاحظة",
      bankDetails: "تفاصيل البنك",
      customizeFields: "تخصيص الحقول",
      description: "الوصف",
      itemName: "اسم الصنف (ATM)",
      price: "السعر",
      quantity: "الكمية",
      total: "الإجمالي",
      saveSettings: "حفظ الإعدادات"
    }
  };

  const t = (key) => {
    if (printLanguage === 'both') {
      return (
        <>
          <div>{translations.en[key]}</div>
          <div>{translations.ar[key]}</div>
        </>
      );
    }
    return translations[printLanguage][key];
  };

  const currencyOptions = [
    { value: '', label: printLanguage === 'both' ? <><div>{translations.en.select}</div><div>{translations.ar.select}</div></> : translations[printLanguage].select },
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'SAR', label: 'SAR - Saudi Riyal' },
    { value: 'JPY', label: 'JPY - Japanese Yen' }
  ];

  const countryOptions = [
    { value: '', label: printLanguage === 'both' ? <><div>{translations.en.select}</div><div>{translations.ar.select}</div></> : translations[printLanguage].select },
    { value: 'USA', label: 'USA' },
    { value: 'India', label: 'India' },
    { value: 'UAE', label: 'UAE' },
    { value: 'France', label: 'France' },
    { value: 'Australia', label: 'Australia' }
  ];

  const stateOptions = [
    { value: '', label: printLanguage === 'both' ? <><div>{translations.en.select}</div><div>{translations.ar.select}</div></> : translations[printLanguage].select },
    { value: 'Alaska', label: 'Alaska' },
    { value: 'California', label: 'California' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Dubai', label: 'Dubai' }
  ];

  const cityOptions = [
    { value: '', label: printLanguage === 'both' ? <><div>{translations.en.select}</div><div>{translations.ar.select}</div></> : translations[printLanguage].select },
    { value: 'New York', label: 'New York' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Dubai', label: 'Dubai' },
    { value: 'Paris', label: 'Paris' }
  ];

  // Subunit mapping per currency
  const currencySubunits = {
    INR: { major: 'Rupees', minor: 'Paise' },
    AED: { major: 'Dirhams', minor: 'Fils' },
    USD: { major: 'Dollars', minor: 'Cents' },
    EUR: { major: 'Euros', minor: 'Cents' },
    default: { major: 'Units', minor: 'Subunits' }
  };

  const getSubunitLabels = (currency) => {
    return currencySubunits[currency] || currencySubunits.default;
  };

  // Template header mapping
  const headerLabels = {
    sales_invoice: printLanguage === 'ar' ? 'رقم الفاتورة' : 'Invoice No.',
    cash_invoice: printLanguage === 'ar' ? 'رقم الفاتورة النقدية' : 'Cash Invoice No.',
    delivery_note: printLanguage === 'ar' ? 'رقم مذكرة التسليم' : 'Delivery Note No.'
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (files && files[0]) {
      setFormData({ ...formData, [name]: files[0] });
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImages(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleTemplateChange = (template) => {
    setFormData(prev => ({
      ...prev,
      invoiceTemplateId: template,
      headerLabel: headerLabels[template]
    }));
  };

  const uploadButtonStyle = {
    backgroundColor: '#002d4d',
    borderColor: '#002d4d',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  };

  const previewImageStyle = {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#f9f9f9',
    padding: '4px'
  };

  const langButtonStyle = (isActive) => ({
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    border: '1px solid #002d4d',
    backgroundColor: isActive ? '#002d4d' : 'white',
    color: isActive ? 'white' : '#002d4d',
    marginRight: '8px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '400'
  });

  return (
    <div
      className="company-info-container"
      style={{
        minHeight: '100vh',
        padding: '20px 0',
        direction: printLanguage === 'ar' ? 'rtl' : 'ltr',
        fontFamily: printLanguage === 'ar' ? '"Segoe UI", Tahoma, sans-serif' : 'system-ui'
      }}
    >
      {/* currency setting component call */}
      <CurrencySetting />

      <Container className="p-4" style={{ maxWidth: '100%' }}>
        {/* Language Toggle Buttons */}
        <div className="lang-toggle-container">
          <Button 
            className={`btn-lang ${printLanguage === 'en' ? 'active' : ''}`}
            onClick={() => setPrintLanguage('en')} 
            size="sm"
          >
            English
          </Button>
          <Button 
            className={`btn-lang ${printLanguage === 'ar' ? 'active' : ''}`}
            onClick={() => setPrintLanguage('ar')} 
            size="sm"
          >
            العربية
          </Button>
        </div>

        {/* Page Title */}
        <h3 className="company-info-title mb-2">
          {t('settings')}
        </h3>
        <p className="company-info-subtitle mb-4">{t('manageSettings')}</p>

        {/* Tabs: Company & Invoice Settings */}
        <Tab.Container defaultActiveKey="company">
          <Nav variant="tabs" className="mb-4 company-info-tabs">
            <Nav.Item>
              <Nav.Link
                eventKey="company"
                className="d-flex align-items-center gap-2"
              >
                <FaBuilding className="fs-5" />
                <span>{t('companySettings')}</span>
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                eventKey="invoice"
                className="d-flex align-items-center gap-2"
              >
                <FaFileInvoice className="fs-5" />
                <span>{t('invoiceSettings')}</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* COMPANY SETTINGS */}
            <Tab.Pane eventKey="company">
              <Card className="company-info-card">
                <h2 className="section-title mb-4">
                  {t('companyInformation')}
                </h2>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">{t('companyName')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('companyName')}
                      className="form-control-custom mb-3"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                    <Form.Label className="form-label-custom">{t('companyEmail')}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder={t('companyEmail')}
                      className="form-control-custom mb-3"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                      required
                    />
                    <Form.Label className="form-label-custom">{t('phoneNumber')}</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder={t('phoneNumber')}
                      className="form-control-custom mb-3"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <hr className="divider" />

                  <div className="section-header">
                    <FaImage />
                    <h5 className="section-title mb-0">{t('companyImages')}</h5>
                  </div>

                  {["companyIcon", "favicon", "companyLogo", "companyDarkLogo"].map((field) => (
                    <Form.Group className="mb-4" key={field}>
                      <Form.Label className="form-label-custom d-block mb-2">{t(field)}</Form.Label>
                      <div className="d-flex align-items-center">
                        <Button as="label" htmlFor={`${field}-upload`} className="btn-upload">
                          {t('chooseFile')}
                          <Form.Control
                            type="file"
                            id={`${field}-upload`}
                            className="d-none"
                            name={field}
                            onChange={handleChange}
                            accept="image/*"
                          />
                        </Button>
                        {previewImages[field] && (
                          <Image src={previewImages[field]} alt={`${field} Preview`} className="preview-image" />
                        )}
                      </div>
                      <Form.Text className="text-muted">
                        {t('uploadInstruction').replace('{field}', t(field).toLowerCase())}
                      </Form.Text>
                    </Form.Group>
                  ))}

                  <hr className="divider" />

                  <div className="section-header">
                    <FaMapMarkerAlt />
                    <h5 className="section-title mb-0">{t('addressInformation')}</h5>
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">{t('address')}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={t('address')}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="form-control-custom"
                      required
                    />
                  </Form.Group>

                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <Form.Label className="form-label-custom">{t('country')}</Form.Label>
                      <Form.Select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        {countryOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-md-6">
                      <Form.Label className="form-label-custom">{t('city')}</Form.Label>
                      <Form.Select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        {cityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <Form.Label className="form-label-custom">{t('state')}</Form.Label>
                      <Form.Select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        {stateOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                    <div className="col-md-6">
                      <Form.Label className="form-label-custom">{t('portalCode')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="portalCode"
                        value={formData.portalCode}
                        onChange={handleChange}
                        className="form-control-custom"
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <Form.Label className="form-label-custom">
                        {printLanguage === 'both' ? (
                          <>
                            <div>Currency *</div>
                            <div>العملة *</div>
                          </>
                        ) : printLanguage === 'ar' ? 'العملة *' : 'Currency *'}
                      </Form.Label>
                      <Form.Select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="form-select-custom"
                        required
                      >
                        {currencyOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <Button className="btn-cancel me-3" type="button">
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="btn-save"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        t('saveChanges')
                      )}
                    </Button>
                  </div>
                </Form>
              </Card>
            </Tab.Pane>

            {/* INVOICE SETTINGS */}
            <Tab.Pane eventKey="invoice">
              <Card className="company-info-card">
                <h2 className="section-title mb-4">
                  {t('invoiceSettings')}
                </h2>

                <Form onSubmit={handleSubmit}>
                  {/* Template Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">{t('invoiceTemplate')}</Form.Label>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        className={`btn-template ${formData.invoiceTemplateId === 'template1' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('template1')}
                      >
                        {t('salesInvoice')}
                      </Button>
                      <Button
                        className={`btn-template ${formData.invoiceTemplateId === 'cash_invoice' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('cash_invoice')}
                      >
                        {t('cashInvoice')}
                      </Button>
                      <Button
                        className={`btn-template ${formData.invoiceTemplateId === 'delivery_note' ? 'active' : ''}`}
                        onClick={() => handleTemplateChange('delivery_note')}
                      >
                        {t('deliveryNote')}
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Footer Fields */}
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">{t('footerText')}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="footerTerms"
                      value={formData.footerTerms}
                      onChange={handleChange}
                      placeholder={t('termsConditions')}
                      className="form-control-custom mb-2"
                    />
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="footerNote"
                      value={formData.footerNote}
                      onChange={handleChange}
                      placeholder={t('note')}
                      className="form-control-custom mb-2"
                    />
                    <Form.Label className="form-label-custom">{t('bankDetails')}</Form.Label>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <Form.Control
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleChange}
                          placeholder="Bank Name"
                          className="form-control-custom"
                        />
                      </div>
                      <div className="col-md-6">
                        <Form.Control
                          type="text"
                          name="account_no"
                          value={formData.account_no}
                          onChange={handleChange}
                          placeholder="Account No."
                          className="form-control-custom"
                        />
                      </div>
                      <div className="col-md-6">
                        <Form.Control
                          type="text"
                          name="account_holder"
                          value={formData.account_holder}
                          onChange={handleChange}
                          placeholder="Account Holder"
                          className="form-control-custom"
                        />
                      </div>
                      <div className="col-md-6">
                        <Form.Control
                          type="text"
                          name="ifsc_code"
                          value={formData.ifsc_code}
                          onChange={handleChange}
                          placeholder="IFSC Code"
                          className="form-control-custom"
                        />
                      </div>
                    </div>
                  </Form.Group>

                  {/* Currency Subunit Info */}
                  {formData.currency && (
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label-custom">
                        {printLanguage === 'both' ? (
                          <>
                            <div>Currency Format</div>
                            <div>تنسيق العملة</div>
                          </>
                        ) : printLanguage === 'ar' ? 'تنسيق العملة' : 'Currency Format'}
                      </Form.Label>
                      <div className="alert alert-info-custom mb-0">
                        {printLanguage === 'ar'
                          ? `العملة: ${getSubunitLabels(formData.currency).major}، الوحدة الفرعية: ${getSubunitLabels(formData.currency).minor}`
                          : `Major Unit: ${getSubunitLabels(formData.currency).major}, Minor Unit: ${getSubunitLabels(formData.currency).minor}`}
                      </div>
                    </Form.Group>
                  )}

                  {/* Customization Options */}
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">{t('customizeFields')}</Form.Label>
                    <div className="d-flex flex-wrap gap-3">
                      {[
                        { key: 'showDescription', label: t('description') },
                        { key: 'showItemName', label: t('itemName') },
                        { key: 'showPrice', label: t('price') },
                        { key: 'showQuantity', label: t('quantity') },
                        { key: 'showTotal', label: t('total') }
                      ].map((field) => (
                        <Form.Check
                          key={field.key}
                          type="checkbox"
                          id={field.key}
                          name={field.key}
                          checked={formData[field.key]}
                          onChange={handleChange}
                          label={field.label}
                        />
                      ))}
                    </div>
                  </Form.Group>

                  <div className="d-flex justify-content-end mt-4">
                    <Button className="btn-cancel me-3" type="button">
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="btn-save"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : (
                        t('saveSettings')
                      )}
                    </Button>
                  </div>
                </Form>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>

      <p className="text-muted text-center mt-3">
        {typeof t('pageDescription') === 'object'
          ? 'Manage your company and invoice settings in both languages.'
          : t('pageDescription')}
      </p>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={3}
      />
    </div>
  );
};

export default CompanyInfo;
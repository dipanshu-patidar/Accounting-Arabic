import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Image, Nav, Tab, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaBuilding, FaImage, FaMapMarkerAlt, FaGlobe, FaFileInvoice, FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { CurrencySetting } from './CurrencySetting';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CompanyInfo = () => {
  const [printLanguage, setPrintLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showErrorAlert, setShowErrorAlert] = useState(true); // NEW: State to control error alert visibility
  const companyId = GetCompanyId();

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

  // Fetch company data on component mount
  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/auth/Company/${companyId}`);
      
      if (response.data && response.data.success) {
        const companyData = response.data.data;

        // Update form data with API response
        setFormData(prev => ({
          ...prev,
          companyName: companyData.name || '',
          companyEmail: companyData.email || '',
          phoneNumber: companyData.phone || '',
          address: companyData.address || '',
          country: companyData.country || '',
          state: companyData.state || '',
          city: companyData.city || '',
          portalCode: companyData.postal_code || '',
          currency: companyData.currency || '',
          bank_name: companyData.bank_details?.bank_name || '',
          account_no: companyData.bank_details?.account_number || '',
          account_holder: companyData.bank_details?.account_holder || '',
          ifsc_code: companyData.bank_details?.ifsc_code || '',
          footerTerms: companyData.terms_and_conditions || '',
          footerNote: companyData.notes || '',
          invoiceTemplateId: companyData.invoice_template || 'template1',
          purchaseTemplateId: companyData.purchase_template || 'purchase1',
          receiptTemplateId: companyData.receipt_template || 'receipt1',
          headerLabel: companyData.header_label || 'Invoice No.',
          showDescription: companyData.show_description !== false,
          showItemName: companyData.show_item_name !== false,
          showPrice: companyData.show_price !== false,
          showQuantity: companyData.show_quantity !== false,
          showTotal: companyData.show_total !== false
        }));

        // Update preview images if URLs are available
        if (companyData.branding) {
          setPreviewImages(prev => ({
            ...prev,
            companyIcon: companyData.branding.company_icon_url,
            favicon: companyData.branding.favicon_url,
            companyLogo: companyData.branding.company_logo_url,
            companyDarkLogo: companyData.branding.company_dark_logo_url,
            purchaseLogo: companyData.branding.purchase_logo_url,
            purchaseDarkLogo: companyData.branding.purchase_dark_logo_url,
            purchaseIcon: companyData.branding.purchase_icon_url,
            invoiceImage: companyData.branding.invoice_image_url
          }));
        }
        
        setSuccess("Company data loaded successfully");
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorMsg = response.data?.message || "Failed to fetch company data";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      const errorMsg = "An error occurred while fetching company data";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const saveCompanyData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Create FormData for file uploads
      const formDataForUpload = new FormData();

      // Add all company info fields
      formDataForUpload.append("name", formData.companyName);
      formDataForUpload.append("email", formData.companyEmail);
      formDataForUpload.append("phone", formData.phoneNumber);
      formDataForUpload.append("address", formData.address);
      formDataForUpload.append("country", formData.country);
      formDataForUpload.append("state", formData.state);
      formDataForUpload.append("city", formData.city);
      formDataForUpload.append("postal_code", formData.portalCode);
      formDataForUpload.append("currency", formData.currency);
      
      // Add bank details
      formDataForUpload.append("bank_name", formData.bank_name);
      formDataForUpload.append("account_number", formData.account_no);
      formDataForUpload.append("account_holder", formData.account_holder);
      formDataForUpload.append("ifsc_code", formData.ifsc_code);
      
      // Add invoice settings
      formDataForUpload.append("terms_and_conditions", formData.footerTerms);
      formDataForUpload.append("notes", formData.footerNote);
      formDataForUpload.append("invoice_template", formData.invoiceTemplateId);
      formDataForUpload.append("purchase_template", formData.purchaseTemplateId);
      formDataForUpload.append("receipt_template", formData.receiptTemplateId);
      formDataForUpload.append("header_label", formData.headerLabel);
      formDataForUpload.append("show_description", formData.showDescription);
      formDataForUpload.append("show_item_name", formData.showItemName);
      formDataForUpload.append("show_price", formData.showPrice);
      formDataForUpload.append("show_quantity", formData.showQuantity);
      formDataForUpload.append("show_total", formData.showTotal);

      // Add image files if they exist
      if (formData.companyIcon instanceof File) {
        formDataForUpload.append("company_icon", formData.companyIcon);
      }
      if (formData.favicon instanceof File) {
        formDataForUpload.append("favicon", formData.favicon);
      }
      if (formData.companyLogo instanceof File) {
        formDataForUpload.append("company_logo", formData.companyLogo);
      }
      if (formData.companyDarkLogo instanceof File) {
        formDataForUpload.append("company_dark_logo", formData.companyDarkLogo);
      }
      if (formData.purchaseLogo instanceof File) {
        formDataForUpload.append("purchase_logo", formData.purchaseLogo);
      }
      if (formData.purchaseDarkLogo instanceof File) {
        formDataForUpload.append("purchase_dark_logo", formData.purchaseDarkLogo);
      }
      if (formData.purchaseIcon instanceof File) {
        formDataForUpload.append("purchase_icon", formData.purchaseIcon);
      }
      if (formData.invoiceImage instanceof File) {
        formDataForUpload.append("invoice_image", formData.invoiceImage);
      }

      const response = await axiosInstance.put(
        `auth/Company/${companyId}`,
        formDataForUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && response.data.success) {
        setSuccess("Company data saved successfully!");
        toast.success("Company data saved successfully!");
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
        // Refresh data after save
        fetchCompanyData();
      } else {
        const errorMsg = response.data?.message || "Failed to save company data";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Error saving company data:', error);
      const errorMsg = "An error occurred while saving company data";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
        <div className="d-flex justify-content-end mb-3 flex-wrap gap-2">
          <Button style={langButtonStyle(printLanguage === 'en')} onClick={() => setPrintLanguage('en')} size="sm">English</Button>
          <Button style={langButtonStyle(printLanguage === 'ar')} onClick={() => setPrintLanguage('ar')} size="sm">العربية</Button>
        </div>

        {/* Page Title */}
        <h1 className="mb-3" style={{ fontSize: '24px', fontWeight: '600' }}>
          {t('settings')}
        </h1>
        <p className="mb-4 text-muted">{t('manageSettings')}</p>

        {/* Tabs: Company & Invoice Settings */}
        <Tab.Container defaultActiveKey="company">
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link
                eventKey="company"
                className="d-flex align-items-center gap-2 p-2"
                style={{ fontWeight: '500' }}
              >
                <FaBuilding className="fs-5" />
                <span>{t('companySettings')}</span>
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                eventKey="invoice"
                className="d-flex align-items-center gap-2 p-2"
                style={{ fontWeight: '500' }}
              >
                <FaFileInvoice className="fs-5" />
                <span>{t('invoiceSettings')}</span>
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            {/* COMPANY SETTINGS */}
            <Tab.Pane eventKey="company">
              <div className="bg-white p-4 rounded shadow-sm">
                <h2 className="mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
                  {t('companyInformation')}
                </h2>

                <Form onSubmit={saveCompanyData}>
                  <Form.Group className="mb-4">
                    <Form.Control
                      type="text"
                      placeholder={t('companyName')}
                      className="mb-3"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control
                      type="email"
                      placeholder={t('companyEmail')}
                      className="mb-3"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control
                      type="tel"
                      placeholder={t('phoneNumber')}
                      className="mb-3"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <hr className="my-4" />

                  <div className="d-flex align-items-center mb-3">
                    <FaImage className="me-2" style={{ color: '#002d4d' }} />
                    <h5 style={{ marginBottom: 0 }}>{t('companyImages')}</h5>
                  </div>

                  {["companyIcon", "favicon", "companyLogo", "companyDarkLogo"].map((field) => (
                    <Form.Group className="mb-4" key={field}>
                      <Form.Label className="fw-bold d-block mb-2">{t(field)}</Form.Label>
                      <div className="d-flex align-items-center">
                        <Button as="label" htmlFor={`${field}-upload`} style={uploadButtonStyle}>
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
                          <Image src={previewImages[field]} alt={`${field} Preview`} style={previewImageStyle} />
                        )}
                      </div>
                      <Form.Text className="text-muted">
                        {t('uploadInstruction').replace('{field}', t(field).toLowerCase())}
                      </Form.Text>
                    </Form.Group>
                  ))}

                  <hr className="my-4" />

                  <div className="d-flex align-items-center mb-3">
                    <FaMapMarkerAlt className="me-2" style={{ color: '#002d4d' }} />
                    <h5 style={{ marginBottom: 0 }}>{t('addressInformation')}</h5>
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={t('address')}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <div className="row mb-4">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <Form.Label className="fw-bold">{t('country')}</Form.Label>
                      <Form.Select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
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
                      <Form.Label className="fw-bold">{t('city')}</Form.Label>
                      <Form.Select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
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
                      <Form.Label className="fw-bold">{t('state')}</Form.Label>
                      <Form.Select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
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
                      <Form.Label className="fw-bold">{t('portalCode')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="portalCode"
                        value={formData.portalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <Form.Label className="fw-bold">
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
                    <Button variant="outline-secondary" className="me-3 px-4 py-2" type="button">
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="px-4 py-2"
                      style={{
                        borderRadius: '4px',
                        backgroundColor: '#002d4d',
                        borderColor: '#002d4d',
                        border: 'none',
                        color: '#fff'
                      }}
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
              </div>
            </Tab.Pane>

            {/* INVOICE SETTINGS */}
            <Tab.Pane eventKey="invoice">
              <div className="p-4 card">
                <h2 className="mb-4" style={{ fontSize: '20px', fontWeight: '600' }}>
                  {t('invoiceSettings')}
                </h2>

                <Form onSubmit={saveCompanyData}>
                  {/* Template Selection */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">{t('invoiceTemplate')}</Form.Label>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant={formData.invoiceTemplateId === 'template1' ? 'primary' : 'outline-primary'}
                        onClick={() => handleTemplateChange('template1')}
                      >
                        {t('salesInvoice')}
                      </Button>
                      <Button
                        variant={formData.invoiceTemplateId === 'cash_invoice' ? 'primary' : 'outline-primary'}
                        onClick={() => handleTemplateChange('cash_invoice')}
                      >
                        {t('cashInvoice')}
                      </Button>
                      <Button
                        variant={formData.invoiceTemplateId === 'delivery_note' ? 'primary' : 'outline-primary'}
                        onClick={() => handleTemplateChange('delivery_note')}
                      >
                        {t('deliveryNote')}
                      </Button>
                    </div>
                  </Form.Group>

                  {/* Footer Fields */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">{t('footerText')}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="footerTerms"
                      value={formData.footerTerms}
                      onChange={handleChange}
                      placeholder={t('termsConditions')}
                      className="mb-2"
                    />
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="footerNote"
                      value={formData.footerNote}
                      onChange={handleChange}
                      placeholder={t('note')}
                      className="mb-2"
                    />
                    <Form.Label className="fw-bold">{t('bankDetails')}</Form.Label>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <Form.Control
                          type="text"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleChange}
                          placeholder="Bank Name"
                        />
                      </div>
                      <div className="col-md-6">
                        <Form.Control
                          type="text"
                          name="account_no"
                          value={formData.account_no}
                          onChange={handleChange}
                          placeholder="Account No."
                        />
                      </div>
                      <div className="col-md-6">
                        <Form.Control
                          type="text"
                          name="account_holder"
                          value={formData.account_holder}
                          onChange={handleChange}
                          placeholder="Account Holder"
                        />
                      </div>
                      <div className="col-md-6">
                        <Form.Control
                          type="text"
                          name="ifsc_code"
                          value={formData.ifsc_code}
                          onChange={handleChange}
                          placeholder="IFSC Code"
                        />
                      </div>
                    </div>
                  </Form.Group>

                  {/* Currency Subunit Info */}
                  {formData.currency && (
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">
                        {printLanguage === 'both' ? (
                          <>
                            <div>Currency Format</div>
                            <div>تنسيق العملة</div>
                          </>
                        ) : printLanguage === 'ar' ? 'تنسيق العملة' : 'Currency Format'}
                      </Form.Label>
                      <div className="alert alert-info mb-0">
                        {printLanguage === 'ar'
                          ? `العملة: ${getSubunitLabels(formData.currency).major}، الوحدة الفرعية: ${getSubunitLabels(formData.currency).minor}`
                          : `Major Unit: ${getSubunitLabels(formData.currency).major}, Minor Unit: ${getSubunitLabels(formData.currency).minor}`}
                      </div>
                    </Form.Group>
                  )}

                  {/* Customization Options */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">{t('customizeFields')}</Form.Label>
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
                    <Button variant="outline-secondary" className="me-3 px-4 py-2" type="button">
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="px-4 py-2"
                      style={{
                        borderRadius: '4px',
                        backgroundColor: '#002d4d',
                        borderColor: '#002d4d',
                        border: 'none',
                        color: '#fff'
                      }}
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
              </div>
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
import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Table,
  Spinner,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import GetCompanyId from "../../../Api/GetCompanyId";
import axiosInstance from "../../../Api/axiosInstance";
import { CurrencyContext } from "../../../hooks/CurrencyContext";

// Error Boundary Component to catch and handle errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger">
          <h5>Something went wrong.</h5>
          <p>Please refresh the page and try again.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const VatReport = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filterType, setFilterType] = useState("All");
  const companyId = GetCompanyId();
  const [vatData, setVatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRTL, setIsRTL] = useState(false);
  const [useSimpleDateInput, setUseSimpleDateInput] = useState(false);
  const [componentReady, setComponentReady] = useState(false);
  
  // Refs to track component mount status
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const containerRef = useRef(null);

  // ✅ Get currency context
  const { convertPrice, symbol } = useContext(CurrencyContext);
  
  // Check if RTL mode is active
  useEffect(() => {
    const checkRTL = () => {
      if (!isMountedRef.current) return;
      
      const htmlElement = document.documentElement;
      const isRTLMode = htmlElement.getAttribute('dir') === 'rtl' || 
                       htmlElement.style.direction === 'rtl' ||
                       getComputedStyle(htmlElement).direction === 'rtl';
      
      setIsRTL(isRTLMode);
      
      // If RTL is detected, use simple date input to avoid DatePicker issues
      if (isRTLMode) {
        setUseSimpleDateInput(true);
      } else {
        setUseSimpleDateInput(false);
      }
    };
    
    // Delay component rendering to ensure DOM is ready
    const timer = setTimeout(() => {
      checkRTL();
      setComponentReady(true);
    }, 100);
    
    // Check on language changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'dir' || 
             mutation.attributeName === 'style')) {
          checkRTL();
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['dir', 'style']
    });
    
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clean up any remaining DatePicker elements
      try {
        const datepickerElements = document.querySelectorAll('.react-datepicker-popper, .react-datepicker__month-container');
        datepickerElements.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      } catch (e) {
        console.warn("Could not remove datepicker elements:", e);
      }
    };
  }, []);

  const types = ["All", "Outward Supplies", "Inward Supplies", "Adjustments", "Exempt Supplies"];

  const fetchVatReport = async (signal) => {
    if (!isMountedRef.current) return;
    
    if (!companyId) {
      setError("Company ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = { company_id: companyId };
      const response = await axiosInstance.get("/vat-report", {
        params,
        signal: signal,
      });

      if (!isMountedRef.current) {
        setLoading(false);
        return;
      }
      
      if (response.data?.success && Array.isArray(response.data.vatSummary)) {
        setVatData(response.data.vatSummary);
      } else {
        setVatData([]);
        setError("Unexpected response format.");
      }
    } catch (err) {
      // Check if the error is because the request was aborted
      if (axiosInstance.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log("Request was canceled.");
        return;
      }

      console.error("VAT Report fetch error:", err);
      if (isMountedRef.current) {
        setError("Failed to load VAT data. Please try again.");
        setVatData([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId || !isMountedRef.current || !componentReady) return;
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    fetchVatReport(signal);

    // Cleanup function for useEffect
    return () => {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, componentReady]);

  const filteredRows = useMemo(() => {
    if (!vatData || !Array.isArray(vatData)) return [];
    return vatData.filter(
      (e) => filterType === "All" || e.type === filterType
    );
  }, [vatData, filterType]);

  // Format date range for display
  const formatDateRange = () => {
    if (!startDate && !endDate) return "Select date range";
    if (startDate && !endDate) return `${startDate.toLocaleDateString()} - `;
    if (!startDate && endDate) return ` - ${endDate.toLocaleDateString()}`;
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  if (!componentReady) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div ref={containerRef} className="p-4 mt-4" dir={isRTL ? "rtl" : "ltr"} style={{ position: "relative", minHeight: "400px" }}>
        <h4 className="fw-bold">GCC VAT Return Report</h4>
        <p className="text-muted mb-4">Auto-generated VAT summary.</p>

        {/* 🔍 Filter Section */}
        <div className="shadow-sm rounded-4 p-4 mb-4 border">
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Label className="fw-semibold">Choose Date</Form.Label>
              <div style={{ position: "relative", minHeight: "38px", width: "100%" }}>
                {useSimpleDateInput ? (
                  // Use simple input for RTL to avoid DatePicker issues
                  <Form.Control
                    type="text"
                    value={formatDateRange()}
                    readOnly
                    placeholder="Select date range"
                    disabled
                    style={{ textAlign: isRTL ? "right" : "left" }}
                  />
                ) : (
                  // Use DatePicker for LTR mode
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => {
                      if (isMountedRef.current) {
                        setDateRange(update);
                      }
                    }}
                    isClearable
                    className="form-control"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date range"
                    disabled
                    // Disable portal to avoid DOM issues in RTL mode
                    withPortal={false}
                    // Add RTL-specific positioning
                    popperPlacement={isRTL ? "bottom-end" : "bottom-start"}
                    popperModifiers={[
                      {
                        name: "preventOverflow",
                        enabled: true,
                        options: {
                          altBoundary: true,
                          altAxis: true,
                          tether: false,
                        },
                      },
                      {
                        name: "flip",
                        enabled: true,
                        options: {
                          altBoundary: true,
                          fallbackPlacements: isRTL ? ["bottom-start", "top-end"] : ["bottom-end", "top-start"],
                        },
                      },
                    ]}
                  />
                )}
              </div>
            </Col>
            <Col md={4}>
              <Form.Label className="fw-semibold">Transaction Type</Form.Label>
              <Form.Select 
                value={filterType} 
                onChange={(e) => {
                  if (isMountedRef.current) {
                    setFilterType(e.target.value);
                  }
                }}
              >
                {types.map((t, i) => (
                  <option key={`type-${i}`} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Button
                type="button"
                variant=""
                style={{
                  backgroundColor: "#27b2b6",
                  borderColor: "#27b2b6",
                  color: "white",
                  width: "100%",
                }}
                className="py-2"
                onClick={() => {
                  if (!isMountedRef.current) return;
                  const controller = new AbortController();
                  fetchVatReport(controller.signal);
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" />
                    Loading...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </Col>
          </Row>
        </div>

        {/* 📊 VAT Table */}
        <Card className="rounded-4 p-4 border-0">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <h5 className="fw-bold mb-2 mb-md-0">VAT Summary</h5>
            <div className="d-flex gap-2">
              <Button type="button" variant="outline-danger" size="sm"><FaFilePdf /></Button>
              <Button type="button" variant="outline-success" size="sm"><FaFileExcel /></Button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" key="error-alert">
              {error}
            </div>
          )}

          <div className="table-responsive">
            <Table hover responsive className="border-2text-nowrap mb-0 align-middle">
              <thead className="text-dark fw-semibold">
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Taxable Amount</th>
                  <th>VAT Rate (%)</th>
                  <th>VAT Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr key="loading-row">
                    <td colSpan="5" className="text-center py-3">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Loading VAT data...
                    </td>
                  </tr>
                )}
                {!loading && filteredRows && filteredRows.length > 0 && filteredRows.map((row, idx) => (
                  <tr key={`vat-row-${row.type || 'unknown'}-${idx}-${row.description || ''}`}>
                    <td>{row.type || ''}</td>
                    <td>{row.description || ''}</td>
                    <td>
                      {symbol} {convertPrice(row.taxableAmount || 0)}
                    </td>
                    <td>
                      {parseFloat(row.vatRate || 0).toFixed(2)}%
                    </td>
                    <td>
                      {symbol} {convertPrice(row.vatAmount || 0)}
                    </td>
                  </tr>
                ))}
                {!loading && (!filteredRows || filteredRows.length === 0) && (
                  <tr key="no-data-row">
                    <td colSpan="5" className="text-center text-muted py-3">
                      No VAT records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>

        {/* Page Info */}
        <Card className="mb-4 p-3 shadow rounded-4 mt-2">
          <Card.Body>
            <h5 className="fw-semibold border-bottom pb-2 mb-3 text-primary">Page Info</h5>
            <ul className="text-muted fs-6 mb-0" style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
              <li>VAT (Value Added Tax) is an indirect tax applied on the sale of goods and services.</li>
              <li>It is charged at every stage of the supply chain — from manufacturer to retailer.</li>
              <li>The final consumer ultimately bears the VAT cost while businesses collect and remit it.</li>
            </ul>
          </Card.Body>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default VatReport;
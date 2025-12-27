import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Container, Card, Button, Table, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import { FaBook, FaFile, FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';
import './JournalEntries.css';

// Hardcoded account map (replace with real API fetch if needed)
const ACCOUNT_NAME_TO_ID = {
  'Cash': 39,
  'Bank': 40,
  'Sales': 31,
  'Purchase': 32,
  'Salary Expense': 33,
  'Rent Expense': 34,
  'Accounts Receivable': 35,
  'Accounts Payable': 36,
};

const ACCOUNT_ID_TO_NAME = Object.fromEntries(
  Object.entries(ACCOUNT_NAME_TO_ID).map(([name, id]) => [id, name])
);

function JournalEntries() {
  const companyId = GetCompanyId();

  // Form states
  const [voucherNo, setVoucherNo] = useState(''); // auto-assigned by backend
  const [manualVoucherNo, setManualVoucherNo] = useState('');
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState([]);
  const [narration, setNarration] = useState('');
  const [document, setDocument] = useState(null);

  // UI states
  const [allJournalEntries, setAllJournalEntries] = useState([]);
  const [viewJournal, setViewJournal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [journalToUpdate, setJournalToUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    autoVoucherNo: '',
    manualVoucherNo: '',
    minDebit: '',
    minCredit: ''
  });

  // Fetch all journal entries on mount
  useEffect(() => {
    fetchJournalEntries();
  }, [companyId]);

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`journals/${companyId}/journal-entries`);
      if (res.data.success && Array.isArray(res.data.data)) {
        setAllJournalEntries(res.data.data.map(je => ({
          ...je,
          voucherNo: je.voucher_no_auto,
          manualVoucherNo: je.manual_voucher_no,
          voucherDate: je.voucher_date.split('T')[0],
          totals: {
            totalDebit: parseFloat(je.total_debit).toFixed(2),
            totalCredit: parseFloat(je.total_credit).toFixed(2)
          },
          entries: je.lines.map(line => ({
            id: line.id,
            accountName: ACCOUNT_ID_TO_NAME[line.account_id] || `Account #${line.account_id}`,
            debitAmount: parseFloat(line.debit_amount) > 0 ? parseFloat(line.debit_amount).toFixed(2) : '',
            creditAmount: parseFloat(line.credit_amount) > 0 ? parseFloat(line.credit_amount).toFixed(2) : '',
            narrationText: line.narration || ''
          })),
          document: je.attachments.length > 0 ? je.attachments[0].file_name : null,
          fileUrl: je.attachments.length > 0 ? je.attachments[0].file_url : null,
          timestamp: new Date(je.created_at).toLocaleString()
        })));
      }
    } catch (err) {
      toast.error('Failed to load journal entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSelect = (e) => {
    const selectedName = e.target.value;
    if (!selectedName || !ACCOUNT_NAME_TO_ID[selectedName]) return;

    const newEntry = {
      id: Date.now(), // temporary local ID
      accountName: selectedName,
      debitAmount: '',
      creditAmount: '',
      narrationText: ''
    };
    setEntries([...entries, newEntry]);
    e.target.value = '';
  };

  const updateEntryField = (id, field, value) => {
    setEntries(entries.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value };
        if (field === 'debitAmount' && value) updated.creditAmount = '';
        if (field === 'creditAmount' && value) updated.debitAmount = '';
        return updated;
      }
      return entry;
    }));
  };

  const removeEntry = (id) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const calculateTotals = () => {
    const totalDebit = entries.reduce((sum, e) => sum + (parseFloat(e.debitAmount) || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + (parseFloat(e.creditAmount) || 0), 0);
    return {
      totalDebit: totalDebit.toFixed(2),
      totalCredit: totalCredit.toFixed(2)
    };
  };

  const handleDocumentUpload = (e) => {
    setDocument(e.target.files[0]);
  };

  const resetForm = () => {
    setVoucherNo('');
    setManualVoucherNo('');
    setVoucherDate(new Date().toISOString().split('T')[0]);
    setEntries([]);
    setNarration('');
    setDocument(null);
    setIsUpdateMode(false);
    setJournalToUpdate(null);
  };

  const preparePayload = () => {
    const totals = calculateTotals();
    const payload = {
      manual_voucher_no: manualVoucherNo || null,
      voucher_date: voucherDate,
      narration: narration || null,
      total_debit: totals.totalDebit,
      total_credit: totals.totalCredit,
      lines: entries.map((entry, idx) => ({
        account_id: ACCOUNT_NAME_TO_ID[entry.accountName],
        seq: idx + 1,
        debit_amount: entry.debitAmount || "0.00",
        credit_amount: entry.creditAmount || "0.00",
        narration: entry.narrationText || null
      }))
    };
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const totals = calculateTotals();
    if (parseFloat(totals.totalDebit) !== parseFloat(totals.totalCredit)) {
      toast.error('Total Debit must equal Total Credit');
      return;
    }

    const formData = new FormData();
    const payload = preparePayload();

    // Append JSON payload as string
    formData.append('data', JSON.stringify(payload));

    // Append file if exists
    if (document) {
      formData.append('attachments', document);
    }

    try {
      setLoading(true);
      let res;
      if (isUpdateMode && journalToUpdate) {
        res = await axiosInstance.put(
          `journals/${companyId}/journal-entries/${journalToUpdate.id}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
        toast.success('Journal Entry Updated');
      } else {
        res = await axiosInstance.post(
          `journals/${companyId}/journal-entries`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
        toast.success('Journal Entry Created');
      }

      await fetchJournalEntries(); // Refresh list
      setShowModal(false);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (journal) => {
    setJournalToUpdate(journal);
    setIsUpdateMode(true);
    setShowModal(true);
    setVoucherNo(journal.voucherNo);
    setManualVoucherNo(journal.manualVoucherNo || '');
    setVoucherDate(journal.voucherDate);
    setEntries([...journal.entries]);
    setNarration(journal.narration || '');
    setDocument(journal.document ? { name: journal.document } : null);
  };

  const handleDelete = (journal) => {
    setJournalToDelete(journal);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`journals/${companyId}/journal-entries/${journalToDelete.id}`);
      toast.success('Journal Entry Deleted');
      await fetchJournalEntries();
      setShowDeleteModal(false);
      setJournalToDelete(null);
    } catch (err) {
      toast.error('Failed to delete journal entry');
      console.error(err);
      setLoading(false);
    }
  };

  // Filter logic
  const filteredJournalEntries = allJournalEntries.filter(journal => {
    const jDate = new Date(journal.voucherDate);
    const from = filters.fromDate ? new Date(filters.fromDate) : null;
    const to = filters.toDate ? new Date(filters.toDate) : null;

    if (from && jDate < from) return false;
    if (to && jDate > to) return false;
    if (filters.autoVoucherNo && !journal.voucherNo.toLowerCase().includes(filters.autoVoucherNo.toLowerCase())) return false;
    if (filters.manualVoucherNo && journal.manualVoucherNo && !journal.manualVoucherNo.toLowerCase().includes(filters.manualVoucherNo.toLowerCase())) return false;
    if (filters.minDebit && parseFloat(journal.totals.totalDebit) < parseFloat(filters.minDebit)) return false;
    if (filters.minCredit && parseFloat(journal.totals.totalCredit) < parseFloat(filters.minCredit)) return false;
    return true;
  });

  const totals = calculateTotals();

  const accountOptions = Object.keys(ACCOUNT_NAME_TO_ID);

  return (
    <Container fluid className="journal-entries-container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
        <div>
          <h4 className="journal-entries-title">
            <FaBook className="me-2" />
            Journal Entries
          </h4>
          <p className="journal-entries-subtitle mb-0">Manage and track your journal entries</p>
        </div>
        <Button
          className="btn-add-entry"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          disabled={loading}
        >
          <FaPlus className="me-2" />
          Add Journal Entry
        </Button>
      </div>

      {/* Filters */}
      <Card className="filter-card">
        <Card.Body>
          <h5 className="mb-3" style={{ color: '#505ece', fontWeight: 600 }}>Filter Journal Entries</h5>
          <Row className="g-3">
            <Col md={2}>
              <Form.Label className="filter-label">From Date</Form.Label>
              <Form.Control
                type="date"
                className="filter-input"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="filter-label">To Date</Form.Label>
              <Form.Control
                type="date"
                className="filter-input"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="filter-label">Auto Voucher No</Form.Label>
              <Form.Control
                type="text"
                className="filter-input"
                value={filters.autoVoucherNo}
                onChange={(e) => setFilters({ ...filters, autoVoucherNo: e.target.value })}
                placeholder="Filter by voucher no"
              />
            </Col>
            <Col md={2}>
              <Form.Label className="filter-label">Manual Voucher No</Form.Label>
              <Form.Control
                type="text"
                className="filter-input"
                value={filters.manualVoucherNo}
                onChange={(e) => setFilters({ ...filters, manualVoucherNo: e.target.value })}
                placeholder="Filter by manual no"
              />
            </Col>
            <Col md={2}>
              <Form.Label className="filter-label">Min Debit</Form.Label>
              <Form.Control
                type="number"
                className="filter-input"
                value={filters.minDebit}
                onChange={(e) => setFilters({ ...filters, minDebit: e.target.value })}
                placeholder="Min debit"
              />
            </Col>
            <Col md={2}>
              <Form.Label className="filter-label">Min Credit</Form.Label>
              <Form.Control
                type="number"
                className="filter-input"
                value={filters.minCredit}
                onChange={(e) => setFilters({ ...filters, minCredit: e.target.value })}
                placeholder="Min credit"
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="journal-entries-table-card">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" className="spinner-custom" />
              <p className="mt-3">Loading journal entries...</p>
            </div>
          ) : filteredJournalEntries.length === 0 ? (
            <div className="text-center py-5 empty-state">
              <FaFile style={{ fontSize: "3rem", color: "#adb5bd", marginBottom: "1rem" }} />
              <p className="text-muted mb-0">No journal entries found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="journal-entries-table" hover responsive="sm">
                <thead className="table-header">
                  <tr>
                    <th>Auto Voucher No</th>
                    <th>Manual Voucher No</th>
                    <th>Date</th>
                    <th>Total Debit</th>
                    <th>Total Credit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJournalEntries.map(journal => (
                    <tr key={journal.id}>
                      <td><strong>{journal.voucherNo}</strong></td>
                      <td>{journal.manualVoucherNo || '-'}</td>
                      <td>{journal.voucherDate}</td>
                      <td className="amount-cell">₹{journal.totals.totalDebit}</td>
                      <td className="amount-cell">₹{journal.totals.totalCredit}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            className="btn-action btn-view"
                            onClick={() => setViewJournal(journal)}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          <Button
                            className="btn-action btn-edit"
                            onClick={() => handleUpdate(journal)}
                            title="Update"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(journal)}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="journal-entries-modal">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>{isUpdateMode ? 'Update Journal Entry' : 'New Journal Entry'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Row className="mb-3">
            <Col md={4}>
              <Form.Label className="modal-form-label">Voucher No (Auto)</Form.Label>
              <Form.Control type="text" className="modal-form-control" value={voucherNo} readOnly />
            </Col>
            <Col md={4}>
              <Form.Label className="modal-form-label">Voucher No (Manual)</Form.Label>
              <Form.Control type="text" className="modal-form-control" value={manualVoucherNo} onChange={e => setManualVoucherNo(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label className="modal-form-label">Voucher Date</Form.Label>
              <Form.Control type="date" className="modal-form-control" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label className="modal-form-label">Select Account</Form.Label>
              <Form.Select className="modal-form-control" onChange={handleAccountSelect}>
                <option value="">-- Select an Account --</option>
                {accountOptions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <div className="table-responsive mb-3">
            <Table className="modal-table" bordered>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Debit Amount</th>
                  <th>Credit Amount</th>
                  <th>Narration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.length > 0 ? (
                  entries.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.accountName}</td>
                      <td>
                        <Form.Control type="number" step="0.01" min="0" className="modal-form-control"
                          value={entry.debitAmount} onChange={e => updateEntryField(entry.id, 'debitAmount', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control type="number" step="0.01" min="0" className="modal-form-control"
                          value={entry.creditAmount} onChange={e => updateEntryField(entry.id, 'creditAmount', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control as="textarea" rows={1} className="modal-form-control" value={entry.narrationText || ''}
                          onChange={e => updateEntryField(entry.id, 'narrationText', e.target.value)} />
                      </td>
                      <td>
                        <Button className="btn-remove-entry" size="sm" onClick={() => removeEntry(entry.id)}>Remove</Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center">No entries added yet.</td></tr>
                )}
                <tr className="table-active">
                  <td><strong>Total</strong></td>
                  <td><strong>₹{totals.totalDebit}</strong></td>
                  <td><strong>₹{totals.totalCredit}</strong></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </div>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label className="modal-form-label">Narration</Form.Label>
              <Form.Control as="textarea" rows={3} className="modal-form-control" value={narration} onChange={e => setNarration(e.target.value)} />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label className="modal-form-label">Upload Document</Form.Label>
              <Form.Control type="file" className="modal-form-control" onChange={handleDocumentUpload} />
              {document && <div className="mt-2 text-success">Selected: {document.name}</div>}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-close" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button className="btn-modal-save" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                {isUpdateMode ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              isUpdateMode ? 'Update' : 'Submit'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Modal */}
      <Modal show={!!viewJournal} onHide={() => setViewJournal(null)} size="lg" className="journal-entries-modal">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Journal Entry Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          {viewJournal && (
            <>
              <Row className="mb-3">
                <Col md={4}><strong>Auto Voucher No:</strong> {viewJournal.voucherNo}</Col>
                <Col md={4}><strong>Manual Voucher No:</strong> {viewJournal.manualVoucherNo || '-'}</Col>
                <Col md={4}><strong>Date:</strong> {viewJournal.voucherDate}</Col>
              </Row>

              <div className="table-responsive mb-4">
                <Table className="modal-table" bordered>
                  <thead>
                    <tr>
                      <th>Account</th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th>Narration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewJournal.entries.map((e, i) => (
                      <tr key={i}>
                        <td>{e.accountName}</td>
                        <td>₹{e.debitAmount || '0.00'}</td>
                        <td>₹{e.creditAmount || '0.00'}</td>
                        <td>{e.narrationText || '-'}</td>
                      </tr>
                    ))}
                    <tr className="table-active">
                      <td><strong>Total</strong></td>
                      <td><strong>₹{viewJournal.totals.totalDebit}</strong></td>
                      <td><strong>₹{viewJournal.totals.totalCredit}</strong></td>
                      <td></td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              {viewJournal.narration && (
                <p><strong>Narration:</strong> {viewJournal.narration}</p>
              )}

              {viewJournal.fileUrl && (
                <div>
                  <strong>Attachment:</strong>
                  <br />
                  <a href={viewJournal.fileUrl} target="_blank" rel="noopener noreferrer">{viewJournal.document}</a>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-close" onClick={() => setViewJournal(null)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} className="journal-entries-modal">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <p>Are you sure you want to delete journal entry <strong>{journalToDelete?.voucherNo}</strong>?</p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          <Button className="btn-modal-close" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button className="btn-modal-danger" onClick={confirmDelete} disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default JournalEntries;
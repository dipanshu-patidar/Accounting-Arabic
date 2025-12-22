import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

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
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-dark">Journal Entries</h3>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          style={{ backgroundColor: "#53b2a5", border: "none", padding: "8px 16px" }}
          disabled={loading}
        >
          + Add Journal Entry
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-2">
        <div className="card-body">
          <h5>Filter Journal Entries</h5>
          <div className="row g-3">
            {['fromDate', 'toDate', 'autoVoucherNo', 'manualVoucherNo', 'minDebit', 'minCredit'].map(key => (
              <div className="col-md-2" key={key}>
                <label>{key.split(/(?=[A-Z])/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</label>
                <input
                  type={key.includes('Date') ? 'date' : key.includes('min') ? 'number' : 'text'}
                  className="form-control"
                  value={filters[key]}
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                  placeholder={`Filter by ${key}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : filteredJournalEntries.length === 0 ? (
            <p className="text-center text-muted">No journal entries found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <thead className="thead-light">
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
                      <td>{journal.voucherNo}</td>
                      <td>{journal.manualVoucherNo || '-'}</td>
                      <td>{journal.voucherDate}</td>
                      <td>₹{journal.totals.totalDebit}</td>
                      <td>₹{journal.totals.totalCredit}</td>
                      <td>
                        <div className="btn-group gap-2"role="group">
                          <button
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "#53b2a5", borderColor: "#53b2a5", color: "white", width: "36px", height: "36px" }}
                            onClick={() => setViewJournal(journal)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "#ffc107", borderColor: "#ffc107", color: "white", width: "36px", height: "36px" }}
                            onClick={() => handleUpdate(journal)}
                            title="Update"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm d-flex align-items-center justify-content-center"
                            style={{ backgroundColor: "#dc3545", borderColor: "#dc3545", color: "white", width: "36px", height: "36px" }}
                            onClick={() => handleDelete(journal)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Update Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isUpdateMode ? 'Update Journal Entry' : 'New Journal Entry'}</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="card">
                  <div className="card-body">
                    <div className="row mb-4">
                      <div className="col-md-4">
                        <label>Voucher No (Auto)</label>
                        <input type="text" className="form-control" value={voucherNo} readOnly />
                      </div>
                      <div className="col-md-4">
                        <label>Voucher No (Manual)</label>
                        <input type="text" className="form-control" value={manualVoucherNo} onChange={e => setManualVoucherNo(e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label>Voucher Date</label>
                        <input type="date" className="form-control" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} />
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-12">
                        <label>Select Account</label>
                        <select className="form-control" onChange={handleAccountSelect}>
                          <option value="">-- Select an Account --</option>
                          {accountOptions.map(name => (
                            <option key={name} value={name}>{name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-bordered table-striped">
                        <thead className="thead-light">
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
                                  <input type="number" step="0.01" min="0" className="form-control"
                                    value={entry.debitAmount} onChange={e => updateEntryField(entry.id, 'debitAmount', e.target.value)} />
                                </td>
                                <td>
                                  <input type="number" step="0.01" min="0" className="form-control"
                                    value={entry.creditAmount} onChange={e => updateEntryField(entry.id, 'creditAmount', e.target.value)} />
                                </td>
                                <td>
                                  <textarea className="form-control" rows="1" value={entry.narrationText || ''}
                                    onChange={e => updateEntryField(entry.id, 'narrationText', e.target.value)} />
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-danger" onClick={() => removeEntry(entry.id)}>Remove</button>
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
                      </table>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-12">
                        <label>Narration</label>
                        <textarea className="form-control" rows="3" value={narration} onChange={e => setNarration(e.target.value)} />
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-12">
                        <label>Upload Document</label>
                        <input type="file" className="form-control-file" onChange={handleDocumentUpload} />
                        {document && <div className="mt-2 text-success">Selected: {document.name}</div>}
                      </div>
                    </div>

                    <div className="d-flex justify-content-end">
                      <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
                        {isUpdateMode ? 'Update' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewJournal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Journal Entry Details</h5>
                <button className="close" onClick={() => setViewJournal(null)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-4"><strong>Auto Voucher No:</strong> {viewJournal.voucherNo}</div>
                  <div className="col-md-4"><strong>Manual Voucher No:</strong> {viewJournal.manualVoucherNo || '-'}</div>
                  <div className="col-md-4"><strong>Date:</strong> {viewJournal.voucherDate}</div>
                </div>

                <div className="table-responsive mb-4">
                  <table className="table table-bordered">
                    <thead><tr><th>Account</th><th>Debit</th><th>Credit</th><th>Narration</th></tr></thead>
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
                  </table>
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

                <div className="mt-3">
                  <button className="btn btn-secondary" onClick={() => setViewJournal(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Confirm Delete</h5>
                <button className="close" onClick={() => setShowDeleteModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete journal entry <strong>{journalToDelete?.voucherNo}</strong>?</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={loading}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JournalEntries;
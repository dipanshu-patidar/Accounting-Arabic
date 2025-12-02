import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Card, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import GetCompanyId from '../../../Api/GetCompanyId';
import axiosInstance from '../../../Api/axiosInstance';

const LedgerPageAccount = () => {
  const companyId = GetCompanyId();
  const location = useLocation();
  const navigate = useNavigate();

  // Expect accountName, accountType, and accountId from route state
  const { accountName, accountType, accountId } = location.state || {};

  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accountId || !companyId) {
      setError('Missing account or company ID');
      setLoading(false);
      return;
    }

    const fetchLedger = async () => {
      try {
        const response = await axiosInstance.get(`account/ledger/${companyId}/${accountId}`);
        if (response.data.success) {
          setLedgerData(response.data);
        } else {
          setError('Failed to load ledger data');
        }
      } catch (err) {
        console.error('API Error:', err);
        setError('Network or server error');
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [companyId, accountId]);

  // Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading ledger...</p>
      </Container>
    );
  }

  // Error state
  if (error || !accountName || !accountType) {
    return (
      <Container className="py-4">
        <Card className="p-4 text-center">
          <h5 className="text-danger">Error</h5>
          <p>{error || 'Invalid account data. Please go back and try again.'}</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </Card>
      </Container>
    );
  }

  const { opening_balance, closing_balance, ledger } = ledgerData;

  return (
    <Container fluid className="py-4">
      {/* Back Button */}
      <div className="mb-3">
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="p-0 d-flex align-items-center gap-1"
        >
          <FaArrowLeft /> Back
        </Button>
      </div>

      {/* Page Header */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4 className="fw-bold">{accountName}</h4>
          <p className="text-muted mb-0">
            <strong>Account Type:</strong> {accountType}
          </p>
        </Card.Body>
      </Card>

      {/* Ledger Table */}
      <Card>
        <Table striped hover className="mb-0 text-center align-middle">
          <thead className="table-light">
            <tr>
              <th>DATE</th>
              <th>PARTICULARS</th>
              <th>VCH NO</th>
              <th>REF NO</th>
              <th>VCH TYPE</th>
              <th>DEBIT</th>
              <th>CREDIT</th>
              <th>RUNNING BALANCE</th>
            </tr>
          </thead>
          <tbody>
            {/* Opening Balance */}
            <tr className='table-secondary'>
              <td colSpan="5" className="text-end fw-bold">Opening Balance</td>
              <td></td>
              <td></td>
              <td className="text-end fw-bold">
                KWD-{parseFloat(opening_balance).toFixed(2)}
              </td>
            </tr>

            {/* Transactions */}
            {ledger.map((tx, index) => (
              <tr key={index}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td className="text-start">{tx.particulars}</td>
                <td>{tx.vch_no}</td>
                <td>{tx.ref_no}</td>
                <td>{tx.vch_type}</td>
                <td className="text-end">
                  {tx.debit > 0 ? `KWD${parseFloat(tx.debit).toFixed(2)}` : ''}
                </td>
                <td className="text-end">
                  {tx.credit > 0 ? `KWD${parseFloat(tx.credit).toFixed(2)}` : ''}
                </td>
                <td className="text-end">KWD{parseFloat(tx.running_balance).toFixed(2)}</td>
              </tr>
            ))}

            {/* Closing Balance */}
            <tr className="table-secondary fw-bold">
              <td colSpan="5" className="text-end">Closing Balance</td>
              <td></td>
              <td></td>
              <td className="text-end">
                KWD{parseFloat(closing_balance).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default LedgerPageAccount;
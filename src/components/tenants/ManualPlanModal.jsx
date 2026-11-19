import React, { useState } from 'react';
import { CreditCard, X, Check, Building2, Calendar, FileText } from 'lucide-react';
import { api } from '../../services/api';

export default function ManualPlanModal({ tenant, onClose, onSuccess }) {
  const [plan, setPlan] = useState('growth');
  const [durationMonths, setDurationMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post(`/platform/subscriptions/${tenant._id}/manual`, {
        plan,
        durationMonths: Number(durationMonths),
        paymentMethod,
        referenceNumber,
        notes,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.error || 'Failed to activate plan');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-panel" style={{ maxWidth: '480px', width: '90%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Activate Store Plan</h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Record offline/manual payment (Bank Transfer, JazzCash, Easypaisa) and grant active access to <strong style={{ color: '#fff' }}>{tenant.name}</strong>.
        </p>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.8rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Plan Selection */}
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Target Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}
            >
              <option value="starter">Starter Plan (150 products, 5 categories)</option>
              <option value="growth">Growth Plan (500 products, 15 categories)</option>
              <option value="pro">Pro Plan (Unlimited products & categories)</option>
              <option value="enterprise">Enterprise Tier</option>
              <option value="lifetime">Lifetime Deal</option>
            </select>
          </div>

          {/* Duration in Months */}
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Duration</label>
            <select
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}
            >
              <option value="1">1 Month</option>
              <option value="3">3 Months</option>
              <option value="6">6 Months (Half Year)</option>
              <option value="12">12 Months (1 Year)</option>
            </select>
          </div>

          {/* Payment Method */}
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Payment Channel</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}
            >
              <option value="bank_transfer">Direct Bank Transfer (Meezan / HBL / UBL)</option>
              <option value="jazzcash">JazzCash</option>
              <option value="easypaisa">Easypaisa</option>
              <option value="other">Cash / Other</option>
            </select>
          </div>

          {/* Reference / Transaction ID */}
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
              Transaction Reference / TID
            </label>
            <input
              type="text"
              placeholder="e.g. TID-982347102 or Bank Deposit Slip #"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="form-input"
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}
            />
          </div>

          {/* Internal Notes */}
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>Notes (Optional)</label>
            <textarea
              placeholder="e.g. Verified by Nouman via bank statement"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              rows={2}
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ gap: '6px' }}>
              <Check size={14} />
              <span>{loading ? 'Activating...' : 'Confirm & Activate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

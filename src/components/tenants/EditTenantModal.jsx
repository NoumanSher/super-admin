import React, { useState, useEffect } from 'react';
import { Store, Save, X, ShieldAlert, Loader2, Key, Globe, Mail, Database, UserCog, Plus, Trash2, Star } from 'lucide-react';
import { api } from '../../services/api';

export default function EditTenantModal({ tenant, onClose, onSaveSuccess }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingOwner, setSavingOwner] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ─── Domain Management State ───────────────────────────────────────────────
  const [domainsList, setDomainsList] = useState([]);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newDomainType, setNewDomainType] = useState('custom');
  const [domainInputError, setDomainInputError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    plan: 'trial',

    // Stripe
    stripePublishable: '',
    stripeSecret: '',
    stripeWebhook: '',

    // Cloudinary Account #1 — Product Images
    cloudinaryMerchantName: '',
    cloudinaryMerchantApiKey: '',
    cloudinaryMerchantApiSecret: '',

    // Cloudinary Account #2 — Review Images
    cloudinaryCustomerName: '',
    cloudinaryCustomerApiKey: '',
    cloudinaryCustomerApiSecret: '',

    // Google OAuth
    googleClientId: '',
    googleClientSecret: '',
    googleCallbackUrl: '',

    // LinkedIn OAuth
    linkedinApiKey: '',
    linkedinSecretKey: '',
    linkedinCallbackUrl: '',

    // Email
    emailService: 'gmail',
    emailUser: '',
    emailPass: '',
    emailSenderName: '',

    // CORS
    corsOrigins: '',

    // Frontend URLs
    frontendUrl: '',
    merchantPanelUrl: '',
  });

  // Owner credentials (separate from main config)
  const [currentOwnerEmail, setCurrentOwnerEmail] = useState('');
  const [currentOwnerName, setCurrentOwnerName] = useState('');
  const [ownerData, setOwnerData] = useState({
    newName: '',
    newEmail: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load full tenant details on mount
  useEffect(() => {
    const loadTenantDetails = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/platform/tenants/${tenant._id}`);
        if (data.success && data.tenant) {
          const t = data.tenant;

          // Initialize domains list from fetched data
          setDomainsList(
            (t.domains || []).map(d => ({
              domain: d.domain,
              type: d.type || 'custom',
              isPrimary: d.isPrimary || false,
              sslEnabled: d.sslEnabled !== false,
            }))
          );

          setFormData({
            name: t.name || '',
            plan: t.subscription?.plan || 'trial',

            stripePublishable: t.config?.stripe?.publishableKey || '',
            stripeSecret: '',
            stripeWebhook: '',

            cloudinaryMerchantName: t.config?.cloudinary?.merchantAccount?.cloudName || '',
            cloudinaryMerchantApiKey: t.config?.cloudinary?.merchantAccount?.apiKey || '',
            cloudinaryMerchantApiSecret: '',

            cloudinaryCustomerName: t.config?.cloudinary?.customerAccount?.cloudName || '',
            cloudinaryCustomerApiKey: t.config?.cloudinary?.customerAccount?.apiKey || '',
            cloudinaryCustomerApiSecret: '',

            googleClientId: t.config?.oauth?.google?.clientId || '',
            googleClientSecret: '',
            googleCallbackUrl: t.config?.oauth?.google?.callbackUrl || '',

            linkedinApiKey: t.config?.oauth?.linkedin?.apiKey || '',
            linkedinSecretKey: '',
            linkedinCallbackUrl: t.config?.oauth?.linkedin?.callbackUrl || '',

            emailService: t.config?.email?.service || 'gmail',
            emailUser: t.config?.email?.user || '',
            emailPass: '',
            emailSenderName: t.config?.email?.senderName || '',

            corsOrigins: t.config?.cors?.allowedOrigins?.join(', ') || '',
            frontendUrl: t.config?.frontendUrl || '',
            merchantPanelUrl: t.config?.merchantPanelUrl || '',
          });

          setCurrentOwnerEmail(t.owner?.email || '');
          setCurrentOwnerName(t.owner?.name || '');
        }
      } catch (err) {
        console.warn('Failed to load tenant details:', err);
        // Fallback to basic tenant data
        setDomainsList(
          (tenant.domains || []).map(d => ({
            domain: d.domain,
            type: d.type || 'custom',
            isPrimary: d.isPrimary || false,
            sslEnabled: d.sslEnabled !== false,
          }))
        );
        setFormData(prev => ({
          ...prev,
          name: tenant.name || '',
          plan: tenant.subscription?.plan || 'trial',
        }));
      } finally {
        setLoading(false);
      }
    };

    loadTenantDetails();
  }, [tenant._id]);

  // ─── Domain Management Handlers ───────────────────────────────────────────

  const handleAddDomain = () => {
    const trimmed = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!trimmed) {
      setDomainInputError('Domain hostname cannot be empty.');
      return;
    }
    if (domainsList.some(d => d.domain === trimmed)) {
      setDomainInputError('This domain is already in the list.');
      return;
    }
    setDomainInputError('');
    const noPrimary = domainsList.length === 0;
    setDomainsList(prev => [
      ...prev,
      { domain: trimmed, type: newDomainType, isPrimary: noPrimary, sslEnabled: true },
    ]);
    setNewDomainInput('');
    setNewDomainType('custom');
  };

  const handleDeleteDomain = (index) => {
    const deleted = domainsList[index];
    const updated = domainsList.filter((_, i) => i !== index);
    // If we deleted the primary and there are still domains left, make the first one primary
    if (deleted.isPrimary && updated.length > 0) {
      updated[0] = { ...updated[0], isPrimary: true };
    }
    setDomainsList(updated);
  };

  const handleSetPrimary = (index) => {
    setDomainsList(prev =>
      prev.map((d, i) => ({ ...d, isPrimary: i === index }))
    );
  };

  const handleDomainTypeChange = (index, newType) => {
    setDomainsList(prev =>
      prev.map((d, i) => i === index ? { ...d, type: newType } : d)
    );
  };

  // ─── General Form Handlers ────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleOwnerSave = async () => {
    if (!ownerData.newName.trim() && !ownerData.newEmail && !ownerData.newPassword) {
      setError('Provide a new name, email, or password to update owner credentials.');
      return;
    }
    if (ownerData.newPassword && ownerData.newPassword !== ownerData.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (ownerData.newPassword && ownerData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSavingOwner(true);
    setError('');
    setSuccess('');

    const payload = {};
    if (ownerData.newName.trim()) payload.name = ownerData.newName.trim();
    if (ownerData.newEmail.trim()) payload.email = ownerData.newEmail.trim();
    if (ownerData.newPassword) payload.password = ownerData.newPassword;

    try {
      const res = await api.put(`/platform/tenants/${tenant._id}/owner`, payload);
      if (res.success) {
        setSuccess(res.message || 'Owner credentials updated!');
        if (payload.email) setCurrentOwnerEmail(payload.email.toLowerCase());
        if (payload.name) setCurrentOwnerName(payload.name);
        setOwnerData({ newName: '', newEmail: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setError(err.message || 'Failed to update owner credentials.');
    } finally {
      setSavingOwner(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Store name is required');
      return;
    }
    if (domainsList.length === 0) {
      setError('At least one domain is required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const updates = {
      name: formData.name,
      // Always send the full domains array from state
      domains: domainsList,
    };

    // Only send subscription if the plan actually changed, preventing unneeded subdocument casting
    if (formData.plan && formData.plan !== tenant.subscription?.plan) {
      updates.subscription = { plan: formData.plan };
    }

    const config = {};

    if (formData.stripePublishable || formData.stripeSecret || formData.stripeWebhook) {
      config.stripe = {};
      if (formData.stripePublishable) config.stripe.publishableKey = formData.stripePublishable;
      if (formData.stripeSecret) config.stripe.secretKey = formData.stripeSecret;
      if (formData.stripeWebhook) config.stripe.webhookSecret = formData.stripeWebhook;
    }

    const hasMerchant = formData.cloudinaryMerchantName && formData.cloudinaryMerchantApiKey;
    const hasCustomer = formData.cloudinaryCustomerName && formData.cloudinaryCustomerApiKey;
    if (hasMerchant || hasCustomer) {
      config.cloudinary = {};
      if (hasMerchant) {
        config.cloudinary.merchantAccount = {
          cloudName: formData.cloudinaryMerchantName,
          apiKey: formData.cloudinaryMerchantApiKey,
          ...(formData.cloudinaryMerchantApiSecret ? { apiSecret: formData.cloudinaryMerchantApiSecret } : {}),
        };
      }
      if (hasCustomer) {
        config.cloudinary.customerAccount = {
          cloudName: formData.cloudinaryCustomerName,
          apiKey: formData.cloudinaryCustomerApiKey,
          ...(formData.cloudinaryCustomerApiSecret ? { apiSecret: formData.cloudinaryCustomerApiSecret } : {}),
        };
      }
    }

    if (formData.googleClientId || formData.linkedinApiKey) {
      config.oauth = {};
      if (formData.googleClientId) {
        config.oauth.google = {
          clientId: formData.googleClientId,
          ...(formData.googleClientSecret ? { clientSecret: formData.googleClientSecret } : {}),
          callbackUrl: formData.googleCallbackUrl,
        };
      }
      if (formData.linkedinApiKey) {
        config.oauth.linkedin = {
          apiKey: formData.linkedinApiKey,
          ...(formData.linkedinSecretKey ? { secretKey: formData.linkedinSecretKey } : {}),
          callbackUrl: formData.linkedinCallbackUrl,
        };
      }
    }

    if (formData.emailUser) {
      config.email = {
        service: formData.emailService,
        user: formData.emailUser,
        senderName: formData.emailSenderName,
      };
      if (formData.emailPass) config.email.pass = formData.emailPass;
    }

    if (formData.corsOrigins.trim()) {
      config.cors = {
        allowedOrigins: formData.corsOrigins.split(',').map(o => o.trim()).filter(Boolean),
      };
    }

    if (formData.frontendUrl) config.frontendUrl = formData.frontendUrl;
    if (formData.merchantPanelUrl) config.merchantPanelUrl = formData.merchantPanelUrl;

    if (Object.keys(config).length > 0) {
      updates.config = config;
    }

    try {
      const res = await api.put(`/platform/tenants/${tenant._id}`, updates);
      if (res.success) {
        setSuccess('Store updated successfully!');
        setTimeout(() => {
          onSaveSuccess?.();
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Failed to update store configuration');
    } finally {
      setSaving(false);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────

  const sectionStyle = {
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '16px',
    marginBottom: '16px',
  };

  const sectionTitleStyle = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#f3f4f6',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const sectionHintStyle = {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginBottom: '12px',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 16, 0.8)',
      backdropFilter: 'var(--glass-blur)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 100,
      animation: 'fadeInModal 0.25s ease-out'
    }}>
      <div className="glass-panel fade-in" style={{
        width: '100%',
        maxWidth: '700px',
        height: '100%',
        borderRadius: 0,
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(12, 15, 29, 0.95)',
        backdropFilter: 'var(--glass-blur-heavy)',
        padding: '32px 36px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={20} color="#818cf8" />
              Edit Store: <span style={{ color: '#818cf8' }}>{tenant.name}</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
              slug: <code style={{ color: '#c084fc', fontFamily: 'monospace' }}>{tenant.slug}</code> (read-only)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={14} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#6ee7b7',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.82rem',
          }}>
            ✓ {success}
          </div>
        )}

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
            Loading store configuration...
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px', maxHeight: 'calc(100vh - 200px)' }}>

              {/* ── Store Identity ───────────────────────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>
                  <Store size={14} color="#818cf8" />
                  Store Identity
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Store Name *</label>
                    <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SaaS Plan</label>
                    <select name="plan" className="form-input" value={formData.plan} onChange={handleChange} style={{ background: 'var(--bg-input)' }}>
                      <option value="trial">Trial</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Store Owner Credentials ──────────────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>
                  <UserCog size={14} color="#f59e0b" />
                  Store Owner Credentials
                </h4>
                <span style={sectionHintStyle}>Update the merchant owner's name, login email and/or password. Leave fields blank to keep current values.</span>
                <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Current Name: </span>
                    <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600 }}>{currentOwnerName || '—'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Current Login Email: </span>
                    <span style={{ fontSize: '0.82rem', color: '#818cf8', fontFamily: 'monospace' }}>{currentOwnerEmail || '—'}</span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">New Name</label>
                    <input type="text" name="newName" className="form-input" placeholder="Leave blank to keep current" value={ownerData.newName} onChange={handleOwnerChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Email</label>
                    <input type="email" name="newEmail" className="form-input" placeholder="Leave blank to keep current" value={ownerData.newEmail} onChange={handleOwnerChange} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" name="newPassword" className="form-input" placeholder="Min. 6 characters" value={ownerData.newPassword} onChange={handleOwnerChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" name="confirmPassword" className="form-input" placeholder="Re-enter password" value={ownerData.confirmPassword} onChange={handleOwnerChange} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOwnerSave}
                  disabled={savingOwner}
                  className="btn-secondary"
                  style={{ marginTop: '8px', padding: '6px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {savingOwner ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Updating...</>
                  ) : (
                    <><UserCog size={14} /> Update Owner Credentials</>
                  )}
                </button>
              </div>

              {/* ── Domain Management ────────────────────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>
                  <Globe size={14} color="#818cf8" />
                  Domain Management
                </h4>
                <span style={sectionHintStyle}>
                  Manage all domains routed to this store. The <strong style={{ color: '#fbbf24' }}>★ Primary</strong> domain is used for the storefront. Admin domains are prefixed with <code>admin.</code>
                </span>

                {/* Domain List Table */}
                {domainsList.length === 0 ? (
                  <div style={{
                    padding: '16px',
                    background: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '10px',
                    border: '1px dashed rgba(99, 102, 241, 0.2)',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    marginBottom: '14px',
                  }}>
                    No domains configured yet. Add a domain below.
                  </div>
                ) : (
                  <div style={{ marginBottom: '14px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                    {/* Table header */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 100px 90px 80px',
                      padding: '8px 12px',
                      background: 'rgba(99, 102, 241, 0.08)',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      <span>Hostname</span>
                      <span>Type</span>
                      <span style={{ textAlign: 'center' }}>Primary</span>
                      <span style={{ textAlign: 'center' }}>Delete</span>
                    </div>

                    {/* Domain rows */}
                    {domainsList.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 100px 90px 80px',
                          padding: '10px 12px',
                          alignItems: 'center',
                          borderBottom: i < domainsList.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          background: d.isPrimary ? 'rgba(251, 191, 36, 0.04)' : 'transparent',
                          transition: 'background 0.2s',
                        }}
                      >
                        {/* Hostname */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          {d.isPrimary && (
                            <Star size={13} color="#fbbf24" fill="#fbbf24" style={{ flexShrink: 0 }} />
                          )}
                          <code style={{
                            fontSize: '0.78rem',
                            color: d.isPrimary ? '#fde68a' : '#c4b5fd',
                            fontFamily: 'monospace',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {d.domain}
                          </code>
                        </div>

                        {/* Type selector */}
                        <select
                          value={d.type}
                          onChange={(e) => handleDomainTypeChange(i, e.target.value)}
                          style={{
                            background: 'var(--bg-input)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            color: '#e5e7eb',
                            padding: '3px 6px',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="custom">Custom</option>
                          <option value="subdomain">Subdomain</option>
                        </select>

                        {/* Make Primary button */}
                        <div style={{ textAlign: 'center' }}>
                          {d.isPrimary ? (
                            <span style={{
                              fontSize: '0.7rem',
                              color: '#fbbf24',
                              fontWeight: 600,
                              padding: '3px 8px',
                              background: 'rgba(251, 191, 36, 0.1)',
                              borderRadius: '12px',
                            }}>Primary</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(i)}
                              title="Set as primary domain"
                              style={{
                                background: 'rgba(251, 191, 36, 0.08)',
                                border: '1px solid rgba(251, 191, 36, 0.2)',
                                color: '#fbbf24',
                                borderRadius: '6px',
                                padding: '3px 8px',
                                cursor: 'pointer',
                                fontSize: '0.7rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Star size={11} /> Set
                            </button>
                          )}
                        </div>

                        {/* Delete button */}
                        <div style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteDomain(i)}
                            title="Remove this domain"
                            style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.18)',
                              color: '#f87171',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Domain Form */}
                <div style={{
                  padding: '14px',
                  background: 'rgba(99, 102, 241, 0.04)',
                  borderRadius: '10px',
                  border: '1px dashed rgba(99, 102, 241, 0.2)',
                }}>
                  <p style={{ fontSize: '0.76rem', fontWeight: 600, color: '#a5b4fc', marginBottom: '10px' }}>
                    + Add New Domain
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px auto', gap: '8px', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Hostname (no https://)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. watches.pakshipper.com"
                        value={newDomainInput}
                        onChange={(e) => { setNewDomainInput(e.target.value); setDomainInputError(''); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDomain(); } }}
                        style={{ fontSize: '0.82rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.72rem' }}>Type</label>
                      <select
                        className="form-input"
                        value={newDomainType}
                        onChange={(e) => setNewDomainType(e.target.value)}
                        style={{ background: 'var(--bg-input)', fontSize: '0.82rem' }}
                      >
                        <option value="custom">Custom</option>
                        <option value="subdomain">Subdomain</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDomain}
                      className="btn-primary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  {domainInputError && (
                    <p style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '6px' }}>{domainInputError}</p>
                  )}
                </div>

                {/* Frontend / Merchant Panel URLs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">
                      Frontend URL
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.7rem', marginLeft: '6px' }}>— customer storefront (with https://)</span>
                    </label>
                    <input type="text" name="frontendUrl" className="form-input" placeholder="https://watches.pakshipper.com" value={formData.frontendUrl} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Merchant Panel URL
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.7rem', marginLeft: '6px' }}>— admin dashboard (with https://)</span>
                    </label>
                    <input type="text" name="merchantPanelUrl" className="form-input" placeholder="https://admin.watches.pakshipper.com" value={formData.merchantPanelUrl} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* ── Stripe ───────────────────────────────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Stripe Billing Config</h4>
                <span style={sectionHintStyle}>Leave secret fields blank to keep existing values.</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Publishable Key</label>
                    <input type="text" name="stripePublishable" className="form-input" placeholder="pk_test_..." value={formData.stripePublishable} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Secret Key</label>
                    <input type="password" name="stripeSecret" className="form-input" placeholder="Enter new value to update" value={formData.stripeSecret} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* ── Cloudinary #1 — Product Images ──────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Cloudinary #1 — Product Images</h4>
                <span style={sectionHintStyle}>Leave API Secret blank to keep existing encrypted value.</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Cloud Name</label>
                    <input type="text" name="cloudinaryMerchantName" className="form-input" value={formData.cloudinaryMerchantName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">API Key</label>
                    <input type="text" name="cloudinaryMerchantApiKey" className="form-input" value={formData.cloudinaryMerchantApiKey} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">API Secret</label>
                    <input type="password" name="cloudinaryMerchantApiSecret" className="form-input" placeholder="Enter new value to update" value={formData.cloudinaryMerchantApiSecret} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* ── Cloudinary #2 — Review Images ───────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>Cloudinary #2 — Review Images</h4>
                <span style={sectionHintStyle}>Separate account for customer review images. Leave blank to share Account #1.</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Cloud Name</label>
                    <input type="text" name="cloudinaryCustomerName" className="form-input" value={formData.cloudinaryCustomerName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">API Key</label>
                    <input type="text" name="cloudinaryCustomerApiKey" className="form-input" value={formData.cloudinaryCustomerApiKey} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">API Secret</label>
                    <input type="password" name="cloudinaryCustomerApiSecret" className="form-input" placeholder="Enter new value to update" value={formData.cloudinaryCustomerApiSecret} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* ── Google OAuth ─────────────────────────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>
                  <Key size={14} color="#818cf8" />
                  Google OAuth Config
                </h4>
                <span style={sectionHintStyle}>Leave blank to use platform defaults.</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Client ID</label>
                    <input type="text" name="googleClientId" className="form-input" value={formData.googleClientId} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Client Secret</label>
                    <input type="password" name="googleClientSecret" className="form-input" placeholder="Enter new value to update" value={formData.googleClientSecret} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Callback URL</label>
                  <input type="text" name="googleCallbackUrl" className="form-input" value={formData.googleCallbackUrl} onChange={handleChange} />
                </div>
              </div>

              {/* ── LinkedIn OAuth ───────────────────────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>
                  <Key size={14} color="#a855f7" />
                  LinkedIn OAuth Config
                </h4>
                <span style={sectionHintStyle}>Leave blank to use platform defaults.</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">API Key</label>
                    <input type="text" name="linkedinApiKey" className="form-input" value={formData.linkedinApiKey} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Secret Key</label>
                    <input type="password" name="linkedinSecretKey" className="form-input" placeholder="Enter new value to update" value={formData.linkedinSecretKey} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Callback URL</label>
                  <input type="text" name="linkedinCallbackUrl" className="form-input" value={formData.linkedinCallbackUrl} onChange={handleChange} />
                </div>
              </div>

              {/* ── Email ────────────────────────────────────────────────── */}
              <div style={sectionStyle}>
                <h4 style={sectionTitleStyle}>
                  <Mail size={14} color="#10b981" />
                  Custom SMTP Email
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">SMTP Email</label>
                    <input type="email" name="emailUser" className="form-input" value={formData.emailUser} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SMTP Password</label>
                    <input type="password" name="emailPass" className="form-input" placeholder="Enter new value to update" value={formData.emailPass} onChange={handleChange} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Sender Display Name</label>
                    <input type="text" name="emailSenderName" className="form-input" value={formData.emailSenderName} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service</label>
                    <select name="emailService" className="form-input" value={formData.emailService} onChange={handleChange} style={{ background: 'var(--bg-input)' }}>
                      <option value="gmail">Gmail</option>
                      <option value="outlook">Outlook</option>
                      <option value="yahoo">Yahoo</option>
                      <option value="custom">Custom SMTP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── CORS Origins ─────────────────────────────────────────── */}
              <div>
                <h4 style={sectionTitleStyle}>CORS Allowed Origins</h4>
                <span style={sectionHintStyle}>Comma-separated list of allowed frontend origins.</span>
                <div className="form-group">
                  <input type="text" name="corsOrigins" className="form-input" placeholder="https://watches.pakshipper.com, http://localhost:3000" value={formData.corsOrigins} onChange={handleChange} />
                </div>
              </div>

            </div>

            {/* Footer Save/Cancel */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              marginTop: '8px',
            }}>
              <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.85rem' }} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, ShieldAlert, Sliders, Play, Square, Trash2, X, Check, HelpCircle, Activity, Pencil, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import WizardForm from '../components/tenants/WizardForm';
import EditTenantModal from '../components/tenants/EditTenantModal';

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  
  // Modal states
  const [showWizard, setShowWizard] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/platform/tenants');
      if (data.success && data.tenants) {
        setTenants(data.tenants);
      }
    } catch (err) {
      console.warn("Failed fetching tenants, using local developer simulation:", err);
      // Beautiful mock tenants so that the UI can be validated immediately!
      setTenants([
        {
          _id: '1',
          name: 'PakShipper Karachi Store',
          slug: 'khi-store',
          domains: [{ domain: 'khi-store.pakshipper.local', type: 'subdomain', isPrimary: true }],
          subscription: { plan: 'pro', status: 'active' },
          status: 'active',
          database: { name: 'pakshipper_tenant_khi' },
          createdAt: '2026-05-18T10:00:00.000Z'
        },
        {
          _id: '2',
          name: 'Outfitters Retail',
          slug: 'outfitters',
          domains: [{ domain: 'outfitters.pakshipper.local', type: 'subdomain', isPrimary: true }],
          subscription: { plan: 'enterprise', status: 'active' },
          status: 'active',
          database: { name: 'pakshipper_tenant_outfitters' },
          createdAt: '2026-05-19T14:30:00.000Z'
        },
        {
          _id: '3',
          name: 'Al-Karam Studio',
          slug: 'alkaram',
          domains: [{ domain: 'alkaram.com', type: 'custom', isPrimary: true }],
          subscription: { plan: 'basic', status: 'suspended' },
          status: 'suspended',
          database: { name: 'pakshipper_tenant_alkaram' },
          createdAt: '2026-05-20T08:15:00.000Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  // Suspend tenant store
  const handleSuspend = async (id) => {
    try {
      const res = await api.patch(`/platform/tenants/${id}/suspend`);
      if (res.success) {
        fetchTenants();
      }
    } catch (err) {
      // Direct local state simulation fallback for smooth visual previews
      setTenants(prev => prev.map(t => t._id === id ? { ...t, status: 'suspended', subscription: { ...t.subscription, status: 'suspended' } } : t));
    }
  };

  // Activate tenant store
  const handleActivate = async (id) => {
    try {
      const res = await api.patch(`/platform/tenants/${id}/activate`);
      if (res.success) {
        fetchTenants();
      }
    } catch (err) {
      // Direct local state simulation fallback for smooth visual previews
      setTenants(prev => prev.map(t => t._id === id ? { ...t, status: 'active', subscription: { ...t.subscription, status: 'active' } } : t));
    }
  };

  // Soft-delete tenant store
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to soft-delete this tenant store instance?")) return;
    try {
      const res = await api.delete(`/platform/tenants/${id}`);
      if (res.success) {
        fetchTenants();
      }
    } catch (err) {
      // Direct local state simulation fallback for smooth visual previews
      setTenants(prev => prev.map(t => t._id === id ? { ...t, status: 'deleted' } : t));
    }
  };

  // Permanently delete tenant store (2-step: must be soft-deleted first)
  const handlePermanentDelete = async (id, name) => {
    const firstConfirm = window.confirm(
      `⚠️ PERMANENT DELETE: "${name}"\n\nThis will permanently drop the store's database and remove all records. This action CANNOT be undone.\n\nAre you absolutely sure?`
    );
    if (!firstConfirm) return;

    const secondConfirm = window.prompt(
      `Type "PERMANENTLY DELETE" to confirm destruction of "${name}":`
    );
    if (secondConfirm !== 'PERMANENTLY DELETE') {
      alert('Permanent deletion cancelled.');
      return;
    }

    try {
      const res = await api.delete(`/platform/tenants/${id}/permanent?confirm=PERMANENT_DELETE`);
      if (res.success) {
        fetchTenants();
      }
    } catch (err) {
      setTenants(prev => prev.filter(t => t._id !== id));
    }
  };

  // Open Edit Modal
  const openEditModal = (tenant) => {
    setSelectedTenant(tenant);
    setShowEditModal(true);
  };

  // Wizard Form Provisioning Submission
  const handleProvisionSubmit = async (payload) => {
    try {
      const res = await api.post('/platform/tenants', payload);
      if (res.success) {
        setShowWizard(false);
        fetchTenants();
      }
    } catch (err) {
      console.error("Failed provisioning tenant:", err);
      // Fallback to local dev mock only if backend is offline / failed to fetch
      if (err.message && (err.message.includes("Failed to fetch") || err.message.includes("NetworkError"))) {
        const simulatedTenant = {
          _id: String(Date.now()),
          name: payload.tenant.name,
          slug: payload.tenant.slug,
          domains: payload.tenant.domains,
          subscription: payload.tenant.subscription,
          status: payload.tenant.subscription?.status || 'active',
          database: payload.tenant.database,
          createdAt: new Date().toISOString()
        };
        setTenants(prev => [simulatedTenant, ...prev]);
        setShowWizard(false);
      } else {
        // Rethrow the API error so the WizardForm can capture and display it
        throw err;
      }
    }
  };

  // Open Details Configuration Modal
  const openConfigureDetails = async (tenant) => {
    setSelectedTenant(tenant);
    setShowDetailModal(true);
    try {
      const data = await api.get(`/platform/tenants/${tenant._id}`);
      if (data.success && data.tenant) {
        setSelectedTenant(data.tenant);
      }
    } catch (err) {
      console.warn("Failed fetching live detailed config, rendering parent overview.");
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) || 
    t.slug?.toLowerCase().includes(search.toLowerCase()) ||
    t.domains?.[0]?.domain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Dynamic Filter Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search size={18} color="var(--text-muted)" style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by store name, slug, domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '48px' }}
          />
        </div>

        {/* Action Button */}
        <button className="btn-primary" onClick={() => setShowWizard(true)}>
          <Plus size={16} />
          <span>Provision Storefront</span>
        </button>
      </div>

      {/* Main Grid Card Content */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Store Identity</th>
                <th>Primary Domain</th>
                <th>Database Isolated Space</th>
                <th>SaaS Tier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && tenants.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    Running platform registry search...
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No matching merchant storefronts found.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const domain = tenant.domains?.find(d => d.isPrimary)?.domain || tenant.domains?.[0]?.domain || 'N/A';
                  const isCustomDomain = tenant.domains?.find(d => d.isPrimary)?.type === 'custom';
                  
                  return (
                    <tr key={tenant._id} className="fade-in">
                      {/* Name & Slug */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>{tenant.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>slug: {tenant.slug}</span>
                        </div>
                      </td>

                      {/* Domain mapping */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem' }}>{domain}</span>
                          <span style={{ fontSize: '0.7rem', color: isCustomDomain ? '#ec4899' : '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
                            {isCustomDomain ? 'Dedicated Custom Domain' : 'Wildcard Subdomain'}
                          </span>
                        </div>
                      </td>

                      {/* Database isolated name */}
                      <td>
                        <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#c084fc' }}>
                          {tenant.database?.name || `db_tenant_${tenant.slug}`}
                        </span>
                      </td>

                      {/* SaaS package */}
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          color: tenant.subscription?.plan === 'enterprise' ? '#ec4899' : tenant.subscription?.plan === 'pro' ? '#a855f7' : '#818cf8'
                        }}>
                          {tenant.subscription?.plan || 'trial'}
                        </span>
                      </td>

                      {/* Custom badge */}
                      <td>
                        <span className={`badge badge-${tenant.status || 'active'}`}>
                          {tenant.status || 'active'}
                        </span>
                      </td>

                      {/* Inline Actions */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(tenant)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                            title="Edit store configuration"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>

                          {/* Config Details */}
                          <button
                            onClick={() => openConfigureDetails(tenant)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px' }}
                            title="View parameters"
                          >
                            <Sliders size={12} />
                            <span>Details</span>
                          </button>

                          {/* Activate / Suspend Toggle */}
                          {tenant.status === 'deleted' ? (
                            <button
                              onClick={() => handlePermanentDelete(tenant._id, tenant.name)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}
                              title="Permanently delete — drops database"
                            >
                              <AlertTriangle size={12} />
                              <span>Destroy</span>
                            </button>
                          ) : tenant.status === 'suspended' ? (
                            <button
                              onClick={() => handleActivate(tenant._id)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'hsla(var(--color-emerald), 0.9)' }}
                              title="Activate Store"
                            >
                              <Play size={12} />
                              <span>Resume</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(tenant._id)}
                              className="btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '4px', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'hsla(var(--color-ruby), 0.9)' }}
                              title="Suspend Store"
                            >
                              <Square size={12} />
                              <span>Suspend</span>
                            </button>
                          )}

                          {/* Soft-Delete Store */}
                          {tenant.status !== 'deleted' && (
                            <button
                              onClick={() => handleDelete(tenant._id)}
                              className="btn-secondary"
                              style={{ padding: '6px 10px', borderColor: 'rgba(239, 68, 68, 0.1)', color: 'hsla(var(--color-ruby), 0.8)' }}
                              title="Soft-delete storefront"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Tenant Provisioning Wizard Slide-in */}
      {showWizard && (
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
          animation: 'fade-in-modal 0.25s ease-out'
        }}>
          <div className="glass-panel fade-in" style={{
            width: '100%',
            maxWidth: '650px',
            height: '100%',
            borderRadius: 0,
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(12, 15, 29, 0.95)',
            backdropFilter: 'var(--glass-blur-heavy)',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Merchant Provisioner Wizard</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Compile, register, and dynamic seed merchant nodes.</p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Inner Wizard form */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <WizardForm
                onCancel={() => setShowWizard(false)}
                onSubmitSuccess={handleProvisionSubmit}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: View Configuration Details */}
      {showDetailModal && selectedTenant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 7, 16, 0.8)',
          backdropFilter: 'var(--glass-blur)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          animation: 'fade-in-modal 0.25s ease-out'
        }}>
          <div className="glass-panel fade-in" style={{
            width: '100%',
            maxWidth: '560px',
            background: 'rgba(12, 15, 29, 0.95)',
            border: 'var(--border-glass)',
            padding: '32px',
            boxShadow: 'var(--shadow-neon)',
            borderRadius: '16px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="#818cf8" />
                <span>Store Specifications</span>
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.85rem' }}>
              {/* Row 1: Brand & Slug */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Merchant Name</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '4px' }}>{selectedTenant.name}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Subdomain Slug</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '4px', fontFamily: 'monospace' }}>{selectedTenant.slug}</p>
                </div>
              </div>

              {/* Row 2: Domain Hosts */}
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Primary Operational Domain</span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#818cf8', marginTop: '4px' }}>
                  {selectedTenant.domains?.[0]?.domain || 'N/A'}
                </p>
              </div>

              {/* Row 3: Isolated Database */}
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Isolated Database Registry URI</span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c084fc', marginTop: '4px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {selectedTenant.database?.connectionString === '[ENCRYPTED]' ? 'mongodb://[ENCRYPTED_HOST_STRING]/' : selectedTenant.database?.connectionString || 'mongodb://127.0.0.1:27017/'}
                  <span style={{ color: '#fff', marginLeft: '6px' }}>({selectedTenant.database?.name || 'db_tenant_' + selectedTenant.slug})</span>
                </p>
              </div>

              {/* Provisioning Error (if failed) */}
              {selectedTenant.status === 'deleted' && selectedTenant.provisioningError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginTop: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fca5a5', fontWeight: 600 }}>
                    <ShieldAlert size={16} />
                    <span>Provisioning Sequence Failure</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedTenant.provisioningError}
                  </p>
                </div>
              )}
            </div>


              {/* Row 4: Service status mappings */}
              <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: 'var(--border-glass)' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  External Microservice Integrations
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Stripe Billing:</span>
                    <span style={{ fontWeight: 600, color: selectedTenant.config?.stripe?.publishableKey || selectedTenant.config?.stripe?.secretKey ? '#818cf8' : 'var(--text-muted)' }}>
                      {selectedTenant.config?.stripe?.publishableKey || selectedTenant.config?.stripe?.secretKey ? '✓ Merchant Override Active' : 'Default Global Billing'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cloudinary (Products):</span>
                    <span style={{ fontWeight: 600, color: selectedTenant.config?.cloudinary?.merchantAccount?.cloudName ? '#ec4899' : 'var(--text-muted)' }}>
                      {selectedTenant.config?.cloudinary?.merchantAccount?.cloudName ? '✓ ' + selectedTenant.config.cloudinary.merchantAccount.cloudName : 'Platform Default'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Cloudinary (Reviews):</span>
                    <span style={{ fontWeight: 600, color: selectedTenant.config?.cloudinary?.customerAccount?.cloudName ? '#ec4899' : 'var(--text-muted)' }}>
                      {selectedTenant.config?.cloudinary?.customerAccount?.cloudName ? '✓ ' + selectedTenant.config.cloudinary.customerAccount.cloudName : 'Platform Default'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Google OAuth:</span>
                    <span style={{ fontWeight: 600, color: selectedTenant.config?.oauth?.google?.clientId ? '#818cf8' : 'var(--text-muted)' }}>
                      {selectedTenant.config?.oauth?.google?.clientId ? '✓ Store-Specific' : 'Platform Default'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>LinkedIn OAuth:</span>
                    <span style={{ fontWeight: 600, color: selectedTenant.config?.oauth?.linkedin?.apiKey ? '#a855f7' : 'var(--text-muted)' }}>
                      {selectedTenant.config?.oauth?.linkedin?.apiKey ? '✓ Store-Specific' : 'Platform Default'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Nodemailer Email:</span>
                    <span style={{ fontWeight: 600, color: selectedTenant.config?.email?.user ? '#10b981' : 'var(--text-muted)' }}>
                      {selectedTenant.config?.email?.user ? '✓ Dedicated SMTP' : 'Default Platform Mailer'}
                    </span>
                  </div>
                </div>

            {/* Footer */}
            <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-primary" onClick={() => { setShowDetailModal(false); openEditModal(selectedTenant); }} style={{ padding: '8px 20px', fontSize: '0.85rem', gap: '6px' }}>
                <Pencil size={14} />
                Edit Store
              </button>
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close Panel
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* MODAL 3: Edit Tenant Configuration */}
      {showEditModal && selectedTenant && (
        <EditTenantModal
          tenant={selectedTenant}
          onClose={() => { setShowEditModal(false); setSelectedTenant(null); }}
          onSaveSuccess={() => fetchTenants()}
        />
      )}

      {/* Inline styles for modal fades */}
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in-modal {
          animation: fadeInModal 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

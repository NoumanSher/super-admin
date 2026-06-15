import React, { useState } from 'react';
import { Store, Database, Globe, Mail, UserPlus, ArrowLeft, ArrowRight, Save, ShieldAlert, Loader2, Key } from 'lucide-react';

export default function WizardForm({ onCancel, onSubmitSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Store info
    name: '',
    slug: '',
    plan: 'trial',
    
    // Step 2: DNS & DB (Optional, empty by default to trigger backend auto-generation)
    domainName: '',
    domainType: 'subdomain',
    databaseUrl: '',
    databaseName: '',

    // Step 3: Configs (Optional)
    stripeSecret: '',
    stripePublishable: '',
    stripeWebhook: '',
    // Cloudinary Account #1 — Product Images
    cloudinaryName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
    // Cloudinary Account #2 — Review Images
    cloudinaryReviewName: '',
    cloudinaryReviewApiKey: '',
    cloudinaryReviewApiSecret: '',
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
    emailSenderName: 'PakShipper Support',

    // Step 4: Owner
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Auto-generate slug, database name, and lvh.me domains if store name changes
      if (name === 'name') {
        const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        return {
          ...prev,
          name: value,
          slug: generatedSlug,
          domainName: generatedSlug ? `${generatedSlug}.lvh.me` : '',
          databaseName: generatedSlug ? `pakshipper_tenant_${generatedSlug.replace(/-/g, '_')}` : ''
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleNext = () => {
    // Basic step validation
    if (currentStep === 1) {
      if (!formData.name || !formData.slug) {
        setError('Please fill in Store Name and Slug');
        return;
      }
    } else if (currentStep === 2) {
      // Domains and Database details are now completely optional (backend auto-generates them if blank)
    } else if (currentStep === 3) {
      // Config fields are optional, so we can proceed
    }
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.ownerEmail || !formData.ownerPassword) {
      setError('Owner profile credentials are required to complete provisioning');
      return;
    }

    setSubmitting(true);
    setError('');

    // Transform local flat state into Zod-schema aligned nested object structure
    const payload = {
      tenant: {
        name: formData.name,
        slug: formData.slug,
        domains: formData.domainName ? [{
          domain: formData.domainName,
          type: formData.domainType,
          isPrimary: true,
          sslEnabled: true
        }] : undefined,
        database: (formData.databaseUrl && formData.databaseName) ? {
          connectionString: formData.databaseUrl,
          name: formData.databaseName
        } : undefined,
        subscription: {
          plan: formData.plan,
          status: 'active'
        },
        config: {
          stripe: formData.stripeSecret ? {
            secretKey: formData.stripeSecret,
            publishableKey: formData.stripePublishable,
            webhookSecret: formData.stripeWebhook
          } : undefined,
          cloudinary: formData.cloudinaryName ? (() => {
            const merchant = {
              cloudName: formData.cloudinaryName,
              apiKey: formData.cloudinaryApiKey,
              apiSecret: formData.cloudinaryApiSecret
            };
            // If Account #2 is filled, use it for reviews; otherwise clone Account #1
            const customer = formData.cloudinaryReviewName ? {
              cloudName: formData.cloudinaryReviewName,
              apiKey: formData.cloudinaryReviewApiKey,
              apiSecret: formData.cloudinaryReviewApiSecret
            } : { ...merchant };
            return { merchantAccount: merchant, customerAccount: customer };
          })() : undefined,
          email: formData.emailUser ? {
            service: formData.emailService,
            user: formData.emailUser,
            pass: formData.emailPass,
            senderName: formData.emailSenderName
          } : undefined,
          oauth: (formData.googleClientId || formData.linkedinApiKey) ? {
            google: formData.googleClientId ? {
              clientId: formData.googleClientId,
              clientSecret: formData.googleClientSecret,
              callbackUrl: formData.googleCallbackUrl
            } : undefined,
            linkedin: formData.linkedinApiKey ? {
              apiKey: formData.linkedinApiKey,
              secretKey: formData.linkedinSecretKey,
              callbackUrl: formData.linkedinCallbackUrl
            } : undefined
          } : undefined
        }
      },
      owner: {
        name: formData.ownerName,
        email: formData.ownerEmail,
        password: formData.ownerPassword
      }
    };

    try {
      await onSubmitSuccess(payload);
    } catch (err) {
      setError(err.message || 'Provisioning sequence failed');
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Store size={18} color="#818cf8" />
              <span>Step 1: General Merchant Storefront Details</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Store Brand Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Outfitters Fashion"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This is the display name of the storefront merchant.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Sub-Route Slug Path *</label>
              <input
                type="text"
                name="slug"
                className="form-input"
                placeholder="e.g. outfitters"
                value={formData.slug}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique identifier used for sub-domains and database registries.</span>
            </div>

            <div className="form-group">
              <label className="form-label">SaaS Subscription Package</label>
              <select
                name="plan"
                className="form-input"
                value={formData.plan}
                onChange={handleChange}
                style={{ background: 'var(--bg-input)' }}
              >
                <option value="trial">Standard Sandbox (Trial)</option>
                <option value="basic">Standard Retailer (Basic)</option>
                <option value="pro">Dynamic Enterprise (Pro)</option>
                <option value="enterprise">Global Custom Cluster (Enterprise)</option>
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="#818cf8" />
              <span>Step 2: Core DNS Routing & Database Isolation</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Operational Domain Hostname (Optional)</label>
              <input
                type="text"
                name="domainName"
                className="form-input"
                placeholder="e.g. outfitters.lvh.me (leave blank for default)"
                value={formData.domainName}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Leave blank to auto-generate using zero-config local subdomains (lvh.me).</span>
            </div>

            <div className="form-group">
              <label className="form-label">Domain Mapping Class</label>
              <select
                name="domainType"
                className="form-input"
                value={formData.domainType}
                onChange={handleChange}
              >
                <option value="subdomain">Subdomain Mapping (*.lvh.me)</option>
                <option value="custom">Premium Dedicated Domain (outfitters.com)</option>
              </select>
            </div>

            <div style={{ padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', border: '1px dashed rgba(99, 102, 241, 0.2)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Database size={14} />
                <span>Isolated Multi-Tenant DB Settings</span>
              </h4>
              
              <div className="form-group">
                <label className="form-label">MongoDB Isolated Cluster Host URI (Optional)</label>
                <input
                  type="text"
                  name="databaseUrl"
                  className="form-input"
                  placeholder="e.g. mongodb+srv://... (leave blank for auto)"
                  value={formData.databaseUrl}
                  onChange={handleChange}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Leave blank to automatically provision an isolated database on your Platform DB cluster.</span>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Database Dedicated Schema Name (Optional)</label>
                <input
                  type="text"
                  name="databaseName"
                  className="form-input"
                  placeholder="e.g. pakshipper_tenant_outfitters (leave blank for auto)"
                  value={formData.databaseName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="fade-in" style={{ maxHeight: '480px', overflowY: 'auto', paddingRight: '6px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} color="#818cf8" />
              <span>Step 3: External Platform Services (Optional overrides)</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '20px' }}>Leave all fields blank to use platform defaults. Only fill in overrides for this specific store.</span>

            {/* Stripe Section */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '12px' }}>Stripe Billing Merchant Config</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Stripe Public Key</label>
                  <input type="text" name="stripePublishable" className="form-input" placeholder="pk_test_..." value={formData.stripePublishable} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Stripe Secret Key</label>
                  <input type="password" name="stripeSecret" className="form-input" placeholder="sk_test_..." value={formData.stripeSecret} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Cloudinary Account #1 — Product Images */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '4px' }}>Cloudinary Account #1 — Product Images</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Used for product catalog images. If only this account is filled, it will also be used for review images.</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Cloud Name</label>
                  <input type="text" name="cloudinaryName" className="form-input" placeholder="e.g. dihcchnl2" value={formData.cloudinaryName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">API Key</label>
                  <input type="text" name="cloudinaryApiKey" className="form-input" placeholder="264653664471342" value={formData.cloudinaryApiKey} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">API Secret</label>
                  <input type="password" name="cloudinaryApiSecret" className="form-input" value={formData.cloudinaryApiSecret} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Cloudinary Account #2 — Review Images */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '4px' }}>Cloudinary Account #2 — Review Images</h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Used for product review images. Leave blank to use Account #1 for both.</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Cloud Name</label>
                  <input type="text" name="cloudinaryReviewName" className="form-input" placeholder="e.g. dhy7mrqjy" value={formData.cloudinaryReviewName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">API Key</label>
                  <input type="text" name="cloudinaryReviewApiKey" className="form-input" placeholder="335149936756991" value={formData.cloudinaryReviewApiKey} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">API Secret</label>
                  <input type="password" name="cloudinaryReviewApiSecret" className="form-input" value={formData.cloudinaryReviewApiSecret} onChange={handleChange} />
                </div>
              </div>
            </div>

            {/* Google OAuth */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} color="#818cf8" />
                Google OAuth Config
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Leave blank to use platform default Google OAuth credentials.</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Client ID</label>
                  <input type="text" name="googleClientId" className="form-input" placeholder="142019406973-...apps.googleusercontent.com" value={formData.googleClientId} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Client Secret</label>
                  <input type="password" name="googleClientSecret" className="form-input" placeholder="GOCSPX-..." value={formData.googleClientSecret} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Callback URL</label>
                <input type="text" name="googleCallbackUrl" className="form-input" placeholder="https://api.yourstore.com/api/auth/google/callback" value={formData.googleCallbackUrl} onChange={handleChange} />
              </div>
            </div>

            {/* LinkedIn OAuth */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={14} color="#a855f7" />
                LinkedIn OAuth Config
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>Leave blank to use platform default LinkedIn OAuth credentials.</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">API Key</label>
                  <input type="text" name="linkedinApiKey" className="form-input" placeholder="772r3c2adj6y86" value={formData.linkedinApiKey} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Secret Key</label>
                  <input type="password" name="linkedinSecretKey" className="form-input" placeholder="WPL_AP1...." value={formData.linkedinSecretKey} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Callback URL</label>
                <input type="text" name="linkedinCallbackUrl" className="form-input" placeholder="https://api.yourstore.com/api/auth/linkedin/callback" value={formData.linkedinCallbackUrl} onChange={handleChange} />
              </div>
            </div>

            {/* Email SMTP */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '12px' }}>Custom SMTP Email Gateway</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">SMTP Username/Email</label>
                  <input type="email" name="emailUser" className="form-input" placeholder="merchant@support.com" value={formData.emailUser} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">SMTP Password</label>
                  <input type="password" name="emailPass" className="form-input" placeholder="SMTP Key" value={formData.emailPass} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="fade-in">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} color="#818cf8" />
              <span>Step 4: Merchant Primary Owner Credentials</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Owner Full Name *</label>
              <input
                type="text"
                name="ownerName"
                className="form-input"
                placeholder="e.g. Nouman Khan"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Login Email *</label>
              <input
                type="email"
                name="ownerEmail"
                className="form-input"
                placeholder="e.g. nouman@outfitters.com"
                value={formData.ownerEmail}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>The tenant merchant will use this email to log in to their local dashboard.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Secure Access Password *</label>
              <input
                type="password"
                name="ownerPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.ownerPassword}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minimum 6 characters. Auto-seeding default merchant schemas.</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Dynamic Step Wizard View */}
      <div style={{ flex: 1, marginBottom: '28px' }}>
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {renderStep()}
      </div>

      {/* Footer Navigation Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {currentStep > 1 ? (
          <button type="button" onClick={handlePrev} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} disabled={submitting}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        ) : (
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} disabled={submitting}>
            Cancel
          </button>
        )}

        {currentStep < 4 ? (
          <button type="button" onClick={handleNext} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button type="submit" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.85rem' }} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Provisioning...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Compile & Launch Store</span>
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

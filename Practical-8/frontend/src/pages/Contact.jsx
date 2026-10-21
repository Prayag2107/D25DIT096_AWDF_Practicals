import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, MessageSquare, CheckCircle2 } from 'lucide-react';

/**
 * Subcomponent displaying static contact information.
 * Suitable for React DevTools profiling (Step 9):
 * By default, without React.memo, this component re-renders on every keystroke
 * when the user types in the message field.
 */
export function ContactInfoCard() {
  return (
    <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--surface-hover)' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Mail size={18} style={{ color: 'var(--primary)' }} /> Developer & Support Contacts
      </h3>
      <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={15} style={{ color: 'var(--primary)' }} />
          <span>support@taskmaster.dev / college-lab@university.edu</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Phone size={15} style={{ color: 'var(--success)' }} />
          <span>+91 98765 43210 (Lab In-charge)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={15} style={{ color: 'var(--warning)' }} />
          <span>Department of Computer Science & Engineering</span>
        </div>
      </div>
    </div>
  );
}

// Practical 8 Step 9: Optimized component using React.memo to prevent unnecessary re-renders
export const MemoizedContactInfoCard = React.memo(ContactInfoCard);
MemoizedContactInfoCard.displayName = 'MemoizedContactInfoCard';


function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Task Management Support',
    message: ''
  });
  const [showHelp, setShowHelp] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="contact-page" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="title" style={{ marginBottom: '0.5rem' }}>Contact & Feedback</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Have feedback or technical questions about Practical 8? Reach out below.
        </p>
      </div>

      {/* Static Subcomponent profiled in Step 9: memoized with React.memo */}
      <MemoizedContactInfoCard />

      {/* Help Toggle Button */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => setShowHelp((prev) => !prev)}
          className="btn btn-outline"
          style={{ fontSize: '0.85rem' }}
        >
          <HelpCircle size={15} /> {showHelp ? 'Hide Help & Tips' : 'Show Help & Tips'}
        </button>
      </div>

      {showHelp && (
        <div className="card" style={{ borderColor: 'var(--primary)', backgroundColor: 'rgba(99, 102, 241, 0.08)', marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>💡 Instructions for Students:</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Type in the message box below while monitoring the <strong>React DevTools Profiler</strong>.
            Notice how child components re-render during input changes before memoization is applied.
          </p>
        </div>
      )}

      {submitted ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', borderColor: 'var(--success)' }}>
          <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem' }}>Message Dispatched!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Thank you, <strong>{formData.name}</strong>. Your feedback has been recorded.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', subject: 'Task Management Support', message: '' });
            }}
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label htmlFor="contact-name" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Full Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="contact-email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Email Address
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="e.g. alex@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="contact-message" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={4}
              className="form-control"
              placeholder="Write your feedback or query..."
              value={formData.message}
              onChange={handleChange}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Live Preview Card */}
          <div style={{ backgroundColor: 'var(--background)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Live Preview:</span>
              <span>Characters: <strong>{formData.message.length}</strong></span>
            </div>
            <p style={{ color: formData.message ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: formData.message ? 'normal' : 'italic' }}>
              {formData.message || 'No message entered yet...'}
            </p>
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '0.5rem' }}>
            <Send size={16} /> Submit Message
          </button>
        </form>
      )}
    </div>
  );
}

export default Contact;

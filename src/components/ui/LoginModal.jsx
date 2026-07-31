import React, { useEffect, useRef, useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ⚠️ Replace with your actual Google OAuth 2.0 Client ID
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';

const STYLES = `
  @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(28px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
  @keyframes shake   { 0%,100%{ transform: translateX(0) } 20%,60%{ transform: translateX(-6px) } 40%,80%{ transform: translateX(6px) } }

  .lm-backdrop { animation: fadeIn 0.2s ease; }
  .lm-card     { animation: slideUp 0.28s cubic-bezier(0.34,1.4,0.64,1); }
  .lm-card.shake { animation: shake 0.35s ease; }

  .lm-tab {
    flex: 1; padding: 10px; background: none; border: none;
    font-size: 0.82rem; font-weight: 600; letter-spacing: 0.06em;
    cursor: pointer; color: rgba(255,255,255,0.35); transition: all 0.2s;
    border-bottom: 2px solid transparent;
  }
  .lm-tab.active { color: #ffd700; border-bottom-color: #ffd700; }
  .lm-tab:hover:not(.active) { color: rgba(255,255,255,0.65); }

  .lm-input-wrap { position: relative; }
  .lm-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    color: rgba(255,255,255,0.3); pointer-events: none;
  }
  .lm-input {
    width: 100%; box-sizing: border-box;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px; padding: 12px 12px 12px 40px;
    color: #fff; font-size: 0.875rem; outline: none; transition: all 0.2s;
    font-family: inherit;
  }
  .lm-input::placeholder { color: rgba(255,255,255,0.3); }
  .lm-input:focus { border-color: rgba(255,215,0,0.5); background: rgba(255,255,255,0.09); box-shadow: 0 0 0 3px rgba(255,215,0,0.08); }
  .lm-input.error { border-color: rgba(255,80,80,0.6); }
  .lm-input.has-toggle { padding-right: 42px; }

  .lm-toggle-pw {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.35);
    display: flex; align-items: center; padding: 2px; transition: color 0.2s;
  }
  .lm-toggle-pw:hover { color: rgba(255,255,255,0.7); }

  .lm-btn-primary {
    width: 100%; padding: 13px; border: none; border-radius: 10px; cursor: pointer;
    background: linear-gradient(135deg, #ffd700, #ffaa00);
    color: #1a1a0e; font-size: 0.9rem; font-weight: 700;
    letter-spacing: 0.04em; transition: all 0.2s; font-family: inherit;
  }
  .lm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,215,0,0.35); }
  .lm-btn-primary:active { transform: translateY(0); }
  .lm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .lm-switch-link {
    background: none; border: none; color: #ffd700; font-size: 0.82rem;
    cursor: pointer; font-family: inherit; font-weight: 600; padding: 0;
    transition: opacity 0.2s;
  }
  .lm-switch-link:hover { opacity: 0.75; text-decoration: underline; }

  .lm-alert {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 10px 13px; border-radius: 8px; font-size: 0.8rem; line-height: 1.5;
  }
  .lm-alert.error   { background: rgba(255,60,60,0.12); border: 1px solid rgba(255,60,60,0.25); color: #ff8080; }
  .lm-alert.success { background: rgba(60,255,120,0.1); border: 1px solid rgba(60,255,120,0.2); color: #7affa0; }

  .lm-divider {
    display: flex; align-items: center; gap: 12px;
  }
  .lm-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.09); }
  .lm-divider-text { color: rgba(255,255,255,0.3); font-size: 0.72rem; letter-spacing: 0.08em; }

  .google-btn-wrap > div { margin: 0 auto !important; }

  .pw-strength { display: flex; gap: 4px; margin-top: 6px; }
  .pw-strength-bar { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.1); transition: background 0.3s; }
`;

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6)  s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw))   s++;
  if (/[0-9]/.test(pw))   s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-5
}

const STRENGTH_COLORS = ['', '#ff4545', '#ff8c00', '#ffd700', '#7dff8c', '#00e676'];
const STRENGTH_LABELS = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

export function LoginModal({ isOpen, onClose }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  // Tabs: 'signin' | 'signup'
  const [tab, setTab]             = useState('signin');
  const [mode, setMode]           = useState('email'); // 'email' | 'google' — kept for rendering toggle

  // Sign-in fields
  const [siEmail, setSiEmail]     = useState('');
  const [siPass,  setSiPass]      = useState('');
  const [siShowPw, setSiShowPw]   = useState(false);

  // Sign-up fields
  const [suName,  setSuName]      = useState('');
  const [suEmail, setSuEmail]     = useState('');
  const [suPass,  setSuPass]      = useState('');
  const [suPass2, setSuPass2]     = useState('');
  const [suShowPw, setSuShowPw]   = useState(false);

  // Feedback
  const [error,   setError]       = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [shaking, setShaking]     = useState(false);

  const googleBtnRef = useRef(null);
  const cardRef      = useRef(null);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) return;
    setTab('signin'); setSiEmail(''); setSiPass(''); setSuName('');
    setSuEmail(''); setSuPass(''); setSuPass2('');
    setError(''); setSuccess(''); setLoading(false);
  }, [isOpen]);

  // Render Google button
  useEffect(() => {
    if (!isOpen || !googleBtnRef.current || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => { signInWithGoogle(resp); onClose(); },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'filled_black', size: 'large', shape: 'pill',
      text: 'signin_with', logo_alignment: 'left', width: 264,
    });
  }, [isOpen, tab]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 400);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!siEmail || !siPass) { setError('Please fill in all fields.'); triggerShake(); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300)); // small UX delay
    const result = signInWithEmail(siEmail, siPass);
    setLoading(false);
    if (result.error) { setError(result.error); triggerShake(); }
    else { setSuccess('Welcome back! Signing you in…'); setTimeout(onClose, 800); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!suName || !suEmail || !suPass || !suPass2) { setError('Please fill in all fields.'); triggerShake(); return; }
    if (suPass !== suPass2) { setError('Passwords do not match.'); triggerShake(); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    const result = signUpWithEmail(suName, suEmail, suPass);
    setLoading(false);
    if (result.error) { setError(result.error); triggerShake(); }
    else { setSuccess('Account created! Welcome to ChessX 🎉'); setTimeout(onClose, 1000); }
  };

  if (!isOpen) return null;

  const pwStrength = getPasswordStrength(tab === 'signup' ? suPass : '');

  return (
    <div
      className="lm-backdrop"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{STYLES}</style>

      <div
        ref={cardRef}
        className={`lm-card${shaking ? ' shake' : ''}`}
        style={{
          background: 'linear-gradient(155deg, #12122a 0%, #1a1a3a 55%, #0e2a4a 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '22px',
          padding: '32px 30px 28px',
          width: '360px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,215,0,0.06)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'rgba(255,255,255,0.07)', border: 'none',
            borderRadius: '50%', width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.14)'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}
          aria-label="Close"
        ><X size={15} /></button>

        {/* Crown + Title */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ fontSize: '2.6rem', lineHeight: 1, marginBottom: '10px' }}>👑</div>
          <h2 style={{
            margin: 0, fontSize: '1.5rem', fontWeight: 800,
            background: 'linear-gradient(135deg,#ffd700,#ffaa00)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.03em',
          }}>
            {tab === 'signin' ? 'Welcome Back' : 'Join ChessX'}
          </h2>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
            {tab === 'signin' ? 'Sign in to continue your journey' : 'Create your account to get started'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '22px' }}>
          <button className={`lm-tab ${tab==='signin'?'active':''}`} onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}>
            SIGN IN
          </button>
          <button className={`lm-tab ${tab==='signup'?'active':''}`} onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>
            SIGN UP
          </button>
        </div>

        {/* Alert */}
        {error   && <div className="lm-alert error"   style={{ marginBottom:'14px' }}><AlertCircle size={15} style={{flexShrink:0, marginTop:'1px'}} />{error}</div>}
        {success && <div className="lm-alert success" style={{ marginBottom:'14px' }}><CheckCircle size={15} style={{flexShrink:0, marginTop:'1px'}} />{success}</div>}

        {/* ── SIGN IN ───────────────────────────────── */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {/* Email */}
            <div className="lm-input-wrap">
              <Mail className="lm-input-icon" size={15} />
              <input
                id="si-email"
                type="email"
                className={`lm-input${error?'':''}`}
                placeholder="Email address"
                value={siEmail}
                onChange={e => setSiEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="lm-input-wrap">
              <Lock className="lm-input-icon" size={15} />
              <input
                id="si-password"
                type={siShowPw ? 'text' : 'password'}
                className="lm-input has-toggle"
                placeholder="Password"
                value={siPass}
                onChange={e => setSiPass(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="lm-toggle-pw" onClick={() => setSiShowPw(p => !p)} aria-label="Toggle password">
                {siShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button type="submit" className="lm-btn-primary" disabled={loading} style={{ marginTop:'4px' }}>
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>
        )}

        {/* ── SIGN UP ───────────────────────────────── */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {/* Username */}
            <div className="lm-input-wrap">
              <User className="lm-input-icon" size={15} />
              <input
                id="su-username"
                type="text"
                className="lm-input"
                placeholder="Username (min. 3 chars)"
                value={suName}
                onChange={e => setSuName(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Email */}
            <div className="lm-input-wrap">
              <Mail className="lm-input-icon" size={15} />
              <input
                id="su-email"
                type="email"
                className="lm-input"
                placeholder="Email address"
                value={suEmail}
                onChange={e => setSuEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="lm-input-wrap">
                <Lock className="lm-input-icon" size={15} />
                <input
                  id="su-password"
                  type={suShowPw ? 'text' : 'password'}
                  className="lm-input has-toggle"
                  placeholder="Password (min. 6 chars)"
                  value={suPass}
                  onChange={e => setSuPass(e.target.value)}
                  autoComplete="new-password"
                />
                <button type="button" className="lm-toggle-pw" onClick={() => setSuShowPw(p => !p)} aria-label="Toggle password">
                  {suShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength meter */}
              {suPass && (
                <>
                  <div className="pw-strength">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="pw-strength-bar"
                        style={{ background: i <= pwStrength ? STRENGTH_COLORS[pwStrength] : undefined }} />
                    ))}
                  </div>
                  <div style={{ fontSize:'0.7rem', color: STRENGTH_COLORS[pwStrength], marginTop:'3px', textAlign:'right' }}>
                    {STRENGTH_LABELS[pwStrength]}
                  </div>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="lm-input-wrap">
              <Lock className="lm-input-icon" size={15} />
              <input
                id="su-confirm-password"
                type={suShowPw ? 'text' : 'password'}
                className={`lm-input has-toggle${suPass2 && suPass2 !== suPass ? ' error' : ''}`}
                placeholder="Confirm password"
                value={suPass2}
                onChange={e => setSuPass2(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="lm-btn-primary" disabled={loading} style={{ marginTop:'4px' }}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Google divider */}
        <div className="lm-divider" style={{ margin:'20px 0 16px' }}>
          <div className="lm-divider-line" />
          <span className="lm-divider-text">OR CONTINUE WITH</span>
          <div className="lm-divider-line" />
        </div>

        {/* Google Sign-In Button */}
        <div className="google-btn-wrap" ref={googleBtnRef} style={{ display:'flex', justifyContent:'center' }} />

        {/* Footer note */}
        <p style={{ marginTop:'20px', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:'0.68rem', lineHeight:1.6 }}>
          By continuing you agree to our Terms of Service.<br/>Your data stays on your device.
        </p>
      </div>
    </div>
  );
}

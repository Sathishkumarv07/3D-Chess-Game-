import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// ─── Storage Keys ────────────────────────────────────────────────────────────
const SESSION_KEY  = 'chessx_session';   // logged-in user
const ACCOUNTS_KEY = 'chessx_accounts';  // registered local accounts

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Decode Google JWT (client-side only). */
function decodeGoogleJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json      = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch { return null; }
}

/**
 * Simple deterministic hash (FNV-1a 32-bit).
 * NOT cryptographically secure — fine for a client-only demo;
 * use bcrypt on the server in production.
 */
function hashPassword(password) {
  let hash = 2166136261;
  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash.toString(16);
}

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {}; }
  catch { return {}; }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Persist session helper
  const persist = (userData) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const signInWithGoogle = (credentialResponse) => {
    const payload = decodeGoogleJwt(credentialResponse.credential);
    if (!payload) return { error: 'Invalid Google credential.' };
    persist({
      name:     payload.name,
      email:    payload.email,
      picture:  payload.picture,
      sub:      payload.sub,
      provider: 'google',
    });
    return { ok: true };
  };

  // ── Local Sign-Up ──────────────────────────────────────────────────────────
  const signUpWithEmail = (username, email, password) => {
    username = username.trim();
    email    = email.trim().toLowerCase();

    if (!username) return { error: 'Username is required.' };
    if (username.length < 3) return { error: 'Username must be at least 3 characters.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };

    const accounts = getAccounts();
    if (accounts[email]) return { error: 'An account with that email already exists.' };

    // Check username uniqueness
    const usernameTaken = Object.values(accounts).some(a => a.username.toLowerCase() === username.toLowerCase());
    if (usernameTaken) return { error: 'That username is already taken.' };

    accounts[email] = { username, email, passwordHash: hashPassword(password) };
    saveAccounts(accounts);

    persist({ name: username, email, picture: null, provider: 'local' });
    return { ok: true };
  };

  // ── Local Sign-In ──────────────────────────────────────────────────────────
  const signInWithEmail = (email, password) => {
    email = email.trim().toLowerCase();

    const accounts = getAccounts();
    const account  = accounts[email];
    if (!account) return { error: 'No account found with that email.' };
    if (account.passwordHash !== hashPassword(password)) return { error: 'Incorrect password.' };

    persist({ name: account.username, email, picture: null, provider: 'local' });
    return { ok: true };
  };

  // ── Sign-Out ───────────────────────────────────────────────────────────────
  const signOut = () => {
    if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import PasswordInput from '../components/PasswordInput';

export default function AccountFormPage({ mode = 'login' }) {
  const auth = useAuth(); const navigate = useNavigate(); const location = useLocation(); const { token } = useParams();
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const signup = mode === 'signup'; const reset = mode === 'reset'; const forgot = mode === 'forgot'; const admin = mode === 'admin';
  const title = signup ? 'Create your account' : reset ? 'Choose a new password' : forgot ? 'Reset your password' : admin ? 'Shop administration' : 'Welcome back';
  const submit = async (event) => {
    event.preventDefault(); if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setError(''); setSuccess('');
    if (values.password && new TextEncoder().encode(values.password).length > 72) { setError('Password must be no longer than 72 UTF-8 bytes.'); return; }
    if ((signup || reset) && values.password !== values.confirmPassword) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      if (forgot) { await authService.forgotPassword(values.email); setSuccess('If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.'); }
      else if (reset) { const user = await authService.resetPassword(token, values); auth.updateUser(user); setSuccess('Password updated. You are signed in.'); }
      else {
        const user = await (signup ? auth.signup : admin ? auth.adminLogin : auth.login)(values);
        const requested = (typeof location.state?.from === 'string' ? location.state.from : location.state?.from?.pathname) || new URLSearchParams(location.search).get('redirect') || '/my-orders';
        const destination = /^\/(?!\/)/.test(requested) && !requested.includes('\\') ? requested : '/my-orders';
        navigate(user?.role?.toLowerCase() === 'admin' ? '/admin' : destination, { replace: true });
      }
    } catch (failure) { const status = failure.response?.status; setError(status === 429 ? 'Too many attempts. Please wait a moment before trying again.' : status === 401 ? 'Email or password is incorrect.' : failure.response?.data?.message || 'We could not complete this request. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="account-page page-width"><section className="account-intro"><p className="eyebrow">MIDHUNYAS PETALS</p><h1>{title}</h1><p>{signup ? 'Save your details and follow your flower orders in one place.' : forgot ? 'Enter your account email. We will send instructions to reset your password.' : reset ? 'Use a password you do not use for other accounts.' : admin ? 'Sign in with an administrator account to manage the shop.' : 'Sign in to continue your order and view your account.'}</p><img src="/gallery/bouquet/bouquet1.jpg" alt="A bouquet from our flower collection" width="400" height="350" /></section><section className="account-form-card"><form onSubmit={submit} aria-label={title} aria-busy={busy}>
    {signup && <div className="field"><label htmlFor="fullName">Full name</label><input name="fullName" id="fullName" autoComplete="name" required minLength={2} maxLength={70} /></div>}
    {!reset && <div className="field"><label htmlFor="email">Email address</label><input name="email" id="email" type="email" autoComplete="email" required maxLength={100} /></div>}
    {signup && <div className="field"><label htmlFor="phoneNumber">Phone number</label><input name="phoneNumber" id="phoneNumber" type="tel" autoComplete="tel" pattern="\+?[0-9]{10,15}" title="10 to 15 digits, optionally starting with +" required maxLength={16} /></div>}
    {!forgot && <PasswordInput id="password" name="password" autoComplete={signup || reset ? 'new-password' : 'current-password'} required minLength={8} />}
    {(signup || reset) && <><p className="field-hint">At least 8 characters. Use a unique password.</p><PasswordInput id="confirmPassword" name="confirmPassword" label="Confirm password" autoComplete="new-password" required minLength={8} /></>}
    {error && <p role="alert" className="form-error">{error}</p>}{success && <div role="status" className="form-success">{success}{reset && <Link to="/my-orders">Go to my orders</Link>}</div>}
    <button className="button" type="submit" disabled={busy}>{busy ? 'Please wait...' : signup ? 'Create account' : reset ? 'Update password' : forgot ? 'Send reset link' : 'Sign in'}</button>
    {signup && <p className="field-hint">By creating an account, you agree to the <Link to="/terms">terms & conditions</Link>. Read how we handle your details in our <Link to="/privacy">privacy notice</Link>.</p>}
  </form><div className="account-links">{!signup && !forgot && !reset && <Link to="/forgot-password">Forgot your password?</Link>}{signup || forgot || reset ? <Link to="/login">Back to sign in</Link> : !admin && <Link to="/signup">Create an account</Link>}</div></section></div>;
}

import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiMoon, FiSun, FiSearch, FiShoppingBag, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Dialog from './Dialog';
const links = [['/gallery', 'Shop flowers'], ['/about', 'Our shop'], ['/reviews', 'Reviews'], ['/contact', 'Contact']];
export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { items } = useCart();
  const location = useLocation(); const navigate = useNavigate();
  const [panel, setPanel] = useState(null); const [search, setSearch] = useState('');
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => { setPanel(null); }, [location.pathname, location.search]);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {} }, [dark]);
  const count = items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <header className="site-header"><div className="nav-shell">
      <Link to="/" className="wordmark" aria-label="Midhunyas Petals home"><span>MIDHUNYAS</span><small>PETALS / KARUR</small></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav>
      <div className="nav-actions">
        <button className="icon-button" aria-label="Search site" onClick={() => setPanel('search')}><FiSearch /></button>
        <button className="icon-button" aria-label={dark ? 'Use light theme' : 'Use dark theme'} aria-pressed={dark} onClick={() => setDark(!dark)}>{dark ? <FiSun /> : <FiMoon />}</button>
        <button className="icon-button account-button" aria-label="Account menu" aria-haspopup="dialog" onClick={() => setPanel('account')}><FiUser /></button>
        <Link to="/cart" className="icon-button cart-link" aria-label={`Cart, ${count} items`}><FiShoppingBag />{count > 0 && <span>{count}</span>}</Link>
        <button className="icon-button mobile-menu-button" aria-label="Open mobile menu" aria-haspopup="dialog" aria-expanded={panel === 'menu'} onClick={() => setPanel('menu')}><FiMenu /></button>
      </div>
    </div></header>
    <Dialog open={panel === 'search'} onClose={() => setPanel(null)} title="Find flowers"><form className="search-form" onSubmit={(event) => { event.preventDefault(); navigate(`/gallery?q=${encodeURIComponent(search.trim())}`); setPanel(null); }}><label htmlFor="site-search">Search by flower or design</label><input id="site-search" type="search" maxLength={100} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Try roses or bridal flowers" autoComplete="off" /><button className="button" type="submit">Search</button></form></Dialog>
    <Dialog open={panel === 'menu' || panel === 'account'} onClose={() => setPanel(null)} title={panel === 'account' ? 'Your account' : 'Explore the shop'}><nav className="dialog-nav" aria-label="Account and mobile navigation">{panel === 'menu' && links.map(([to, label]) => <Link key={to} to={to} onClick={() => setPanel(null)}>{label}</Link>)}{user ? <><Link to="/my-orders">My orders & profile</Link><Link to="/favorites">Saved flowers</Link>{isAdmin && <Link to="/admin">Manage shop</Link>}<button className="button secondary" onClick={async () => { await logout(); setPanel(null); navigate('/'); }}>Sign out</button></> : <><Link to="/login">Sign in</Link><Link to="/signup">Create an account</Link></>}</nav></Dialog>
  </>;
}

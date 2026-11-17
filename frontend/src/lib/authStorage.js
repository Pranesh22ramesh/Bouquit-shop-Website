// Access tokens stay in memory; reloads restore sessions using the HttpOnly cookie.
let accessToken = null;
try { localStorage.removeItem('bb_access_token'); } catch { /* storage may be disabled */ }
export const getAccessToken = () => accessToken;
export const hasSessionHint = () => { try { return localStorage.getItem('shop-session') === '1'; } catch { return Boolean(accessToken); } };
export const setAccessToken = (token) => { accessToken = token || null; try { if (token) localStorage.setItem('shop-session', '1'); else localStorage.removeItem('shop-session'); } catch {} };
export const clearAccessToken = () => { setAccessToken(null); };

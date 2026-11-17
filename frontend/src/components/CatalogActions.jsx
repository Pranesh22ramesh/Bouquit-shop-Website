import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiBookmark } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/userService';
import { authService } from '../api/authService';
export default function CatalogActions({ product }) {
  const { user, updateUser } = useAuth(); const navigate = useNavigate(); const [busy, setBusy] = useState(false);
  const id = product._id || product.id;
  const toggle = async (kind) => {
    if (!user) { navigate('/login', { state: { from: '/gallery' } }); return; }
    if (busy) return;
    setBusy(true);
    try { await (kind === 'likes' ? userService.toggleLike : userService.toggleWishlist)(id); updateUser(await authService.me()); }
    catch { toast.error('Could not update your saved flowers. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="catalog-actions"><button type="button" disabled={busy} aria-label={`Like ${product.name}`} aria-pressed={user?.likes?.includes(id) || false} onClick={() => toggle('likes')}><FiHeart />{user?.likes?.includes(id) ? 'Liked' : 'Like'}</button><button type="button" disabled={busy} aria-label={`Save ${product.name}`} aria-pressed={user?.wishlist?.includes(id) || false} onClick={() => toggle('wishlist')}><FiBookmark />{user?.wishlist?.includes(id) ? 'Saved' : 'Save'}</button></div>;
}

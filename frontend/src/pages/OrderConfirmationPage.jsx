import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
export default function OrderConfirmationPage() {
 const [params] = useSearchParams(); const id = params.get('order') || ''; const [copyMessage, setCopyMessage] = useState('');
 const valid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id);
 const { data: order, isLoading, isError } = useQuery({ queryKey: ['order', id], enabled: valid, retry: false, queryFn: async () => (await api.get(`/orders/${id}`)).data });
 return <article className="page-width policy-page"><p className="eyebrow">YOUR ORDER</p>{isLoading ? <p role="status">Loading order...</p> : isError || !order ? <><h1>Order unavailable</h1><p>We could not find an order you can access. Check My orders or contact the shop for help.</p></> : <><h1>Order received</h1><p>Order number: <strong>{order._id}</strong></p><p>Status: {order.status}</p><p>Total: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.totalPrice)}</p><p>Payment: {order.paymentMethod}</p><p>Last updated: <time dateTime={order.updatedAt}>{new Date(order.updatedAt || order.createdAt).toLocaleString('en-IN')}</time></p><div className="button-row"><button className="button secondary" onClick={async () => { try { await navigator.clipboard.writeText(order._id); setCopyMessage('Order number copied.'); } catch { setCopyMessage('Select the order number above to copy it.'); } }}>Copy order number</button><button className="button secondary" onClick={() => window.print()}>Print order</button></div><p role="status">{copyMessage}</p></>}<div className="button-row"><Link className="button" to="/my-orders">View my orders</Link><Link className="text-link" to="/gallery">Continue shopping</Link></div></article>;
}

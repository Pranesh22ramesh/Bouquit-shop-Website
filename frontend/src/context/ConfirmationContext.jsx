import React, { createContext, useContext, useState } from 'react';
import Dialog from '../components/Dialog';
const Context = createContext(null);
export const useConfirmation = () => useContext(Context);
export function ConfirmationProvider({ children }) {
  const [pending, setPending] = useState(null);
  const confirm = (message) => new Promise((resolve) => setPending((previous) => { previous?.resolve(false); return { message, resolve }; }));
  const finish = (accepted) => { pending?.resolve(accepted); setPending(null); };
  return <Context.Provider value={confirm}>{children}<Dialog open={Boolean(pending)} onClose={() => finish(false)} title="Confirm deletion"><p className="mb-6">{pending?.message}</p><div className="button-row"><button className="button secondary" onClick={() => finish(false)}>Keep it</button><button className="button" onClick={() => finish(true)}>Delete</button></div></Dialog></Context.Provider>;
}

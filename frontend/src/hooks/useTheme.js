import { useSyncExternalStore } from 'react';
const subscribe = (callback) => {
 const observer = new MutationObserver(callback);
 observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
 return () => observer.disconnect();
};
export const useTheme = () => useSyncExternalStore(subscribe, () => document.documentElement.classList.contains('dark'), () => false);

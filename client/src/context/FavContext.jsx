import { createContext, useContext, useEffect, useState } from 'react';

const FavContext = createContext(null);
export const useFavs = () => useContext(FavContext);

// Saved (heart) fragrances, kept in this browser.
export function FavProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favs')) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem('favs', JSON.stringify(ids)), [ids]);
  const has = (id) => ids.includes(id);
  const toggle = (id) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return <FavContext.Provider value={{ ids, has, toggle }}>{children}</FavContext.Provider>;
}

import { useEffect, useState } from 'react';
import { api } from './api.js';

// One shared copy of the catalogue, refreshed at most once a minute.
let cache = null;
let cachedAt = 0;
let inflight = null;

export function loadProducts(force = false) {
  if (cache && !force && Date.now() - cachedAt < 60000) return Promise.resolve(cache);
  if (!inflight) {
    inflight = api('/products')
      .then((d) => { cache = d; cachedAt = Date.now(); inflight = null; return d; })
      .catch((e) => { inflight = null; throw e; });
  }
  return inflight;
}

export function useProducts() {
  const [list, setList] = useState(cache || []);
  useEffect(() => {
    let on = true;
    loadProducts().then((d) => on && setList(d)).catch(() => {});
    return () => { on = false; };
  }, []);
  return list;
}

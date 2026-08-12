'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { PublicPortal } from '@/lib/api';
import { loadPublicPortal } from '@/lib/publicPortalCache';

const PortalContext = createContext<{ data: PublicPortal | null; loading: boolean }>({ data: null, loading: true });

export function PublicPortalProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PublicPortal | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (data) return; loadPublicPortal().then(setData).finally(() => setLoading(false));
  }, [data]);
  return <PortalContext.Provider value={{ data, loading }}>{children}</PortalContext.Provider>;
}

export const usePublicPortal = () => useContext(PortalContext);

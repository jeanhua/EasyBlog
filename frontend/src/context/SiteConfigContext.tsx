import React, { createContext, useContext, useEffect, useState } from "react";

import api from "../lib/api";

type SiteConfig = {
  enable_register?: boolean | null;
};

const SiteConfigContext = createContext<SiteConfig | undefined>(undefined);

export function SiteConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cfg, setCfg] = useState<SiteConfig>({ enable_register: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getConfig("enable_register");
        const val = (res as any).data?.value;
        setCfg({ enable_register: val === "true" });
      } catch {
        setCfg({ enable_register: false });
      }
    })();
  }, []);

  return (
    <SiteConfigContext.Provider value={cfg}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx)
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return ctx;
}

export default SiteConfigContext;

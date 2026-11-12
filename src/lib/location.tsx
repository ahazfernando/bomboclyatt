"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MARKET_LOCATIONS, getLocationById, type MarketLocation } from "@/lib/locations";

const KEY = "bomboclyatt-location";

interface LocationContextValue {
  locationId: string | null;
  location: MarketLocation | null;
  setLocationId: (id: string | null) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationId, setLocationIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && getLocationById(saved)) setLocationIdState(saved);
    } catch {}
  }, []);

  const setLocationId = (id: string | null) => {
    setLocationIdState(id);
    try {
      if (id) localStorage.setItem(KEY, id);
      else localStorage.removeItem(KEY);
    } catch {}
  };

  const location = getLocationById(locationId) ?? null;

  return (
    <LocationContext.Provider value={{ locationId, location, setLocationId }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}

export { MARKET_LOCATIONS };

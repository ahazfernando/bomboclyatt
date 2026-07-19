"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Currency = "USD" | "LKR" | "EUR";

const RATES: Record<Currency, number> = {
  USD: 1,
  LKR: 300,
  EUR: 0.92,
};

const SYMBOLS: Record<Currency, string> = {
  USD: "$",
  LKR: "Rs ",
  EUR: "€",
};

const KEY = "emberdex-currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Convert a USD amount into the active currency and format it. */
  formatPrice: (usdAmount: number) => string;
  /** Convert a USD amount into the active currency (numeric). */
  convert: (usdAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Currency | null;
      if (saved && saved in RATES) setCurrencyState(saved);
    } catch {}
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(KEY, c);
    } catch {}
  };

  const convert = (usdAmount: number) => usdAmount * RATES[currency];

  const formatPrice = (usdAmount: number) => {
    const value = convert(usdAmount);
    if (currency === "LKR") {
      return `${SYMBOLS.LKR}${Math.round(value).toLocaleString()}`;
    }
    if (currency === "EUR") {
      return `${SYMBOLS.EUR}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return `${SYMBOLS.USD}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export const CURRENCIES: { code: Currency; label: string }[] = [
  { code: "USD", label: "USD $" },
  { code: "LKR", label: "LKR Rs" },
  { code: "EUR", label: "EUR €" },
];

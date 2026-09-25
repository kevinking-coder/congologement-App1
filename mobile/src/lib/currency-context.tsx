import { createContext, useContext, useState, type ReactNode } from 'react';
import { type Currency } from '@/src/lib/listing-utils';

const CurrencyContext = createContext<{ currency: Currency; toggle: () => void; setCurrency: (c: Currency) => void } | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const toggle = () => setCurrency((c) => (c === 'USD' ? 'CDF' : 'USD'));
  return (
    <CurrencyContext.Provider value={{ currency, toggle, setCurrency }}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

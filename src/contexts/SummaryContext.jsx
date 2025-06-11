import { createContext, useState } from "react";

export const SummaryContext = createContext();

export function SummaryProvider({ children }) {
  const [summaryData, setSummaryData] = useState({ url: "", summary: "" });

  return (
    <SummaryContext.Provider value={{ summaryData, setSummaryData }}>
      {children}
    </SummaryContext.Provider>
  );
}

"use client";

import React, { createContext, useContext } from 'react';

type SettingsContextType = {
  [key: string]: any;
};

const SettingsContext = createContext<SettingsContextType>({});

export function SettingsProvider({ children, settings }: { children: React.ReactNode, settings: SettingsContextType }) {
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

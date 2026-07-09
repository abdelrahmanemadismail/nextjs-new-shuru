'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface BreadcrumbContextType {
  titles: Record<string, string>;
  setBreadcrumbTitle: (path: string, title: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [titles, setTitles] = useState<Record<string, string>>({});

  const setBreadcrumbTitle = useCallback((path: string, title: string) => {
    setTitles((prev) => {
      if (prev[path] === title) return prev;
      return { ...prev, [path]: title };
    });
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ titles, setBreadcrumbTitle }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}

interface BreadcrumbTitleSetterProps {
  path: string;
  title: string;
}

export function BreadcrumbTitleSetter({ path, title }: BreadcrumbTitleSetterProps) {
  const { setBreadcrumbTitle } = useBreadcrumb();
  
  React.useEffect(() => {
    if (path && title) {
      setBreadcrumbTitle(path, title);
    }
  }, [path, title, setBreadcrumbTitle]);

  return null;
}

"use client";

import { createContext, useContext, useState } from "react";

type EvaluationActions = {
  openImport: () => void;
  exportExcel: () => void;
};

type SummaryActions = {
  viewSelectedResults: () => void;
  disabled: boolean;
};

type AdminEvaluationActionsContextValue = {
  actions: EvaluationActions | null;
  setActions: (actions: EvaluationActions | null) => void;
  summaryActions: SummaryActions | null;
  setSummaryActions: (actions: SummaryActions | null) => void;
};

const AdminEvaluationActionsContext =
  createContext<AdminEvaluationActionsContextValue | null>(null);

export function AdminEvaluationActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [actions, setActions] = useState<EvaluationActions | null>(null);
  const [summaryActions, setSummaryActions] =
    useState<SummaryActions | null>(null);

  return (
    <AdminEvaluationActionsContext.Provider
      value={{ actions, setActions, summaryActions, setSummaryActions }}
    >
      {children}
    </AdminEvaluationActionsContext.Provider>
  );
}

export function useAdminEvaluationActions() {
  const context = useContext(AdminEvaluationActionsContext);
  if (!context) {
    throw new Error(
      "useAdminEvaluationActions must be used within AdminEvaluationActionsProvider",
    );
  }
  return context;
}

export function useOptionalAdminEvaluationActions() {
  return useContext(AdminEvaluationActionsContext);
}

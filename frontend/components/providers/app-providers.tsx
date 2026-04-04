"use client";

import { CrmAuthProvider } from "@/context/crm-auth-context";
import { OrgBrandingProvider } from "@/context/org-branding-context";
import type { ReactNode } from "react";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({
  children,
}: AppProvidersProps): React.JSX.Element => {
  return (
    <OrgBrandingProvider>
      <CrmAuthProvider>{children}</CrmAuthProvider>
    </OrgBrandingProvider>
  );
};

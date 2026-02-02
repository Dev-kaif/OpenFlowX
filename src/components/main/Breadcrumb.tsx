"use client";

import { usePathname } from "next/navigation";
import { BreadcrumbPage } from "../ui/breadcrumb";

function getBreadcrumbTitle(pathname: string) {

  const ROUTE_TITLES: Record<string, string> = {
    "/workflows": "Workflows",
    "/credentials": "Credentials",
    "/executions": "Executions",
    "/settings": "Settings",
  };

  if (pathname.startsWith("/executions")) {
    return "Execution History";
  }

  return ROUTE_TITLES[pathname] ?? "Workflows";
}

export default function BreadcrumbPageClient() {
  const pathname = usePathname();

  const title = getBreadcrumbTitle(pathname);

  return (
    <BreadcrumbPage>
      {title}
    </BreadcrumbPage>
  );
}

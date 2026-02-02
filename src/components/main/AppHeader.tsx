import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import BreadcrumbPageClient from "./Breadcrumb";

function AppHeader() {
  return (
    <header className="flex sticky top-0 z-50 px-4 border-b h-14 gap-2 items-center bg-sidebar">
      <div className="flex shrink-0 grow items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPageClient />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}

export default AppHeader;

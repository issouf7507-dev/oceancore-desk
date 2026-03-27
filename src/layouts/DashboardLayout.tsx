import { Outlet } from 'react-router-dom'

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"



export function DashboardLayout() {


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />

      <SidebarInset>

        <div className="flex flex-1 flex-col gap-4 ">
          <Outlet />

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

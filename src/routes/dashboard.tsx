import { createFileRoute, Outlet } from '@tanstack/solid-router'
import type { ParentProps } from 'solid-js'
import { AppSidebar } from '~/components/page/app-sidebar'
import { DynamicBreadcrump } from '~/components/page/breadCrump'
import ThemeToggle from '~/components/ThemeToggle'
import { SidebarProvider, SidebarTrigger } from '~/components/ui/sidebar'


export const Route = createFileRoute('/dashboard')({
  component: Customlayout,
})


function Customlayout(props: ParentProps) {
  return (
    <SidebarProvider>

      <AppSidebar />


      <main class="flex flex-1 flex-col w-full min-h-screen">
        {/* Top Navbar/Header */}
        <header class="flex h-14 items-center justify-between border-b rounded-b-2xl px-4 bg-background shadow-2xl shadow-blue-200">
          {/* Left Side: Trigger & Breadcrumbs */}
          <div class="flex items-center gap-4">
            <SidebarTrigger />
            <DynamicBreadcrump />
          </div>

          {/* Right Side: Theme Toggle */}
          <ThemeToggle />
        </header>

        {/* Main Content Area (Outlet) */}
        <div class="flex-1 p-2  bg-muted/20">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  )
}

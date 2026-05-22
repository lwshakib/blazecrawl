"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Icon } from "@iconify/react"
import { Logo } from "@/components/Logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog"

interface NavigationItem {
  name: string
  url: string
  icon: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeItem?: string
  setActiveItem?: (item: string) => void
  handleLogout: () => void
}

// 1. Navigation items list matching standard workspace sub-routes
const data = {
  navMain: [
    { name: "Overview", url: "/overview", icon: "solar:widget-linear" },
    {
      name: "Scrape a Web Page",
      url: "/scrape",
      icon: "solar:document-text-linear",
    },
    { name: "Settings", url: "/settings", icon: "solar:settings-linear" },
  ],
}

// 2. NavMain: Handles clean flat navigation items with direct HTML routing links
export function NavMain({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="p-2 py-0">
      <SidebarGroupContent>
        <SidebarMenu className="gap-0">
          {items.map((item) => (
            <SidebarMenuItem key={item.name} className="my-0.5">
              <SidebarMenuButton
                isActive={
                  pathname === item.url ||
                  (item.url === "/overview" && pathname === "/")
                }
                asChild
                tooltip={item.name}
                className="h-9 transition-colors"
              >
                <Link href={item.url} className="flex w-full items-center">
                  <Icon icon={item.icon} className="mr-2 h-4 w-4 shrink-0" />
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.name}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// 3. NavUser: Footer component handling Account and Log Out buttons without borders
export function NavUser({ handleLogout }: { handleLogout: () => void }) {
  const pathname = usePathname()

  return (
    <SidebarMenu className="gap-0">
      {/* Account Item */}
      <SidebarMenuItem className="my-1.5">
        <SidebarMenuButton
          isActive={pathname === "/account"}
          asChild
          tooltip="Account"
          className="h-9 transition-colors"
        >
          <Link href="/account" className="flex w-full items-center">
            <Icon icon="solar:user-linear" className="mr-2 h-4 w-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">
              Account
            </span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Logout Item */}
      <SidebarMenuItem className="my-1.5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <SidebarMenuButton
              tooltip="Log Out"
              className="h-9 transition-colors"
            >
              <Icon
                icon="solar:logout-linear"
                className="mr-2 h-4 w-4 shrink-0"
              />
              <span className="group-data-[collapsible=icon]:hidden">
                Log Out
              </span>
            </SidebarMenuButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will end your active session on BlazeCrawl and redirect you
                back to the login screen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// 4. Main AppSidebar component exporting the final sidebar structure with decreased top gap
export function AppSidebar({ handleLogout, ...props }: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 bg-card"
      {...props}
    >
      {/* Sidebar Header: Logo and App Name aligned to start and matching menu items alignment */}
      <SidebarHeader className="flex h-14 justify-center border-b-0 p-2">
        <div className="flex w-full items-center gap-2.5 overflow-hidden px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Logo className="h-7 w-7 shrink-0 animate-pulse text-foreground" />
          <span className="truncate text-lg font-bold tracking-tight transition-opacity duration-200 group-data-[collapsible=icon]:hidden">
            BlazeCrawl
          </span>
        </div>
      </SidebarHeader>

      {/* Sidebar Content: Flat Navigation Items with tight padding (decreased title gap) */}
      <SidebarContent className="py-0 pt-1.5 pb-4">
        <NavMain items={data.navMain} />
      </SidebarContent>

      {/* Sidebar Footer: Account and Logout Buttons (clean layout, no borders) */}
      <SidebarFooter className="p-2 pt-0">
        <NavUser handleLogout={handleLogout} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

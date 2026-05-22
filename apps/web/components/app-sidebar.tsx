"use client"

import * as React from "react"
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
  icon: string
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeItem: string
  setActiveItem: (item: string) => void
  handleLogout: () => void
}

// 1. Navigation items list matching standard workspace views
const data = {
  navMain: [
    { name: "Overview", icon: "solar:widget-linear" },
    { name: "Crawlers", icon: "solar:layers-linear" },
    { name: "Datasets", icon: "solar:database-linear" },
    { name: "Settings", icon: "solar:settings-linear" },
  ]
}

// 2. NavMain: Handles clean flat navigation items with start-aligned icons
export function NavMain({
  items,
  activeItem,
  setActiveItem,
}: {
  items: NavigationItem[]
  activeItem: string
  setActiveItem: (item: string) => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                isActive={activeItem === item.name}
                onClick={() => setActiveItem(item.name)}
                tooltip={item.name}
                className="transition-colors"
              >
                <Icon icon={item.icon} className="w-4 h-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.name}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// 3. NavUser: Footer component handling Account and Log Out buttons without borders
export function NavUser({
  activeItem,
  setActiveItem,
  handleLogout,
}: {
  activeItem: string
  setActiveItem: (item: string) => void
  handleLogout: () => void
}) {
  return (
    <SidebarMenu>
      {/* Account Item */}
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={activeItem === "Account"}
          onClick={() => setActiveItem("Account")}
          tooltip="Account"
          className="transition-colors"
        >
          <Icon icon="solar:user-linear" className="w-4 h-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Account</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {/* Logout Item */}
      <SidebarMenuItem className="mt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <SidebarMenuButton
              tooltip="Log Out"
              className="transition-colors"
            >
              <Icon icon="solar:logout-linear" className="w-4 h-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
            </SidebarMenuButton>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will end your active session on BlazeCrawl and redirect you back to the login screen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

// 4. Main AppSidebar component exporting the final sidebar structure
export function AppSidebar({
  activeItem,
  setActiveItem,
  handleLogout,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/60 bg-card" {...props}>
      {/* Sidebar Header: Logo and App Name aligned to start and matching menu items alignment */}
      <SidebarHeader className="h-16 flex justify-center p-2 border-b-0">
        <div className="flex items-center gap-2.5 px-2 overflow-hidden w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Logo className="w-7 h-7 text-foreground shrink-0" />
          <span className="font-bold text-lg tracking-tight truncate group-data-[collapsible=icon]:hidden transition-opacity duration-200">
            BlazeCrawl
          </span>
        </div>
      </SidebarHeader>

      {/* Sidebar Content: Flat Navigation Items */}
      <SidebarContent className="py-4">
        <NavMain
          items={data.navMain}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      </SidebarContent>

      {/* Sidebar Footer: Account and Logout Buttons (clean layout, no borders) */}
      <SidebarFooter className="p-2">
        <NavUser
          activeItem={activeItem}
          setActiveItem={setActiveItem}
          handleLogout={handleLogout}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

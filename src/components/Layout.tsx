import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Menu } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Global trigger in header - always visible */}
        <header className="h-14 flex items-center border-b border-border/50 bg-gradient-card shadow-sm fixed top-0 left-0 right-0 z-50">
          <SidebarTrigger className="ml-4">
            <Menu className="h-4 w-4" />
          </SidebarTrigger>
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-lg font-semibold text-foreground">ClinicFlow</h1>
          </div>
          <div className="w-12"></div> {/* Spacer for balance */}
        </header>

        <AppSidebar />

        <main className="flex-1 pt-14">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
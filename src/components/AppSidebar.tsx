import { Calendar, Users, UserCheck, Settings, BarChart3, Home } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Agenda", url: "/agenda", icon: Calendar },
  { title: "Pacientes", url: "/pacientes", icon: Users },
  { title: "Profissionais", url: "/profissionais", icon: UserCheck },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isCollapsed = state === "collapsed"
  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary shadow-sm" 
      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"

  return (
    <Sidebar
      className="bg-gradient-card border-r border-border/50 shadow-card"
      collapsible="icon"
    >
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border/50">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">ClinicFlow</h2>
              <p className="text-xs text-muted-foreground">Gestão Clínica</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <Calendar className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`${isCollapsed ? "sr-only" : ""} text-xs font-medium text-muted-foreground mb-2`}>
            Navegação
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${getNavCls({ isActive })}`
                      }
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info at bottom */}
        {!isCollapsed && (
          <div className="mt-auto p-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@clinica.com</p>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
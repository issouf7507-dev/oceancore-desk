import * as React from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  Ship,
  LayoutDashboard,
  LogOut,
  Loader2,
  Fuel,
  Truck,
  Users,
  Gauge,
  BarChart3,
  GaugeCircle,
  Route,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ModeToggle } from "./mode-toggle"
import { Button } from "./ui/button"
import { logoutRequest } from "@/modules/auth/core/_requests"
import { useAuth } from "@/modules/auth/core/Auth"

// Données de navigation
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      title: "Consommation moyenne flotte",
      url: "/consommation-moyenne-flotte",
      icon: Gauge,
    },
    {
      title: "Consommation moyenne véhicule",
      url: "/conso-moyenne-vehicule",
      icon: BarChart3,
    },

    {
      title: "Trajets anormaux",
      url: "/trajets-anormaux",
      icon: Fuel,
    },
    {
      title: "Frequence ravitaillements",
      url: "/frequence-ravitaillements",
      icon: Truck,
    },
    {
      title: "Eco score chauffeurs",
      url: "/eco-score-chauffeurs",
      icon: Users,
    },
    {
      title: "Vitesse max véhicule",
      url: "/vitesse-max-vehicule",
      icon: GaugeCircle,
    },
    {
      title: "Conso pondérée ligne",
      url: "/conso-ponderee-ligne",
      icon: Route,
    },

  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isLoading, setIsLoading] = React.useState(false);
  const location = useLocation()
  const navigate = useNavigate()
  const { auth, setCurrentUser, saveAuth } = useAuth()
  const logout = async () => {
    setIsLoading(true)
    try {
      await logoutRequest(auth.api_token)
      localStorage.removeItem("kt-auth-react-v");
      setCurrentUser(undefined)
      saveAuth(undefined)
    } catch (error) {
      // Session déjà expirée ou invalide, on redirige quand même
      localStorage.removeItem("kt-auth-react-v");
      setCurrentUser(undefined)
      saveAuth(undefined)
      navigate("/auth")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Ship className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Ocean Transport</span>
                  <span className="text-xs text-sidebar-muted-foreground">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent >

        <div className="flex gap-2 flex-col justify-between w-full h-full">
          <SidebarGroup>
            <SidebarMenu className="gap-1">
              {data.navMain.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.url ||
                  (item.url !== "/dashboard" && location.pathname.startsWith(item.url))

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>

            <SidebarGroupContent>
              <div className="flex items-center gap-1">
                <ModeToggle />
                <Button variant="default" size="default" className="w-full" onClick={logout} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  <span>Déconnexion</span>
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>


      </SidebarContent>
    </Sidebar>
  )
}

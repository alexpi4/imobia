import * as React from "react"
import { cn } from "@/lib/utils"
import { PanelLeft } from "lucide-react"

const SidebarContext = React.createContext<{
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}>({
    collapsed: false,
    setCollapsed: () => { },
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = React.useState(false)
    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
            <div className="flex min-h-screen w-full bg-background text-foreground">
                {children}
            </div>
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    return React.useContext(SidebarContext)
}

export function Sidebar({ className, children }: { className?: string, children: React.ReactNode }) {
    const { collapsed } = useSidebar()
    return (
        <aside className={cn("border-r bg-card transition-all duration-300", collapsed ? "w-16" : "w-64", className)}>
            {children}
        </aside>
    )
}

export function SidebarTrigger() {
    const { collapsed, setCollapsed } = useSidebar()
    return <button onClick={() => setCollapsed(!collapsed)} className="p-2"><PanelLeft /></button>
}

export function SidebarGroup({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={cn("p-4", className)}>{children}</div>
}

export function SidebarGroupLabel({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar()
    if (collapsed) return null
    return <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">{children}</h3>
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
    return <ul className="space-y-1">{children}</ul>
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
    return <li>{children}</li>
}

export function SidebarMenuButton({ children, isActive, onClick, className }: { children: React.ReactNode, isActive?: boolean, onClick?: () => void, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground",
                className
            )}
        >
            {children}
        </button>
    )
}

export function SidebarMenuSub({ children }: { children: React.ReactNode }) {
    return <ul className="ml-4 mt-1 space-y-1 border-l border-border pl-2">{children}</ul>
}

export function SidebarMenuSubItem({ children }: { children: React.ReactNode }) {
    return <li>{children}</li>
}

export function SidebarMenuSubButton({ children, isActive, onClick, className }: { children: React.ReactNode, isActive?: boolean, onClick?: () => void, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground",
                className
            )}
        >
            {children}
        </button>
    )
}

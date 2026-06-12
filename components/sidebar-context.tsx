"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

interface SidebarContextType {
    isCollapsed: boolean
    toggleSidebar: () => void
    setIsCollapsed: (collapsed: boolean) => void
    isMobileOpen: boolean
    toggleMobileSidebar: () => void
    setIsMobileOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem('sidebar-collapsed') === 'true'
    })
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const hasMounted = useRef(false)

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (hasMounted.current) {
            localStorage.setItem('sidebar-collapsed', String(isCollapsed))
        }
        hasMounted.current = true
    }, [isCollapsed])

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev)
    }

    const toggleMobileSidebar = () => {
        setIsMobileOpen(prev => !prev)
    }

    return (
        <SidebarContext.Provider value={{
            isCollapsed,
            toggleSidebar,
            setIsCollapsed,
            isMobileOpen,
            toggleMobileSidebar,
            setIsMobileOpen
        }}>
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}

"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

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
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Load state from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('sidebar-collapsed')
        if (stored !== null) {
            setIsCollapsed(stored === 'true')
        }
        setMounted(true)
    }, [])

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('sidebar-collapsed', String(isCollapsed))
        }
    }, [isCollapsed, mounted])

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

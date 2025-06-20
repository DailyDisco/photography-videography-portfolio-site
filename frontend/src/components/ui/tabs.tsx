import React from 'react'
import { cn } from '../../lib/utils'

interface TabsContextType {
    activeTab: string
    setActiveTab: (tab: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
    defaultValue: string
    children: React.ReactNode
    className?: string
}

export const Tabs: React.FC<TabsProps> = ({
    defaultValue,
    children,
    className
}) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue)

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn('w-full', className)}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    children: React.ReactNode
    className?: string
}

export const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
                className
            )}
        >
            {children}
        </div>
    )
}

interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
    value,
    children,
    className
}) => {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error('TabsTrigger must be used within Tabs')
    }

    const { activeTab, setActiveTab } = context
    const isActive = activeTab === value

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:bg-background/50',
                className
            )}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

export const TabsContent: React.FC<TabsContentProps> = ({
    value,
    children,
    className
}) => {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error('TabsContent must be used within Tabs')
    }

    const { activeTab } = context
    if (activeTab !== value) return null

    return (
        <div
            className={cn(
                'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                className
            )}
        >
            {children}
        </div>
    )
} 
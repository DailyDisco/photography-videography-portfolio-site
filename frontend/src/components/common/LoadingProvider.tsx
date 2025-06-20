import React, { createContext, useContext, ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface LoadingContextType {
    isLoading: boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
    const context = useContext(LoadingContext)
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider')
    }
    return context
}

interface LoadingProviderProps {
    children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const isLoading = useSelector((state: RootState) => state.ui.isLoading)

    return (
        <LoadingContext.Provider value={{ isLoading }}>
            {children}
            {isLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg border shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="loading-spinner w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span className="text-foreground">Loading...</span>
                        </div>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    )
} 
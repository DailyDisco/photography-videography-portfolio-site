import React, { ReactNode, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { getCurrentUser } from '../../store/slices/authSlice'

interface ProtectedRouteProps {
    children: ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>()
    const location = useLocation()
    const { isAuthenticated, isLoading, token } = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        // If we have a token but no user data, try to fetch user
        if (token && !isAuthenticated && !isLoading) {
            dispatch(getCurrentUser())
        }
    }, [dispatch, token, isAuthenticated, isLoading])

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <div className="loading-spinner w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span>Verifying authentication...</span>
                </div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Render protected content
    return <>{children}</>
} 
import React, { useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, Mail, Camera, Loader2 } from 'lucide-react'
import { RootState, AppDispatch } from '../store'
import { loginUser, clearError } from '../store/slices/authSlice'
import { LoginCredentials } from '../types'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const LoginPage: React.FC = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch<AppDispatch>()
    const { isLoading, isAuthenticated, error } = useSelector((state: RootState) => state.auth)

    const from = (location.state as any)?.from?.pathname || '/admin'

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
    })

    useEffect(() => {
        // Redirect if already authenticated
        if (isAuthenticated) {
            navigate(from, { replace: true })
        }
    }, [isAuthenticated, navigate, from])

    useEffect(() => {
        // Clear errors when component mounts
        dispatch(clearError())
    }, [dispatch])

    const onSubmit = async (data: LoginCredentials) => {
        try {
            await dispatch(loginUser(data)).unwrap()
            navigate(from, { replace: true })
        } catch (error) {
            // Error is handled by the redux slice
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full"
            >
                <div className="bg-card border border-border rounded-lg shadow-lg p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold text-foreground mb-6">
                            <Camera className="w-8 h-8 text-primary" />
                            <span>Portfolio</span>
                        </Link>
                        <h2 className="text-2xl font-bold text-foreground">Admin Login</h2>
                        <p className="text-muted-foreground mt-2">
                            Sign in to access the admin dashboard
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    id="email"
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="admin@portfolio.com"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                                <input
                                    {...register('password')}
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <span>Sign in</span>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-accent/50 rounded-md border border-border">
                        <p className="text-sm font-medium text-foreground mb-2">Demo Credentials:</p>
                        <p className="text-sm text-muted-foreground">
                            Email: <code className="bg-background px-1 rounded">admin@portfolio.com</code>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Password: <code className="bg-background px-1 rounded">admin123</code>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            ← Back to Homepage
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
} 
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu, X, Camera, User, LogOut } from 'lucide-react'
import { RootState, AppDispatch } from '../../store'
import { logoutUser } from '../../store/slices/authSlice'
import { MediaCategory } from '../../types'

const categories: { name: string; label: string; path: MediaCategory }[] = [
    { name: 'athletes', label: 'Athletes', path: 'athletes' },
    { name: 'food', label: 'Food', path: 'food' },
    { name: 'nature', label: 'Nature', path: 'nature' },
    { name: 'portraits', label: 'Portraits', path: 'portraits' },
    { name: 'action', label: 'Action', path: 'action' },
]

export const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

    const handleLogout = async () => {
        await dispatch(logoutUser())
        navigate('/')
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <header className="bg-background border-b border-border sticky top-0 z-40">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
                        onClick={closeMobileMenu}
                    >
                        <Camera className="w-6 h-6" />
                        <span>Portfolio</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            Home
                        </Link>

                        {/* Gallery Dropdown */}
                        <div className="relative group">
                            <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                Galleries
                            </button>
                            <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[160px]">
                                {categories.map((category) => (
                                    <Link
                                        key={category.name}
                                        to={`/gallery/${category.path}`}
                                        className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                                    >
                                        {category.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link
                            to="/contact"
                            className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/contact' ? 'text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            Contact
                        </Link>

                        <Link
                            to="/booking"
                            className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/booking' ? 'text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            Booking
                        </Link>

                        {/* Auth Section */}
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/admin"
                                    className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/admin' ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    Admin
                                </Link>
                                <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm text-muted-foreground">{user?.email}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <div className="flex flex-col space-y-3">
                            <Link
                                to="/"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                onClick={closeMobileMenu}
                            >
                                Home
                            </Link>

                            {/* Mobile Gallery Links */}
                            <div className="pl-4">
                                <div className="text-sm font-medium text-muted-foreground mb-2">Galleries</div>
                                {categories.map((category) => (
                                    <Link
                                        key={category.name}
                                        to={`/gallery/${category.path}`}
                                        className="block py-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        {category.label}
                                    </Link>
                                ))}
                            </div>

                            <Link
                                to="/contact"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                onClick={closeMobileMenu}
                            >
                                Contact
                            </Link>

                            <Link
                                to="/booking"
                                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                onClick={closeMobileMenu}
                            >
                                Booking
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/admin"
                                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                        onClick={closeMobileMenu}
                                    >
                                        Admin
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout()
                                            closeMobileMenu()
                                        }}
                                        className="text-left text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Logout ({user?.email})
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors w-fit"
                                    onClick={closeMobileMenu}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
} 
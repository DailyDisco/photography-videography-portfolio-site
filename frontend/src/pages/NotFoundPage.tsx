import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20">
            <div className="max-w-md w-full text-center px-4">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
                    <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
                    <p className="text-muted-foreground text-lg">
                        Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        <span>Go Home</span>
                    </Link>
                    <Link
                        to="/gallery/portraits"
                        className="inline-flex items-center justify-center space-x-2 border border-border text-foreground px-6 py-3 rounded-md font-medium hover:bg-accent transition-colors"
                    >
                        <Search className="w-5 h-5" />
                        <span>Browse Gallery</span>
                    </Link>
                </div>
            </div>
        </div>
    )
} 
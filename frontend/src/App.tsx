import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'

import { store } from './store'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { GalleryPage } from './pages/GalleryPage'
import { ContactPage } from './pages/ContactPage'
import { BookingPage } from './pages/BookingPage'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { LoadingProvider } from './components/common/LoadingProvider'
import { ErrorBoundary } from './components/common/ErrorBoundary'

import './styles/globals.css'

// Create a client with React Query v5 configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 1,
        },
    },
})

function App() {
    return (
        <ErrorBoundary>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <LoadingProvider>
                        <Router>
                            <div className="min-h-screen bg-background font-sans antialiased">
                                <Routes>
                                    {/* Public routes */}
                                    <Route path="/" element={<Layout />}>
                                        <Route index element={<HomePage />} />
                                        <Route path="gallery/:category" element={<GalleryPage />} />
                                        <Route path="contact" element={<ContactPage />} />
                                        <Route path="booking" element={<BookingPage />} />
                                        <Route path="login" element={<LoginPage />} />

                                        {/* Protected admin routes */}
                                        <Route
                                            path="admin"
                                            element={
                                                <ProtectedRoute>
                                                    <AdminPage />
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Gallery category routes */}
                                        <Route path="athletes" element={<GalleryPage />} />
                                        <Route path="food" element={<GalleryPage />} />
                                        <Route path="nature" element={<GalleryPage />} />
                                        <Route path="portraits" element={<GalleryPage />} />
                                        <Route path="action" element={<GalleryPage />} />

                                        {/* 404 */}
                                        <Route path="*" element={<NotFoundPage />} />
                                    </Route>
                                </Routes>

                                {/* Global toast notifications */}
                                <Toaster
                                    position="top-right"
                                    toastOptions={{
                                        duration: 4000,
                                        style: {
                                            background: 'hsl(var(--background))',
                                            color: 'hsl(var(--foreground))',
                                            border: '1px solid hsl(var(--border))',
                                        },
                                        success: {
                                            iconTheme: {
                                                primary: 'hsl(var(--primary))',
                                                secondary: 'hsl(var(--primary-foreground))',
                                            },
                                        },
                                        error: {
                                            iconTheme: {
                                                primary: 'hsl(var(--destructive))',
                                                secondary: 'hsl(var(--destructive-foreground))',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </Router>
                    </LoadingProvider>
                </QueryClientProvider>
            </Provider>
        </ErrorBoundary>
    )
}

export default App 
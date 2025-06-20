import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
        this.setState({ error, errorInfo })
    }

    override render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="max-w-md w-full p-6 bg-card rounded-lg border shadow-lg">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h1>
                            <p className="text-muted-foreground mb-6">
                                An unexpected error occurred. Please refresh the page or try again later.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-sm font-medium mb-2">
                                        Error Details (Development Only)
                                    </summary>
                                    <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    Refresh Page
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                                >
                                    Go Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
} 
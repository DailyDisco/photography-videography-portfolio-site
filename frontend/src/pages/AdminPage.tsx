import React from 'react'
import { Upload, Settings, BarChart3, Users } from 'lucide-react'

export const AdminPage: React.FC = () => {
    return (
        <div className="min-h-screen">
            <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Admin Dashboard
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Manage your portfolio, uploads, and business settings.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <Upload className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Upload Media</h3>
                            <p className="text-muted-foreground">Add new photos and videos to your galleries</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <BarChart3 className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Analytics</h3>
                            <p className="text-muted-foreground">View engagement and performance metrics</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Contact Messages</h3>
                            <p className="text-muted-foreground">Manage inquiries and client communications</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <Settings className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Settings</h3>
                            <p className="text-muted-foreground">Configure site settings and preferences</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground">Full admin functionality will be implemented here.</p>
                    </div>
                </div>
            </section>
        </div>
    )
} 
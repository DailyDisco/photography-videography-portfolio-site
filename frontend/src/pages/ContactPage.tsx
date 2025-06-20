import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'

export const ContactPage: React.FC = () => {
    return (
        <div className="min-h-screen">
            <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Get In Touch
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Ready to capture your special moments? Let's discuss your photography needs
                            and create something beautiful together.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
                            <p className="text-muted-foreground">contact@portfolio.com</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <Phone className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Phone</h3>
                            <p className="text-muted-foreground">(555) 123-4567</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <MapPin className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Location</h3>
                            <p className="text-muted-foreground">Your City, State</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="bg-card border border-border rounded-lg p-8">
                            <p className="text-muted-foreground">Contact form will be implemented here with React Hook Form and Zod validation.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
} 
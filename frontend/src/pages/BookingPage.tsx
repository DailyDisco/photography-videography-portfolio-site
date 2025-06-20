import React from 'react'
import { Calendar, Camera, Clock } from 'lucide-react'

export const BookingPage: React.FC = () => {
    return (
        <div className="min-h-screen">
            <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Book a Session
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Choose from our photography services and schedule your perfect session.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <Camera className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Portrait Session</h3>
                            <p className="text-muted-foreground">Professional portraits for individuals and families</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <Calendar className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Event Photography</h3>
                            <p className="text-muted-foreground">Capture your special events and celebrations</p>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6 text-center">
                            <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Sports & Action</h3>
                            <p className="text-muted-foreground">Dynamic sports and action photography</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <p className="text-muted-foreground">Booking system will be implemented here with Stripe integration.</p>
                    </div>
                </div>
            </section>
        </div>
    )
} 
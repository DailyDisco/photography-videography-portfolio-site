import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Calendar, MapPin, Clock, DollarSign, User, Mail, Phone, FileText, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { bookingAPI } from '../services/api'
import type { Booking } from '../types'

export const BookingSuccessPage: React.FC = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [booking, setBooking] = useState<Booking | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (!sessionId) {
                setError('No session ID found')
                setLoading(false)
                return
            }

            try {
                const bookingData = await bookingAPI.getBookingSuccess(sessionId)
                setBooking(bookingData)
                toast.success('Booking confirmed successfully!')
            } catch (err) {
                console.error('Error fetching booking:', err)
                setError('Failed to retrieve booking details')
                toast.error('Failed to retrieve booking details')
            } finally {
                setLoading(false)
            }
        }

        fetchBookingDetails()
    }, [sessionId])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatServiceType = (serviceType: string) => {
        return serviceType.charAt(0).toUpperCase() + serviceType.slice(1) + ' Photography'
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Loading your booking details...</p>
                </div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">✕</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Button onClick={() => navigate('/booking')} variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Booking
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary/5">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Booking Confirmed!
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Your photography session has been successfully booked and paid for.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="mb-8">
                        <CardHeader className="text-center border-b">
                            <CardTitle className="text-2xl">Booking Details</CardTitle>
                            <CardDescription>
                                Booking ID: #{booking.id}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Client Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                                        Client Information
                                    </h3>

                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Full Name</p>
                                            <p className="font-medium">{booking.client_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="font-medium">{booking.client_email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{booking.client_phone}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Session Information */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                                        Session Details
                                    </h3>

                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Date</p>
                                            <p className="font-medium">{formatDate(booking.scheduled_date)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Duration</p>
                                            <p className="font-medium">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>

                                    {booking.location && (
                                        <div className="flex items-center space-x-3">
                                            <MapPin className="w-5 h-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Location</p>
                                                <p className="font-medium">{booking.location}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-semibold">Service Type:</span>
                                    <Badge variant="secondary" className="text-sm">
                                        {formatServiceType(booking.service_type)}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-lg font-semibold">Payment Status:</span>
                                    <Badge variant="default" className="text-sm bg-green-600">
                                        {booking.payment_status}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-2xl font-bold">
                                    <span className="flex items-center">
                                        <DollarSign className="w-6 h-6 mr-1" />
                                        Total Paid:
                                    </span>
                                    <span className="text-primary">${booking.price}</span>
                                </div>
                            </div>

                            {(booking.description || booking.notes) && (
                                <div className="mt-8 pt-8 border-t space-y-4">
                                    {booking.description && (
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <span className="font-medium">Session Description</span>
                                            </div>
                                            <p className="text-muted-foreground bg-accent/30 p-3 rounded-lg">
                                                {booking.description}
                                            </p>
                                        </div>
                                    )}

                                    {booking.notes && (
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <span className="font-medium">Additional Notes</span>
                                            </div>
                                            <p className="text-muted-foreground bg-accent/30 p-3 rounded-lg">
                                                {booking.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center space-y-4"
                >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">What's Next?</h3>
                        <p className="text-blue-700">
                            We'll contact you within 24 hours to confirm your session details and discuss any specific requirements.
                            A confirmation email has been sent to {booking.client_email}.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => navigate('/')} variant="outline" size="lg">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                        <Button onClick={() => navigate('/gallery')} size="lg">
                            View Our Portfolio
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
} 
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Camera, Clock, DollarSign, MapPin, User, Phone, Mail, FileText, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { bookingAPI } from '../services/api'
import type { BookingFormData, BookingService } from '../types'

// Form validation schema
const bookingSchema = z.object({
    client_name: z.string().min(2, 'Name must be at least 2 characters'),
    client_email: z.string().email('Please enter a valid email address'),
    client_phone: z.string().min(10, 'Please enter a valid phone number'),
    service_type: z.enum(['portrait', 'wedding', 'event', 'commercial', 'sports', 'nature']),
    description: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    scheduled_date: z.string().min(1, 'Please select a date'),
    duration: z.number().min(1, 'Duration must be at least 1 hour').max(24, 'Duration cannot exceed 24 hours'),
    notes: z.string().optional(),
})

type BookingFormSchema = z.infer<typeof bookingSchema>

export const BookingPage: React.FC = () => {
    const [selectedService, setSelectedService] = useState<BookingService | null>(null)
    const [duration, setDuration] = useState(2) // Default 2 hours
    const [isSubmitting, setIsSubmitting] = useState(false)

    const services = bookingAPI.getServices()

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<BookingFormSchema>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            duration: 2,
        },
    })

    const watchedServiceType = watch('service_type')
    const watchedDuration = watch('duration') || duration

    // Calculate total price
    const calculatePrice = (service: BookingService, hours: number) => {
        return service.pricePerHour * hours
    }

    // Handle service selection
    const handleServiceSelect = (service: BookingService) => {
        setSelectedService(service)
        setValue('service_type', service.type)
    }

    // Handle duration change
    const handleDurationChange = (newDuration: number) => {
        setDuration(newDuration)
        setValue('duration', newDuration)
    }

    // Handle form submission
    const onSubmit = async (data: BookingFormSchema) => {
        if (!selectedService) {
            toast.error('Please select a service')
            return
        }

        setIsSubmitting(true)

        try {
            // Create Stripe checkout session
            const bookingData: BookingFormData = {
                client_name: data.client_name,
                client_email: data.client_email,
                client_phone: data.client_phone,
                service_type: selectedService.type,
                location: data.location,
                scheduled_date: data.scheduled_date,
                duration: watchedDuration,
                ...(data.description && { description: data.description }),
                ...(data.notes && { notes: data.notes }),
            }
            const checkoutResponse = await bookingAPI.createStripeSession(bookingData)

            // Redirect to Stripe checkout
            window.location.href = checkoutResponse.checkout_url
        } catch (error) {
            console.error('Booking error:', error)
            toast.error('Failed to create booking. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Book Your Photography Session
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Choose from our photography services and schedule your perfect session with secure online payment.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Service Selection */}
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-8">Choose Your Service</h2>
                            <div className="space-y-4">
                                {services.map((service, index) => (
                                    <motion.div
                                        key={service.type}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card
                                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedService?.type === service.type
                                                ? 'ring-2 ring-primary bg-primary/5'
                                                : 'hover:bg-accent/50'
                                                }`}
                                            onClick={() => handleServiceSelect(service)}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Camera className="w-6 h-6 text-primary" />
                                                        <CardTitle className="text-lg">{service.name}</CardTitle>
                                                    </div>
                                                    <Badge variant="secondary">
                                                        ${service.pricePerHour}/hour
                                                    </Badge>
                                                </div>
                                                <CardDescription>{service.description}</CardDescription>
                                            </CardHeader>
                                            {selectedService?.type === service.type && (
                                                <CardContent className="pt-0">
                                                    <div className="flex items-center text-sm text-primary">
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Selected
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Duration Selection */}
                            {selectedService && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8"
                                >
                                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        Session Duration
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[1, 2, 4, 8].map((hours) => (
                                            <Button
                                                key={hours}
                                                variant={watchedDuration === hours ? "default" : "outline"}
                                                onClick={() => handleDurationChange(hours)}
                                                className="h-12"
                                            >
                                                {hours} hour{hours > 1 ? 's' : ''}
                                            </Button>
                                        ))}
                                    </div>

                                    <div className="mt-6 p-4 bg-accent/30 rounded-lg">
                                        <div className="flex items-center justify-between text-lg font-semibold">
                                            <span className="flex items-center">
                                                <DollarSign className="w-5 h-5 mr-1" />
                                                Total Price:
                                            </span>
                                            <span className="text-primary">
                                                ${calculatePrice(selectedService, watchedDuration)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedService.name} • {watchedDuration} hour{watchedDuration > 1 ? 's' : ''}
                                            {watchedServiceType && ` • ${watchedServiceType} Photography`}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Booking Form */}
                        <div>
                            <h2 className="text-3xl font-bold text-foreground mb-8">Your Details</h2>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Client Information */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="client_name" className="flex items-center mb-2">
                                            <User className="w-4 h-4 mr-2" />
                                            Full Name
                                        </Label>
                                        <Input
                                            id="client_name"
                                            {...register('client_name')}
                                            placeholder="Enter your full name"
                                            className={errors.client_name ? 'border-red-500' : ''}
                                        />
                                        {errors.client_name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.client_name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="client_email" className="flex items-center mb-2">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="client_email"
                                            type="email"
                                            {...register('client_email')}
                                            placeholder="Enter your email"
                                            className={errors.client_email ? 'border-red-500' : ''}
                                        />
                                        {errors.client_email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.client_email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="client_phone" className="flex items-center mb-2">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="client_phone"
                                            type="tel"
                                            {...register('client_phone')}
                                            placeholder="Enter your phone number"
                                            className={errors.client_phone ? 'border-red-500' : ''}
                                        />
                                        {errors.client_phone && (
                                            <p className="text-red-500 text-sm mt-1">{errors.client_phone.message}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Session Details */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="location" className="flex items-center mb-2">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Session Location
                                        </Label>
                                        <Input
                                            id="location"
                                            {...register('location')}
                                            placeholder="Where should the session take place?"
                                            className={errors.location ? 'border-red-500' : ''}
                                        />
                                        {errors.location && (
                                            <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="scheduled_date" className="flex items-center mb-2">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Preferred Date
                                        </Label>
                                        <Input
                                            id="scheduled_date"
                                            type="date"
                                            {...register('scheduled_date')}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={errors.scheduled_date ? 'border-red-500' : ''}
                                        />
                                        {errors.scheduled_date && (
                                            <p className="text-red-500 text-sm mt-1">{errors.scheduled_date.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className="flex items-center mb-2">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Session Description (Optional)
                                        </Label>
                                        <Textarea
                                            id="description"
                                            {...register('description')}
                                            placeholder="Tell us about your vision for the session..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="notes" className="flex items-center mb-2">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Additional Notes (Optional)
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            {...register('notes')}
                                            placeholder="Any special requests or questions?"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={!selectedService || isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Creating Booking...
                                        </>
                                    ) : (
                                        <>
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            Book Session & Pay ${selectedService ? calculatePrice(selectedService, watchedDuration) : 0}
                                        </>
                                    )}
                                </Button>

                                <p className="text-sm text-muted-foreground text-center">
                                    You'll be redirected to Stripe for secure payment processing
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
} 
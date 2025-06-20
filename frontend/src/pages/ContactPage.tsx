import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { contactAPI } from '../services/api'
import { ContactFormData } from '../types'

// Contact form validation schema
const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().optional(),
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message must be less than 2000 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export const ContactPage: React.FC = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
    })

    const onSubmit = async (data: ContactFormValues) => {
        setIsSubmitting(true)
        try {
            // Ensure phone is defined or excluded
            const formData: ContactFormData = {
                name: data.name,
                email: data.email,
                subject: data.subject,
                message: data.message,
                ...(data.phone && { phone: data.phone })
            }
            await contactAPI.submitContact(formData)
            toast.success('Thank you for your message! We\'ll get back to you soon.')
            reset()
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.'
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }
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

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-12"
                    >
                        <Card className="max-w-2xl mx-auto">
                            <CardHeader>
                                <CardTitle className="text-2xl text-center">Send us a Message</CardTitle>
                                <CardDescription className="text-center">
                                    Fill out the form below and we'll get back to you as soon as possible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium text-foreground">
                                                Name *
                                            </label>
                                            <Input
                                                id="name"
                                                placeholder="Your full name"
                                                {...register('name')}
                                                className={errors.name ? 'border-destructive' : ''}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">{errors.name.message}</p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium text-foreground">
                                                Email *
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="your.email@example.com"
                                                {...register('email')}
                                                className={errors.email ? 'border-destructive' : ''}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive">{errors.email.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-medium text-foreground">
                                            Phone Number (Optional)
                                        </label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="(555) 123-4567"
                                            {...register('phone')}
                                        />
                                    </div>

                                    {/* Subject Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium text-foreground">
                                            Subject *
                                        </label>
                                        <Input
                                            id="subject"
                                            placeholder="What is this about?"
                                            {...register('subject')}
                                            className={errors.subject ? 'border-destructive' : ''}
                                        />
                                        {errors.subject && (
                                            <p className="text-sm text-destructive">{errors.subject.message}</p>
                                        )}
                                    </div>

                                    {/* Message Field */}
                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium text-foreground">
                                            Message *
                                        </label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us about your photography needs, event details, or any questions you have..."
                                            rows={6}
                                            {...register('message')}
                                            className={errors.message ? 'border-destructive' : ''}
                                        />
                                        {errors.message && (
                                            <p className="text-sm text-destructive">{errors.message.message}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending Message...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>
        </div>
    )
} 
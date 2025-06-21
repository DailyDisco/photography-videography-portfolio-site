import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export const BookingCancelPage: React.FC = () => {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-accent/5">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                        Booking Cancelled
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Your booking process was cancelled. Don't worry - no charges were made to your account.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl">What Happened?</CardTitle>
                            <CardDescription>
                                Your booking and payment process was cancelled before completion
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Possible Reasons:</h3>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                            You clicked the back button during payment
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                            Payment process was interrupted
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                            You decided to book later
                                        </li>
                                        <li className="flex items-start">
                                            <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                                            Technical issue occurred
                                        </li>
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-foreground">Important Notes:</h3>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                                                <span className="text-white text-xs">✓</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900">No Charges Made</p>
                                                <p className="text-sm text-green-700">
                                                    Your payment method was not charged. You can try booking again anytime.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-blue-900">Need Help?</p>
                                                <p className="text-sm text-blue-700">
                                                    If you experienced technical issues, please contact us for assistance.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-center space-y-6"
                >
                    <h2 className="text-2xl font-bold text-foreground">What Would You Like to Do?</h2>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                        <Button
                            onClick={() => navigate('/booking')}
                            size="lg"
                            className="flex-1"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Booking Again
                        </Button>

                        <Button
                            onClick={() => navigate('/contact')}
                            variant="outline"
                            size="lg"
                            className="flex-1"
                        >
                            <HelpCircle className="w-4 h-4 mr-2" />
                            Contact Support
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            size="lg"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>

                        <Button
                            onClick={() => navigate('/gallery')}
                            variant="ghost"
                            size="lg"
                        >
                            View Our Portfolio
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12"
                >
                    <Card className="bg-accent/30">
                        <CardContent className="p-6 text-center">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Still Interested in Our Services?
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Browse our portfolio to see our work, or learn more about our photography services.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={() => navigate('/gallery')}
                                    variant="outline"
                                >
                                    Browse Portfolio
                                </Button>
                                <Button
                                    onClick={() => navigate('/about')}
                                    variant="outline"
                                >
                                    Learn About Us
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
} 
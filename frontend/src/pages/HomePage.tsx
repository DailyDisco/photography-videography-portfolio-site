import React from 'react'
import { Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Camera, ArrowRight, Star, Users, Award, Clock } from 'lucide-react'
// import { mediaAPI } from '../services/api'
import { MediaCategory } from '../types'
import { Button } from '../components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
// import { Badge } from '../components/ui/badge'

const categories: { name: MediaCategory; label: string; description: string }[] = [
    { name: 'portraits', label: 'Portraits', description: 'Stunning individual and group portraits' },
    { name: 'athletes', label: 'Athletes', description: 'Dynamic sports and athletic photography' },
    { name: 'action', label: 'Action', description: 'High-energy action and event photography' },
    { name: 'nature', label: 'Nature', description: 'Beautiful landscapes and natural scenes' },
    { name: 'food', label: 'Food', description: 'Appetizing culinary and product photography' },
]

const stats = [
    { icon: Users, label: 'Happy Clients', value: '500+' },
    { icon: Camera, label: 'Photos Taken', value: '10K+' },
    { icon: Award, label: 'Awards Won', value: '15' },
    { icon: Clock, label: 'Years Experience', value: '8' },
]

export const HomePage: React.FC = () => {
    // Fetch featured media from different categories
    // const featuredQueries = categories.slice(0, 3).map((category) =>
    //     useQuery({
    //         queryKey: ['media', category.name, 'featured'],
    //         queryFn: () => mediaAPI.getMediaByCategory(category.name, 1, 3),
    //         staleTime: 5 * 60 * 1000,
    //     })
    // )

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-background via-background to-accent/20 py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                                Capturing Life's{' '}
                                <span className="text-primary">Most Beautiful</span>{' '}
                                Moments
                            </h1>
                            <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
                                Professional photography and videography services that transform your special moments
                                into timeless memories. From portraits to action shots, we bring your vision to life.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                <Button asChild size="lg">
                                    <Link to="/booking">
                                        <span>Book a Session</span>
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild size="lg">
                                    <Link to="/gallery/portraits">
                                        <Camera className="w-4 h-4 mr-2" />
                                        <span>View Gallery</span>
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>

                        {/* Hero Image Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/30 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <Camera className="w-16 h-16 mx-auto text-primary mb-4" />
                                        <p className="text-muted-foreground">Featured Photography</p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
                                <Star className="w-6 h-6" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-card border border-border p-3 rounded-full shadow-lg">
                                <Award className="w-6 h-6 text-primary" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-card border-y border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center"
                            >
                                <stat.icon className="w-8 h-8 mx-auto text-primary mb-3" />
                                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                                <div className="text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Explore Our Work
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Discover our diverse portfolio across different photography categories
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.slice(0, 3).map((category, index) => (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/gallery/${category.name}`}
                                    className="group block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                                >
                                    {/* Category Image Placeholder */}
                                    <div className="aspect-[4/3] bg-gradient-to-br from-accent/30 to-primary/20 relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Camera className="w-12 h-12 text-primary/70" />
                                        </div>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                            {category.label}
                                        </h3>
                                        <p className="text-muted-foreground mb-4">{category.description}</p>
                                        <div className="flex items-center text-primary group-hover:text-primary/80 transition-colors">
                                            <span className="text-sm font-medium">View Gallery</span>
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-center mt-12"
                    >
                        <Link
                            to="/gallery/portraits"
                            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            <span>View All Categories</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-primary-foreground">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Capture Your Story?
                        </h2>
                        <p className="text-xl mb-8 text-primary-foreground/90">
                            Let's work together to create stunning visuals that tell your unique story.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/booking"
                                className="bg-primary-foreground text-primary px-8 py-3 rounded-md font-medium hover:bg-primary-foreground/90 transition-colors"
                            >
                                Book Your Session
                            </Link>
                            <Link
                                to="/contact"
                                className="border border-primary-foreground/30 text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary-foreground/10 transition-colors"
                            >
                                Get in Touch
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
} 
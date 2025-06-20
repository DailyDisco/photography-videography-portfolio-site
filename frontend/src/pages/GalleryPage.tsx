import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Grid, Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { mediaAPI } from '../services/api'
import { MediaCategory, Media } from '../types'

const categoryLabels: Record<MediaCategory, string> = {
    athletes: 'Athletes',
    food: 'Food',
    nature: 'Nature',
    portraits: 'Portraits',
    action: 'Action',
}

const categoryDescriptions: Record<MediaCategory, string> = {
    athletes: 'Dynamic sports and athletic photography capturing peak performance',
    food: 'Appetizing culinary photography that makes every dish irresistible',
    nature: 'Breathtaking landscapes and natural beauty from around the world',
    portraits: 'Professional portraits that capture personality and emotion',
    action: 'High-energy photography capturing movement and excitement',
}

export const GalleryPage: React.FC = () => {
    const { category } = useParams<{ category: MediaCategory }>()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedImage, setSelectedImage] = useState<Media | null>(null)
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)

    const {
        data: galleryData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['media', category, 'gallery'],
        queryFn: () => mediaAPI.getMediaByCategory(category as MediaCategory, 1, 50),
        enabled: !!category && category in categoryLabels,
        staleTime: 5 * 60 * 1000,
    })

    const media = galleryData?.media || []
    const filteredMedia = media.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Handle keyboard navigation in lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedImage) return

            switch (e.key) {
                case 'Escape':
                    closeLightbox()
                    break
                case 'ArrowLeft':
                    navigateImage(-1)
                    break
                case 'ArrowRight':
                    navigateImage(1)
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [selectedImage, selectedIndex])

    const openLightbox = (image: Media, index: number) => {
        setSelectedImage(image)
        setSelectedIndex(index)
        document.body.style.overflow = 'hidden'
    }

    const closeLightbox = () => {
        setSelectedImage(null)
        setSelectedIndex(-1)
        document.body.style.overflow = 'unset'
    }

    const navigateImage = (direction: number) => {
        const newIndex = selectedIndex + direction
        if (newIndex >= 0 && newIndex < filteredMedia.length) {
            const newImage = filteredMedia[newIndex]
            if (newImage) {
                setSelectedImage(newImage)
                setSelectedIndex(newIndex)
            }
        }
    }

    if (!category || !(category in categoryLabels)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Gallery Not Found</h1>
                    <p className="text-muted-foreground mb-6">The gallery you're looking for doesn't exist.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Home</span>
                        </Link>

                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            {categoryLabels[category]} Gallery
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl">
                            {categoryDescriptions[category]}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Search and Controls */}
            <section className="py-8 border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        {/* Search */}
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search photos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            />
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center space-x-4 text-muted-foreground">
                            <Grid className="w-5 h-5" />
                            <span>{filteredMedia.length} photos</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex items-center space-x-3">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-muted-foreground">Loading gallery...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to load gallery</h3>
                            <p className="text-muted-foreground">Please try again later.</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-20">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {searchTerm ? 'No photos found' : 'No photos in this gallery yet'}
                            </h3>
                            <p className="text-muted-foreground">
                                {searchTerm ? 'Try a different search term.' : 'Check back soon for new content.'}
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="gallery-grid"
                        >
                            {filteredMedia.map((image, index) => (
                                <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="gallery-item cursor-pointer group"
                                    onClick={() => openLightbox(image, index)}
                                >
                                    <div className="aspect-square bg-accent/30 rounded-lg overflow-hidden">
                                        {image.thumbnail_url || image.url ? (
                                            <img
                                                src={image.thumbnail_url || image.url}
                                                alt={image.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/30 to-primary/20">
                                                <div className="text-center">
                                                    <Grid className="w-8 h-8 mx-auto text-primary/70 mb-2" />
                                                    <p className="text-sm text-muted-foreground">{image.title}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end p-4">
                                            <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="text-white font-medium text-sm">{image.title}</h3>
                                                {image.description && (
                                                    <p className="text-white/80 text-xs mt-1 line-clamp-2">{image.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lightbox-overlay flex items-center justify-center p-4"
                        onClick={closeLightbox}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-6xl max-h-[90vh] w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeLightbox}
                                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Navigation Buttons */}
                            {selectedIndex > 0 && (
                                <button
                                    onClick={() => navigateImage(-1)}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}

                            {selectedIndex < filteredMedia.length - 1 && (
                                <button
                                    onClick={() => navigateImage(1)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            )}

                            {/* Image */}
                            <div className="bg-card rounded-lg overflow-hidden">
                                <img
                                    src={selectedImage.url}
                                    alt={selectedImage.title}
                                    className="w-full h-auto max-h-[70vh] object-contain"
                                />

                                {/* Image Info */}
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        {selectedImage.title}
                                    </h3>
                                    {selectedImage.description && (
                                        <p className="text-muted-foreground">{selectedImage.description}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                                        <span>{selectedIndex + 1} of {filteredMedia.length}</span>
                                        <span>{selectedImage.views} views</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
} 
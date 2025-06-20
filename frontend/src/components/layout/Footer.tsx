import React from 'react'
import { Link } from 'react-router-dom'
import { Camera, Mail, Phone, MapPin } from 'lucide-react'

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-card border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-foreground mb-4">
                            <Camera className="w-6 h-6" />
                            <span>Portfolio</span>
                        </Link>
                        <p className="text-muted-foreground max-w-md">
                            Professional photography and videography services capturing life's most important moments.
                            From athletic events to portraits, we bring your vision to life.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery/portraits" className="text-muted-foreground hover:text-primary transition-colors">
                                    Portraits
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery/athletes" className="text-muted-foreground hover:text-primary transition-colors">
                                    Athletes
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery/action" className="text-muted-foreground hover:text-primary transition-colors">
                                    Action
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link to="/booking" className="text-muted-foreground hover:text-primary transition-colors">
                                    Book Session
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Contact</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center space-x-2 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>contact@portfolio.com</span>
                            </li>
                            <li className="flex items-center space-x-2 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>(555) 123-4567</span>
                            </li>
                            <li className="flex items-center space-x-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>Your City, State</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-muted-foreground text-sm">
                        © {currentYear} Photography Portfolio. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-sm">
                        <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
} 
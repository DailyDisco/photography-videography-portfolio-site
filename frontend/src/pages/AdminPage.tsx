import React, { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Upload,
    Settings,
    BarChart3,
    Users,
    Trash2,
    Eye,
    EyeOff,
    Plus,
    Image,
    Film,
    FileText,
    Calendar,
    TrendingUp,
    MessageCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    Input,
    Badge,
    Spinner,
    Label,
    Textarea
} from '../components/ui'
import { adminAPI, contactAPI, mediaAPI } from '../services/api'

interface DashboardStats {
    totalMedia: number
    totalMessages: number
    unreadMessages: number
    recentMessages: Array<{
        id: string
        name: string
        email: string
        subject: string
        message: string
        is_read: boolean
        created_at: string
    }>
}

interface Analytics {
    mediaByCategory: Record<string, number>
    messagesThisMonth: number
    popularCategories: Array<{ category: string; views: number }>
}

export const AdminPage: React.FC = () => {
    const [uploadFiles, setUploadFiles] = useState<File[]>([])
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
    const queryClient = useQueryClient()

    // Fetch dashboard data
    const { data: dashboardData, isLoading: isDashboardLoading } = useQuery<DashboardStats>({
        queryKey: ['admin-dashboard'],
        queryFn: adminAPI.getDashboard,
    })

    // Fetch analytics data
    const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery<Analytics>({
        queryKey: ['admin-analytics'],
        queryFn: adminAPI.getAnalytics,
    })

    // Fetch contact messages
    const { data: contactData, isLoading: isContactLoading } = useQuery({
        queryKey: ['admin-contact-messages'],
        queryFn: () => adminAPI.getContactMessages(1, 20),
    })

    // Fetch media for admin
    const { data: mediaData, isLoading: isMediaLoading } = useQuery({
        queryKey: ['admin-media'],
        queryFn: () => mediaAPI.getAllMedia(1, 20),
    })

    // Mark message as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: contactAPI.markMessageAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] })
        },
    })

    // Mark message as unread mutation
    const markAsUnreadMutation = useMutation({
        mutationFn: contactAPI.markMessageAsUnread,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] })
        },
    })

    // Delete message mutation
    const deleteMessageMutation = useMutation({
        mutationFn: contactAPI.deleteMessage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
            queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] })
        },
    })

    // Upload media mutation
    const uploadMediaMutation = useMutation({
        mutationFn: ({ formData, onProgress }: { formData: FormData; onProgress: (progress: number) => void }) =>
            mediaAPI.uploadMedia(formData, onProgress),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-media'] })
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
            setUploadFiles([])
            setUploadProgress({})
        },
    })

    // Handle file selection
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        setUploadFiles(files)
    }, [])

    // Handle file upload
    const handleUpload = useCallback(async (file: File, category: string) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)
        formData.append('title', file.name.replace(/\.[^/.]+$/, ''))
        formData.append('description', `Uploaded ${file.name}`)
        formData.append('is_featured', 'false')

        await uploadMediaMutation.mutateAsync({
            formData,
            onProgress: (progress) => {
                setUploadProgress(prev => ({ ...prev, [file.name]: progress }))
            }
        })
    }, [uploadMediaMutation])

    if (isDashboardLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <section className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                            Admin Dashboard
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Manage your portfolio, analyze performance, and handle client communications
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Media</p>
                                        <p className="text-3xl font-bold">{dashboardData?.totalMedia || 0}</p>
                                    </div>
                                    <Image className="w-8 h-8 text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Messages</p>
                                        <p className="text-3xl font-bold">{dashboardData?.totalMessages || 0}</p>
                                    </div>
                                    <MessageCircle className="w-8 h-8 text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unread Messages</p>
                                        <p className="text-3xl font-bold text-orange-600">{dashboardData?.unreadMessages || 0}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">This Month</p>
                                        <p className="text-3xl font-bold text-green-600">{analyticsData?.messagesThisMonth || 0}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="messages" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="messages">Messages</TabsTrigger>
                        <TabsTrigger value="media">Media</TabsTrigger>
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* Messages Tab */}
                    <TabsContent value="messages">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Contact Messages
                                </CardTitle>
                                <CardDescription>
                                    Manage client inquiries and communications
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isContactLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {contactData?.messages?.map((message) => (
                                                <TableRow key={message.id}>
                                                    <TableCell className="font-medium">{message.name}</TableCell>
                                                    <TableCell>{message.email}</TableCell>
                                                    <TableCell className="max-w-xs truncate">{message.subject}</TableCell>
                                                    <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={message.is_read ? 'default' : 'destructive'}>
                                                            {message.is_read ? 'Read' : 'Unread'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    if (message.is_read) {
                                                                        markAsUnreadMutation.mutate(message.id)
                                                                    } else {
                                                                        markAsReadMutation.mutate(message.id)
                                                                    }
                                                                }}
                                                            >
                                                                {message.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => deleteMessageMutation.mutate(message.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Media Tab */}
                    <TabsContent value="media">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Image className="w-5 h-5" />
                                            Media Library
                                        </CardTitle>
                                        <CardDescription>
                                            Manage your portfolio images and videos
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Add New
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isMediaLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {mediaData?.media?.map((item) => (
                                            <Card key={item.id} className="overflow-hidden">
                                                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                                    {item.type === 'video' ? (
                                                        <Film className="w-12 h-12 text-gray-400" />
                                                    ) : (
                                                        <img
                                                            src={item.s3_url}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                target.style.display = 'none';
                                                                if (target.parentElement) {
                                                                    target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" /></svg></div>';
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                                <CardContent className="p-3">
                                                    <p className="font-medium text-sm truncate">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">{item.category}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <Badge variant={item.is_featured ? 'default' : 'secondary'}>
                                                            {item.is_featured ? 'Featured' : 'Regular'}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">{item.view_count} views</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Upload Tab */}
                    <TabsContent value="upload">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Upload Media
                                </CardTitle>
                                <CardDescription>
                                    Add new photos and videos to your portfolio
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium">Drop files here or click to browse</p>
                                        <p className="text-sm text-muted-foreground">
                                            Supports: JPG, PNG, GIF, WebP, MP4, MOV, AVI
                                        </p>
                                    </div>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={handleFileSelect}
                                        className="mt-4"
                                    />
                                </div>

                                {uploadFiles.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium">Selected Files ({uploadFiles.length})</h3>
                                        {uploadFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                                                <div className="flex items-center gap-3">
                                                    {file.type.startsWith('video/') ? (
                                                        <Film className="w-6 h-6 text-blue-500" />
                                                    ) : (
                                                        <Image className="w-6 h-6 text-green-500" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{file.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="px-3 py-1 border rounded text-sm"
                                                        defaultValue="nature"
                                                        id={`category-${index}`}
                                                    >
                                                        <option value="athletes">Athletes</option>
                                                        <option value="food">Food</option>
                                                        <option value="nature">Nature</option>
                                                        <option value="portraits">Portraits</option>
                                                        <option value="action">Action</option>
                                                    </select>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            const select = document.getElementById(`category-${index}`) as HTMLSelectElement
                                                            handleUpload(file, select.value)
                                                        }}
                                                        disabled={uploadMediaMutation.isPending}
                                                    >
                                                        {uploadProgress[file.name] ? `${uploadProgress[file.name]}%` : 'Upload'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5" />
                                        Media by Category
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isAnalyticsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {Object.entries(analyticsData?.mediaByCategory || {}).map(([category, count]) => (
                                                <div key={category} className="flex justify-between items-center">
                                                    <span className="capitalize font-medium">{category}</span>
                                                    <Badge variant="outline">{count} items</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Popular Categories
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {isAnalyticsLoading ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {analyticsData?.popularCategories?.map((item, index) => (
                                                <div key={item.category} className="flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                                                        <span className="capitalize font-medium">{item.category}</span>
                                                    </div>
                                                    <Badge variant="outline">{item.views} views</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="w-5 h-5" />
                                        General Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="site-title">Site Title</Label>
                                        <Input
                                            id="site-title"
                                            defaultValue="Photography Portfolio"
                                            placeholder="Enter site title..."
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact-email">Contact Email</Label>
                                        <Input
                                            id="contact-email"
                                            type="email"
                                            defaultValue="contact@example.com"
                                            placeholder="Enter contact email..."
                                        />
                                    </div>
                                    <Button className="w-full">Save Settings</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Booking Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="booking-hours">Available Hours</Label>
                                        <Input
                                            id="booking-hours"
                                            defaultValue="9:00 AM - 6:00 PM"
                                            placeholder="Set available hours..."
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="advance-booking">Advance Booking (days)</Label>
                                        <Input
                                            id="advance-booking"
                                            type="number"
                                            defaultValue="7"
                                            min="1"
                                            placeholder="Minimum advance booking..."
                                        />
                                    </div>
                                    <Button className="w-full">Update Schedule</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Terms & Policies
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="terms">Terms of Service</Label>
                                        <Textarea
                                            id="terms"
                                            placeholder="Enter terms of service..."
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="privacy">Privacy Policy</Label>
                                        <Textarea
                                            id="privacy"
                                            placeholder="Enter privacy policy..."
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <Button className="w-full">Save Policies</Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="w-5 h-5" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add New Gallery Category
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Custom Service
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Generate Reports
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Schedule Maintenance
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
} 
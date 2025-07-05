// apps/web/app/workspace/content-spark/image-gallery/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@boastitup/ui';
import { Button } from '@boastitup/ui';
import { Input } from '@boastitup/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@boastitup/ui';
import { Badge } from '@boastitup/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@boastitup/ui';
import { useToast } from '@boastitup/hooks/src/use-toast';
import {
  Images,
  Search,
  Download,
  Heart,
  Share,
  Grid3X3,
  Grid2X2,
  RefreshCw,
  SortAsc,
  SortDesc,
  Copy,
  Eye,
  Calendar,
  HardDrive,
  Star,
  Play,
  Video,
  Instagram,
  Layers,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize,
  MoreHorizontal,
  ExternalLink,
  Bookmark,
  RotateCcw,
  Filter,
  Package,
  Sparkles
} from "lucide-react";
import Image from 'next/image';
import { useMediaGallery, MediaItem } from '@boastitup/hooks/src/useMediaGallery';
import { CloudinaryAPIService, formatFileSize, formatDate } from '@/lib/cloudinary-api';
import { useState, useRef, useEffect, useMemo } from 'react';

type ContentType = 'all' | 'images' | 'videos';
type InstagramType = 'all' | 'source' | 'carousel' | 'final' | 'reel';

export default function ContentGalleryPage() {
  const { toast } = useToast();
  
  // Initialize Cloudinary service
  const cloudinaryService = useMemo(() => {
  return new CloudinaryAPIService(CloudinaryAPIService.getConfig());
}, []); // Empty dependency array ensures it's created only once
  
  // Use the media gallery hook
  const gallery = useMediaGallery({
    cloudinaryService,
    folder: 'content-spark-gallery',
    maxResults: 24,
    enableFavorites: true,
    includeVideos: true,
  });

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Filter media items based on hook state
  const filteredMediaItems = gallery.filteredItems;

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Media URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (item: MediaItem) => {
    const link = document.createElement('a');
    link.href = item.secure_url;
    link.download = item.public_id.split('/').pop() || 'media';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openVideoModal = (video: MediaItem) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
    setIsPlaying(false);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getInstagramTypeColor = (type?: string) => {
    switch (type) {
      case 'source': return 'bg-blue-100 text-blue-800';
      case 'carousel': return 'bg-purple-100 text-purple-800';
      case 'final': return 'bg-green-100 text-green-800';
      case 'reel': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInstagramTypeIcon = (type?: string) => {
    switch (type) {
      case 'source': return <ImageIcon className="h-3 w-3" />;
      case 'carousel': return <Layers className="h-3 w-3" />;
      case 'final': return <Sparkles className="h-3 w-3" />;
      case 'reel': return <Video className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Instagram className="h-8 w-8 text-pink-500" />
            Content Gallery
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize your Instagram posts, carousels, and reel content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
                            onClick={gallery.refreshMedia}
            disabled={gallery.loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${gallery.loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Images className="h-4 w-4" />
              Total Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gallery.mediaItems.filter(item => item.resource_type === 'image').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Video className="h-4 w-4" />
              Total Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gallery.mediaItems.filter(item => item.resource_type === 'video').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Ready to Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gallery.mediaItems.filter(item => item.context?.instagram_ready).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Total Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(gallery.mediaItems.reduce((sum, item) => sum + item.bytes, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gallery.favorites.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={gallery.searchTerm}
                  onChange={(e) => gallery.setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Content Type Filter */}
            <div className="min-w-[130px]">
              <Select value={gallery.contentType} onValueChange={gallery.setContentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="images">Images Only</SelectItem>
                  <SelectItem value="videos">Videos Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Instagram Type Filter */}
            <div className="min-w-[150px]">
              <Select value={gallery.instagramType} onValueChange={gallery.setInstagramType}>
                <SelectTrigger>
                  <SelectValue placeholder="Instagram type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="source">Source Material</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="final">Final Posts</SelectItem>
                  <SelectItem value="reel">Reels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="min-w-[130px]">
              <Select value={gallery.sortBy} onValueChange={gallery.setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="public_id">Name</SelectItem>
                  <SelectItem value="bytes">File Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => gallery.setSortOrder(gallery.sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {gallery.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={gallery.viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => gallery.setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={gallery.viewMode === 'masonry' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => gallery.setViewMode('masonry')}
                className="rounded-l-none"
              >
                <Grid2X2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredMediaItems.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMediaItems.map((item, index) => (
            <Card key={item.public_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative group">
                <div 
                  className={`relative cursor-pointer ${
                    item.resource_type === 'video' ? 'aspect-[9/16]' : 'aspect-square'
                  }`}
                  onClick={() => {
                    if (item.resource_type === 'video') {
                      openVideoModal(item);
                    } else {
                      gallery.openItemModal(item, index);
                    }
                  }}
                >
                  {item.resource_type === 'image' ? (
                    <Image
                      src={cloudinaryService.getOptimizedImageUrl(item.public_id, { width: 400, height: 400 })}
                      alt={item.context?.alt || item.public_id}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <>
                      <video
                        className="w-full h-full object-cover"
                        poster={cloudinaryService.getOptimizedImageUrl(item.public_id.replace('.mp4', '.jpg'), { width: 400, height: 600 })}
                        muted
                      >
                        <source src={item.secure_url} type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-black/60 rounded-full p-3">
                          <Play className="h-8 w-8 text-white fill-white" />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge className={`text-xs ${getInstagramTypeColor(item.context?.instagram_type)}`}>
                      {getInstagramTypeIcon(item.context?.instagram_type)}
                      <span className="ml-1 capitalize">{item.context?.instagram_type || 'other'}</span>
                    </Badge>
                  </div>

                  {/* Ready Badge */}
                  {item.context?.instagram_ready && (
                    <div className="absolute top-2 right-2">
                      <Badge className="text-xs bg-green-500 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    </div>
                  )}

                  {/* Video Duration */}
                  {item.resource_type === 'video' && item.duration && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatTime(item.duration)}
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        gallery.toggleFavorite(item.public_id);
                      }}
                    >
                      <Heart className={`h-4 w-4 ${gallery.favorites.includes(item.public_id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.public_id.split('/').pop()}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.width} × {item.height} • {formatFileSize(item.bytes)}
                      </p>
                      {item.context?.caption && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.context.caption}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyUrl(item.secure_url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(item)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {item.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.created_at)}
                    </div>
                    
                    {/* Instagram Actions */}
                    <div className="flex gap-1">
                      {item.context?.instagram_type === 'reel' && (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Instagram className="h-3 w-3 mr-1" />
                          Use for Reel
                        </Button>
                      )}
                      {(item.context?.instagram_type === 'final' || item.context?.instagram_type === 'carousel') && (
                        <Button size="sm" variant="outline" className="text-xs">
                          <Instagram className="h-3 w-3 mr-1" />
                          Post to IG
                        </Button>
                      )}
                      {item.context?.instagram_type === 'source' && (
                        <Button size="sm" variant="outline" className="text-xs">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal (existing) */}
      <Dialog open={gallery.isModalOpen} onOpenChange={gallery.closeItemModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {gallery.selectedItem && gallery.selectedItem.resource_type === 'image' && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>{gallery.selectedItem.public_id.split('/').pop()}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {gallery.currentItemIndex + 1} of {gallery.filteredItems.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => gallery.toggleFavorite(gallery.selectedItem!.public_id)}
                    >
                      <Heart className={`h-4 w-4 ${gallery.favorites.includes(gallery.selectedItem.public_id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyUrl(gallery.selectedItem!.secure_url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(gallery.selectedItem!)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="flex-1 relative">
                <div className="relative h-full min-h-[400px] max-h-[600px]">
                  <Image
                    src={cloudinaryService.getOptimizedImageUrl(gallery.selectedItem.public_id, { width: 1200 })}
                    alt={gallery.selectedItem.context?.alt || gallery.selectedItem.public_id}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 80vw"
                  />
                  
                  {/* Navigation */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => gallery.navigateItem('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => gallery.navigateItem('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={isVideoModalOpen} onOpenChange={closeVideoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedVideo && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      {selectedVideo.public_id.split('/').pop()}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      Instagram Reel • {selectedVideo.duration && formatTime(selectedVideo.duration)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => gallery.toggleFavorite(selectedVideo.public_id)}
                    >
                      <Heart className={`h-4 w-4 ${gallery.favorites.includes(selectedVideo.public_id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyUrl(selectedVideo.secure_url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(selectedVideo)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="flex-1 relative bg-black">
                <div className="relative h-full min-h-[600px] max-h-[70vh] flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="max-h-full max-w-full"
                    src={selectedVideo.secure_url}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    onClick={togglePlayPause}
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 opacity-0 hover:opacity-100 transition-opacity">
                    {/* Play/Pause Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={togglePlayPause}
                        className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4"
                      >
                        {isPlaying ? (
                          <div className="w-6 h-6 bg-white"></div>
                        ) : (
                          <Play className="h-8 w-8 fill-white" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Bottom Controls */}
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                      {/* Progress Bar */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={duration ? (currentTime / duration) * 100 : 0}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={togglePlayPause}
                            className="text-white hover:bg-white/20"
                          >
                            {isPlaying ? (
                              <div className="w-4 h-4 bg-white"></div>
                            ) : (
                              <Play className="h-4 w-4 fill-white" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                            className="text-white hover:bg-white/20"
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                          <span className="text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20"
                          >
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Video Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Dimensions:</span> {selectedVideo.width} × {selectedVideo.height}</p>
                      <p><span className="font-medium">Duration:</span> {selectedVideo.duration && formatTime(selectedVideo.duration)}</p>
                      <p><span className="font-medium">Size:</span> {formatFileSize(selectedVideo.bytes)}</p>
                      <p><span className="font-medium">Format:</span> {selectedVideo.format.toUpperCase()}</p>
                      <p><span className="font-medium">Created:</span> {formatDate(selectedVideo.created_at)}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Instagram Actions</h4>
                    <div className="space-y-2">
                      <Button className="w-full" size="sm">
                        <Instagram className="h-4 w-4 mr-2" />
                        Use for Instagram Reel
                      </Button>
                      <Button variant="outline" className="w-full" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Editor
                      </Button>
                    </div>
                    {selectedVideo.context?.caption && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground">{selectedVideo.context.caption}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
// apps/web/components/InstagramContentOrganizer.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@boastitup/ui';
import { Button } from '@boastitup/ui';
import { Badge } from '@boastitup/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@boastitup/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@boastitup/ui';
import { Input } from '@boastitup/ui';
import { Label } from '@boastitup/ui';
import { Textarea } from '@boastitup/ui';
import { useToast } from '@boastitup/hooks/src/use-toast';
import {
  Instagram,
  Image as ImageIcon,
  Video,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Hash,
  Edit,
  Copy,
  Share,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  MoreVertical,
  Filter,
  SortAsc,
  CheckCircle,
  AlertCircle,
  Camera,
  Play
} from "lucide-react";
import Image from 'next/image';

interface InstagramContent {
  id: string;
  type: 'source' | 'carousel' | 'final' | 'reel';
  resourceType: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  caption?: string;
  hashtags: string[];
  status: 'draft' | 'ready' | 'scheduled' | 'published';
  engagementPrediction?: number;
  bestTimeToPost?: string;
  createdAt: string;
  scheduledFor?: string;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: string;
  duration?: number; // for videos
}

interface InstagramContentOrganizerProps {
  contents: InstagramContent[];
  onContentUpdate?: (id: string, updates: Partial<InstagramContent>) => void;
  onContentSchedule?: (id: string, scheduledTime: string) => void;
  onContentPublish?: (id: string) => void;
}

export const InstagramContentOrganizer: React.FC<InstagramContentOrganizerProps> = ({
  contents,
  onContentUpdate,
  onContentSchedule,
  onContentPublish
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created');
  const [selectedContent, setSelectedContent] = useState<InstagramContent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredContents = contents.filter(content => {
    if (selectedType !== 'all' && content.type !== selectedType) return false;
    if (selectedStatus !== 'all' && content.status !== selectedStatus) return false;
    return true;
  });

  const sortedContents = [...filteredContents].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'engagement':
        return (b.engagementPrediction || 0) - (a.engagementPrediction || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'scheduled':
        if (!a.scheduledFor && !b.scheduledFor) return 0;
        if (!a.scheduledFor) return 1;
        if (!b.scheduledFor) return -1;
        return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'source': return <Camera className="h-4 w-4" />;
      case 'carousel': return <Layers className="h-4 w-4" />;
      case 'final': return <Sparkles className="h-4 w-4" />;
      case 'reel': return <Video className="h-4 w-4" />;
      default: return <ImageIcon className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'source': return 'bg-blue-100 text-blue-800';
      case 'carousel': return 'bg-purple-100 text-purple-800';
      case 'final': return 'bg-green-100 text-green-800';
      case 'reel': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'published': return <Instagram className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const handleEditContent = (content: InstagramContent) => {
    setSelectedContent(content);
    setIsEditModalOpen(true);
  };

  const handleSaveContent = () => {
    if (selectedContent && onContentUpdate) {
      onContentUpdate(selectedContent.id, selectedContent);
      setIsEditModalOpen(false);
      toast({
        title: "Content Updated",
        description: "Your Instagram content has been updated successfully.",
      });
    }
  };

  const handleScheduleContent = (content: InstagramContent) => {
    // Mock scheduling - in real app, would open date/time picker
    const scheduledTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    if (onContentSchedule) {
      onContentSchedule(content.id, scheduledTime);
      toast({
        title: "Content Scheduled",
        description: "Your content has been scheduled for tomorrow.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Instagram className="h-6 w-6 text-pink-500" />
            Content Organizer
          </h2>
          <p className="text-muted-foreground">
            Manage your Instagram content pipeline
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="source">Source</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="reel">Reel</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ready to Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contents.filter(c => c.status === 'ready').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contents.filter(c => c.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(contents.reduce((acc, c) => acc + (c.engagementPrediction || 0), 0) / contents.length)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedContents.map((content) => (
          <Card key={content.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Media Preview */}
            <div className="relative aspect-square">
              {content.resourceType === 'image' ? (
                <Image
                  src={content.url}
                  alt={content.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="relative w-full h-full bg-black">
                  <video
                    src={content.url}
                    poster={content.thumbnail}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white fill-white opacity-80" />
                  </div>
                  {content.duration && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatDuration(content.duration)}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Type & Status Badges */}
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge className={`text-xs ${getTypeColor(content.type)}`}>
                  {getTypeIcon(content.type)}
                  <span className="ml-1 capitalize">{content.type}</span>
                </Badge>
              </div>

              <div className="absolute top-2 right-2">
                <Badge className={`text-xs ${getStatusColor(content.status)}`}>
                  {getStatusIcon(content.status)}
                  <span className="ml-1 capitalize">{content.status}</span>
                </Badge>
              </div>

              {/* Engagement Prediction */}
              {content.engagementPrediction && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {content.engagementPrediction}% engagement
                  </Badge>
                </div>
              )}
            </div>

            {/* Content Info */}
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium line-clamp-1">{content.title}</h3>
                  {content.caption && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {content.caption}
                    </p>
                  )}
                </div>

                {/* Hashtags */}
                {content.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {content.hashtags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {content.hashtags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{content.hashtags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{content.dimensions.width}×{content.dimensions.height}</span>
                  <span>{content.fileSize}</span>
                  <span>{formatDate(content.createdAt)}</span>
                </div>

                {/* Scheduled Time */}
                {content.scheduledFor && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Clock className="h-3 w-3" />
                    Scheduled for {formatDate(content.scheduledFor)}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditContent(content)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  {content.status === 'ready' && (
                    <Button
                      size="sm"
                      onClick={() => handleScheduleContent(content)}
                      className="flex-1"
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule
                    </Button>
                  )}

                  {content.status === 'scheduled' && onContentPublish && (
                    <Button
                      size="sm"
                      onClick={() => onContentPublish(content.id)}
                      className="flex-1 bg-pink-600 hover:bg-pink-700"
                    >
                      <Instagram className="h-3 w-3 mr-1" />
                      Publish
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Content Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Instagram Content</DialogTitle>
          </DialogHeader>
          
          {selectedContent && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={selectedContent.title}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent,
                    title: e.target.value
                  })}
                />
              </div>

              <div>
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={selectedContent.caption || ''}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent,
                    caption: e.target.value
                  })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
                <Input
                  id="hashtags"
                  value={selectedContent.hashtags.join(', ')}
                  onChange={(e) => setSelectedContent({
                    ...selectedContent,
                    hashtags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                  placeholder="fashion, style, ootd"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Content Type</Label>
                  <Select
                    value={selectedContent.type}
                    onValueChange={(value) => setSelectedContent({
                      ...selectedContent,
                      type: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="source">Source</SelectItem>
                      <SelectItem value="carousel">Carousel</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={selectedContent.status}
                    onValueChange={(value) => setSelectedContent({
                      ...selectedContent,
                      status: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveContent}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
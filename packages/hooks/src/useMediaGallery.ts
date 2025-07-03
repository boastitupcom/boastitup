// apps/web/hooks/useMediaGallery.ts

import { useState, useEffect, useCallback } from 'react';
import { CloudinaryAPIService } from '@/lib/cloudinary-api';

export interface MediaItem {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
  tags: string[];
  resource_type: 'image' | 'video';
  duration?: number; // for videos
  context?: {
    alt?: string;
    caption?: string;
    instagram_type?: 'source' | 'carousel' | 'final' | 'reel';
    instagram_ready?: boolean;
    [key: string]: any;
  };
}

export interface MediaGalleryState {
  mediaItems: MediaItem[];
  filteredItems: MediaItem[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedTag: string;
  contentType: 'all' | 'images' | 'videos';
  instagramType: 'all' | 'source' | 'carousel' | 'final' | 'reel';
  sortBy: 'created_at' | 'public_id' | 'bytes' | 'duration';
  sortOrder: 'asc' | 'desc';
  selectedItem: MediaItem | null;
  currentItemIndex: number;
  favorites: string[];
  availableTags: string[];
  viewMode: 'grid' | 'masonry';
  isModalOpen: boolean;
  nextCursor?: string;
  hasMore: boolean;
}

export interface MediaGalleryActions {
  loadMedia: () => Promise<void>;
  loadMoreMedia: () => Promise<void>;
  refreshMedia: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  setSelectedTag: (tag: string) => void;
  setContentType: (type: MediaGalleryState['contentType']) => void;
  setInstagramType: (type: MediaGalleryState['instagramType']) => void;
  setSortBy: (sortBy: MediaGalleryState['sortBy']) => void;
  setSortOrder: (order: MediaGalleryState['sortOrder']) => void;
  setViewMode: (mode: MediaGalleryState['viewMode']) => void;
  openItemModal: (item: MediaItem, index: number) => void;
  closeItemModal: () => void;
  navigateItem: (direction: 'prev' | 'next') => void;
  toggleFavorite: (publicId: string) => void;
  searchMedia: (query: string) => Promise<void>;
  markAsInstagramReady: (publicId: string, ready: boolean) => void;
  updateInstagramType: (publicId: string, type: string) => void;
}

export interface UseMediaGalleryOptions {
  cloudinaryService: CloudinaryAPIService;
  folder?: string;
  initialTags?: string[];
  maxResults?: number;
  enableFavorites?: boolean;
  includeVideos?: boolean;
}

export const useMediaGallery = (options: UseMediaGalleryOptions): MediaGalleryState & MediaGalleryActions => {
  const {
    cloudinaryService,
    folder,
    initialTags = [],
    maxResults = 50,
    enableFavorites = true,
    includeVideos = true,
  } = options;

  const [state, setState] = useState<MediaGalleryState>({
    mediaItems: [],
    filteredItems: [],
    loading: false,
    error: null,
    searchTerm: '',
    selectedTag: 'all',
    contentType: 'all',
    instagramType: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
    selectedItem: null,
    currentItemIndex: 0,
    favorites: [],
    availableTags: [],
    viewMode: 'grid',
    isModalOpen: false,
    nextCursor: undefined,
    hasMore: true,
  });

  // Load favorites from localStorage
  useEffect(() => {
    if (enableFavorites) {
      const savedFavorites = localStorage.getItem('content-gallery-favorites');
      if (savedFavorites) {
        try {
          const favorites = JSON.parse(savedFavorites);
          setState(prev => ({ ...prev, favorites }));
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      }
    }
  }, [enableFavorites]);

  // Save favorites to localStorage
  useEffect(() => {
    if (enableFavorites) {
      localStorage.setItem('content-gallery-favorites', JSON.stringify(state.favorites));
    }
  }, [state.favorites, enableFavorites]);

  // Filter and sort items when dependencies change
  useEffect(() => {
    filterAndSortItems();
  }, [
    state.mediaItems, 
    state.searchTerm, 
    state.selectedTag, 
    state.contentType, 
    state.instagramType, 
    state.sortBy, 
    state.sortOrder
  ]);

  const filterAndSortItems = useCallback(() => {
    let filtered = [...state.mediaItems];

    // Apply search filter
    if (state.searchTerm) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.public_id.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        item.context?.alt?.toLowerCase().includes(searchLower) ||
        item.context?.caption?.toLowerCase().includes(searchLower)
      );
    }

    // Apply tag filter
    if (state.selectedTag !== 'all') {
      filtered = filtered.filter(item => item.tags.includes(state.selectedTag));
    }

    // Apply content type filter
    if (state.contentType !== 'all') {
      if (state.contentType === 'images') {
        filtered = filtered.filter(item => item.resource_type === 'image');
      } else if (state.contentType === 'videos') {
        filtered = filtered.filter(item => item.resource_type === 'video');
      }
    }

    // Apply Instagram type filter
    if (state.instagramType !== 'all') {
      filtered = filtered.filter(item => item.context?.instagram_type === state.instagramType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (state.sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'public_id':
          aValue = a.public_id.toLowerCase();
          bValue = b.public_id.toLowerCase();
          break;
        case 'bytes':
          aValue = a.bytes;
          bValue = b.bytes;
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (state.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setState(prev => ({ ...prev, filteredItems: filtered }));
  }, [
    state.mediaItems, 
    state.searchTerm, 
    state.selectedTag, 
    state.contentType, 
    state.instagramType, 
    state.sortBy, 
    state.sortOrder
  ]);

  const loadMedia = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Mock data for demonstration - replace with actual API call
      const mockMediaItems: MediaItem[] = [
        {
          public_id: 'content-spark/instagram-post-source-1',
          secure_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_400,q_auto,f_auto/sample.jpg',
          width: 1080,
          height: 1080,
          format: 'jpg',
          bytes: 245760,
          created_at: '2024-01-15T10:30:00Z',
          tags: ['instagram', 'source', 'product'],
          resource_type: 'image',
          context: {
            alt: 'Product photo source material',
            caption: 'High-quality product shot for Instagram',
            instagram_type: 'source',
            instagram_ready: false
          }
        },
        {
          public_id: 'content-spark/instagram-carousel-1',
          secure_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_400,q_auto,f_auto/sample2.jpg',
          width: 1080,
          height: 1080,
          format: 'jpg',
          bytes: 189432,
          created_at: '2024-01-14T14:20:00Z',
          tags: ['instagram', 'carousel', 'lifestyle'],
          resource_type: 'image',
          context: {
            alt: 'Lifestyle carousel image',
            caption: 'Part of Instagram carousel post',
            instagram_type: 'carousel',
            instagram_ready: true
          }
        },
        {
          public_id: 'content-spark/instagram-final-post-1',
          secure_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_400,q_auto,f_auto/sample3.jpg',
          width: 1080,
          height: 1080,
          format: 'jpg',
          bytes: 156789,
          created_at: '2024-01-13T09:15:00Z',
          tags: ['instagram', 'final', 'branded'],
          resource_type: 'image',
          context: {
            alt: 'Final Instagram post',
            caption: 'Ready-to-post Instagram content',
            instagram_type: 'final',
            instagram_ready: true
          }
        },
        {
          public_id: 'content-spark/instagram-reel-1',
          secure_url: 'https://res.cloudinary.com/demo/video/upload/q_auto,f_auto/sample.mp4',
          width: 1080,
          height: 1920,
          format: 'mp4',
          bytes: 2456789,
          created_at: '2024-01-12T16:45:00Z',
          tags: ['instagram', 'reel', 'video'],
          resource_type: 'video',
          duration: 15,
          context: {
            alt: 'Instagram Reel video',
            caption: 'Engaging reel content',
            instagram_type: 'reel',
            instagram_ready: true
          }
        },
        {
          public_id: 'content-spark/instagram-reel-2',
          secure_url: 'https://res.cloudinary.com/demo/video/upload/q_auto,f_auto/sample2.mp4',
          width: 1080,
          height: 1920,
          format: 'mp4',
          bytes: 3234567,
          created_at: '2024-01-11T11:20:00Z',
          tags: ['instagram', 'reel', 'tutorial'],
          resource_type: 'video',
          duration: 30,
          context: {
            alt: 'Tutorial Reel video',
            caption: 'How-to content for Instagram',
            instagram_type: 'reel',
            instagram_ready: true
          }
        },
        {
          public_id: 'content-spark/instagram-story-source-1',
          secure_url: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_600,q_auto,f_auto/sample4.jpg',
          width: 1080,
          height: 1920,
          format: 'jpg',
          bytes: 298765,
          created_at: '2024-01-10T08:15:00Z',
          tags: ['instagram', 'story', 'behind-scenes'],
          resource_type: 'image',
          context: {
            alt: 'Behind the scenes content',
            caption: 'Story content for Instagram',
            instagram_type: 'source',
            instagram_ready: false
          }
        }
      ];

      // Extract unique tags
      const allTags = [...new Set(mockMediaItems.flatMap(item => item.tags))];

      setState(prev => ({
        ...prev,
        mediaItems: mockMediaItems,
        availableTags: allTags,
        hasMore: false, // No more items in mock data
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load media',
        loading: false,
      }));
    }
  }, [cloudinaryService, maxResults, folder, initialTags]);

  const loadMoreMedia = useCallback(async (): Promise<void> => {
    if (!state.hasMore || state.loading) return;

    // Mock implementation - in real app, load more from API
    console.log('Loading more media...');
  }, [state.hasMore, state.loading]);

  const refreshMedia = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, nextCursor: undefined, hasMore: true }));
    await loadMedia();
  }, [loadMedia]);

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setSelectedTag = useCallback((tag: string) => {
    setState(prev => ({ ...prev, selectedTag: tag }));
  }, []);

  const setContentType = useCallback((type: MediaGalleryState['contentType']) => {
    setState(prev => ({ ...prev, contentType: type }));
  }, []);

  const setInstagramType = useCallback((type: MediaGalleryState['instagramType']) => {
    setState(prev => ({ ...prev, instagramType: type }));
  }, []);

  const setSortBy = useCallback((sortBy: MediaGalleryState['sortBy']) => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((order: MediaGalleryState['sortOrder']) => {
    setState(prev => ({ ...prev, sortOrder: order }));
  }, []);

  const setViewMode = useCallback((mode: MediaGalleryState['viewMode']) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const openItemModal = useCallback((item: MediaItem, index: number) => {
    setState(prev => ({
      ...prev,
      selectedItem: item,
      currentItemIndex: index,
      isModalOpen: true,
    }));
  }, []);

  const closeItemModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedItem: null,
      isModalOpen: false,
    }));
  }, []);

  const navigateItem = useCallback((direction: 'prev' | 'next') => {
    setState(prev => {
      if (!prev.selectedItem) return prev;

      const newIndex = direction === 'prev'
        ? (prev.currentItemIndex - 1 + prev.filteredItems.length) % prev.filteredItems.length
        : (prev.currentItemIndex + 1) % prev.filteredItems.length;

      return {
        ...prev,
        currentItemIndex: newIndex,
        selectedItem: prev.filteredItems[newIndex],
      };
    });
  }, []);

  const toggleFavorite = useCallback((publicId: string) => {
    if (!enableFavorites) return;

    setState(prev => ({
      ...prev,
      favorites: prev.favorites.includes(publicId)
        ? prev.favorites.filter(id => id !== publicId)
        : [...prev.favorites, publicId],
    }));
  }, [enableFavorites]);

  const searchMedia = useCallback(async (query: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, searchTerm: query }));

      // Mock search implementation
      // In real app, this would call cloudinaryService.searchImages
      
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to search media',
        loading: false,
      }));
    }
  }, []);

  const markAsInstagramReady = useCallback((publicId: string, ready: boolean) => {
    setState(prev => ({
      ...prev,
      mediaItems: prev.mediaItems.map(item =>
        item.public_id === publicId
          ? {
              ...item,
              context: { ...item.context, instagram_ready: ready }
            }
          : item
      ),
    }));
  }, []);

  const updateInstagramType = useCallback((publicId: string, type: string) => {
    setState(prev => ({
      ...prev,
      mediaItems: prev.mediaItems.map(item =>
        item.public_id === publicId
          ? {
              ...item,
              context: { ...item.context, instagram_type: type as any }
            }
          : item
      ),
    }));
  }, []);

  // Load media on mount
  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  return {
    ...state,
    loadMedia,
    loadMoreMedia,
    refreshMedia,
    setSearchTerm,
    setSelectedTag,
    setContentType,
    setInstagramType,
    setSortBy,
    setSortOrder,
    setViewMode,
    openItemModal,
    closeItemModal,
    navigateItem,
    toggleFavorite,
    searchMedia,
    markAsInstagramReady,
    updateInstagramType,
  };
};
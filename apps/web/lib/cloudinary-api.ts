// apps/web/lib/cloudinary-api.ts

export interface CloudinaryConfig {
  cloudName: string;
  apiKey?: string;
  apiSecret?: string;
  uploadPreset?: string;
  folder?: string;
}

export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
  tags: string[];
  context?: {
    alt?: string;
    caption?: string;
    [key: string]: any;
  };
  metadata?: {
    colors?: any;
    faces?: any;
    quality_analysis?: any;
    accessibility_analysis?: any;
  };
}

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
  tags: string[];
  context?: Record<string, any>;
}

export interface CloudinarySearchResponse {
  images: CloudinaryImage[];
  next_cursor?: string;
  total_count: number;
}

export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'pad' | 'limit' | 'mfit' | 'mpad';
  gravity?: 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png' | 'gif';
  fetch_format?: 'auto' | 'webp' | 'avif';
  dpr?: 'auto' | number;
  flags?: string[];
  effects?: string[];
  overlay?: string;
  underlay?: string;
  border?: string;
  color?: string;
  angle?: number;
  opacity?: number;
  radius?: number | string;
  background?: string;
  [key: string]: any;
}

export class CloudinaryAPIService {
  private config: CloudinaryConfig;
  private baseUrl: string;

  constructor(config: CloudinaryConfig) {
    this.config = config;
    this.baseUrl = '/api/cloudinary';
  }

  /**
   * Get Cloudinary configuration from environment variables
   */
  static getConfig(): CloudinaryConfig {
    return {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
      folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'content-spark-gallery',
    };
  }

  /**
   * Generate optimized image URL with transformations
   */
  getOptimizedImageUrl(
    publicId: string,
    transformations: CloudinaryTransformation = {}
  ): string {
    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
      gravity = 'auto',
      dpr = 'auto',
      fetch_format = 'auto',
      ...otherTransformations
    } = transformations;

    const transformationParts = [];
    
    // Add basic optimizations
    if (quality !== undefined) transformationParts.push(`q_${quality}`);
    if (format !== undefined) transformationParts.push(`f_${format}`);
    if (fetch_format !== undefined) transformationParts.push(`fl_${fetch_format}`);
    if (dpr !== undefined) transformationParts.push(`dpr_${dpr}`);
    
    // Add resize transformations
    if (width || height) {
      const resizeParams = [`c_${crop}`];
      if (width) resizeParams.push(`w_${width}`);
      if (height) resizeParams.push(`h_${height}`);
      if (crop === 'fill' || crop === 'crop') resizeParams.push(`g_${gravity}`);
      transformationParts.push(resizeParams.join(','));
    }

    // Add other transformations
    Object.entries(otherTransformations).forEach(([key, value]) => {
      if (value !== undefined) {
        transformationParts.push(`${key}_${value}`);
      }
    });

    const transformationString = transformationParts.join('/');
    
    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${transformationString}/${publicId}`;
  }

  /**
   * Generate thumbnail URL
   */
  getThumbnailUrl(publicId: string, size: number = 150): string {
    return this.getOptimizedImageUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto',
    });
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  getResponsiveImageUrls(publicId: string): {
    mobile: string;
    tablet: string;
    desktop: string;
    large: string;
  } {
    return {
      mobile: this.getOptimizedImageUrl(publicId, { width: 420, quality: 'auto' }),
      tablet: this.getOptimizedImageUrl(publicId, { width: 768, quality: 'auto' }),
      desktop: this.getOptimizedImageUrl(publicId, { width: 1200, quality: 'auto' }),
      large: this.getOptimizedImageUrl(publicId, { width: 1920, quality: 'auto' }),
    };
  }

  /**
   * Generate srcset for responsive images
   */
  generateSrcSet(publicId: string, sizes: number[] = [320, 640, 768, 1024, 1280, 1536, 1920]): string {
    return sizes
      .map(size => `${this.getOptimizedImageUrl(publicId, { width: size, quality: 'auto' })} ${size}w`)
      .join(', ');
  }

  /**
   * Fetch images from Cloudinary via API
   */
  async fetchImages(options: {
    maxResults?: number;
    nextCursor?: string;
    tags?: string[];
    folder?: string;
  } = {}): Promise<CloudinarySearchResponse> {
    try {
      const {
        maxResults = 50,
        nextCursor,
        tags,
        folder = this.config.folder,
      } = options;

      const params = new URLSearchParams();
      if (folder) params.append('folder', folder);
      if (maxResults) params.append('max_results', maxResults.toString());
      if (nextCursor) params.append('next_cursor', nextCursor);
      if (tags && tags.length > 0) params.append('tags', tags.join(','));

      const response = await fetch(`${this.baseUrl}/images?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        images: data.images || [],
        next_cursor: data.next_cursor,
        total_count: data.total_count || 0,
      };
    } catch (error) {
      console.error('Error fetching images:', error);
      throw new Error('Failed to fetch images');
    }
  }

  /**
   * Search images
   */
  async searchImages(query: string, options: {
    maxResults?: number;
    folder?: string;
  } = {}): Promise<CloudinarySearchResponse> {
    try {
      const {
        maxResults = 50,
        folder = this.config.folder,
      } = options;

      const params = new URLSearchParams();
      params.append('q', query);
      if (folder) params.append('folder', folder);
      if (maxResults) params.append('max_results', maxResults.toString());

      const response = await fetch(`${this.baseUrl}/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        images: data.images || [],
        total_count: data.total_count || 0,
      };
    } catch (error) {
      console.error('Error searching images:', error);
      throw new Error('Failed to search images');
    }
  }

  /**
   * Upload image to Cloudinary via API
   */
  async uploadImage(file: File, options: {
    tags?: string[];
    folder?: string;
    context?: Record<string, any>;
  } = {}): Promise<CloudinaryUploadResponse> {
    try {
      const { tags = [], folder = this.config.folder, context = {} } = options;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      
      if (tags.length > 0) {
        formData.append('tags', tags.join(','));
      }
      
      if (Object.keys(context).length > 0) {
        formData.append('context', Object.entries(context).map(([key, value]) => `${key}=${value}`).join('|'));
      }

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Delete image from Cloudinary via API
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_id: publicId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(publicId: string): Promise<CloudinaryImage> {
    try {
      const params = new URLSearchParams();
      params.append('public_id', publicId);

      const response = await fetch(`${this.baseUrl}/metadata?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting image metadata:', error);
      throw new Error('Failed to get image metadata');
    }
  }

  /**
   * Get all available tags
   */
  async getTags(folder?: string): Promise<string[]> {
    try {
      const params = new URLSearchParams();
      if (folder) params.append('folder', folder);

      const response = await fetch(`${this.baseUrl}/tags?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.tags || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }
  }

  /**
   * Generate transformation URL
   */
  async generateTransformation(
    publicId: string,
    transformations: CloudinaryTransformation
  ): Promise<{ url: string; public_id: string; transformations: CloudinaryTransformation }> {
    try {
      const response = await fetch(`${this.baseUrl}/transform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          transformations,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating transformation:', error);
      throw new Error('Failed to generate transformation');
    }
  }

  /**
   * Get folder structure
   */
  async getFolders(): Promise<{ folders: Array<{ name: string; path: string }> }> {
    try {
      const response = await fetch(`${this.baseUrl}/folders`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching folders:', error);
      throw new Error('Failed to fetch folders');
    }
  }

  /**
   * Create new folder
   */
  async createFolder(folderName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/folders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folder_name: folderName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error('Failed to create folder');
    }
  }

  /**
   * Get image analytics and insights
   */
  async getImageAnalytics(publicId: string): Promise<any> {
    try {
      const metadata = await this.getImageMetadata(publicId);
      
      // Calculate additional analytics
      const aspectRatio = metadata.width / metadata.height;
      const megapixels = (metadata.width * metadata.height) / 1000000;
      const compression = metadata.bytes / (metadata.width * metadata.height * 3); // Rough estimate
      
      return {
        ...metadata,
        analytics: {
          aspect_ratio: aspectRatio,
          megapixels: Number(megapixels.toFixed(2)),
          compression_ratio: Number(compression.toFixed(4)),
          file_size_kb: Math.round(metadata.bytes / 1024),
          file_size_mb: Number((metadata.bytes / (1024 * 1024)).toFixed(2)),
          dimensions: `${metadata.width}x${metadata.height}`,
        },
      };
    } catch (error) {
      console.error('Error getting image analytics:', error);
      throw new Error('Failed to get image analytics');
    }
  }
}

// Export a default instance
export const cloudinaryAPI = new CloudinaryAPIService(CloudinaryAPIService.getConfig());

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getImageAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

export const getImageOrientation = (width: number, height: number): 'landscape' | 'portrait' | 'square' => {
  if (width > height) return 'landscape';
  if (height > width) return 'portrait';
  return 'square';
};

export const generateImageSizes = (baseSize: number = 400): number[] => {
  return [
    Math.round(baseSize * 0.5),  // 200px
    baseSize,                    // 400px
    Math.round(baseSize * 1.5),  // 600px
    Math.round(baseSize * 2),    // 800px
    Math.round(baseSize * 2.5),  // 1000px
    Math.round(baseSize * 3),    // 1200px
  ];
};
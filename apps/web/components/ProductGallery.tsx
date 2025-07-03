'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Image as ImageIcon, ExternalLink, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import clsx from 'clsx';

export interface ProductImage {
  name: string;
  url: string;
  uploadedAt?: string;
}

interface ProductGalleryProps {
  selectedImages: ProductImage[];
  onSelectImages: (images: ProductImage[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function ProductGallery({
  selectedImages,
  onSelectImages,
  multiSelect = true,
  className = '',
}: ProductGalleryProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configurationStatus, setConfigurationStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');

  useEffect(() => {
    checkConfigurationAndFetchImages();
  }, []);

  const checkConfigurationAndFetchImages = async () => {
    try {
      setConfigurationStatus('checking');
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching images from Azure API...');
      
      // Use the API route that works with server-side environment variables
      const response = await fetch('/api/azure/images');
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Azure API response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch images from Azure');
      }
      
      setConfigurationStatus('valid');
      setImages(data.images || []);
      console.log(`✅ Loaded ${data.images?.length || 0} images from Azure`);
      
    } catch (err) {
      console.error('❌ Error fetching images:', err);
      setConfigurationStatus('invalid');
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/azure/images');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch images from Azure');
      }
      
      setImages(data.images || []);
      
    } catch (err) {
      console.error('❌ Error fetching images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (image: ProductImage) => {
    const alreadySelected = selectedImages.some((img) => img.url === image.url);
    const updated = multiSelect
      ? alreadySelected
        ? selectedImages.filter((img) => img.url !== image.url)
        : [...selectedImages, image]
      : [image];

    onSelectImages(updated);
  };

  const isSelected = (image: ProductImage) =>
    selectedImages.some((img) => img.url === image.url);

  // Configuration Missing View
  if (configurationStatus === 'invalid') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-orange-500" />
            Azure Storage Configuration Issue
          </CardTitle>
          <CardDescription>
            Unable to connect to Azure Blob Storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Azure Storage connection failed'}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              This might be due to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Missing Azure Storage connection string</li>
              <li>Invalid container name or permissions</li>
              <li>Network connectivity issues</li>
            </ul>
            
            <p className="text-muted-foreground">
              Check your server logs for more details.
            </p>
          </div>

          <Button onClick={checkConfigurationAndFetchImages} variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Loading Configuration Check
  if (configurationStatus === 'checking') {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading product images...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main Gallery View
  return (
    <div className={clsx('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Product Images</h3>
        <Button onClick={fetchImages} variant="outline" size="sm" disabled={loading}>
          <Loader2 className={clsx("mr-2 h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && images.length === 0 ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No images found</p>
          <p className="text-sm">Upload images to your Azure Storage container to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.url}
              className={clsx(
                'relative rounded-lg overflow-hidden group cursor-pointer border-2 transition-all',
                isSelected(image) ? 'border-pink-500 shadow-lg' : 'border-transparent hover:border-gray-300'
              )}
              onClick={() => toggleSelect(image)}
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover aspect-square"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
              />

              <div className="absolute top-2 right-2 z-10">
                {isSelected(image) && (
                  <CheckCircle2 className="text-pink-500 bg-white rounded-full h-6 w-6" />
                )}
              </div>

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(image.url, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs truncate">{image.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImages.length > 0 && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">
            Selected Images ({selectedImages.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedImages.map((image) => (
              <div key={image.url} className="flex items-center gap-2 bg-background p-2 rounded border">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-8 h-8 object-cover rounded"
                />
                <span className="text-xs">{image.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4"
                  onClick={() => toggleSelect(image)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
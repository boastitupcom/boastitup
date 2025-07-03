// components/product-selector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useBrandProducts } from '@/hooks/use-brand-products';
import { BrandProductWithBrand } from '@/lib/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Package, Search, Filter, ShoppingCart, Tag, DollarSign, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  brandId?: string;
  selectedProducts: string[];
  onProductsChange: (productIds: string[]) => void;
  maxSelection?: number;
  className?: string;
}

export function ProductSelector({
  brandId,
  selectedProducts,
  onProductsChange,
  maxSelection,
  className
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  
  const { products, loading, error, refetch } = useBrandProducts({
    brandId,
    limit: 100
  });

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    const matchesPriceRange = (!priceRange.min || !product.price || product.price >= parseFloat(priceRange.min)) &&
      (!priceRange.max || !product.price || product.price <= parseFloat(priceRange.max));
    
    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const handleProductToggle = (productId: string) => {
    const isSelected = selectedProducts.includes(productId);
    
    if (isSelected) {
      onProductsChange(selectedProducts.filter(id => id !== productId));
    } else {
      if (maxSelection && selectedProducts.length >= maxSelection) {
        return; // Don't allow more selections
      }
      onProductsChange([...selectedProducts, productId]);
    }
  };

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return 'Price not set';
    const currencySymbol = currency === 'USD' ? '$' : currency || '';
    return `${currencySymbol}${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Products
            </CardTitle>
            <CardDescription>
              Choose products to feature in your Instagram reel
              {maxSelection && ` (max ${maxSelection})`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category!}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Min Price</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Max Price</label>
                <Input
                  type="number"
                  placeholder="999.99"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Selection Summary */}
        {selectedProducts.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            <span>{selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected</span>
            {maxSelection && (
              <span>/ {maxSelection} max</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No products found</h3>
            <p className="text-sm text-muted-foreground">
              {products.length === 0 
                ? "No products have been added to this brand yet."
                : "Try adjusting your search or filters."
              }
            </p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.includes(product.id);
                const isDisabled = maxSelection && 
                  !isSelected && 
                  selectedProducts.length >= maxSelection;

                return (
                  <div
                    key={product.id}
                    className={cn(
                      "border rounded-lg p-4 transition-all cursor-pointer",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isDisabled && handleProductToggle(product.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        disabled={!!isDisabled}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm leading-tight mb-1">
                              {product.name}
                            </h4>
                            {product.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {product.description}
                              </p>
                            )}
                          </div>
                          
                          {product.image_urls && product.image_urls.length > 0 && (
                            <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                              <img
                                src={product.image_urls[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {product.price && (
                              <div className="flex items-center gap-1 text-sm font-medium">
                                <DollarSign className="h-3 w-3" />
                                {formatPrice(product.price, product.currency)}
                              </div>
                            )}
                            
                            {product.category && (
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {product.stock_quantity !== null && (
                              <span className={cn(
                                "text-xs",
                                product.stock_quantity > 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            )}
                          </div>
                        </div>

                        {product.tags && product.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{product.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
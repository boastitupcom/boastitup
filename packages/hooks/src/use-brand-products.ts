// hooks/use-brand-products.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BrandProduct, BrandProductWithBrand } from '@/lib/types/database';

interface UseBrandProductsOptions {
  brandId?: string;
  category?: string;
  isActive?: boolean;
  limit?: number;
  includeInactive?: boolean;
}

interface UseBrandProductsReturn {
  products: BrandProductWithBrand[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalCount: number;
}

export function useBrandProducts({
  brandId,
  category,
  isActive = true,
  limit = 50,
  includeInactive = false
}: UseBrandProductsOptions = {}): UseBrandProductsReturn {
  const [products, setProducts] = useState<BrandProductWithBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('brand_products')
        .select(`
          *,
          brand:brands(
            id,
            name,
            slug,
            tenant_id
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (brandId) {
        query = query.eq('brand_id', brandId);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (!includeInactive) {
        query = query.eq('is_active', isActive);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching brand products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [brandId, category, isActive, limit, includeInactive, supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    totalCount
  };
}

// Hook for fetching products by specific filters
export function useBrandProductsAdvanced() {
  const [products, setProducts] = useState<BrandProductWithBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchProductsWithFilters = useCallback(async (filters: {
    brandIds?: string[];
    categories?: string[];
    priceRange?: { min?: number; max?: number };
    tags?: string[];
    searchTerm?: string;
    inStock?: boolean;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('brand_products')
        .select(`
          *,
          brand:brands(
            id,
            name,
            slug,
            tenant_id
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.brandIds && filters.brandIds.length > 0) {
        query = query.in('brand_id', filters.brandIds);
      }

      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      if (filters.priceRange?.min !== undefined) {
        query = query.gte('price', filters.priceRange.min);
      }

      if (filters.priceRange?.max !== undefined) {
        query = query.lte('price', filters.priceRange.max);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching filtered products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return {
    products,
    loading,
    error,
    fetchProductsWithFilters
  };
}

// Hook for fetching a single product
export function useBrandProduct(productId: string) {
  const [product, setProduct] = useState<BrandProductWithBrand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('brand_products')
          .select(`
            *,
            brand:brands(
              id,
              name,
              slug,
              tenant_id
            )
          `)
          .eq('id', productId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, supabase]);

  return {
    product,
    loading,
    error
  };
}
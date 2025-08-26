import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/types';

// Type for public product data (limited fields)
type PublicProduct = Pick<Product, 'productName' | 'category' | 'type' | 'quantity' | 'minimumStock'> & {
  _id: string;
};

const fetchProducts = async (): Promise<PublicProduct[]> => {
  const response = await fetch('/api/products/public');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['public-products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

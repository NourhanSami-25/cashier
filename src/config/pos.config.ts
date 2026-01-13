import { POSConfig } from '@/types/pos';

export const POS_CONFIG: POSConfig = {
  serviceFeePercentage: 0.10, // 10%
  taxPercentage: 0.14,        // 14%
  currency: 'EGP',
};

export const STORAGE_KEYS = {
  PRODUCTS: 'cafe_pos_products',
  CATEGORIES: 'cafe_pos_categories',
  INVOICES: 'cafe_pos_invoices',
} as const;

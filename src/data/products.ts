import { Product, Category } from '@/types/pos';

export const categories: Category[] = [
  { id: 'all', name: 'الكل', icon: '☕' },
  { id: 'coffee', name: 'القهوة', icon: '☕' },
  { id: 'tea', name: 'الشاي', icon: '🍵' },
  { id: 'cold', name: 'مشروبات باردة', icon: '🧊' },
  { id: 'desserts', name: 'الحلويات', icon: '🍰' },
  { id: 'food', name: 'الطعام', icon: '🥪' },
];

export const products: Product[] = [
  // Coffee
  { id: '1', name: 'إسبريسو', price: 15, category: 'coffee' },
  { id: '2', name: 'كابتشينو', price: 22, category: 'coffee' },
  { id: '3', name: 'لاتيه', price: 25, category: 'coffee' },
  { id: '4', name: 'موكا', price: 28, category: 'coffee' },
  { id: '5', name: 'أمريكانو', price: 18, category: 'coffee' },
  { id: '6', name: 'ماكياتو', price: 20, category: 'coffee' },
  { id: '7', name: 'فلات وايت', price: 24, category: 'coffee' },
  { id: '8', name: 'قهوة تركية', price: 12, category: 'coffee' },
  
  // Tea
  { id: '9', name: 'شاي أحمر', price: 8, category: 'tea' },
  { id: '10', name: 'شاي أخضر', price: 10, category: 'tea' },
  { id: '11', name: 'شاي بالنعناع', price: 12, category: 'tea' },
  { id: '12', name: 'شاي كرك', price: 14, category: 'tea' },
  
  // Cold drinks
  { id: '13', name: 'آيس لاتيه', price: 28, category: 'cold' },
  { id: '14', name: 'آيس موكا', price: 30, category: 'cold' },
  { id: '15', name: 'فرابتشينو', price: 32, category: 'cold' },
  { id: '16', name: 'سموذي فراولة', price: 26, category: 'cold' },
  { id: '17', name: 'عصير برتقال', price: 18, category: 'cold' },
  { id: '18', name: 'ليموناضة', price: 16, category: 'cold' },
  
  // Desserts
  { id: '19', name: 'كيكة شوكولاتة', price: 25, category: 'desserts' },
  { id: '20', name: 'تشيز كيك', price: 28, category: 'desserts' },
  { id: '21', name: 'كرواسون', price: 15, category: 'desserts' },
  { id: '22', name: 'مافن', price: 12, category: 'desserts' },
  { id: '23', name: 'براوني', price: 18, category: 'desserts' },
  
  // Food
  { id: '24', name: 'ساندويتش دجاج', price: 35, category: 'food' },
  { id: '25', name: 'ساندويتش جبن', price: 25, category: 'food' },
  { id: '26', name: 'سلطة سيزر', price: 32, category: 'food' },
  { id: '27', name: 'بانيني', price: 30, category: 'food' },
];

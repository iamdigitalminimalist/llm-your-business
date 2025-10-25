import { useDraggable } from '@dnd-kit/core';
import { Package, GripVertical } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import type { Product } from '../studio.api';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: product.id,
      data: {
        type: 'product',
        product,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const productTypeLabel = product.productType
    ? product.productType
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Unknown Type';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        p-3 bg-white border border-gray-200 rounded cursor-grab active:cursor-grabbing transition-all
        ${isDragging ? 'opacity-50 scale-105 shadow-lg' : 'hover:border-gray-300 hover:shadow-sm'}
      `}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            {product.name}
          </span>
        </div>
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      <div className="text-left">
        <span className="text-xs text-gray-600">{productTypeLabel}</span>
      </div>
    </div>
  );
}

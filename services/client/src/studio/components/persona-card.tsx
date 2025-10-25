import { useDraggable } from '@dnd-kit/core';
import { User, GripVertical } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import type { Persona } from '../studio.api';

interface PersonaCardProps {
  persona: Persona;
}

export function PersonaCard({ persona }: PersonaCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: persona.id,
      data: {
        type: 'persona',
        persona,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

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
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            {persona.name}
          </span>
        </div>
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      <div className="text-left">
        <div className="flex flex-wrap gap-1 line-clamp-1 overflow-hidden">
          {persona.occupation.slice(0, 2).map((occ, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded whitespace-nowrap"
            >
              {occ}
            </span>
          ))}
          {persona.occupation.length > 2 && (
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded whitespace-nowrap">
              +{persona.occupation.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

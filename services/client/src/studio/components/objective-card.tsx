import { useDraggable } from '@dnd-kit/core';
import { Target, GripVertical } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import type { Objective } from '../studio.api';

interface ObjectiveCardProps {
  objective: Objective;
}

export function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: objective.id,
      data: {
        type: 'objective',
        objective,
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
        p-3 bg-white border border-gray-200 rounded cursor-grab active:cursor-grabbing transition-all w-64
        ${isDragging ? 'opacity-50 scale-105 shadow-lg' : 'hover:border-gray-300 hover:shadow-sm'}
      `}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            {objective.title}
          </span>
        </div>
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      <div className="text-left">
        <p className="text-xs text-gray-600 truncate">
          {objective.description}
        </p>
      </div>
    </div>
  );
}
